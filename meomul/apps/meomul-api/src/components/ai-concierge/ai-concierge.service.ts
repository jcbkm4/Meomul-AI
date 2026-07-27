import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { HotelLocation, HotelStatus, VerificationStatus, BadgeLevel } from '../../libs/enums/hotel.enum';
import { DemandLevel, ReviewStatus, StayPurpose } from '../../libs/enums/common.enum';
import { RoomStatus } from '../../libs/enums/room.enum';
import type { MemberJwtPayload } from '../../libs/types/member';
import type { HotelDocument } from '../../libs/types/hotel';
import type { RoomDocument } from '../../libs/types/room';
import type { RoomInventoryDocument } from '../../libs/types/room-inventory';
import type { ReviewDocument } from '../../libs/types/review';
import type { UserProfileDocument } from '../../libs/types/user-profile';
import type { AiConciergeSessionDocument } from '../../libs/types/ai-concierge';
import { AskStayConciergeInput } from '../../libs/dto/ai-concierge/ai-concierge.input';
import { StayCandidateDto, StayConciergeResultDto, StayIntentDto } from '../../libs/dto/ai-concierge/ai-concierge';

type CandidateContext = {
	hotel: HotelDocument;
	room: RoomDocument;
	reviewStats: ReviewStats;
	priceInsight: PriceInsight;
};

type ReviewStats = {
	count: number;
	verifiedCount: number;
	photoCount: number;
	averageRating?: number;
	recentSnippets: string[];
};

type PriceInsight = {
	currentPrice: number;
	cheapestDate?: string;
	cheapestPrice?: number;
	averagePrice?: number;
	savings?: number;
	notes: string[];
};

const MAX_RETURNED_CANDIDATES = 3;
const STAY_CONCIERGE_PROMPT_VERSION = 'stay-concierge.deterministic.v1';

const LOCATION_KEYWORDS: Record<HotelLocation, string[]> = {
	[HotelLocation.SEOUL]: ['seoul', '서울', 'gangnam', 'hongdae', 'myeongdong', 'jongno', 'itaewon', 'yeongdeungpo'],
	[HotelLocation.BUSAN]: ['busan', '부산', 'haeundae', '해운대'],
	[HotelLocation.INCHEON]: ['incheon', '인천'],
	[HotelLocation.DAEGU]: ['daegu', '대구'],
	[HotelLocation.GWANGJU]: ['gwangju', '광주'],
	[HotelLocation.DAEJON]: ['daejeon', '대전', 'daejon'],
	[HotelLocation.JEJU]: ['jeju', '제주'],
	[HotelLocation.GYEONGJU]: ['gyeongju', '경주'],
	[HotelLocation.GANGNEUNG]: ['gangneung', '강릉'],
};

const AMENITY_KEYWORDS: Record<string, string[]> = {
	workspace: ['workspace', 'work desk', 'desk', 'remote work', 'business', 'workation', '업무', '출장', '작업'],
	wifi: ['wifi', 'wi-fi', 'internet', '와이파이', '인터넷'],
	meetingRoom: ['meeting', '회의실', '미팅룸'],
	parking: ['parking', '주차'],
	breakfast: ['breakfast', '조식'],
	breakfastIncluded: ['breakfast included', '조식 포함'],
	gym: ['gym', 'fitness', '피트니스', '헬스장'],
	pool: ['pool', 'swimming', '수영장'],
	spa: ['spa', '스파'],
	familyRoom: ['family', 'kids', 'children', '가족', '아이', '키즈'],
	kidsFriendly: ['kids friendly', 'children', '아이', '키즈'],
	coupleRoom: ['couple', 'romantic', 'date', '커플', '데이트'],
	romanticView: ['romantic view', 'view', '전망', '뷰'],
	wheelchairAccessible: ['wheelchair', 'accessible', 'accessibility', '휠체어', '장애인'],
	elevator: ['elevator', '엘리베이터'],
	airportShuttle: ['airport shuttle', 'airport', '공항', '셔틀'],
};

