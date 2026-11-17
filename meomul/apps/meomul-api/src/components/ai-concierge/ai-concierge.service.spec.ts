import { Types } from 'mongoose';
import {
	HotelLocation,
	HotelStatus,
	VerificationStatus,
	BadgeLevel,
	HotelType,
	CancellationPolicy,
} from '../../libs/enums/hotel.enum';
import { ReviewStatus, StayPurpose } from '../../libs/enums/common.enum';
import { RoomStatus, RoomType, BedType, ViewType } from '../../libs/enums/room.enum';
import { AiConciergeService } from './ai-concierge.service';
import { AiQuotaService } from './ai-quota.service';
import type { ClaudeService } from './claude.service';

/** Claude switched off: the service must behave exactly like the rule-based concierge. */
const claudeOff = { enabled: false } as unknown as ClaudeService;

/** Claude switched on, with each beta.messages.parse call answered from `outputs` in order. */
function claudeWith(outputs: unknown[]): { claude: ClaudeService; parse: jest.Mock } {
	const parse = jest.fn();
	for (const output of outputs) {
		parse.mockResolvedValueOnce({ stop_reason: 'end_turn', parsed_output: output });
	}
	const claude = {
		enabled: true,
		model: 'claude-opus-5-5',
		betas: ['server-side-fallback-2026-07-01'],
		client: { beta: { messages: { parse } } },
	} as unknown as ClaudeService;
	return { claude, parse };
}

function queryChain<T>(result: T): Record<string, jest.Mock> {
	const chain: Record<string, jest.Mock> = {
		find: jest.fn(),
		findOne: jest.fn(),
		sort: jest.fn(),
		limit: jest.fn(),
		lean: jest.fn(),
		exec: jest.fn().mockResolvedValue(result),
	};

	chain.find.mockReturnValue(chain);
	chain.findOne.mockReturnValue(chain);
	chain.sort.mockReturnValue(chain);
	chain.limit.mockReturnValue(chain);
	chain.lean.mockReturnValue(chain);

	return chain;
}

