import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import JobLockSchema from './job-lock.schema';
import { CronLockService } from './cron-lock.service';
import { IndexSyncService } from './index-sync.service';

@Global()
@Module({
	imports: [MongooseModule.forFeature([{ name: 'JobLock', schema: JobLockSchema }])],
	providers: [CronLockService, IndexSyncService],
	exports: [CronLockService],
})
export class CommonModule {}
