import { randomUUID } from 'crypto';
import type { Params } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Structured logging.
 *
 * Both apps previously used Nest's default logger, which emits interpolated strings with
 * no request correlation. That is unreadable once a log shipper is involved and makes it
 * impossible to follow a single request through the API.
 *
 * This is wired via `app.useLogger()`, so the 54 existing `new Logger(Name)` call sites
 * keep working unchanged — they simply produce JSON now, with the request context
 * attached automatically.
 *
 * Production emits newline-delimited JSON. Development keeps the readable pretty format,
 * since piping JSON through a terminal helps nobody.
 */
export const buildLoggerConfig = (appName: 'api' | 'batch'): Params => {
	const isProduction = process.env.NODE_ENV === 'production';

	return {
		pinoHttp: {
			name: appName,
			level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),

			...(isProduction
				? {}
				: {
						transport: {
							target: 'pino-pretty',
							options: { singleLine: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname,req,res' },
						},
					}),

			// Correlation id: honour an upstream header when Caddy or a client supplies one,
			// otherwise mint one. Every log line for the request carries it.
			genReqId: (req: IncomingMessage, res: ServerResponse) => {
				const existing = req.headers['x-request-id'];
				const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
				res.setHeader('x-request-id', id);
				return id;
			},

			// Health checks would otherwise dominate the log volume at one line per 30s
			// per container, for no diagnostic value.
			autoLogging: {
				ignore: (req: IncomingMessage) => req.url === '/health',
			},

			customProps: () => ({ app: appName }),

			// Never log credentials or personal data. Pino redacts before serialising, so
			// these values never reach the output stream.
			redact: {
				paths: [
					'req.headers.authorization',
					'req.headers.cookie',
					'res.headers["set-cookie"]',
					'req.body.password',
					'req.body.memberPassword',
					'req.body.newPassword',
					'req.body.code',
					'*.memberPassword',
					'*.memberPhone',
					'*.tokenHash',
					'*.codeHash',
				],
				censor: '[redacted]',
			},

			serializers: {
				req: (req: IncomingMessage & { id?: string; url?: string; method?: string }) => ({
					id: req.id,
					method: req.method,
					url: req.url,
				}),
				res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
			},
		},
	};
};