describe('AiConciergeService', () => {
	const hotelId = new Types.ObjectId();
	const roomId = new Types.ObjectId();

	const hotel = {
		_id: hotelId,
		hotelTitle: 'Meomul Business Stay Seoul',
		hotelType: HotelType.HOTEL,
		hotelLocation: HotelLocation.SEOUL,
		hotelStatus: HotelStatus.ACTIVE,
		hotelDesc: '',
		memberId: new Types.ObjectId(),
		detailedLocation: {
			city: HotelLocation.SEOUL,
			address: 'Gangnam-daero',
			coordinates: { lat: 37.5, lng: 127.0 },
			nearestSubway: 'Gangnam',
			walkingDistance: 6,
		},
		starRating: 4,
		checkInTime: '15:00',
		checkOutTime: '11:00',
		flexibleCheckIn: { enabled: true, times: ['22:00'], fee: 0 },
		flexibleCheckOut: { enabled: false, times: [], fee: 0 },
		verificationStatus: VerificationStatus.VERIFIED,
		badgeLevel: BadgeLevel.INSPECTED,
		verificationDocs: {},
		cancellationPolicy: CancellationPolicy.MODERATE,
		ageRestriction: 19,
		petsAllowed: false,
		smokingAllowed: false,
		amenities: {
			workspace: true,
			wifi: true,
			meetingRoom: true,
			parking: true,
			breakfast: false,
		},
		safetyFeatures: {
			frontDesk24h: true,
			securityCameras: true,
			roomSafe: true,
			fireSafety: true,
			wellLitParking: true,
			femaleOnlyFloors: false,
		},
		safeStayCertified: true,
		suitableFor: [StayPurpose.BUSINESS],
		hotelImages: [],
		hotelVideos: [],
		hotelViews: 0,
		hotelLikes: 0,
		hotelReviews: 12,
		hotelRating: 4.7,
		hotelRank: 90,
		startingPrice: 180000,
		warningStrikes: 0,
		strikeHistory: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const room = {
		_id: roomId,
		hotelId,
		roomType: RoomType.STANDARD,
		roomName: 'Work Suite',
		roomDesc: '',
		maxOccupancy: 2,
		bedType: BedType.QUEEN,
		bedCount: 1,
		basePrice: 180000,
		weekendSurcharge: 30000,
		roomSize: 24,
		viewType: ViewType.CITY,
		roomAmenities: ['desk', 'wifi'],
		totalRooms: 10,
		availableRooms: 3,
		currentViewers: 2,
		roomImages: [],
		roomStatus: RoomStatus.AVAILABLE,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const review = {
		_id: new Types.ObjectId(),
		reviewerId: new Types.ObjectId(),
		hotelId,
		bookingId: new Types.ObjectId(),
		verifiedStay: true,
		stayDate: new Date(),
		overallRating: 5,
		cleanlinessRating: 5,
		locationRating: 5,
		valueRating: 4,
		serviceRating: 5,
		amenitiesRating: 5,
		reviewText: 'Quiet room, fast Wi-Fi, and good desk for business travel.',
		guestPhotos: ['photo.jpg'],
		helpfulCount: 0,
		reviewViews: 0,
		reviewStatus: ReviewStatus.APPROVED,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('parses intent, scores real hotel context, and stores the session', async () => {
		const sessionModel = { create: jest.fn().mockResolvedValue({}) };
		const hotelModel = queryChain([hotel]);
		const roomModel = queryChain([room]);
		const roomInventoryModel = queryChain([
			{
				_id: new Types.ObjectId(),
				roomId,
				date: new Date(Date.UTC(2026, 4, 5)),
				total: 10,
				booked: 1,
				closed: false,
				basePrice: 160000,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
		const reviewModel = queryChain([review]);
		const userProfileModel = queryChain(null);
		const service = new AiConciergeService(
			sessionModel as never,
			hotelModel as never,
			roomModel as never,
			roomInventoryModel as never,
			reviewModel as never,
			userProfileModel as never,
			claudeOff,
			new AiQuotaService(),
		);

		const result = await service.ask(null, {
			message: 'Quiet business hotel in Seoul under 200000 KRW with workspace and subway access for 2 guests',
			language: 'en',
		});

		expect(result.intent.location).toBe(HotelLocation.SEOUL);
		expect(result.intent.purpose).toBe(StayPurpose.BUSINESS);
		expect(result.intent.budgetMax).toBe(200000);
		expect(result.candidates).toHaveLength(1);
		expect(result.candidates[0].hotelTitle).toBe('Meomul Business Stay Seoul');
		expect(result.candidates[0].fitScore).toBeGreaterThan(80);
		expect(result.candidates[0].trustSignals).toContain('Hotel is verified.');
		expect(sessionModel.create).toHaveBeenCalledTimes(1);
	});

	it('returns clarification when no active candidates match', async () => {
		const sessionModel = { create: jest.fn().mockResolvedValue({}) };
		const hotelModel = queryChain([]);
		const emptyModel = queryChain([]);
		const service = new AiConciergeService(
			sessionModel as never,
			hotelModel as never,
			emptyModel as never,
			emptyModel as never,
			emptyModel as never,
			queryChain(null) as never,
			claudeOff,
			new AiQuotaService(),
		);

		const result = await service.ask(null, {
			message: 'Need a place',
			language: 'en',
		});

		expect(result.candidates).toHaveLength(0);
		expect(result.clarifyingQuestions.length).toBeGreaterThan(0);
		expect(result.nextAction).toContain('Adjust');
	});

	const buildModels = () => ({
		sessionModel: { create: jest.fn().mockResolvedValue({}) },
		hotelModel: queryChain([hotel]),
		roomModel: queryChain([room]),
		roomInventoryModel: queryChain([]),
		reviewModel: queryChain([review]),
		userProfileModel: queryChain(null),
	});

	const claudeIntent = {
		location: HotelLocation.SEOUL,
		district: 'Gangnam',
		purpose: StayPurpose.BUSINESS,
		budgetMax: 200000,
		guests: 2,
		checkIn: null,
		checkOut: null,
		amenities: ['workspace'],
		roomPreferences: ['quiet'],
		safetyPreferences: [],
		transportPreferences: ['near subway'],
		language: 'en',
	};

	it('uses Claude picks but keeps only real candidates and our own price facts', async () => {
		const models = buildModels();
		const { claude, parse } = claudeWith([
			claudeIntent,
			{
				summary: 'The Gangnam work suite is the clear pick.',
				nextAction: 'Open the hotel and compare the Work Suite dates.',
				clarifyingQuestions: ['Which dates?'],
				picks: [
					{ hotelId: 'not-a-real-hotel', fitScore: 99, headline: 'Invented', reasons: ['x'], tradeoffs: [] },
					{ hotelId: String(hotelId), fitScore: 140, headline: 'Quiet desk near Gangnam station', reasons: ['Desk and fast Wi-Fi'], tradeoffs: [] },
				],
			},
		]);
		const service = new AiConciergeService(
			models.sessionModel as never,
			models.hotelModel as never,
			models.roomModel as never,
			models.roomInventoryModel as never,
			models.reviewModel as never,
			models.userProfileModel as never,
			claude,
			new AiQuotaService(),
		);

		const result = await service.ask(null, { message: 'Quiet work trip in Gangnam for two, under 200k', language: 'en' }, '1.2.3.4');

		expect(parse).toHaveBeenCalledTimes(2);
		expect(result.provider).toBe('claude');
		expect(result.intent.district).toBe('Gangnam');
		expect(result.candidates).toHaveLength(1);
		expect(result.candidates[0].hotelId).toBe(String(hotelId));
		expect(result.candidates[0].fitScore).toBe(100);
		expect(result.candidates[0].headline).toBe('Quiet desk near Gangnam station');
		expect(result.candidates[0].estimatedPrice).toBe(180000);
		expect(result.candidates[0].trustSignals).toContain('Hotel is verified.');
	});

	it('falls back to the rule-based result when Claude fails', async () => {
		const models = buildModels();
		const parse = jest.fn().mockRejectedValue(new Error('network down'));
		const claude = {
			enabled: true,
			model: 'claude-opus-5-5',
			betas: [],
			client: { beta: { messages: { parse } } },
		} as unknown as ClaudeService;
		const service = new AiConciergeService(
			models.sessionModel as never,
			models.hotelModel as never,
			models.roomModel as never,
			models.roomInventoryModel as never,
			models.reviewModel as never,
			models.userProfileModel as never,
			claude,
			new AiQuotaService(),
		);

		const result = await service.ask(null, {
			message: 'Quiet business hotel in Seoul under 200000 KRW with workspace and subway access for 2 guests',
			language: 'en',
		});

		expect(result.provider).toBe('deterministic');
		expect(result.candidates[0].hotelTitle).toBe('Meomul Business Stay Seoul');
	});

	it('ranks stays in the named neighbourhood first for the chat search tool', async () => {
		const models = buildModels();
		const service = new AiConciergeService(
			models.sessionModel as never,
			models.hotelModel as never,
			models.roomModel as never,
			models.roomInventoryModel as never,
			models.reviewModel as never,
			models.userProfileModel as never,
			claudeOff,
			new AiQuotaService(),
		);

		const inGangnam = await service.searchStays({ location: HotelLocation.SEOUL, district: 'Gangnam station' });
		const elsewhere = await service.searchStays({ location: HotelLocation.SEOUL, district: 'Hongdae' });

		expect(inGangnam[0].reasons).toContain('In Gangnam station.');
		expect(elsewhere[0].tradeoffs).toContain('Not in Hongdae.');
		expect(inGangnam[0].fitScore).toBeGreaterThan(elsewhere[0].fitScore);
	});
});
