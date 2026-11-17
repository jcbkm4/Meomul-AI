import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { HotelLocation } from '../../libs/enums/hotel.enum';
import { StayPurpose } from '../../libs/enums/common.enum';
import type { StayCandidateDto } from '../../libs/dto/ai-concierge/ai-concierge';
import { AiConciergeService } from './ai-concierge.service';
import { AiQuotaService } from './ai-quota.service';
import { ClaudeService } from './claude.service';
import { CHAT_SYSTEM_PROMPT } from './ai-prompts';

export interface ChatTurn {
	role: 'user' | 'assistant';
	content: string;
}

export interface ChatContext {
	visitorKey: string;
	pagePath?: string;
	locale?: string;
	/** Stays already shown to the guest as cards in this conversation, newest first. */
	shownStays?: Array<{ hotelId: string; title: string }>;
}

/** A bracketed note about shown stays must never reach the model as transcript text. */
const SHOWN_NOTE = /\n*\[Stays shown[^\]]*\]\s*$/i;

/** One hotel card the chat window renders under the assistant's reply. */
export interface ChatHotelCard {
	hotelId: string;
	title: string;
	image?: string;
	location?: string;
	district?: string;
	rating?: number;
	reviews?: number;
	roomId?: string;
	roomName?: string;
	pricePerNight?: number;
	fitScore: number;
}

export type ChatEvent =
	| { type: 'status'; step: 'search' | 'details'; city?: string }
	| { type: 'delta'; text: string }
	| { type: 'hotels'; items: ChatHotelCard[] }
	| { type: 'done' }
	| { type: 'error'; code: 'unavailable' | 'quota' | 'failed'; message: string };

const MAX_TOOL_ROUNDS = 5;
const MAX_HISTORY_CHARS = 16_000;

const SearchHotelsInput = z.object({
	location: z.enum(HotelLocation).optional(),
	district: z.string().max(60).optional(),
	purpose: z.enum(StayPurpose).optional(),
	budget_max_krw: z.number().int().positive().optional(),
	guests: z.number().int().positive().max(20).optional(),
	check_in: z.string().optional(),
	check_out: z.string().optional(),
	amenities: z.array(z.string()).max(12).optional(),
	near_subway: z.boolean().optional(),
});

const HotelDetailsInput = z.object({
	hotel_id: z.string().min(1),
});

const ShowStaysInput = z.object({
	hotel_ids: z.array(z.string().min(1)).min(1).max(4),
});

const MAX_SHOWN_STAYS = 4;
/** Stop a reply when the upstream stream has been silent this long... */
const STREAM_IDLE_MS = 60_000;
/** ...or when the whole reply (all tool rounds) runs past this. */
const REPLY_OVERALL_MS = 90_000;

/** Tool definitions are fixed and in a fixed order so the prompt-cache prefix stays stable. */
const CHAT_TOOLS: Anthropic.Beta.BetaTool[] = [
	{
		name: 'search_hotels',
		description:
			'Search Meomul\'s live hotel inventory in South Korea. Returns up to five matching stays with the best-fitting room, its nightly price in KRW, rating and a fit score. Call it whenever the guest wants options; leave out filters the guest has not given.',
		eager_input_streaming: true,
		input_schema: {
			type: 'object',
			properties: {
				location: { type: 'string', enum: Object.values(HotelLocation), description: 'City.' },
				district: {
					type: 'string',
					description: 'Neighbourhood or landmark the guest named, in English (Gangnam, Hongdae, Myeongdong, Haeundae).',
				},
				purpose: { type: 'string', enum: Object.values(StayPurpose), description: 'Trip purpose.' },
				budget_max_krw: { type: 'integer', description: 'Maximum price per night in KRW.' },
				guests: { type: 'integer', description: 'Number of guests in one room.' },
				check_in: { type: 'string', description: 'YYYY-MM-DD' },
				check_out: { type: 'string', description: 'YYYY-MM-DD' },
				amenities: {
					type: 'array',
					items: {
						type: 'string',
						enum: [
							'workspace', 'wifi', 'meetingRoom', 'parking', 'breakfast', 'breakfastIncluded', 'gym', 'pool',
							'spa', 'roomService', 'restaurant', 'familyRoom', 'kidsFriendly', 'coupleRoom', 'romanticView',
							'privateBath', 'wheelchairAccessible', 'elevator', 'airportShuttle', 'evCharging',
						],
					},
					description: 'Amenities the guest asked for.',
				},
				near_subway: { type: 'boolean', description: 'True when the guest wants to be close to a subway station.' },
			},
			additionalProperties: false,
		},
	},
	{
		name: 'get_hotel_details',
		description:
			'Get one hotel\'s full facts: address, nearest subway, check-in/out times, cancellation policy, amenities, bookable rooms with nightly prices, and recent guest reviews. Use the hotelId from search_hotels results.',
		eager_input_streaming: true,
		input_schema: {
			type: 'object',
			properties: {
				hotel_id: { type: 'string', description: 'hotelId from search_hotels.' },
			},
			required: ['hotel_id'],
			additionalProperties: false,
		},
	},
	{
		name: 'show_stays',
		description:
			'Show the guest the stays you recommend, as cards with photo, name, area, rating and nightly price under your reply. Call it once per reply with your picks, best first: one to four hotelIds from search_hotels or get_hotel_details. Skip it when you are not recommending specific stays.',
		eager_input_streaming: true,
		input_schema: {
			type: 'object',
			properties: {
				hotel_ids: {
					type: 'array',
					items: { type: 'string' },
					description: 'hotelIds to show, best first (at most four).',
				},
			},
			required: ['hotel_ids'],
			additionalProperties: false,
		},
	},
];

