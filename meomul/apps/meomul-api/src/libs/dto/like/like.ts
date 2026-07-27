import { Field, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { LikeGroup } from '../../enums/common.enum';

@ObjectType()
export class LikeDto {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => LikeGroup)
	likeGroup: LikeGroup;

	@Field(() => String)
	likeRefId: Types.ObjectId;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;
}
