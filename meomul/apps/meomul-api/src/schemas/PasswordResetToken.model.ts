import { Schema } from 'mongoose';

/**
 * Single-use, short-lived password reset codes.
 *
 * The code itself is never stored — only a SHA-256 hash, the same approach used for
 * refresh tokens. A database leak therefore does not hand out the ability to take over
 * accounts.
 */
const PasswordResetTokenSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
			index: true,
		},
		codeHash: {
			type: String,
			required: true,
			index: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		/** Set once the code has been redeemed, so a code cannot be replayed. */
		consumedAt: {
			type: Date,
			default: null,
		},
		/** Guards against brute-forcing a 6-digit code within its lifetime. */
		attempts: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

// Sweep redeemed and expired documents an hour past expiry. Validity is still checked
// explicitly at read time — a TTL monitor only runs about once a minute, so it must
// never be the thing enforcing expiry.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
PasswordResetTokenSchema.index({ memberId: 1, consumedAt: 1 });

export default PasswordResetTokenSchema;
