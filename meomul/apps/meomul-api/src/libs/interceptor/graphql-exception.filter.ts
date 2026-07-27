import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
	private readonly logger = new Logger(GraphqlExceptionFilter.name);
	private readonly isProduction = process.env.NODE_ENV === 'production';

	public catch(exception: unknown): GraphQLError {
		const { message, statusCode } = this.resolveError(exception);
		return new GraphQLError(message, {
			extensions: {
				success: false,
				message,
				code: this.mapStatusToCode(statusCode),
			},
		});
	}

	private resolveError(exception: unknown): { message: string; statusCode: number } {
		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';

		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			// 4xx are expected outcomes (bad input, unauthorised) and would drown out real
			// failures. Only server-side statuses are worth an alert.
			if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
				Sentry.captureException(exception);
			}
			const response = exception.getResponse();

			if (typeof response === 'string') {
				message = response;
			} else if (response && typeof response === 'object') {
				const responseMessage = (response as { message?: string | string[] }).message;
				if (Array.isArray(responseMessage)) {
					message = responseMessage[0] ?? exception.message;
				} else if (typeof responseMessage === 'string') {
					message = responseMessage;
				} else if ('error' in response) {
					message = String((response as { error?: string }).error ?? exception.message);
				}
			} else {
				message = exception.message;
			}
		} else if (exception instanceof Error) {
			// Report before sanitising: the client gets a generic message, we keep the detail.
			Sentry.captureException(exception);

			// In production, never leak internal error details to client
			if (this.isProduction) {
				this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
				message = 'Internal server error';
			} else {
				message = exception.message;
			}
		} else {
			Sentry.captureException(exception);
			if (this.isProduction) {
				this.logger.error('Unknown exception type caught', exception);
			}
		}

		return { message, statusCode };
	}

	private mapStatusToCode(statusCode: number): string {
		const statusCodeToGraphCode: Record<number, string> = {
			[HttpStatus.BAD_REQUEST]: 'BAD_USER_INPUT',
			[HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
			[HttpStatus.FORBIDDEN]: 'FORBIDDEN',
			[HttpStatus.NOT_FOUND]: 'NOT_FOUND',
			[HttpStatus.CONFLICT]: 'CONFLICT',
		};
		return statusCodeToGraphCode[statusCode] ?? 'INTERNAL_SERVER_ERROR';
	}
}
