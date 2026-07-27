import { createHash } from 'crypto';
import { AuthService } from './auth.service';
import type { RefreshTokenDocument } from '../../libs/types/refresh-token';

/**
 * Refresh tokens are the long-lived half of the session: a leaked one is a durable
 * account compromise. This covers the properties that make that safe — the raw token is
 * never stored, lookups are constrained to unrevoked entries, expiry is enforced at read
 * time rather than trusted to a TTL index, and revocation actually takes effect.
 */
describe('AuthService', () => {
	const memberId = '699b0a1cc85a99084dbf56b1';

	const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

	const createService = () => {
		const created: Record<string, unknown>[] = [];
		const refreshTokenModel = {
			create: jest.fn((doc: Record<string, unknown>) => {
				created.push(doc);
				return Promise.resolve(doc);
			}),
			findOne: jest.fn().mockResolvedValue(null),
			deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
			updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
			updateMany: jest.fn().mockResolvedValue({ modifiedCount: 3 }),
		};
		const jwtService = {
			signAsync: jest.fn<Promise<string>, [Record<string, unknown>]>().mockResolvedValue('signed.jwt.token'),
		};

		const service = new AuthService(jwtService as never, refreshTokenModel as never);

		return { service, refreshTokenModel, jwtService, created };
	};

	const storedToken = (overrides: Partial<RefreshTokenDocument> = {}): RefreshTokenDocument =>
		({
			_id: 'token-doc-id',
			memberId,
			expiresAt: new Date(Date.now() + 60_000),
			revoked: false,
			...overrides,
		}) as unknown as RefreshTokenDocument;

	describe('password hashing', () => {
		it('does not store the plaintext, and verifies it back', async () => {
			const { service } = createService();

			const hashed = await service.hashPassword('correct-horse-battery');

			expect(hashed).not.toBe('correct-horse-battery');
			expect(hashed).not.toContain('correct-horse-battery');
			await expect(service.comparePassword('correct-horse-battery', hashed)).resolves.toBe(true);
			await expect(service.comparePassword('wrong-password', hashed)).resolves.toBe(false);
		});

		it('salts, so the same password hashes differently every time', async () => {
			const { service } = createService();

			const [first, second] = await Promise.all([
				service.hashPassword('same-password'),
				service.hashPassword('same-password'),
			]);

			expect(first).not.toBe(second);
		});
	});

	describe('createRefreshToken', () => {
		it('persists only the hash, never the raw token', async () => {
			const { service, created } = createService();

			const rawToken = await service.createRefreshToken(memberId);

			expect(created).toHaveLength(1);
			expect(created[0].tokenHash).toBe(sha256(rawToken));
			// A database leak must not hand out usable tokens.
			expect(JSON.stringify(created[0])).not.toContain(rawToken);
		});

		it('issues unguessable, unique tokens', async () => {
			const { service } = createService();

			const tokens = await Promise.all(Array.from({ length: 25 }, () => service.createRefreshToken(memberId)));

			expect(new Set(tokens).size).toBe(25);
			// 40 random bytes rendered as hex.
			for (const token of tokens) {
				expect(token).toMatch(/^[0-9a-f]{80}$/);
			}
		});

		it('sets a 7-day expiry', async () => {
			const { service, created } = createService();

			await service.createRefreshToken(memberId);

			const expiresAt = created[0].expiresAt as Date;
			const daysOut = (expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
			expect(daysOut).toBeGreaterThan(6.9);
			expect(daysOut).toBeLessThan(7.1);
		});
	});

	describe('validateRefreshToken', () => {
		it('looks the token up by hash and only among unrevoked entries', async () => {
			const { service, refreshTokenModel } = createService();
			refreshTokenModel.findOne.mockResolvedValue(storedToken());

			await service.validateRefreshToken('raw-token-value');

			expect(refreshTokenModel.findOne).toHaveBeenCalledWith({
				tokenHash: sha256('raw-token-value'),
				revoked: false,
			});
		});

		it('returns the member id for a valid token', async () => {
			const { service, refreshTokenModel } = createService();
			refreshTokenModel.findOne.mockResolvedValue(storedToken());

			await expect(service.validateRefreshToken('raw-token-value')).resolves.toBe(memberId);
		});

		it('rejects an unknown or revoked token', async () => {
			const { service, refreshTokenModel } = createService();
			refreshTokenModel.findOne.mockResolvedValue(null);

			await expect(service.validateRefreshToken('raw-token-value')).resolves.toBeNull();
		});

		it('rejects an expired token and deletes it', async () => {
			const { service, refreshTokenModel } = createService();
			// Expiry is enforced here rather than relying on a TTL index, which only
			// sweeps periodically and would otherwise leave a window of valid-looking
			// expired tokens.
			refreshTokenModel.findOne.mockResolvedValue(storedToken({ expiresAt: new Date(Date.now() - 1000) }));

			await expect(service.validateRefreshToken('raw-token-value')).resolves.toBeNull();
			expect(refreshTokenModel.deleteOne).toHaveBeenCalledWith({ _id: 'token-doc-id' });
		});
	});

	describe('revocation', () => {
		it('revokes a single token by hash, not by raw value', async () => {
			const { service, refreshTokenModel } = createService();

			await service.revokeRefreshToken('raw-token-value');

			expect(refreshTokenModel.updateOne).toHaveBeenCalledWith(
				{ tokenHash: sha256('raw-token-value') },
				{ revoked: true },
			);
		});

		it('revokes every live session for a member', async () => {
			const { service, refreshTokenModel } = createService();

			// Used on password reset and ban — every device must lose access at once.
			await service.revokeAllMemberTokens(memberId);

			expect(refreshTokenModel.updateMany).toHaveBeenCalledWith({ memberId, revoked: false }, { revoked: true });
		});
	});

	describe('generateJwtToken', () => {
		it('carries identity and authorisation claims, and no credentials', async () => {
			const { service, jwtService } = createService();
			const member = {
				_id: { toString: () => memberId },
				memberNick: 'kamil',
				memberType: 'USER',
				memberStatus: 'ACTIVE',
				memberAuthType: 'EMAIL',
				memberPassword: 'should-never-be-in-a-jwt',
			};

			await service.generateJwtToken(member as never);

			const payload = jwtService.signAsync.mock.calls[0][0];
			expect(payload._id).toBe(memberId);
			expect(payload.sub).toBe(memberId);
			expect(payload.memberType).toBe('USER');
			// A JWT is readable by anyone holding it.
			expect(payload).not.toHaveProperty('memberPassword');
			expect(JSON.stringify(payload)).not.toContain('should-never-be-in-a-jwt');
		});

		it('defaults hostAccessStatus rather than emitting undefined', async () => {
			const { service, jwtService } = createService();

			await service.generateJwtToken({ _id: memberId, memberNick: 'kamil' } as never);

			const payload = jwtService.signAsync.mock.calls[0][0];
			expect(payload.hostAccessStatus).toBe('NONE');
		});
	});
});
