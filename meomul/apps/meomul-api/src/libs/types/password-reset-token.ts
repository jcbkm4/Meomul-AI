import type { Document, Types } from 'mongoose';

export interface PasswordResetTokenDocument extends Document {
	_id: Types.ObjectId;
	memberId: Types.ObjectId;
	codeHash: string;
	expiresAt: Date;
	consumedAt: Date | null;
	attempts: number;
	createdAt: Date;
	updatedAt: Date;
}
