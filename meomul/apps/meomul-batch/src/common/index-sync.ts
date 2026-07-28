/**
 * Shared MongoDB index reconciliation.
 *
 * `database.module.ts` sets `autoIndex: false` in production, so Mongoose never builds
 * the indexes declared across `apps/meomul-api/src/schemas/` on a production database.
 * This module is the thing that does build them. It is consumed twice:
 *
 *   - `scripts/sync-indexes.ts` — the CLI, for local runs and `--dry-run` inspection.
 *   - `IndexSyncService` — runs at batch-worker boot when RUN_INDEX_SYNC=true, which is
 *     how production actually gets its indexes (the built image contains only app
 *     entrypoints, so the CLI script is not available there).
 *
 * Everything here is idempotent.
 */
import { Logger } from '@nestjs/common';
import type { Collection, Connection, IndexDefinition, IndexOptions, Schema } from 'mongoose';

import AiConciergeSessionSchema from '../../../meomul-api/src/schemas/AiConciergeSession.model';
import AnalyticsEventSchema from '../../../meomul-api/src/schemas/AnalyticsEvent.model';
import BookingSchema from '../../../meomul-api/src/schemas/Booking.model';
import ChatSchema from '../../../meomul-api/src/schemas/Chat.model';
import FollowSchema from '../../../meomul-api/src/schemas/Follow.model';
import HostApplicationSchema from '../../../meomul-api/src/schemas/HostApplication.model';
import HotelSchema from '../../../meomul-api/src/schemas/Hotel.model';
import LikeSchema from '../../../meomul-api/src/schemas/Like.model';
import MemberSchema from '../../../meomul-api/src/schemas/Member.model';
import NotificationSchema from '../../../meomul-api/src/schemas/Notification.model';
import PasswordResetTokenSchema from '../../../meomul-api/src/schemas/PasswordResetToken.model';
import PriceLockSchema from '../../../meomul-api/src/schemas/PriceLock.model';
import RecommendationCacheSchema from '../../../meomul-api/src/schemas/RecommendationCache.model';
import RefreshTokenSchema from '../../../meomul-api/src/schemas/RefreshToken.model';
import ReviewSchema from '../../../meomul-api/src/schemas/Review.model';
import RoomSchema from '../../../meomul-api/src/schemas/Room.model';
import RoomInventorySchema from '../../../meomul-api/src/schemas/RoomInventory.model';
import SearchHistorySchema from '../../../meomul-api/src/schemas/SearchHistory.model';
import UserProfileSchema from '../../../meomul-api/src/schemas/UserProfile.model';
import ViewSchema from '../../../meomul-api/src/schemas/View.model';
import JobLockSchema from './job-lock.schema';

/**
 * Model name -> schema. These names must stay identical to the ones passed to
 * `MongooseModule.forFeature(...)`, because the model name determines the collection
 * Mongoose targets. A typo here silently indexes the wrong collection.
 */
export const MODELS: Record<string, Schema> = {
	AiConciergeSession: AiConciergeSessionSchema,
	AnalyticsEvent: AnalyticsEventSchema,
	Booking: BookingSchema,
	Chat: ChatSchema,
	Follow: FollowSchema,
	HostApplication: HostApplicationSchema,
	Hotel: HotelSchema,
	JobLock: JobLockSchema,
	Like: LikeSchema,
	Member: MemberSchema,
	Notification: NotificationSchema,
	PasswordResetToken: PasswordResetTokenSchema,
	PriceLock: PriceLockSchema,
	RecommendationCache: RecommendationCacheSchema,
	RefreshToken: RefreshTokenSchema,
	Review: ReviewSchema,
	Room: RoomSchema,
	RoomInventory: RoomInventorySchema,
	SearchHistory: SearchHistorySchema,
	UserProfile: UserProfileSchema,
	View: ViewSchema,
};

