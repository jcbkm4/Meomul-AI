/**
 * CLI wrapper around {@link syncModelIndexes} for local runs and inspection.
 *
 * In production the batch worker performs this at boot (see IndexSyncService) because the
 * built image contains only app entrypoints — this script is not available there.
 *
 * Usage:
 *   npm run indexes:sync -- --dry-run     # report differences, change nothing
 *   npm run indexes:sync                  # create missing indexes (additive, safe)
 *   npm run indexes:sync -- --prune       # also DROP indexes no longer in the schema
 */
import { Logger } from '@nestjs/common';
import mongoose from 'mongoose';

import { syncModelIndexes } from '../common/index-sync';

const logger = new Logger('SyncIndexes');

const HELP = `
Create or reconcile MongoDB indexes for every registered model.

  --dry-run   Report which indexes would be created or dropped, then exit.
  --prune     Drop indexes present in the database but absent from the schema.
              Off by default: dropping an index a running container still uses
              degrades queries mid-deploy. Run this deliberately, after rollout.
  --help      Show this message.

Connects to MONGO_PROD when NODE_ENV=production, otherwise MONGO_DEV.
`;

function resolveMongoUri(): string {
	const isProduction = process.env.NODE_ENV === 'production';
	const uri = isProduction ? process.env.MONGO_PROD : process.env.MONGO_DEV;
	if (!uri) {
		throw new Error(
			`${isProduction ? 'MONGO_PROD' : 'MONGO_DEV'} is not set. Index sync cannot run without a connection string.`,
		);
	}
	return uri;
}

async function main(): Promise<void> {
	const argv = process.argv.slice(2);
	if (argv.includes('--help') || argv.includes('-h')) {
		process.stdout.write(HELP);
		return;
	}

	// autoIndex off: this script decides when indexes are built, not model registration.
	await mongoose.connect(resolveMongoUri(), { autoIndex: false, serverSelectionTimeoutMS: 30000 });
	logger.log(`Connected (${process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'})`);

	const dryRun = argv.includes('--dry-run');
	const { failed } = await syncModelIndexes(mongoose.connection, {
		dryRun,
		prune: argv.includes('--prune'),
		logger,
	});

	await mongoose.disconnect();

	if (failed > 0) {
		throw new Error(`${failed} model(s) failed to index. Treat the deploy as unsuccessful.`);
	}
	logger.log(dryRun ? 'Dry run complete.' : 'All indexes are in place.');
}

main().catch((error: unknown) => {
	logger.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