const PURPOSE_KEYWORDS: Array<{ purpose: StayPurpose; keywords: string[]; amenities: string[] }> = [
	{
		purpose: StayPurpose.BUSINESS,
		keywords: ['business', 'work', 'remote', '출장', '업무', '워크'],
		amenities: ['workspace', 'wifi'],
	},
	{
		purpose: StayPurpose.ROMANTIC,
		keywords: ['couple', 'romantic', 'date', 'anniversary', '커플', '데이트', '기념일'],
		amenities: ['coupleRoom', 'romanticView', 'privateBath'],
	},
	{
		purpose: StayPurpose.FAMILY,
		keywords: ['family', 'children', 'kids', '가족', '아이', '키즈'],
		amenities: ['familyRoom', 'kidsFriendly'],
	},
	{
		purpose: StayPurpose.STAYCATION,
		keywords: ['staycation', 'relax', 'spa', 'pool', '호캉스', '휴식', '스파', '수영장'],
		amenities: ['pool', 'spa', 'roomService'],
	},
	{
		purpose: StayPurpose.SOLO,
		keywords: ['solo', 'alone', '혼자', '솔로'],
		amenities: ['wifi'],
	},
];

@Injectable()
export class AiConciergeService {
	private readonly logger = new Logger(AiConciergeService.name);

	constructor(
		@InjectModel('AiConciergeSession')
		private readonly aiConciergeSessionModel: Model<AiConciergeSessionDocument>,
		@InjectModel('Hotel') private readonly hotelModel: Model<HotelDocument>,
		@InjectModel('Room') private readonly roomModel: Model<RoomDocument>,
		@InjectModel('RoomInventory') private readonly roomInventoryModel: Model<RoomInventoryDocument>,
		@InjectModel('Review') private readonly reviewModel: Model<ReviewDocument>,
		@InjectModel('UserProfile') private readonly userProfileModel: Model<UserProfileDocument>,
	) {}

	public async ask(
		currentMember: MemberJwtPayload | null,
		input: AskStayConciergeInput,
	): Promise<StayConciergeResultDto> {
		const intent = await this.buildIntent(currentMember, input);
		const candidateContexts = await this.findCandidateContexts(intent);
		const deterministicCandidates = this.scoreCandidates(intent, candidateContexts);
		const clarifyingQuestions = this.buildClarifyingQuestions(intent, deterministicCandidates);
		const result = this.buildDeterministicResult(intent, deterministicCandidates, clarifyingQuestions);

		await this.storeSession(currentMember, input.message, result).catch((error) => {
			this.logger.warn(`failed to store concierge session: ${error instanceof Error ? error.message : error}`);
		});

		return result;
	}

	private async buildIntent(
		currentMember: MemberJwtPayload | null,
		input: AskStayConciergeInput,
	): Promise<StayIntentDto> {
		const message = input.message.trim();
		const lower = message.toLowerCase();
		const explicitLanguage = input.language === 'ko' || input.language === 'en' ? input.language : undefined;
		const detectedLanguage = explicitLanguage ?? (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(message) ? 'ko' : 'en');
		const profile = currentMember ? await this.getUserProfile(currentMember._id) : null;
		const location = this.extractLocation(lower) ?? this.firstEnumValue(profile?.preferredLocations, HotelLocation);
		const purpose = this.extractPurpose(lower) ?? this.firstEnumValue(profile?.preferredPurposes, StayPurpose);
		const purposeAmenities = PURPOSE_KEYWORDS.find((item) => item.purpose === purpose)?.amenities ?? [];
		const amenities = this.uniqueStrings([
			...purposeAmenities,
			...this.extractAmenities(lower),
			...(profile?.preferredAmenities ?? []),
		]);
		const budgetMax = input.budgetMax ?? this.extractBudgetMax(lower) ?? profile?.avgPriceMax;
		const guests = input.guests ?? this.extractGuests(lower);
		const roomPreferences = this.extractRoomPreferences(lower);
		const safetyPreferences = this.extractSafetyPreferences(lower);
		const transportPreferences = this.extractTransportPreferences(lower);
		const signalCount = [
			location,
			purpose,
			budgetMax,
			guests,
			input.checkIn,
			input.checkOut,
			amenities.length > 0,
			roomPreferences.length > 0,
			transportPreferences.length > 0,
		].filter(Boolean).length;

		return {
			location,
			checkIn: input.checkIn,
			checkOut: input.checkOut,
			guests,
			budgetMax,
			purpose,
			amenities,
			roomPreferences,
			safetyPreferences,
			transportPreferences,
			language: detectedLanguage,
			confidence: Math.min(0.95, 0.35 + signalCount * 0.08),
		};
	}

