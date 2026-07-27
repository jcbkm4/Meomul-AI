import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';

@ObjectType()
export class RoomInventoryDto {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => String)
	roomId: Types.ObjectId;

	@Field(() => Date)
	date: Date;

	@Field(() => Int)
	total: number;

	@Field(() => Int)
	booked: number;

	@Field(() => Int)
	available: number;

	@Field(() => Boolean)
	closed: boolean;

	@Field(() => Int, { nullable: true })
	basePrice?: number;

	@Field(() => Int, { nullable: true })
	overridePrice?: number;

	@Field(() => Int, { nullable: true })
	effectivePrice?: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
