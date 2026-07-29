// class-transformer needs the metadata shim. main.ts pulls it in at runtime; a unit test
// importing the module directly has to do it itself.
import 'reflect-metadata';
import { validateEnv } from './env.validation';

/**
 * These exist because REDIS_URL crash-looped the API on its first real deploy.
 *
 * The value was `redis://meomul-redis:6379` — correct for Docker Compose, where the
 * service name is the hostname. validator.js only accepts http/https/ftp unless given a
 * protocol list, so it rejected the scheme and the process exited on boot, repeatedly.
 *
 * Nothing caught it earlier: every local run either had no REDIS_URL or used the
 * in-memory cache fallback, so the field was never exercised with a real value.
 *
 * Note that validateEnv reports failure by calling process.exit(1), not by throwing —
 * deliberate, so a misconfigured container dies immediately instead of serving. The
 * tests stub it into a throw so that outcome is assertable.
 */
describe('validateEnv', () => {
	const base = {
		NODE_ENV: 'development',
		JWT_SECRET: 'a'.repeat(32),
		COOKIE_SECRET: 'b'.repeat(32),
	};

	let exitSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		exitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
			throw new Error(`process.exit(${code})`);
		}) as never);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	/** Runs validateEnv and reports whether it rejected the configuration. */
	const rejects = (config: Record<string, unknown>): boolean => {
		try {
			validateEnv(config);
			return false;
		} catch {
			return true;
		}
	};

	describe('REDIS_URL', () => {
		it('accepts a Docker Compose service hostname', () => {
			// No dot in the host, and a redis:// scheme — the exact shape that failed.
			expect(rejects({ ...base, REDIS_URL: 'redis://meomul-redis:6379' })).toBe(false);
			expect(exitSpy).not.toHaveBeenCalled();
		});

		it.each([
			'redis://redis:6379',
			'redis://localhost:6379',
			'redis://127.0.0.1:6379',
			'rediss://secure-redis:6380',
			'redis://cache.internal.example.com:6379',
		])('accepts %s', (url) => {
			expect(rejects({ ...base, REDIS_URL: url })).toBe(false);
		});

		it('is optional — the app falls back to an in-memory cache', () => {
			expect(rejects({ ...base })).toBe(false);
		});

		it('treats an empty string as unset rather than invalid', () => {
			// .env files routinely carry `REDIS_URL=` for a disabled option.
			expect(rejects({ ...base, REDIS_URL: '' })).toBe(false);
		});

		it('still rejects a value that is not a URL at all', () => {
			expect(rejects({ ...base, REDIS_URL: 'not a url' })).toBe(true);
		});
	});

	describe('secrets', () => {
		it('rejects secrets shorter than 32 characters', () => {
			expect(rejects({ ...base, JWT_SECRET: 'too-short' })).toBe(true);
			expect(rejects({ ...base, COOKIE_SECRET: 'too-short' })).toBe(true);
		});

		it('accepts secrets at exactly the 32-character minimum', () => {
			expect(rejects({ ...base, JWT_SECRET: 'x'.repeat(32), COOKIE_SECRET: 'y'.repeat(32) })).toBe(false);
		});
	});
});
