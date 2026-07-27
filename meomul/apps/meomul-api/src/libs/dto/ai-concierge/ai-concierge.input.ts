import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

@InputType()
export class AskStayConciergeInput {
	@IsString()
	@MinLength(4)
	@Field(() => String)
	message: string;

	@IsOptional()
	@IsString()
	@Field(() => String, { nullable: true })
	checkIn?: string;

	@IsOptional()
	@IsString()
	@Field(() => String, { nullable: true })
	checkOut?: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(20)
	@Field(() => Int, { nullable: true })
	guests?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	budgetMax?: number;

	@IsOptional()
	@IsString()
	@Field(() => String, { nullable: true })
	language?: 'en' | 'ko';
}

