import { Field, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { ViewGroup } from '../../enums/common.enum';

@ObjectType()
export class ViewDto {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => ViewGroup)
	viewGroup: ViewGroup;

	@Field(() => String)
	viewRefId: Types.ObjectId;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;
}
