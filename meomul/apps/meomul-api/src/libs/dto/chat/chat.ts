import { Field, ObjectType, Int } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { ChatScope, ChatStatus, MessageType, SenderType } from '../../enums/common.enum';
import { MemberType } from '../../enums/member.enum';

@ObjectType()
export class MessageDto {
	@Field(() => String)
	senderId: Types.ObjectId;

	@Field(() => SenderType)
	senderType: SenderType;

	@Field(() => MessageType)
	messageType: MessageType;

	@Field(() => String, { nullable: true })
	content?: string;

	@Field(() => String, { nullable: true })
	imageUrl?: string;

	@Field(() => String, { nullable: true })
	fileUrl?: string;

	@Field(() => Date)
	timestamp: Date;

	@Field(() => Boolean)
	read: boolean;
}

@ObjectType()
export class ChatDto {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => String)
	guestId: Types.ObjectId;

	@Field(() => String, { nullable: true })
	guestNick?: string;

	@Field(() => String, { nullable: true })
	guestImage?: string;

	@Field(() => MemberType, { nullable: true })
	guestMemberType?: MemberType;

	@Field(() => String, { nullable: true })
	hotelId?: Types.ObjectId;

	@Field(() => ChatScope)
	chatScope: ChatScope;

	@Field(() => String, { nullable: true })
	assignedAgentId?: Types.ObjectId;

	@Field(() => String, { nullable: true })
	bookingId?: Types.ObjectId;

	@Field(() => String, { nullable: true })
	supportTopic?: string;

	@Field(() => String, { nullable: true })
	sourcePath?: string;

	@Field(() => [MessageDto], { nullable: true })
	messages?: MessageDto[];

	@Field(() => MessageDto, { nullable: true })
	lastMessage?: MessageDto;

	@Field(() => ChatStatus)
	chatStatus: ChatStatus;

	@Field(() => Int)
	unreadGuestMessages: number;

	@Field(() => Int)
	unreadAgentMessages: number;

	@Field(() => Date)
	lastMessageAt: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
