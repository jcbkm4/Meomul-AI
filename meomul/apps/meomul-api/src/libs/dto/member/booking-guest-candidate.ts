import { Field, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';

@ObjectType()
export class BookingGuestCandidateDto {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => String)
	memberNick: string;

	@Field(() => String)
	memberPhone: string;

	@Field(() => String, { nullable: true })
	memberFullName?: string;
}