const CITY_LABELS: Record<string, string> = {
	SEOUL: 'Seoul',
	BUSAN: 'Busan',
	INCHEON: 'Incheon',
	DAEGU: 'Daegu',
	GWANGJU: 'Gwangju',
	DAEJON: 'Daejeon',
	JEJU: 'Jeju',
	GYEONGJU: 'Gyeongju',
	GANGNEUNG: 'Gangneung',
};

@Injectable()
export class AiChatService {
	private readonly logger = new Logger(AiChatService.name);

	constructor(
		private readonly claude: ClaudeService,
		private readonly quota: AiQuotaService,
		private readonly concierge: AiConciergeService,
	) {}

	public async run(history: ChatTurn[], context: ChatContext, emit: (event: ChatEvent) => void, signal: AbortSignal): Promise<void> {
		if (!this.claude.enabled) {
			emit({ type: 'error', code: 'unavailable', message: 'The AI assistant is not switched on yet.' });
			return;
		}

		const decision = this.quota.consume(context.visitorKey, 'chat');
		if (!decision.ok) {
			emit({
				type: 'error',
				code: 'quota',
				message:
					decision.reason === 'daily'
						? 'The assistant has reached today\'s limit. Please try again tomorrow.'
						: `You have sent a lot of messages. Please try again in about ${Math.ceil(decision.retryAfterSeconds / 60)} minutes.`,
			});
			return;
		}

		const messages: Anthropic.Beta.BetaMessageParam[] = this.toMessages(history);
		// Per-request facts go in an appended system message, not the top-level system prompt,
		// so the cached prefix (tools + system) stays byte-identical across visitors.
		messages.push({ role: 'system', content: this.describeContext(context) });

		let wroteText = false;
		// Cards for every stay the tools returned in this reply, so show_stays can render picks.
		const knownStays = new Map<string, ChatHotelCard>();

		// Watchdog: a reply must keep moving. A stalled upstream stream would otherwise leave the
		// guest looking at "Searching..." forever, so stop after a silence or an overall cap.
		const watchdog = new AbortController();
		let stopReason: 'client' | 'idle' | 'overall' | null = null;
		const stop = (reason: 'client' | 'idle' | 'overall') => {
			if (!stopReason) stopReason = reason;
			watchdog.abort();
		};
		const onClientAbort = () => stop('client');
		signal.addEventListener('abort', onClientAbort);
		let idleTimer = setTimeout(() => stop('idle'), STREAM_IDLE_MS);
		const overallTimer = setTimeout(() => stop('overall'), REPLY_OVERALL_MS);
		const stillAlive = () => {
			clearTimeout(idleTimer);
			idleTimer = setTimeout(() => stop('idle'), STREAM_IDLE_MS);
		};

		try {
			for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
				let roundHasText = false;
				stillAlive();
				const stream = this.claude.client.beta.messages.stream(
					{
						model: this.claude.model,
						max_tokens: 8000,
						betas: this.claude.betas,
						fallbacks: 'default',
						output_config: { effort: 'low' },
						cache_control: { type: 'ephemeral' },
						system: [{ type: 'text', text: CHAT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
						tools: CHAT_TOOLS,
						messages,
					},
					{ signal: watchdog.signal },
				);

				stream.on('streamEvent', stillAlive);
				stream.on('text', (delta) => {
					if (!roundHasText && wroteText) {
						emit({ type: 'delta', text: '\n\n' });
					}
					roundHasText = true;
					wroteText = true;
					emit({ type: 'delta', text: delta });
				});

				const message = await stream.finalMessage();
				this.logger.log(
					`Claude chat usage: in=${message.usage.input_tokens} out=${message.usage.output_tokens} cacheRead=${message.usage.cache_read_input_tokens ?? 0} cacheWrite=${message.usage.cache_creation_input_tokens ?? 0}`,
				);

				if (message.stop_reason === 'refusal') {
					if (!wroteText) {
						emit({ type: 'delta', text: 'Sorry, I can\'t help with that. I\'m happy to help you find a stay in Korea.' });
					}
					break;
				}

				if (message.stop_reason === 'pause_turn') {
					messages.push({ role: 'assistant', content: message.content });
					continue;
				}

				const toolUses = message.content.filter(
					(block): block is Anthropic.Beta.BetaToolUseBlock => block.type === 'tool_use',
				);
				if (message.stop_reason !== 'tool_use' || toolUses.length === 0) {
					break;
				}

				messages.push({ role: 'assistant', content: message.content });
				const results = await Promise.all(toolUses.map((toolUse) => this.runTool(toolUse, emit, knownStays)));
				messages.push({ role: 'user', content: results });
			}

			if (!wroteText) {
				emit({ type: 'delta', text: 'Here is what I found.' });
			}
			emit({ type: 'done' });
		} catch (error) {
			if (stopReason === 'client') {
				this.logger.log('chat stopped: the guest closed the connection');
				return;
			}
			if (stopReason) {
				this.logger.warn(`chat stopped: no reply progress (${stopReason})`);
				emit({ type: 'error', code: 'failed', message: 'This is taking longer than it should. Please try again.' });
				return;
			}
			this.logger.warn(`chat failed: ${error instanceof Error ? error.message : error}`);
			emit({
				type: 'error',
				code: 'failed',
				message: error instanceof Anthropic.RateLimitError ? 'The assistant is busy right now. Please try again in a moment.' : 'Something went wrong. Please try again.',
			});
		} finally {
			clearTimeout(idleTimer);
			clearTimeout(overallTimer);
			signal.removeEventListener('abort', onClientAbort);
		}
	}

	private async runTool(
		toolUse: Anthropic.Beta.BetaToolUseBlock,
		emit: (event: ChatEvent) => void,
		knownStays: Map<string, ChatHotelCard>,
	): Promise<Anthropic.Beta.BetaToolResultBlockParam> {
		try {
			if (toolUse.name === 'search_hotels') {
				const parsed = SearchHotelsInput.safeParse(toolUse.input);
				if (!parsed.success) {
					return this.toolError(toolUse.id, `Invalid input: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`);
				}
				const input = parsed.data;
				emit({ type: 'status', step: 'search', city: input.location ? CITY_LABELS[input.location] ?? input.location : undefined });
				const results = await this.concierge.searchStays({
					location: input.location,
					district: input.district,
					purpose: input.purpose,
					budgetMax: input.budget_max_krw,
					guests: input.guests,
					checkIn: input.check_in,
					checkOut: input.check_out,
					amenities: input.amenities,
					nearSubway: input.near_subway,
				});
				for (const candidate of results) {
					knownStays.set(candidate.hotelId, this.toCard(candidate));
				}
				return {
					type: 'tool_result',
					tool_use_id: toolUse.id,
					content: JSON.stringify({
						count: results.length,
						stays: results.map((candidate) => ({
							hotelId: candidate.hotelId,
							name: candidate.hotelTitle,
							city: candidate.hotelLocation,
							district: candidate.hotelDistrict ?? null,
							guestRating: candidate.hotelRating ?? null,
							bestRoom: candidate.roomName ?? null,
							pricePerNightKrw: candidate.estimatedPrice ?? null,
							cheapestDateThisMonth: candidate.cheapestDate ?? null,
							fitScore: candidate.fitScore,
							why: candidate.reasons,
							watchOut: candidate.tradeoffs,
						})),
					}),
				};
			}

			if (toolUse.name === 'get_hotel_details') {
				const parsed = HotelDetailsInput.safeParse(toolUse.input);
				if (!parsed.success) {
					return this.toolError(toolUse.id, 'Invalid input: hotel_id is required.');
				}
				emit({ type: 'status', step: 'details' });
				const details = await this.concierge.getHotelDetails(parsed.data.hotel_id);
				if (!details) {
					return this.toolError(toolUse.id, 'No active hotel with that id.');
				}
				return { type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(details) };
			}

			if (toolUse.name === 'show_stays') {
				const parsed = ShowStaysInput.safeParse(toolUse.input);
				if (!parsed.success) {
					return this.toolError(toolUse.id, 'Invalid input: hotel_ids must list one to four hotelIds.');
				}
				const ids = [...new Set(parsed.data.hotel_ids)].slice(0, MAX_SHOWN_STAYS);
				const missing = ids.filter((id) => !knownStays.has(id));
				if (missing.length > 0) {
					for (const candidate of await this.concierge.getStayCards(missing)) {
						knownStays.set(candidate.hotelId, this.toCard(candidate));
					}
				}
				const cards = ids.flatMap((id) => {
					const card = knownStays.get(id);
					return card ? [card] : [];
				});
				if (cards.length === 0) {
					return this.toolError(toolUse.id, 'None of those hotelIds matched an active stay.');
				}
				emit({ type: 'hotels', items: cards });
				return {
					type: 'tool_result',
					tool_use_id: toolUse.id,
					content: `Shown to the guest as cards: ${cards.map((card) => card.title).join(', ')}.`,
				};
			}

			return this.toolError(toolUse.id, `Unknown tool ${toolUse.name}.`);
		} catch (error) {
			this.logger.warn(`tool ${toolUse.name} failed: ${error instanceof Error ? error.message : error}`);
			return this.toolError(toolUse.id, 'The lookup failed. Try again or continue without it.');
		}
	}

	private toolError(toolUseId: string, message: string): Anthropic.Beta.BetaToolResultBlockParam {
		return { type: 'tool_result', tool_use_id: toolUseId, is_error: true, content: message };
	}

	private toCard(candidate: StayCandidateDto): ChatHotelCard {
		return {
			hotelId: candidate.hotelId,
			title: candidate.hotelTitle,
			image: candidate.hotelImage,
			location: candidate.hotelLocation,
			district: candidate.hotelDistrict,
			rating: candidate.hotelRating,
			reviews: candidate.hotelReviews,
			roomId: candidate.roomId,
			roomName: candidate.roomName,
			pricePerNight: candidate.estimatedPrice,
			fitScore: candidate.fitScore,
		};
	}

	/**
	 * The browser sends the visible transcript (text only). Normalise it into a valid
	 * alternating conversation that starts and ends with the guest, newest turns kept.
	 */
	private toMessages(history: ChatTurn[]): Anthropic.Beta.BetaMessageParam[] {
		const turns: ChatTurn[] = [];
		for (const turn of history) {
			const content = turn.content.replace(SHOWN_NOTE, '').trim();
			if (!content) continue;
			const last = turns[turns.length - 1];
			if (last && last.role === turn.role) {
				last.content = `${last.content}\n\n${content}`;
			} else {
				turns.push({ role: turn.role, content });
			}
		}
		while (turns.length > 0 && turns[0].role !== 'user') turns.shift();
		while (turns.length > 0 && turns[turns.length - 1].role !== 'user') turns.pop();

		let total = 0;
		const kept: ChatTurn[] = [];
		for (let index = turns.length - 1; index >= 0; index -= 1) {
			total += turns[index].content.length;
			if (total > MAX_HISTORY_CHARS && kept.length > 0) break;
			kept.unshift(turns[index]);
		}
		while (kept.length > 0 && kept[0].role !== 'user') kept.shift();

		return kept.map((turn) => ({ role: turn.role, content: turn.content }));
	}

	private describeContext(context: ChatContext): string {
		const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
		const lines = [`Today is ${today} (Korea time).`];
		const hotelMatch = context.pagePath?.match(/^\/hotels\/([a-f0-9]{24})/i);
		if (hotelMatch) {
			lines.push(`The guest is looking at the hotel page for hotelId ${hotelMatch[1]}.`);
		} else if (context.pagePath) {
			lines.push(`The guest is on the page ${context.pagePath.slice(0, 120)}.`);
		}
		if (context.shownStays && context.shownStays.length > 0) {
			const shown = context.shownStays
				.map((stay) => `${stay.title.replace(/\s+/g, ' ').slice(0, 120)} (hotelId ${stay.hotelId})`)
				.join('; ');
			lines.push(`Stays already shown to the guest as cards, newest first: ${shown}.`);
		}
		if (context.locale && /^[a-z]{2}$/.test(context.locale) && context.locale !== 'en') {
			lines.push(`The site is set to the "${context.locale}" language.`);
		}
		return lines.join(' ');
	}
}
