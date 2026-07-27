import { Field, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { NotificationType } from '../../enums/common.enum';

@ObjectType()
export class NotificationDto {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => String)
	userId: Types.ObjectId;

	@Field(() => NotificationType)
	type: NotificationType;

	@Field(() => String)
	title: string;

	@Field(() => String)
	message: string;

	@Field(() => String, { nullable: true })
	link?: string;

	@Field(() => Boolean)
	read: boolean;

	@Field(() => String, { nullable: true })
	userNick?: string;

	@Field(() => Date)
	createdAt: Date;
}
