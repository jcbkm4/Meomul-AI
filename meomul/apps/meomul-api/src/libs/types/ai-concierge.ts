import type { Document, Types } from 'mongoose';
import type { StayCandidateDto, StayIntentDto } from '../dto/ai-concierge/ai-concierge';

export interface AiConciergeSessionDocument extends Document {
	_id: Types.ObjectId;
	memberId?: Types.ObjectId;
	message: string;
	parsedIntent: StayIntentDto;
	candidates: StayCandidateDto[];
	aiSummary: string;
	provider: string;
	modelName?: string;
	promptVersion: string;
	createdAt: Date;
	updatedAt: Date;
}

