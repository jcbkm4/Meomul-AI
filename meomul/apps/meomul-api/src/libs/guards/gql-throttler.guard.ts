import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

/**
 * Custom ThrottlerGuard that correctly extracts the request/response
 * from a GraphQL execution context (where switchToHttp() returns undefined).
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
	protected getRequestResponse(context: ExecutionContext): { req: Record<string, any>; res: Record<string, any> } {
		if (context.getType<'graphql' | 'http'>() === 'graphql') {
			const gqlCtx = GqlExecutionContext.create(context);
			const ctx = gqlCtx.getContext<{ req: Request; res: Response }>();
			return { req: ctx.req, res: ctx.res };
		}

		return {
			req: context.switchToHttp().getRequest(),
			res: context.switchToHttp().getResponse(),
		};
	}

	/**
	 * Behind Cloudflare every request reaches the API from the same proxy address, so
	 * limiting by req.ip would put all visitors in one bucket. Cloudflare sets
	 * CF-Connecting-IP to the visitor's address (clients cannot override it at the edge).
	 */
	protected async getTracker(req: Record<string, any>): Promise<string> {
		const cfIp = req.headers?.['cf-connecting-ip'];
		if (typeof cfIp === 'string' && cfIp.length > 0) {
			return cfIp;
		}
		return req.ip;
	}
}