	private async getUserProfile(memberId: string): Promise<UserProfileDocument | null> {
		try {
			return this.userProfileModel.findOne({ memberId }).lean<UserProfileDocument>().exec();
		} catch {
			return null;
		}
	}

	private extractLocation(text: string): HotelLocation | undefined {
		for (const [location, keywords] of Object.entries(LOCATION_KEYWORDS) as Array<[HotelLocation, string[]]>) {
			if (keywords.some((keyword) => text.includes(keyword))) {
				return location;
			}
		}
		return undefined;
	}

	private extractPurpose(text: string): StayPurpose | undefined {
		return PURPOSE_KEYWORDS.find((item) => item.keywords.some((keyword) => text.includes(keyword)))?.purpose;
	}

	private extractAmenities(text: string): string[] {
		return Object.entries(AMENITY_KEYWORDS)
			.filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
			.map(([amenity]) => amenity);
	}

	private extractBudgetMax(text: string): number | undefined {
		const compact = text.replace(/,/g, '');
		const krwMatch = compact.match(
			/(?:under|below|less than|max|budget|up to|까지|이하|예산)\s*(?:₩|krw)?\s*(\d{5,7})/i,
		);
		if (krwMatch) {
			return Number(krwMatch[1]);
		}

		const manwonMatch = compact.match(/(\d+)\s*만\s*원/);
		if (manwonMatch) {
			return Number(manwonMatch[1]) * 10000;
		}

		const kMatch = compact.match(/(\d+)\s*k/);
		if (kMatch) {
			return Number(kMatch[1]) * 1000;
		}

		return undefined;
	}

	private extractGuests(text: string): number | undefined {
		const match = text.match(/(\d+)\s*(guests?|people|persons|명|인)/);
		if (!match) return undefined;
		const guests = Number(match[1]);
		return Number.isInteger(guests) && guests > 0 ? guests : undefined;
	}

	private extractRoomPreferences(text: string): string[] {
		const preferences: string[] = [];
		if (this.includesAny(text, ['quiet', '조용'])) preferences.push('quiet');
		if (this.includesAny(text, ['view', '전망', '뷰'])) preferences.push('view');
		if (this.includesAny(text, ['late check-in', 'late checkin', '늦은 체크인'])) preferences.push('late check-in');
		if (this.includesAny(text, ['early check-in', 'early checkin', '빠른 체크인'])) preferences.push('early check-in');
		return preferences;
	}

	private extractSafetyPreferences(text: string): string[] {
		const preferences: string[] = [];
		if (this.includesAny(text, ['safe', 'safety', '안전'])) preferences.push('safety');
		if (this.includesAny(text, ['24h', '24-hour', 'front desk', '프론트'])) preferences.push('24h front desk');
		if (this.includesAny(text, ['female only', 'women only', '여성 전용'])) preferences.push('female only floor');
		return preferences;
	}

	private extractTransportPreferences(text: string): string[] {
		const preferences: string[] = [];
		if (this.includesAny(text, ['subway', 'metro', 'station', '지하철', '역'])) preferences.push('near subway');
		if (this.includesAny(text, ['parking', '주차'])) preferences.push('parking');
		if (this.includesAny(text, ['airport', '공항'])) preferences.push('airport access');
		return preferences;
	}

