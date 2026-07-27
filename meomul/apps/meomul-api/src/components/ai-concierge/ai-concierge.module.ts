import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AiConciergeSessionSchema from '../../schemas/AiConciergeSession.model';
import HotelSchema from '../../schemas/Hotel.model';
import ReviewSchema from '../../schemas/Review.model';
import RoomInventorySchema from '../../schemas/RoomInventory.model';
import RoomSchema from '../../schemas/Room.model';
import UserProfileSchema from '../../schemas/UserProfile.model';
import { AiConciergeResolver } from './ai-concierge.resolver';
import { AiConciergeService } from './ai-concierge.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'AiConciergeSession', schema: AiConciergeSessionSchema },
			{ name: 'Hotel', schema: HotelSchema },
			{ name: 'Room', schema: RoomSchema },
			{ name: 'RoomInventory', schema: RoomInventorySchema },
			{ name: 'Review', schema: ReviewSchema },
			{ name: 'UserProfile', schema: UserProfileSchema },
		]),
	],
	providers: [AiConciergeResolver, AiConciergeService],
	exports: [AiConciergeService],
})
export class AiConciergeModule {}

