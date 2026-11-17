import { Injectable } from '@nestjs/common';

export type AiQuotaKind = 'chat' | 'match';

export type AiQuotaDecision = { ok: true } | { ok: false; reason: 'visitor' | 'daily'; retryAfterSeconds: number };

const HOUR_MS = 60 * 60 * 1000;

const readLimit = (name: string, fallback: number): number => {
	const value = Number(process.env[name]);
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};

/**
 * Spend guard for the public demo: every Claude call costs money, so each visitor gets a
 * per-hour allowance and the whole site gets a daily cap. In-memory is enough for a single
 * API instance; the counters reset when the process restarts.
 */
@Injectable()
export class AiQuotaService {
	private readonly perVisitorPerHour: Record<AiQuotaKind, number> = {
		chat: readLimit('AI_CHAT_PER_VISITOR_PER_HOUR', 30),
		match: readLimit('AI_MATCH_PER_VISITOR_PER_HOUR', 12),
	};
	private readonly dailyLimit = readLimit('AI_DAILY_LIMIT', 600);

	private readonly visitorHits = new Map<string, number[]>();
	private dayKey = this.currentDayKey();
	private dayCount = 0;

	public consume(visitorKey: string, kind: AiQuotaKind): AiQuotaDecision {
		const now = Date.now();

		const today = this.currentDayKey();
		if (today !== this.dayKey) {
			this.dayKey = today;
			this.dayCount = 0;
		}
		if (this.dayCount >= this.dailyLimit) {
			return { ok: false, reason: 'daily', retryAfterSeconds: this.secondsUntilTomorrow(now) };
		}

		const key = `${kind}:${visitorKey}`;
		const recent = (this.visitorHits.get(key) ?? []).filter((time) => now - time < HOUR_MS);
		if (recent.length >= this.perVisitorPerHour[kind]) {
			this.visitorHits.set(key, recent);
			return { ok: false, reason: 'visitor', retryAfterSeconds: Math.ceil((recent[0] + HOUR_MS - now) / 1000) };
		}

		recent.push(now);
		this.visitorHits.set(key, recent);
		this.dayCount += 1;
		this.pruneOccasionally(now);
		return { ok: true };
	}

	private pruneOccasionally(now: number): void {
		if (this.visitorHits.size < 5000) {
			return;
		}
		for (const [key, times] of this.visitorHits) {
			if (times.every((time) => now - time >= HOUR_MS)) {
				this.visitorHits.delete(key);
			}
		}
	}

	/** Day boundaries follow Korea time, where the site's visitors and data are. */
	private currentDayKey(): string {
		return new Date(Date.now() + 9 * HOUR_MS).toISOString().slice(0, 10);
	}

	private secondsUntilTomorrow(now: number): number {
		const kst = new Date(now + 9 * HOUR_MS);
		const nextMidnightKst = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + 1) - 9 * HOUR_MS;
		return Math.max(60, Math.ceil((nextMidnightKst - now) / 1000));
	}
}

/** The visitor's address: Cloudflare's CF-Connecting-IP when present, else the socket address. */
export const resolveVisitorKey = (req: { headers?: Record<string, unknown>; ip?: string } | undefined): string => {
	const cfIp = req?.headers?.['cf-connecting-ip'];
	if (typeof cfIp === 'string' && cfIp.length > 0) {
		return cfIp;
	}
	return req?.ip ?? 'unknown';
};