	private async findCandidateContexts(intent: StayIntentDto): Promise<CandidateContext[]> {
		const hotelFilter: Record<string, unknown> = {
			hotelStatus: HotelStatus.ACTIVE,
		};

		if (intent.location) {
			hotelFilter.hotelLocation = intent.location;
		}

		const hotels = await this.hotelModel
			.find(hotelFilter)
			.sort({ hotelRank: -1, hotelRating: -1, hotelReviews: -1, startingPrice: 1 })
			.limit(80)
			.exec();

		if (hotels.length === 0) {
			return [];
		}

		const hotelIds = hotels.map((hotel) => hotel._id);
		const roomFilter: Record<string, unknown> = {
			hotelId: { $in: hotelIds },
			roomStatus: RoomStatus.AVAILABLE,
		};

		if (intent.guests) {
			roomFilter.maxOccupancy = { $gte: intent.guests };
		}

		const rooms = await this.roomModel.find(roomFilter).sort({ basePrice: 1, availableRooms: -1 }).limit(240).exec();
		const roomsByHotelId = new Map<string, RoomDocument[]>();
		for (const room of rooms) {
			const hotelId = String(room.hotelId);
			roomsByHotelId.set(hotelId, [...(roomsByHotelId.get(hotelId) ?? []), room]);
		}

		const contexts: CandidateContext[] = [];
		for (const hotel of hotels) {
			const bestRoom = this.pickBestRoom(intent, roomsByHotelId.get(String(hotel._id)) ?? []);
			if (!bestRoom) {
				continue;
			}

			const [reviewStats, priceInsight] = await Promise.all([
				this.getReviewStats(hotel._id),
				this.getPriceInsight(bestRoom, intent),
			]);

			contexts.push({ hotel, room: bestRoom, reviewStats, priceInsight });
		}

		return contexts;
	}

	private pickBestRoom(intent: StayIntentDto, rooms: RoomDocument[]): RoomDocument | null {
		if (rooms.length === 0) {
			return null;
		}

		return [...rooms].sort((a, b) => {
			const aPrice = this.resolveCurrentPublicPrice(a);
			const bPrice = this.resolveCurrentPublicPrice(b);
			const aBudgetPenalty = intent.budgetMax && aPrice > intent.budgetMax ? aPrice - intent.budgetMax : 0;
			const bBudgetPenalty = intent.budgetMax && bPrice > intent.budgetMax ? bPrice - intent.budgetMax : 0;
			return aBudgetPenalty - bBudgetPenalty || aPrice - bPrice || b.availableRooms - a.availableRooms;
		})[0];
	}

	private async getReviewStats(hotelId: Types.ObjectId): Promise<ReviewStats> {
		const reviews = await this.reviewModel
			.find({ hotelId, reviewStatus: ReviewStatus.APPROVED })
			.sort({ stayDate: -1, createdAt: -1 })
			.limit(20)
			.lean<ReviewDocument[]>()
			.exec();

		if (reviews.length === 0) {
			return {
				count: 0,
				verifiedCount: 0,
				photoCount: 0,
				recentSnippets: [],
			};
		}

		const averageRating =
			reviews.reduce((sum, review) => sum + (review.overallRating ?? 0), 0) / Math.max(1, reviews.length);

		return {
			count: reviews.length,
			verifiedCount: reviews.filter((review) => review.verifiedStay).length,
			photoCount: reviews.reduce((sum, review) => sum + (review.guestPhotos?.length ?? 0), 0),
			averageRating: Number(averageRating.toFixed(1)),
			recentSnippets: reviews
				.map((review) => review.reviewText)
				.filter(Boolean)
				.slice(0, 3)
				.map((text) => text.slice(0, 140)),
		};
	}

