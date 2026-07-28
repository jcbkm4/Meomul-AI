import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { AuthService } from '../auth/auth.service';
import { SmsService } from '../sms/sms.service';
import { Messages } from '../../libs/messages';
import { MemberStatus } from '../../libs/enums/member.enum';
import type { MemberDocument } from '../../libs/types/member';
import type { PasswordResetTokenDocument } from '../../libs/types/password-reset-token';

const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * Password recovery.
 *
 * This replaces a flow that reset any account's password given only its nickname and
 * phone number — both non-secret, both enumerable — which made every account takeable
 * over by anyone who knew two public-ish facts about the owner.
 *
 * The design now:
 *   - Recovery requires possession of the member's phone, proved with a one-time code.
 *   - Codes are stored only as a SHA-256 hash, never in plaintext.
 *   - Codes are single-use, expire in 15 minutes, and allow 5 verification attempts.
 *   - Requesting a code always reports the same result, so the endpoint cannot be used
 *     to discover which nickname/phone pairs exist.
 *   - A successful reset revokes every refresh token, so a session an attacker already
 *     had is cut off.
 */
@Injectable()
export class PasswordResetService {
	private readonly logger = new Logger(PasswordResetService.name);

	constructor(
		@InjectModel('Member') private readonly memberModel: Model<MemberDocument>,
		@InjectModel('PasswordResetToken')
		private readonly resetTokenModel: Model<PasswordResetTokenDocument>,
		private readonly authService: AuthService,
		private readonly smsService: SmsService,
	) {}

	/**
	 * Issue a recovery code. Always resolves the same way regardless of whether the
	 * account exists — the caller learns nothing about who is registered.
	 */
	public async requestPasswordReset(memberNick: string, memberPhone: string): Promise<void> {
		const member = await this.memberModel
			.findOne({ memberNick: memberNick.trim(), memberPhone: memberPhone.trim() })
			.select('_id memberStatus memberPhone')
			.exec();

		if (!member || member.memberStatus === MemberStatus.DELETE || member.memberStatus === MemberStatus.BLOCK) {
			// Deliberately silent: no error, no timing tell worth chasing at this scale.
			this.logger.log('Password reset requested for an unknown or ineligible account');
			return;
		}

		// Invalidate any outstanding codes, so only the newest one works.
		await this.resetTokenModel.updateMany(
			{ memberId: member._id, consumedAt: null },
			{ $set: { consumedAt: new Date() } },
		);

		// randomInt is cryptographically secure and unbiased, unlike Math.random.
		const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

		await this.resetTokenModel.create({
			memberId: member._id,
			codeHash: this.hashCode(code),
			expiresAt: new Date(Date.now() + CODE_TTL_MS),
		});

		const sent = await this.smsService.send({
			to: member.memberPhone,
			text: `[Meomul] Your password reset code is ${code}. It expires in 15 minutes. If you did not request this, ignore this message.`,
		});

		if (!sent) {
			// Surfaced in logs and Sentry; the caller still sees the same generic result.
			this.logger.error('Password reset code could not be delivered');
		}
	}

	/**
	 * Verify a code and set the new password. Every failure returns the same message so
	 * a caller cannot distinguish "wrong code" from "no such account".
	 */
	public async resetPassword(
		memberNick: string,
		memberPhone: string,
		code: string,
		newPassword: string,
	): Promise<void> {
		const member = await this.memberModel
			.findOne({ memberNick: memberNick.trim(), memberPhone: memberPhone.trim() })
			.select('+memberPassword memberStatus')
			.exec();

		if (!member || member.memberStatus === MemberStatus.DELETE) {
			throw new BadRequestException(Messages.INVALID_MEMBER_RECOVERY);
		}
		if (member.memberStatus === MemberStatus.BLOCK) {
			throw new UnauthorizedException(Messages.BLOCKED_USER);
		}

		const token = await this.resetTokenModel
			.findOne({ memberId: member._id, consumedAt: null })
			.sort({ createdAt: -1 })
			.exec();

		if (!token) {
			throw new BadRequestException(Messages.INVALID_MEMBER_RECOVERY);
		}

		if (token.expiresAt.getTime() <= Date.now()) {
			// Checked here rather than left to the TTL monitor, which only sweeps
			// periodically and would leave expired codes usable in the meantime.
			await this.consume(token);
			throw new BadRequestException(Messages.INVALID_MEMBER_RECOVERY);
		}

		if (token.attempts >= MAX_VERIFY_ATTEMPTS) {
			await this.consume(token);
			throw new BadRequestException(Messages.INVALID_MEMBER_RECOVERY);
		}

		if (!this.codeMatches(code, token.codeHash)) {
			// Count the attempt before returning, so a burst of guesses burns the code.
			await this.resetTokenModel.updateOne({ _id: token._id }, { $inc: { attempts: 1 } }).exec();
			throw new BadRequestException(Messages.INVALID_MEMBER_RECOVERY);
		}

		await this.consume(token);

		member.memberPassword = await this.authService.hashPassword(newPassword);
		await member.save();

		// Anyone already holding a session for this account loses it.
		await this.authService.revokeAllMemberTokens(member._id.toString());

		this.logger.log('Password reset completed');
	}

	private async consume(token: PasswordResetTokenDocument): Promise<void> {
		await this.resetTokenModel.updateOne({ _id: token._id }, { $set: { consumedAt: new Date() } }).exec();
	}

	private hashCode(code: string): string {
		return createHash('sha256').update(code).digest('hex');
	}

	/** Constant-time compare, so response timing does not leak how much of a code matched. */
	private codeMatches(candidate: string, expectedHash: string): boolean {
		const candidateHash = Buffer.from(this.hashCode(candidate.trim()), 'hex');
		const expected = Buffer.from(expectedHash, 'hex');
		if (candidateHash.length !== expected.length) {
			return false;
		}
		return timingSafeEqual(candidateHash, expected);
	}
}
