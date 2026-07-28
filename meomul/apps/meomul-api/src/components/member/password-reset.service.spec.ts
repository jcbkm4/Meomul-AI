import { createHash } from 'crypto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { MemberStatus } from '../../libs/enums/member.enum';

/**
 * The flow this replaces reset any account's password given only a nickname and a phone
 * number, both of which are non-secret and enumerable. These tests pin the properties
 * that make the replacement safe, so a future refactor cannot quietly reopen the hole.
 */
describe('PasswordResetService', () => {
	const memberId = '699b0a1cc85a99084dbf56b1';
	const sha256 = (v: string): string => createHash('sha256').update(v).digest('hex');

	const createService = (
		member: Record<string, unknown> | null = {
			_id: memberId,
			memberStatus: MemberStatus.ACTIVE,
			memberPhone: '01011112222',
		},
		token: Record<string, unknown> | null = null,
	) => {
		const memberDoc = member
			? { ...member, _id: { toString: () => memberId }, save: jest.fn().mockResolvedValue(undefined) }
			: null;

		const memberModel = {
			findOne: jest.fn().mockReturnValue({
				select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(memberDoc) }),
			}),
		};

		const created: Record<string, unknown>[] = [];
		const resetTokenModel = {
			create: jest.fn((doc: Record<string, unknown>) => {
				created.push(doc);
				return Promise.resolve(doc);
			}),
			findOne: jest.fn().mockReturnValue({
				sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(token) }),
			}),
			updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
			updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
		};

		const authService = {
			hashPassword: jest.fn().mockResolvedValue('hashed-new-password'),
			revokeAllMemberTokens: jest.fn().mockResolvedValue(undefined),
		};
		const smsService = { send: jest.fn<Promise<boolean>, [{ to: string; text: string }]>().mockResolvedValue(true) };

		const service = new PasswordResetService(
			memberModel as never,
			resetTokenModel as never,
			authService as never,
			smsService as never,
		);

		return { service, memberModel, resetTokenModel, authService, smsService, created, memberDoc };
	};

	const validToken = (overrides: Record<string, unknown> = {}) => ({
		_id: 'reset-token-id',
		memberId,
		codeHash: sha256('123456'),
		expiresAt: new Date(Date.now() + 60_000),
		consumedAt: null,
		attempts: 0,
		...overrides,
	});

	describe('requestPasswordReset', () => {
		it('sends a 6-digit code and stores only its hash', async () => {
			const { service, smsService, created } = createService();

			await service.requestPasswordReset('kamil', '01011112222');

			const [message] = smsService.send.mock.calls[0];
			const text = message.text;
			const code = /\b(\d{6})\b/.exec(text)?.[1];
			expect(code).toBeDefined();

			// A database leak must not yield usable reset codes.
			expect(created[0].codeHash).toBe(sha256(code as string));
			expect(JSON.stringify(created[0])).not.toContain(code as string);
		});

		it('expires the code in 15 minutes', async () => {
			const { service, created } = createService();

			await service.requestPasswordReset('kamil', '01011112222');

			const minutes = ((created[0].expiresAt as Date).getTime() - Date.now()) / 60_000;
			expect(minutes).toBeGreaterThan(14);
			expect(minutes).toBeLessThan(15.1);
		});

		it('invalidates any earlier outstanding codes', async () => {
			const { service, resetTokenModel } = createService();

			await service.requestPasswordReset('kamil', '01011112222');

			// Otherwise a second request would leave two live codes.
			const anyValue: unknown = expect.anything();
			const anyDate: unknown = expect.any(Date);
			expect(resetTokenModel.updateMany).toHaveBeenCalledWith(
				{ memberId: anyValue, consumedAt: null },
				{ $set: { consumedAt: anyDate } },
			);
		});

		it('stays silent for an unknown account, sending nothing', async () => {
			const { service, smsService, resetTokenModel } = createService(null);

			// Must not throw: a distinguishable response turns this into an account oracle.
			await expect(service.requestPasswordReset('ghost', '01099998888')).resolves.toBeUndefined();
			expect(smsService.send).not.toHaveBeenCalled();
			expect(resetTokenModel.create).not.toHaveBeenCalled();
		});

		it('stays silent for blocked and deleted accounts', async () => {
			for (const status of [MemberStatus.BLOCK, MemberStatus.DELETE]) {
				const { service, smsService } = createService({
					_id: memberId,
					memberStatus: status,
					memberPhone: '01011112222',
				});

				await expect(service.requestPasswordReset('kamil', '01011112222')).resolves.toBeUndefined();
				expect(smsService.send).not.toHaveBeenCalled();
			}
		});

		it('does not surface an SMS delivery failure to the caller', async () => {
			const { service, smsService } = createService();
			smsService.send.mockResolvedValue(false);

			await expect(service.requestPasswordReset('kamil', '01011112222')).resolves.toBeUndefined();
		});
	});

	describe('resetPassword', () => {
		it('sets the new password and revokes every session on a valid code', async () => {
			const { service, authService, memberDoc, resetTokenModel } = createService(undefined, validToken());

			await service.resetPassword('kamil', '01011112222', '123456', 'new-password');

			expect(authService.hashPassword).toHaveBeenCalledWith('new-password');
			expect(memberDoc?.save).toHaveBeenCalled();
			// Cuts off a session an attacker may already hold.
			expect(authService.revokeAllMemberTokens).toHaveBeenCalledWith(memberId);
			// Single use.
			const anyDate: unknown = expect.any(Date);
			expect(resetTokenModel.updateOne).toHaveBeenCalledWith(
				{ _id: 'reset-token-id' },
				{ $set: { consumedAt: anyDate } },
			);
		});

		it('rejects a wrong code and counts the attempt', async () => {
			const { service, authService, resetTokenModel } = createService(undefined, validToken());

			await expect(service.resetPassword('kamil', '01011112222', '000000', 'new-password')).rejects.toThrow(
				BadRequestException,
			);

			expect(authService.hashPassword).not.toHaveBeenCalled();
			// Burns the code over repeated guesses rather than allowing unlimited tries.
			expect(resetTokenModel.updateOne).toHaveBeenCalledWith({ _id: 'reset-token-id' }, { $inc: { attempts: 1 } });
		});

		it('rejects an expired code', async () => {
			const { service, authService } = createService(undefined, validToken({ expiresAt: new Date(Date.now() - 1000) }));

			await expect(service.resetPassword('kamil', '01011112222', '123456', 'new-password')).rejects.toThrow(
				BadRequestException,
			);
			expect(authService.hashPassword).not.toHaveBeenCalled();
		});

		it('rejects a correct code once the attempt limit is exhausted', async () => {
			const { service, authService } = createService(undefined, validToken({ attempts: 5 }));

			await expect(service.resetPassword('kamil', '01011112222', '123456', 'new-password')).rejects.toThrow(
				BadRequestException,
			);
			expect(authService.hashPassword).not.toHaveBeenCalled();
		});

		it('rejects when no code was ever requested', async () => {
			const { service, authService } = createService(undefined, null);

			// This is the old vulnerability: nickname + phone alone must not be enough.
			await expect(service.resetPassword('kamil', '01011112222', '123456', 'new-password')).rejects.toThrow(
				BadRequestException,
			);
			expect(authService.hashPassword).not.toHaveBeenCalled();
		});

		it('rejects an unknown account', async () => {
			const { service } = createService(null, validToken());

			await expect(service.resetPassword('ghost', '01099998888', '123456', 'new-password')).rejects.toThrow(
				BadRequestException,
			);
		});

		it('rejects a blocked account even with a valid code', async () => {
			const { service } = createService(
				{ _id: memberId, memberStatus: MemberStatus.BLOCK, memberPhone: '01011112222' },
				validToken(),
			);

			await expect(service.resetPassword('kamil', '01011112222', '123456', 'new-password')).rejects.toThrow(
				UnauthorizedException,
			);
		});
	});
});