	private async getPriceInsight(room: RoomDocument, intent: StayIntentDto): Promise<PriceInsight> {
		const currentPrice = this.resolveCurrentPublicPrice(room);
		const notes: string[] = [];

		if (room.lastMinuteDeal?.isActive && room.lastMinuteDeal.validUntil > new Date()) {
			notes.push(`${room.lastMinuteDeal.discountPercent}% last-minute deal is active.`);
		}

		const monthStart = this.resolveMonthStart(intent.checkIn);
		const monthEnd = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0));
		const inventoryRows = await this.roomInventoryModel
			.find({
				roomId: room._id,
				date: { $gte: monthStart, $lte: monthEnd },
			})
			.sort({ date: 1 })
			.lean<RoomInventoryDocument[]>()
			.exec();

		const prices = inventoryRows
			.filter((row) => !row.closed && Math.max(0, (row.total ?? room.totalRooms) - (row.booked ?? 0)) > 0)
			.map((row) => ({
				date: this.formatDate(row.date),
				price: this.calculateDayPrice(
					row.overridePrice ?? row.basePrice ?? room.basePrice,
					room.weekendSurcharge,
					this.isWeekend(row.date),
					this.getDemandLevel(row, room.totalRooms),
				),
			}));

		if (prices.length === 0) {
			return { currentPrice, notes };
		}

		const cheapest = prices.reduce((min, row) => (row.price < min.price ? row : min), prices[0]);
		const averagePrice = Math.round(prices.reduce((sum, row) => sum + row.price, 0) / prices.length);
		const mostExpensive = prices.reduce((max, row) => (row.price > max.price ? row : max), prices[0]);
		const savings = mostExpensive.price - cheapest.price;

		if (cheapest.price < currentPrice) {
			notes.push(`Cheapest visible date is ${cheapest.date} at ${cheapest.price.toLocaleString()} KRW.`);
		}
		if (savings > 0) {
			notes.push(`Flexible dates can save up to ${savings.toLocaleString()} KRW this month.`);
		}

		return {
			currentPrice,
			cheapestDate: cheapest.date,
			cheapestPrice: cheapest.price,
			averagePrice,
			savings,
			notes,
		};
	}

	private scoreCandidates(intent: StayIntentDto, contexts: CandidateContext[]): StayCandidateDto[] {
		return contexts
			.map((context) => this.scoreCandidate(intent, context))
			.sort((a, b) => b.fitScore - a.fitScore)
			.slice(0, MAX_RETURNED_CANDIDATES);
	}

	private scoreCandidate(intent: StayIntentDto, context: CandidateContext): StayCandidateDto {
		const { hotel, room, reviewStats, priceInsight } = context;
		let score = 0;
		const reasons: string[] = [];
		const tradeoffs: string[] = [];
		const trustSignals: string[] = [];
		const priceInsights = [...priceInsight.notes];

		if (intent.location) {
			if (hotel.hotelLocation === intent.location) {
				score += 20;
				reasons.push(`Located in ${hotel.hotelLocation}.`);
			} else {
				tradeoffs.push(`Not in requested location (${hotel.hotelLocation}).`);
			}
		} else {
			score += 8;
		}

		if (intent.budgetMax) {
			if (priceInsight.currentPrice <= intent.budgetMax) {
				score += 20;
				reasons.push(`Estimated room price is within budget at ${priceInsight.currentPrice.toLocaleString()} KRW.`);
			} else if (priceInsight.currentPrice <= intent.budgetMax * 1.15) {
				score += 10;
				tradeoffs.push(`Slightly above budget at ${priceInsight.currentPrice.toLocaleString()} KRW.`);
			} else {
				tradeoffs.push(`Above budget at ${priceInsight.currentPrice.toLocaleString()} KRW.`);
			}
		} else {
			score += 6;
		}

		const amenityMatches = intent.amenities.filter((amenity) => this.hotelHasAmenity(hotel, amenity));
		score += Math.min(25, amenityMatches.length * 6);
		if (amenityMatches.length > 0) {
			reasons.push(`Matches requested amenities: ${amenityMatches.join(', ')}.`);
		}

		const missedAmenities = intent.amenities.filter((amenity) => !this.hotelHasAmenity(hotel, amenity));
		if (missedAmenities.length > 0) {
			tradeoffs.push(`Missing or unconfirmed amenities: ${missedAmenities.slice(0, 3).join(', ')}.`);
		}

		if (intent.guests) {
			if (room.maxOccupancy >= intent.guests) {
				score += 10;
				reasons.push(`${room.roomName} fits ${intent.guests} guest${intent.guests > 1 ? 's' : ''}.`);
			} else {
				tradeoffs.push(`Best visible room capacity is ${room.maxOccupancy}.`);
			}
		} else {
			score += 5;
		}

		if (intent.transportPreferences.includes('near subway')) {
			if (hotel.detailedLocation?.nearestSubway) {
				score += hotel.detailedLocation.walkingDistance && hotel.detailedLocation.walkingDistance <= 10 ? 8 : 5;
				reasons.push(`Near ${hotel.detailedLocation.nearestSubway} subway station.`);
			} else {
				tradeoffs.push('Subway distance is not listed.');
			}
		}

		if (intent.roomPreferences.includes('late check-in')) {
			if (hotel.flexibleCheckIn?.enabled || hotel.safetyFeatures?.frontDesk24h) {
				score += 5;
				reasons.push('Late arrival looks practical because flexible check-in or 24h front desk is available.');
			} else {
				tradeoffs.push('Late check-in support is not clearly listed.');
			}
		}

		if (hotel.verificationStatus === VerificationStatus.VERIFIED) {
			score += 4;
			trustSignals.push('Hotel is verified.');
		}
		if (hotel.badgeLevel === BadgeLevel.SUPERHOST || hotel.badgeLevel === BadgeLevel.INSPECTED) {
			score += 3;
			trustSignals.push(`${hotel.badgeLevel.toLowerCase()} badge.`);
		}
		if (hotel.safeStayCertified) {
			score += 3;
			trustSignals.push('SafeStay certified.');
		}
		if (reviewStats.verifiedCount > 0) {
			score += 3;
			trustSignals.push(
				`${reviewStats.verifiedCount} recent verified stay review${reviewStats.verifiedCount > 1 ? 's' : ''}.`,
			);
		}
		if (reviewStats.photoCount > 0) {
			score += 2;
			trustSignals.push(`${reviewStats.photoCount} guest photo signal${reviewStats.photoCount > 1 ? 's' : ''}.`);
		}
		if (hotel.warningStrikes > 0) {
			score -= Math.min(12, hotel.warningStrikes * 4);
			tradeoffs.push(`${hotel.warningStrikes} warning strike${hotel.warningStrikes > 1 ? 's' : ''} recorded.`);
		}

		if (
			priceInsight.cheapestDate &&
			priceInsight.cheapestPrice &&
			priceInsight.cheapestPrice < priceInsight.currentPrice
		) {
			score += 4;
		}

		if (reasons.length === 0) {
			reasons.push('This stay is a broad match based on active availability and platform ranking.');
		}

		return {
			hotelId: String(hotel._id),
			hotelTitle: hotel.hotelTitle,
			roomId: String(room._id),
			roomName: room.roomName,
			fitScore: Math.max(0, Math.min(100, Math.round(score))),
			reasons: reasons.slice(0, 5),
			tradeoffs: tradeoffs.slice(0, 4),
			trustSignals: trustSignals.slice(0, 5),
			priceInsights: priceInsights.slice(0, 4),
			estimatedPrice: priceInsight.currentPrice,
			cheapestDate: priceInsight.cheapestDate,
			cheapestPrice: priceInsight.cheapestPrice,
		};
	}

	private buildClarifyingQuestions(intent: StayIntentDto, candidates: StayCandidateDto[]): string[] {
		const questions: string[] = [];
		if (!intent.location) questions.push('Which city or area should I focus on?');
		if (!intent.checkIn || !intent.checkOut) questions.push('What check-in and check-out dates are you considering?');
		if (!intent.budgetMax) questions.push('What is your maximum nightly budget?');
		if (!intent.guests) questions.push('How many guests are staying?');
		if (candidates.length === 0)
			questions.push('Can you loosen one condition, such as budget, location, or amenity needs?');
		return questions.slice(0, 3);
	}

	private buildDeterministicResult(
		intent: StayIntentDto,
		candidates: StayCandidateDto[],
		clarifyingQuestions: string[],
	): StayConciergeResultDto {
		const top = candidates[0];
		const summary =
			candidates.length > 0
				? `${top.hotelTitle} is the strongest match with a ${top.fitScore}/100 fit score. I compared location, budget, amenities, room capacity, trust signals, and price timing.`
				: 'I could not find a strong stay match from the current visible hotel and room inventory.';
		const nextAction =
			candidates.length > 0
				? 'Open the best hotel, compare room details, and use price lock if the date and room fit.'
				: 'Adjust the request and try again with a broader location, budget, or amenity set.';

		return {
			intent,
			candidates,
			clarifyingQuestions,
			summary,
			nextAction,
			provider: 'deterministic',
		};
	}

	private async storeSession(
		currentMember: MemberJwtPayload | null,
		message: string,
		result: StayConciergeResultDto,
	): Promise<void> {
		await this.aiConciergeSessionModel.create({
			memberId: currentMember?._id,
			message,
			parsedIntent: result.intent,
			candidates: result.candidates,
			aiSummary: result.summary,
			provider: result.provider,
			promptVersion: STAY_CONCIERGE_PROMPT_VERSION,
		});
	}

	private firstEnumValue<T extends Record<string, string>>(values: unknown, enumType: T): T[keyof T] | undefined {
		if (!Array.isArray(values)) {
			return undefined;
		}
		// Array.isArray narrows `unknown` to `any[]`; re-widen to unknown[] so the callback
		// parameter is checked rather than silently `any`.
		const candidates: unknown[] = values;
		const enumValues = new Set<string>(Object.values(enumType));
		const matched = candidates.find((value) => typeof value === 'string' && enumValues.has(value));
		return matched as T[keyof T] | undefined;
	}

	private resolveCurrentPublicPrice(room: RoomDocument): number {
		if (room.lastMinuteDeal?.isActive && room.lastMinuteDeal.validUntil > new Date()) {
			return room.lastMinuteDeal.dealPrice;
		}
		return room.basePrice;
	}

	private hotelHasAmenity(hotel: HotelDocument, amenity: string): boolean {
		const amenities = hotel.amenities as unknown as Record<string, unknown>;
		return amenities?.[amenity] === true;
	}

	private resolveMonthStart(checkIn?: string): Date {
		if (checkIn && /^\d{4}-\d{2}-\d{2}$/.test(checkIn)) {
			const [year, month] = checkIn.split('-').map(Number);
			return new Date(Date.UTC(year, month - 1, 1));
		}
		const now = new Date();
		return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
	}

	private calculateDayPrice(
		basePrice: number,
		weekendSurcharge: number,
		isWeekend: boolean,
		demandLevel: DemandLevel,
	): number {
		let price = basePrice + (isWeekend ? weekendSurcharge : 0);
		if (demandLevel === DemandLevel.HIGH) price = Math.round(price * 1.2);
		if (demandLevel === DemandLevel.MEDIUM) price = Math.round(price * 1.05);
		return price;
	}

	private getDemandLevel(row: RoomInventoryDocument, fallbackTotal: number): DemandLevel {
		const total = row.total ?? fallbackTotal;
		const available = Math.max(0, total - (row.booked ?? 0));
		const occupancyRate = total > 0 ? (total - available) / total : 0;
		if (occupancyRate >= 0.8) return DemandLevel.HIGH;
		if (occupancyRate >= 0.4) return DemandLevel.MEDIUM;
		return DemandLevel.LOW;
	}

	private isWeekend(date: Date): boolean {
		const day = date.getUTCDay();
		return day === 5 || day === 6;
	}

	private formatDate(date: Date): string {
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, '0');
		const day = String(date.getUTCDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	private includesAny(text: string, keywords: string[]): boolean {
		return keywords.some((keyword) => text.includes(keyword));
	}

	private uniqueStrings(values: Array<string | undefined>): string[] {
		return [...new Set(values.filter((value): value is string => Boolean(value)))];
	}
}
