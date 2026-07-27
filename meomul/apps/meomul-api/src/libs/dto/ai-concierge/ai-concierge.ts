import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { HotelLocation } from '../../enums/hotel.enum';
import { StayPurpose } from '../../enums/common.enum';

@ObjectType()
export class StayIntentDto {
	@Field(() => HotelLocation, { nullable: true })
	location?: HotelLocation;

	@Field(() => String, { nullable: true })
	district?: string;

	@Field(() => String, { nullable: true })
	checkIn?: string;

	@Field(() => String, { nullable: true })
	checkOut?: string;

	@Field(() => Int, { nullable: true })
	guests?: number;

	@Field(() => Int, { nullable: true })
	budgetMin?: number;

	@Field(() => Int, { nullable: true })
	budgetMax?: number;

	@Field(() => StayPurpose, { nullable: true })
	purpose?: StayPurpose;

	@Field(() => [String])
	amenities: string[];

	@Field(() => [String])
	roomPreferences: string[];

	@Field(() => [String])
	safetyPreferences: string[];

	@Field(() => [String])
	transportPreferences: string[];

	@Field(() => String)
	language: 'en' | 'ko';

	@Field(() => Float)
	confidence: number;
}

@ObjectType()
export class StayCandidateDto {
	@Field(() => String)
	hotelId: string;

	@Field(() => String)
	hotelTitle: string;

	@Field(() => String, { nullable: true })
	roomId?: string;

	@Field(() => String, { nullable: true })
	roomName?: string;

	@Field(() => Int)
	fitScore: number;

	@Field(() => [String])
	reasons: string[];

	@Field(() => [String])
	tradeoffs: string[];

	@Field(() => [String])
	trustSignals: string[];

	@Field(() => [String])
	priceInsights: string[];

	@Field(() => Int, { nullable: true })
	estimatedPrice?: number;

	@Field(() => String, { nullable: true })
	cheapestDate?: string;

	@Field(() => Int, { nullable: true })
	cheapestPrice?: number;
}

@ObjectType()
export class StayConciergeResultDto {
	@Field(() => StayIntentDto)
	intent: StayIntentDto;

	@Field(() => [StayCandidateDto])
	candidates: StayCandidateDto[];

	@Field(() => [String])
	clarifyingQuestions: string[];

	@Field(() => String)
	summary: string;

	@Field(() => String)
	nextAction: string;

	@Field(() => String)
	provider: string;
}
