import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Thin owner of the Anthropic client.
 *
 * The AI features degrade to the deterministic concierge when ANTHROPIC_API_KEY is not set,
 * so local development and the test suite never need a key.
 */
@Injectable()
export class ClaudeService {
	private readonly logger = new Logger(ClaudeService.name);
	private readonly anthropic: Anthropic | null;

	/** Model for every AI call. Override with ANTHROPIC_MODEL. */
	public readonly model = process.env.ANTHROPIC_MODEL?.trim() || 'claude-opus-5-5';

	/**
	 * On a policy decline the API re-runs the request on a fallback model inside the same call
	 * (server-side fallbacks, routed by refusal category).
	 */
	public readonly betas: Anthropic.Beta.AnthropicBeta[] = ['server-side-fallback-2026-07-01'];

	constructor() {
		const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
		this.anthropic = apiKey ? new Anthropic({ apiKey, maxRetries: 2, timeout: 90_000 }) : null;
		this.logger.log(
			this.anthropic ? `Claude enabled (model ${this.model})` : 'ANTHROPIC_API_KEY not set: AI features use the deterministic fallback',
		);
	}

	public get enabled(): boolean {
		return this.anthropic !== null;
	}

	public get client(): Anthropic {
		if (!this.anthropic) {
			throw new Error('Claude is not configured (ANTHROPIC_API_KEY is missing).');
		}
		return this.anthropic;
	}
}
