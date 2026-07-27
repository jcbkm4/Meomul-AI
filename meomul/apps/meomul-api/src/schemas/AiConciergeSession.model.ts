import { Schema } from 'mongoose';

const AiConciergeSessionSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			index: true,
		},
		message: {
			type: String,
			required: true,
		},
		parsedIntent: {
			type: Schema.Types.Mixed,
			required: true,
		},
		candidates: {
			type: [Schema.Types.Mixed],
			default: [],
		},
		aiSummary: {
			type: String,
			default: '',
		},
		provider: {
			type: String,
			default: 'deterministic',
		},
		modelName: String,
		promptVersion: {
			type: String,
			default: 'stay-concierge.v1',
		},
	},
	{
		timestamps: true,
		collection: 'aiconciergesessions',
	},
);

AiConciergeSessionSchema.index({ createdAt: -1 });

export default AiConciergeSessionSchema;

