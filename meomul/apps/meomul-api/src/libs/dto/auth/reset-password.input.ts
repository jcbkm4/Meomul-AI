import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

@InputType()
export class ResetPasswordInput {
	@IsNotEmpty()
	@IsString()
	@Length(3, 20)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@IsString()
	@Matches(/^01[0-9]{8,9}$/, { message: 'Invalid Korean phone number format' })
	@Field(() => String)
	memberPhone: string;

	/**
	 * The one-time code sent by SMS. Required — without it, knowing a nickname and a
	 * phone number was enough to take over any account.
	 */
	@IsNotEmpty()
	@IsString()
	@Matches(/^[0-9]{6}$/, { message: 'Reset code must be 6 digits' })
	@Field(() => String)
	code: string;

	@IsNotEmpty()
	@IsString()
	@Length(6, 100)
	@Field(() => String)
	newPassword: string;
}
