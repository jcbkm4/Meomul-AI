import { Types } from 'mongoose';
import { HotelLocation, HotelStatus, VerificationStatus, BadgeLevel, HotelType, CancellationPolicy } from '../../libs/enums/hotel.enum';
import { ReviewStatus, StayPurpose } from '../../libs/enums/common.enum';
import { RoomStatus, RoomType, BedType, ViewType } from '../../libs/enums/room.enum';
import { AiConciergeService } from './ai-concierge.service';

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
		);

		const result = await service.ask(null, {
			message: 'Need a place',
			language: 'en',
		});

		expect(result.candidates).toHaveLength(0);
		expect(result.clarifyingQuestions.length).toBeGreaterThan(0);
		expect(result.nextAction).toContain('Adjust');
	});
});
