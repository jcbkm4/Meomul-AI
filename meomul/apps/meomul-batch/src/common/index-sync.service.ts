import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

import { syncModelIndexes } from './index-sync';

/**
 * Builds MongoDB indexes at batch-worker boot when RUN_INDEX_SYNC=true.
 *
 * Production runs with `autoIndex: false`, so without this nothing ever creates the
 * indexes declared in the schemas and every query is a collection scan. The batch worker
 * is the right place for it: exactly one instance runs, and it starts alongside the API
 * rather than inside the request path.
 *
 * Additive only — this never drops an index. Use `npm run indexes:sync -- --prune`
 * deliberately for that, after a rollout has settled.
 *
 * A failure here is logged loudly but does not stop the worker: cron jobs still running
 * on an under-indexed database is strictly better than no cron jobs at all.
 */
@Injectable()
export class IndexSyncService implements OnApplicationBootstrap {
	private readonly logger = new Logger(IndexSyncService.name);

	constructor(@InjectConnection() private readonly connection: Connection) {}

	async onApplicationBootstrap(): Promise<void> {
		if (process.env.RUN_INDEX_SYNC !== 'true') {
			this.logger.log('RUN_INDEX_SYNC is not "true" — skipping index sync');
			return;
		}

		this.logger.log('Starting index sync');
		const startedAt = Date.now();

		try {
			const { total, failed } = await syncModelIndexes(this.connection, { logger: this.logger });
			const duration = Date.now() - startedAt;

			if (failed > 0) {
				this.logger.error(`Index sync finished in ${duration}ms with ${failed}/${total} model(s) FAILED`);
			} else {
				this.logger.log(`Index sync finished in ${duration}ms — ${total} models in place`);
			}
		} catch (error) {
			this.logger.error(`Index sync could not run — ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
