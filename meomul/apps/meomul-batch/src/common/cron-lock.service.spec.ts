import { CronLockService } from './cron-lock.service';

/**
 * CronLockService is what stops two batch containers running the same job at once —
 * double-charging, double-notifying, or double-releasing inventory. It had no coverage,
 * and until the jest `roots` fix the whole batch app was excluded from `npm test`.
 */
describe('CronLockService', () => {
	const JOB = 'refresh-deals';
	const TTL = 60_000;

	const createService = (lockHolder: 'us' | 'other' | 'error' = 'us') => {
		const jobLockModel = {
			findOneAndUpdate: jest.fn<{ exec: () => Promise<unknown> }, [Record<string, unknown>, unknown, unknown]>(),
			updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
		};

		const service = new CronLockService(jobLockModel as never);
		// ownerId is derived from hostname and pid; read it back rather than reproducing it.
		const ownerId = (service as unknown as { ownerId: string }).ownerId;

		if (lockHolder === 'error') {
			jobLockModel.findOneAndUpdate.mockReturnValue({
				exec: jest.fn().mockRejectedValue(new Error('E11000 duplicate key error')),
			});
		} else {
			jobLockModel.findOneAndUpdate.mockReturnValue({
				exec: jest.fn().mockResolvedValue({
					name: JOB,
					owner: lockHolder === 'us' ? ownerId : 'another-host:999',
				}),
			});
		}

		return { service, jobLockModel, ownerId };
	};

	it('runs the task when it acquires the lock', async () => {
		const { service } = createService('us');
		const task = jest.fn().mockResolvedValue(undefined);

		await service.runLocked(JOB, TTL, task);

		expect(task).toHaveBeenCalledTimes(1);
	});

	it('only claims locks that are expired or already ours', async () => {
		const { service, jobLockModel, ownerId } = createService('us');

		await service.runLocked(JOB, TTL, jest.fn().mockResolvedValue(undefined));

		const [filter] = jobLockModel.findOneAndUpdate.mock.calls[0];
		expect(filter.name).toBe(JOB);

		// Without this condition a second container would steal a live lock: it claims
		// only a lock whose deadline has passed, or one this instance already owns.
		const clauses = filter.$or as [{ lockedUntil: { $lte: Date } }, { owner: string }];
		expect(clauses[0].lockedUntil.$lte).toBeInstanceOf(Date);
		expect(clauses[1]).toEqual({ owner: ownerId });
	});

	it('skips the task when another instance holds the lock', async () => {
		const { service, jobLockModel } = createService('other');
		const task = jest.fn().mockResolvedValue(undefined);

		await service.runLocked(JOB, TTL, task);

		expect(task).not.toHaveBeenCalled();
		// Nothing to release — it was never ours.
		expect(jobLockModel.updateOne).not.toHaveBeenCalled();
	});

	it('skips the task when the lock query fails, rather than running unprotected', async () => {
		const { service } = createService('error');
		const task = jest.fn().mockResolvedValue(undefined);

		await service.runLocked(JOB, TTL, task);

		// Racing two containers is worse than skipping one scheduled run.
		expect(task).not.toHaveBeenCalled();
	});

	it('releases the lock after a successful run', async () => {
		const { service, jobLockModel, ownerId } = createService('us');

		await service.runLocked(JOB, TTL, jest.fn().mockResolvedValue(undefined));

		const release = jobLockModel.updateOne.mock.calls.at(-1) as [
			Record<string, unknown>,
			{ $set: Record<string, unknown> },
		];
		expect(release[0]).toEqual({ name: JOB, owner: ownerId });
		// Epoch zero == immediately claimable by the next run.
		expect((release[1].$set.lockedUntil as Date).getTime()).toBe(0);
	});

	it('releases the lock even when the task throws, and rethrows', async () => {
		const { service, jobLockModel } = createService('us');
		const failure = new Error('deal refresh exploded');

		await expect(service.runLocked(JOB, TTL, jest.fn().mockRejectedValue(failure))).rejects.toThrow(failure);

		// A held lock after a crash would block the job until its TTL expired.
		const release = jobLockModel.updateOne.mock.calls.at(-1) as [unknown, { $set: Record<string, unknown> }];
		expect((release[1].$set.lockedUntil as Date).getTime()).toBe(0);
	});

	it('records the failure reason on the lock document', async () => {
		const { service, jobLockModel } = createService('us');

		await expect(
			service.runLocked(JOB, TTL, jest.fn().mockRejectedValue(new Error('deal refresh exploded'))),
		).rejects.toThrow();

		const [, update] = jobLockModel.updateOne.mock.calls[0] as [unknown, { $set: Record<string, unknown> }];
		expect(update.$set.lastError).toBe('deal refresh exploded');
	});

	it('truncates a huge error message instead of writing it whole', async () => {
		const { service, jobLockModel } = createService('us');

		await expect(
			service.runLocked(JOB, TTL, jest.fn().mockRejectedValue(new Error('x'.repeat(5000)))),
		).rejects.toThrow();

		const [, update] = jobLockModel.updateOne.mock.calls[0] as [unknown, { $set: Record<string, unknown> }];
		expect((update.$set.lastError as string).length).toBe(1000);
	});

	describe('failure alerting', () => {
		const originalWebhook = process.env.BATCH_ALERT_WEBHOOK_URL;

		afterEach(() => {
			process.env.BATCH_ALERT_WEBHOOK_URL = originalWebhook;
			jest.restoreAllMocks();
		});

		it('does not call out when no webhook is configured', async () => {
			delete process.env.BATCH_ALERT_WEBHOOK_URL;
			const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(null));
			const { service } = createService('us');

			await expect(service.runLocked(JOB, TTL, jest.fn().mockRejectedValue(new Error('boom')))).rejects.toThrow();

			expect(fetchSpy).not.toHaveBeenCalled();
		});

		it('swallows webhook failures so alerting cannot take down the worker', async () => {
			process.env.BATCH_ALERT_WEBHOOK_URL = 'https://hooks.example.com/alert';
			jest.spyOn(global, 'fetch').mockRejectedValue(new Error('webhook host unreachable'));
			const { service } = createService('us');

			// The job's own error must surface — not the webhook's.
			await expect(service.runLocked(JOB, TTL, jest.fn().mockRejectedValue(new Error('boom')))).rejects.toThrow('boom');
		});
	});
});