export interface SyncOptions {
	/** Report differences without changing anything. */
	dryRun?: boolean;
	/** Also drop indexes present in the database but absent from the schema. */
	prune?: boolean;
	logger?: Logger;
}

export interface SyncResult {
	total: number;
	failed: number;
}

/**
 * Stable key for an index, so schema-declared and database-present indexes compare equal.
 *
 * Text indexes need special handling: a schema declares `{ title: 'text', desc: 'text' }`
 * but the server reports the key as `{ _fts: 'text', _ftsx: 1 }`, with the real fields
 * moved into `weights`. Comparing raw keys would report every text index as both missing
 * and extra. A collection can hold only one text index, so collapsing them to a single
 * token compares correctly.
 */
function indexKey(spec: Record<string, unknown>): string {
	if (Object.values(spec).includes('text') || '_fts' in spec) {
		return '<text index>';
	}
	return JSON.stringify(spec);
}

/** Only the members needed for inspection, so any concrete Model shape satisfies it. */
type IndexInspectable = { schema: Schema; collection: Collection };

async function reportDifferences(model: IndexInspectable, name: string, logger: Logger): Promise<void> {
	const declared = model.schema
		.indexes()
		.map(([spec]: [IndexDefinition, IndexOptions]) => indexKey(spec as Record<string, unknown>));

	let existing: string[];
	try {
		const dbIndexes = await model.collection.indexes();
		existing = dbIndexes.map((index) => indexKey(index.key as Record<string, unknown>));
	} catch {
		// Collection does not exist yet — every declared index counts as missing.
		logger.log(`${name}: collection does not exist yet; ${declared.length} index(es) would be created`);
		return;
	}

	const missing = declared.filter((key) => !existing.includes(key));
	// `_id_` is always present and never schema-declared; it is not an extra.
	const extra = existing.filter((key) => key !== '{"_id":1}' && !declared.includes(key));

	if (missing.length === 0 && extra.length === 0) {
		logger.log(`${name}: up to date (${declared.length} index(es))`);
		return;
	}
	if (missing.length > 0) {
		logger.warn(`${name}: ${missing.length} index(es) MISSING -> ${missing.join(', ')}`);
	}
	if (extra.length > 0) {
		logger.warn(`${name}: ${extra.length} index(es) not in schema -> ${extra.join(', ')}`);
	}
}

/**
 * Create (or reconcile) indexes for every model in {@link MODELS} on the given connection.
 *
 * Defaults to additive: `createIndexes()` adds what is missing and leaves everything else
 * alone. Dropping an index that a still-running container depends on would degrade queries
 * mid-deploy, so pruning is opt-in and should be run deliberately after a rollout settles.
 */
export async function syncModelIndexes(connection: Connection, options: SyncOptions = {}): Promise<SyncResult> {
	const { dryRun = false, prune = false } = options;
	const logger = options.logger ?? new Logger('IndexSync');

	const entries = Object.entries(MODELS);
	logger.log(`${entries.length} models registered${dryRun ? ' — dry run, nothing will change' : ''}`);

	let failed = 0;

	for (const [name, schema] of entries) {
		// Reuse an already-compiled model when a feature module registered it first;
		// re-registering the same name on one connection throws OverwriteModelError.
		const model = connection.models[name] ?? connection.model(name, schema);

		try {
			if (dryRun) {
				await reportDifferences(model, name, logger);
				continue;
			}

			const started = Date.now();
			if (prune) {
				// syncIndexes = create missing AND drop those no longer declared.
				const dropped = await model.syncIndexes();
				logger.log(
					`${name}: synced in ${Date.now() - started}ms` +
						(dropped.length > 0 ? ` (dropped ${dropped.join(', ')})` : ''),
				);
			} else {
				await model.createIndexes();
				logger.log(`${name}: indexes created in ${Date.now() - started}ms`);
			}
		} catch (error) {
			failed += 1;
			logger.error(`${name}: FAILED — ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return { total: entries.length, failed };
}
