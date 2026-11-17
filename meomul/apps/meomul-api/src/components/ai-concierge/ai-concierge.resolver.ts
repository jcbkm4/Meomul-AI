import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentMember } from '../auth/decorators/current-member.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { MemberJwtPayload } from '../../libs/types/member';
import { AskStayConciergeInput } from '../../libs/dto/ai-concierge/ai-concierge.input';
import { StayConciergeResultDto } from '../../libs/dto/ai-concierge/ai-concierge';
import { AiConciergeService } from './ai-concierge.service';
import { resolveVisitorKey } from './ai-quota.service';

@Resolver()
export class AiConciergeResolver {
	private readonly logger = new Logger(AiConciergeResolver.name);

	constructor(private readonly aiConciergeService: AiConciergeService) {}

	@Mutation(() => StayConciergeResultDto)
	@Public()
	public async askStayConcierge(
		@Args('input') input: AskStayConciergeInput,
		@Context() context: { req?: Request },
		@CurrentMember() currentMember?: MemberJwtPayload | null,
	): Promise<StayConciergeResultDto> {
		this.logger.log('Mutation askStayConcierge');
		return this.aiConciergeService.ask(currentMember ?? null, input, resolveVisitorKey(context.req));
	}
}
