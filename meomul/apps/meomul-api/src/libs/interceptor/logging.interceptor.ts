import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Per-operation GraphQL timing.
 *
 * Two things were wrong here. It ran for every request type, so REST endpoints — the
 * health check most of all — produced a stream of `[GraphQL] unknown 0ms` lines that were
 * both noise and inaccurate. And it emitted interpolated strings, which a log shipper
 * cannot index or aggregate.
 *
 * It now bails out on non-GraphQL contexts and logs structured fields, so operation
 * latency is queryable rather than something you grep for.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name);

	public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		// REST and websocket traffic is already covered by pino's request logging.
		if (context.getType<'graphql'>() !== 'graphql') {
			return next.handle();
		}

		const gqlContext = GqlExecutionContext.create(context);
		const info = gqlContext.getInfo<{ fieldName?: string; operation?: { operation?: string } } | undefined>();
		const operationName = info?.fieldName ?? 'unknown';
		const operationType = info?.operation?.operation ?? 'unknown';
		const start = Date.now();

		return next.handle().pipe(
			tap(() => {
				this.logger.log({
					msg: 'graphql operation',
					operationName,
					operationType,
					durationMs: Date.now() - start,
					outcome: 'success',
				});
			}),
			catchError((error: unknown) => {
				const durationMs = Date.now() - start;

				// An absent refresh token is the normal state for a signed-out visitor, not
				// a failure worth an error line on every page load.
				if (operationName === 'refreshToken' && error instanceof Error && error.message === 'No refresh token') {
					this.logger.debug({ msg: 'graphql operation', operationName, durationMs, outcome: 'skipped' });
					throw error;
				}

				this.logger.error({
					msg: 'graphql operation',
					operationName,
					operationType,
					durationMs,
					outcome: 'error',
					err: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
				});
				throw error;
			}),
		);
	}
}
