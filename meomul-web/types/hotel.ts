export type HotelLocation =
  | "SEOUL"
  | "BUSAN"
  | "DAEGU"
  | "DAEJON"
  | "GWANGJU"
  | "INCHEON"
  | "JEJU"
  | "GYEONGJU"
  | "GANGNEUNG";

export type HotelType =
  | "HOTEL"
  | "MOTEL"
  | "RESORT"
  | "GUESTHOUSE"
  | "HANOK"
  | "PENSION";
export type CancellationPolicy = "FLEXIBLE" | "MODERATE" | "STRICT";
export type HotelStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "DELETE";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type BadgeLevel = "NONE" | "VERIFIED" | "SUPERHOST" | "INSPECTED";

export type RoomType =
  | "STANDARD"
  | "DELUXE"
  | "SUITE"
  | "FAMILY"
  | "PREMIUM"
  | "PENTHOUSE";
export type RoomStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "INACTIVE";
export type BedType = "SINGLE" | "DOUBLE" | "QUEEN" | "KING" | "TWIN";
export type ViewType = "CITY" | "OCEAN" | "MOUNTAIN" | "GARDEN" | "NONE";
export type StayPurpose =
  | "BUSINESS"
  | "ROMANTIC"
  | "FAMILY"
  | "SOLO"
  | "STAYCATION"
  | "EVENT"
  | "MEDICAL"
  | "LONG_TERM";
export type HotelAmenityKey =
  | "workspace"
  | "wifi"
  | "meetingRoom"
  | "coupleRoom"
  | "romanticView"
  | "privateBath"
  | "familyRoom"
  | "kidsFriendly"
  | "playground"
  | "pool"
  | "spa"
  | "roomService"
  | "restaurant"
  | "parking"
  | "breakfast"
  | "breakfastIncluded"
  | "gym"
  | "airportShuttle"
  | "evCharging"
  | "wheelchairAccessible"
  | "elevator"
  | "accessibleBathroom"
  | "visualAlarms"
  | "serviceAnimalsAllowed";

export interface PaginationInput {
  page: number;
  limit: number;
  sort: string;
  direction: 1 | -1;
}

export interface PriceRangeInput {
  start?: number;
  end?: number;
}

export interface HotelSearchInput {
  location?: HotelLocation;
  dong?: string;
  nearestSubway?: string;
  subwayLines?: number[];
  maxWalkingDistance?: number;
  hotelTypes?: HotelType[];
  roomTypes?: RoomType[];
  priceRange?: PriceRangeInput;
  starRatings?: number[];
  minRating?: number;
  amenities?: HotelAmenityKey[];
  verifiedOnly?: boolean;
  purpose?: StayPurpose;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  petsAllowed?: boolean;
  wheelchairAccessible?: boolean;
  text?: string;
}

export interface MetaCounterDto {
  total: number;
}

export interface HotelListItem {
  _id: string;
  hotelTitle: string;
  hotelLocation: HotelLocation;
  hotelType: HotelType;
  hotelRating: number;
  hotelLikes: number;
  hotelImages: string[];
}

export interface HotelDetailItem extends HotelListItem {
  memberId: string;
  hotelDesc: string;
  hotelStatus: HotelStatus;
  verificationStatus: VerificationStatus;
  badgeLevel: BadgeLevel;
  hotelRank: number;
  hotelReviews: number;
  hotelViews: number;
  warningStrikes: number;
  startingPrice: number;
  safeStayCertified: boolean;
  ageRestriction: number;
  maxPetWeight?: number | null;
  hotelVideos: string[];
  starRating: number;
  checkInTime: string;
  checkOutTime: string;
  suitableFor: string[];
  petsAllowed: boolean;
  smokingAllowed: boolean;
  cancellationPolicy: CancellationPolicy;
  flexibleCheckIn: {
    enabled: boolean;
    times: string[];
    fee: number;
  };
  flexibleCheckOut: {
    enabled: boolean;
    times: string[];
    fee: number;
  };
  detailedLocation: {
    address: string;
    city: HotelLocation;
    district?: string | null;
    dong?: string | null;
    nearestSubway?: string | null;
    subwayExit?: string | null;
    subwayLines?: number[] | null;
    walkingDistance?: number | null;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: {
    wifi: boolean;
    wifiSpeed?: number | null;
    parking: boolean;
    parkingFee: number;
    breakfast: boolean;
    breakfastIncluded: boolean;
    roomService: boolean;
    gym: boolean;
    pool: boolean;
    workspace: boolean;
    familyRoom: boolean;
    kidsFriendly: boolean;
    wheelchairAccessible: boolean;
    elevator: boolean;
    accessibleBathroom: boolean;
    visualAlarms: boolean;
    serviceAnimalsAllowed: boolean;
    airportShuttle: boolean;
    evCharging: boolean;
    playground: boolean;
    meetingRoom: boolean;
    privateBath: boolean;
    restaurant: boolean;
    spa: boolean;
    coupleRoom: boolean;
    romanticView: boolean;
  };
  safetyFeatures: {
    fireSafety: boolean;
    securityCameras: boolean;
    frontDesk24h: boolean;
    roomSafe: boolean;
    femaleOnlyFloors: boolean;
    wellLitParking: boolean;
  };
  verificationDocs: {
    businessLicense?: string | null;
    touristLicense?: string | null;
    propertyOwnership?: string | null;
  };
  strikeHistory: Array<{
    date: string;
    reason: string;
    bookingId: string;
  }>;
  lastInspectionDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface HotelsDto {
  list: HotelListItem[];
  metaCounter: MetaCounterDto;
}

export interface GetHotelsQueryData {
  getHotels: HotelsDto;
}

export interface GetHotelsQueryVars {
  input: PaginationInput;
  search?: HotelSearchInput;
}

export interface GetHotelsCountQueryData {
  getHotelsCount: MetaCounterDto;
}

export interface GetHotelsCountQueryVars {
  search?: HotelSearchInput;
}

export interface RoomListItem {
  _id: string;
  hotelId?: string;
  roomName: string;
  roomType: RoomType;
  roomNumber?: string | null;
  roomDesc?: string;
  viewType: ViewType;
  maxOccupancy?: number;
  bedType?: BedType;
  bedCount?: number;
  weekendSurcharge?: number;
  roomSize?: number;
  roomAmenities?: string[];
  totalRooms?: number;
  basePrice: number;
  availableRooms: number;
  currentViewers?: number;
  lastMinuteDeal?: {
    isActive: boolean;
    discountPercent: number;
    originalPrice: number;
    dealPrice: number;
    validUntil: string;
  } | null;
  roomImages: string[];
  roomStatus: RoomStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomDetailItem extends RoomListItem {
  hotelId: string;
  roomNumber?: string | null;
  roomDesc: string;
  maxOccupancy: number;
  bedType: BedType;
  bedCount: number;
  weekendSurcharge: number;
  roomSize: number;
  viewType: ViewType;
  roomAmenities: string[];
  totalRooms: number;
  currentViewers: number;
  lastMinuteDeal?: {
    isActive: boolean;
    discountPercent: number;
    originalPrice: number;
    dealPrice: number;
    validUntil: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomsDto {
  list: RoomListItem[];
  metaCounter: MetaCounterDto;
}

export interface GetRoomsByHotelQueryData {
  getRoomsByHotel: RoomsDto;
}

export interface GetRoomsByHotelQueryVars {
  hotelId: string;
  input: PaginationInput;
}

export interface GetHotelQueryData {
  getHotel: HotelDetailItem;
}

export interface GetHotelQueryVars {
  hotelId: string;
}

export interface HotelContextItem {
  _id: string;
  memberId: string;
  hotelTitle: string;
  hotelLocation: HotelLocation;
  hotelType: HotelType;
  safeStayCertified: boolean;
  starRating: number;
  hotelImages: string[];
  checkInTime: string;
  checkOutTime: string;
  suitableFor: string[];
  petsAllowed: boolean;
  smokingAllowed: boolean;
  cancellationPolicy: CancellationPolicy;
  flexibleCheckIn: {
    enabled: boolean;
    times: string[];
    fee: number;
  };
  flexibleCheckOut: {
    enabled: boolean;
    times: string[];
    fee: number;
  };
  detailedLocation: {
    address: string;
    city: string;
    district?: string | null;
    dong?: string | null;
    nearestSubway?: string | null;
    subwayExit?: string | null;
    subwayLines?: string[] | null;
    walkingDistance?: number | null;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: {
    wifi: boolean;
    wifiSpeed?: number | null;
    parking: boolean;
    parkingFee: number;
    breakfast: boolean;
    breakfastIncluded: boolean;
    roomService: boolean;
    gym: boolean;
    pool: boolean;
    workspace: boolean;
    familyRoom: boolean;
    kidsFriendly: boolean;
    wheelchairAccessible: boolean;
    elevator: boolean;
    accessibleBathroom: boolean;
    visualAlarms: boolean;
    serviceAnimalsAllowed: boolean;
    airportShuttle: boolean;
    evCharging: boolean;
    playground: boolean;
    meetingRoom: boolean;
    privateBath: boolean;
    restaurant: boolean;
    spa: boolean;
    coupleRoom: boolean;
    romanticView: boolean;
  };
  safetyFeatures: {
    fireSafety: boolean;
    securityCameras: boolean;
    frontDesk24h: boolean;
    roomSafe: boolean;
    femaleOnlyFloors: boolean;
    wellLitParking: boolean;
  };
  ageRestriction: number;
  maxPetWeight?: number | null;
}

export interface GetHotelContextQueryData {
  getHotel: HotelContextItem;
}

export interface GetHotelContextQueryVars {
  hotelId: string;
}

export interface GetRoomQueryData {
  getRoom: RoomDetailItem;
}

export interface GetRoomQueryVars {
  roomId: string;
}

export interface GetAgentHotelsQueryData {
  getAgentHotels: HotelsDto;
}

export interface GetAgentHotelsQueryVars {
  input: PaginationInput;
}

export interface DashboardStatsDto {
  totalMembers: number;
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  totalReviews: number;
  newBookingsToday: number;
  checkInsToday: number;
  checkOutsToday: number;
  newReviewsToday: number;
  newMembersToday: number;
  pendingHotels: number;
  activeHotels: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  totalChats: number;
  waitingChats: number;
  activeChats: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalNotifications: number;
  unreadNotifications: number;
}

export interface AdminHotelListItem {
  _id: string;
  hotelTitle: string;
  hotelLocation: HotelLocation;
  hotelType: HotelType;
  hotelStatus: HotelStatus;
  verificationStatus: VerificationStatus;
  badgeLevel: BadgeLevel;
  hotelRating: number;
  hotelLikes: number;
  hotelImages: string[];
  warningStrikes: number;
  safeStayCertified: boolean;
  starRating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminHotelsDto {
  list: AdminHotelListItem[];
  metaCounter: MetaCounterDto;
}

export interface GetAllHotelsAdminQueryData {
  getAllHotelsAdmin: AdminHotelsDto;
}

export interface GetAllHotelsAdminQueryVars {
  input: PaginationInput;
  statusFilter?: HotelStatus;
}

export interface HotelUpdateInput {
  _id: string;
  hotelStatus?: HotelStatus;
  verificationStatus?: VerificationStatus;
  badgeLevel?: BadgeLevel;
  starRating?: number;
}

export interface UpdateHotelByAdminMutationVars {
  input: HotelUpdateInput;
}

export interface UpdateHotelByAdminMutationData {
  updateHotelByAdmin: AdminHotelListItem;
}

export interface AdminRoomListItem {
  _id: string;
  hotelId: string;
  roomName: string;
  roomType: RoomType;
  roomStatus: RoomStatus;
  basePrice: number;
  availableRooms: number;
  roomImages: string[];
  bedType: BedType;
  viewType: ViewType;
  maxOccupancy: number;
  roomSize: number;
}

export interface AdminRoomsDto {
  list: AdminRoomListItem[];
  metaCounter: MetaCounterDto;
}

export interface GetAllRoomsAdminQueryData {
  getAllRoomsAdmin: AdminRoomsDto;
}

export interface GetAllRoomsAdminQueryVars {
  input: PaginationInput;
  statusFilter?: RoomStatus;
}

export interface UpdateRoomByAdminMutationData {
  updateRoomByAdmin: {
    _id: string;
    roomName: string;
    roomType: RoomType;
    roomStatus: RoomStatus;
    basePrice: number;
    availableRooms: number;
  };
}

export interface GetDashboardStatsQueryData {
  getDashboardStats: DashboardStatsDto;
}

export type ReviewStatus = "PENDING" | "APPROVED" | "FLAGGED" | "REMOVED";
export type LikeGroup = "MEMBER" | "HOTEL" | "ARTICLE" | "REVIEW";
export type DemandLevel = "LOW" | "MEDIUM" | "HIGH";

export interface HotelResponseDto {
  responseText: string;
  respondedBy?: string | null;
  respondedAt?: string | null;
}

export interface ReviewDto {
  _id: string;
  reviewerId: string;
  reviewerNick?: string | null;
  reviewerImage?: string | null;
  bookingId: string;
  hotelId: string;
  overallRating: number;
  cleanlinessRating: number;
  locationRating: number;
  serviceRating: number;
  amenitiesRating: number;
  valueRating: number;
  reviewTitle?: string | null;
  reviewText: string;
  guestPhotos: string[];
  helpfulCount: number;
  reviewStatus: ReviewStatus;
  verifiedStay: boolean;
  stayDate: string;
  createdAt: string;
  updatedAt?: string;
  reviewViews?: number;
  hotelResponse?: HotelResponseDto | null;
}

export interface ReviewRatingsSummaryDto {
  totalReviews: number;
  overallRating: number;
  cleanlinessRating: number;
  locationRating: number;
  serviceRating: number;
  amenitiesRating: number;
  valueRating: number;
}

export interface ReviewsDto {
  list: ReviewDto[];
  metaCounter: MetaCounterDto;
  ratingsSummary?: ReviewRatingsSummaryDto | null;
}

export interface GetHotelReviewsQueryData {
  getHotelReviews: ReviewsDto;
}

export interface GetHotelReviewsQueryVars {
  hotelId: string;
  input: PaginationInput;
}

export interface GetAllReviewsAdminQueryData {
  getAllReviewsAdmin: ReviewsDto;
}

export interface GetAllReviewsAdminQueryVars {
  input: PaginationInput;
  statusFilter?: ReviewStatus;
}

export interface RespondToReviewMutationData {
  respondToReview: ReviewDto;
}

export interface RespondToReviewMutationVars {
  reviewId: string;
  responseText: string;
}

export interface GetSimilarHotelsQueryData {
  getSimilarHotels: HotelListItem[];
}

export interface GetSimilarHotelsQueryVars {
  hotelId: string;
  limit?: number;
}

export interface GetTrendingByLocationQueryData {
  getTrendingByLocation: HotelListItem[];
}

export interface GetTrendingByLocationQueryVars {
  location: HotelLocation;
  limit?: number;
}

export interface GetTrendingHotelsQueryData {
  getTrendingHotels: HotelListItem[];
}

export interface GetTrendingHotelsQueryVars {
  limit?: number;
}

export interface HomeTestimonialDto {
  hotelId: string;
  hotelTitle: string;
  review: ReviewDto;
}

export interface HomeLastMinuteDealDto {
  roomId: string;
  hotelId: string;
  hotelTitle: string;
  hotelLocation: HotelLocation | string;
  roomName: string;
  roomType: RoomType | string;
  imageUrl: string;
  basePrice: number;
  dealPrice: number;
  discountPercent: number;
  validUntil: string;
}

export interface HomeFeedInput {
  heroLimit?: number;
  trendingLimit?: number;
  dealsLimit?: number;
  testimonialsLimit?: number;
  featuredReviewLimit?: number;
  recommendationLimit?: number;
}

export interface HomeFeedDto {
  topHotels: HotelListItem[];
  hotelInventoryTotal: number;
  totalVerifiedReviews: number;
  trendingHotels: HotelListItem[];
  featuredReviews: ReviewDto[];
  featuredRatingsSummary?: ReviewRatingsSummaryDto | null;
  lastMinuteDeals: HomeLastMinuteDealDto[];
  testimonials: HomeTestimonialDto[];
  recommendationMeta?: RecommendationMetaDto | null;
  recommendationResult?: RecommendedHotelsV2Dto | null;
}

export interface GetHomeTestimonialsQueryData {
  getHomeTestimonials: HomeTestimonialDto[];
}

export interface GetHomeTestimonialsQueryVars {
  limit?: number;
}

export interface GetHomeLastMinuteDealsQueryData {
  getHomeLastMinuteDeals: HomeLastMinuteDealDto[];
}

export interface GetHomeLastMinuteDealsQueryVars {
  limit?: number;
}

export interface GetHomeFeedQueryData {
  getHomeFeed: HomeFeedDto;
}

export interface GetHomeFeedQueryVars {
  input?: HomeFeedInput;
}

export interface GetRecommendedHotelsQueryData {
  getRecommendedHotels: HotelListItem[];
}

export interface GetRecommendedHotelsQueryVars {
  limit?: number;
}

export interface RecommendationMetaDto {
  profileSource: "onboarding" | "computed";
  onboardingWeight: number;
  behaviorWeight: number;
  matchedLocationCount: number;
  fallbackCount: number;
  strictStageCount: number;
  relaxedStageCount: number;
  generalStageCount: number;
}

export interface RecommendationExplanationDto {
  hotelId: string;
  stage: string;
  fromFallback: boolean;
  matchedLocation: boolean;
  matchedType: boolean;
  matchedPrice: boolean;
  likedSimilar: boolean;
  matchedPurposes: string[];
  matchedAmenities: string[];
  signals: string[];
}

export interface RecommendedHotelsV2Dto {
  list: HotelListItem[];
  meta: RecommendationMetaDto;
  explanations: RecommendationExplanationDto[];
}

export interface GetRecommendedHotelsV2QueryData {
  getRecommendedHotelsV2: RecommendedHotelsV2Dto;
}

export interface GetRecommendedHotelsV2QueryVars {
  limit?: number;
}

export interface HasLikedQueryData {
  hasLiked: boolean;
}

export interface HasLikedQueryVars {
  likeRefId: string;
  likeGroup: LikeGroup;
}

export interface MyLikeListItem {
  _id: string;
  likeGroup: LikeGroup;
  likeRefId: string;
  memberId: string;
  createdAt: string;
}

export interface GetMyLikesQueryData {
  getMyLikes: MyLikeListItem[];
}

export interface GetMyLikesQueryVars {
  likeGroup: LikeGroup;
}

export interface ToggleLikeMutationData {
  toggleLike: {
    liked: boolean;
    likeCount: number;
  };
}

export interface ToggleLikeMutationVars {
  input: {
    likeGroup: LikeGroup;
    likeRefId: string;
  };
}

export interface MarkHelpfulMutationData {
  markHelpful: {
    _id: string;
    helpfulCount: number;
  };
}

export interface MarkHelpfulMutationVars {
  reviewId: string;
}

export interface DayPriceDto {
  date: string;
  price: number;
  isWeekend: boolean;
  demandLevel: DemandLevel;
  localEvent?: string | null;
  availableRooms?: number | null;
}

export interface PriceCalendarDto {
  calendar: DayPriceDto[];
  cheapestDate: {
    date: string;
    price: number;
  };
  mostExpensiveDate: {
    date: string;
    price: number;
  };
  averagePrice: number;
  savings: number;
}

export interface GetPriceCalendarQueryData {
  getPriceCalendar: PriceCalendarDto;
}

export interface GetPriceCalendarQueryVars {
  input: {
    roomId: string;
    month?: string;
  };
}

export interface PriceLockDto {
  _id: string;
  roomId: string;
  lockedPrice: number;
  expiresAt: string;
  createdAt: string;
}

export interface GetMyPriceLockQueryData {
  getMyPriceLock: PriceLockDto | null;
}

export interface GetMyPriceLockQueryVars {
  roomId: string;
}

export interface GetMyPriceLocksQueryData {
  getMyPriceLocks: PriceLockDto[];
}

export interface LockPriceMutationData {
  lockPrice: PriceLockDto;
}

export interface LockPriceMutationVars {
  input: {
    roomId: string;
    currentPrice: number;
  };
}

export interface CancelPriceLockMutationData {
  cancelPriceLock: boolean;
}

export interface CancelPriceLockMutationVars {
  priceLockId: string;
}

// ─── Agent hotel & room management ───────────────────────────────────────────

export interface AgentRoomListItem {
  _id: string;
  hotelId: string;
  roomName: string;
  roomType: RoomType;
  roomNumber?: string | null;
  roomDesc: string;
  maxOccupancy: number;
  bedType: BedType;
  bedCount: number;
  basePrice: number;
  weekendSurcharge: number;
  roomSize: number;
  viewType: ViewType;
  roomAmenities: string[];
  roomImages: string[];
  roomStatus: RoomStatus;
  totalRooms: number;
  availableRooms: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRoomsDto {
  list: AgentRoomListItem[];
  metaCounter: MetaCounterDto;
}

export interface GetAgentRoomsQueryData {
  getAgentRooms: AgentRoomsDto;
}

export interface GetAgentRoomsQueryVars {
  hotelId: string;
  input: PaginationInput;
}

export interface DetailedLocationInput {
  city: HotelLocation;
  address: string;
  coordinates: { lat: number; lng: number };
  district?: string;
  dong?: string;
  nearestSubway?: string;
  subwayExit?: string;
  subwayLines?: number[];
  walkingDistance?: number;
}

export interface AmenitiesInput {
  wifi?: boolean;
  wifiSpeed?: number;
  parking?: boolean;
  parkingFee?: number;
  breakfast?: boolean;
  breakfastIncluded?: boolean;
  roomService?: boolean;
  gym?: boolean;
  pool?: boolean;
  workspace?: boolean;
  familyRoom?: boolean;
  kidsFriendly?: boolean;
  wheelchairAccessible?: boolean;
  elevator?: boolean;
  accessibleBathroom?: boolean;
  visualAlarms?: boolean;
  serviceAnimalsAllowed?: boolean;
  airportShuttle?: boolean;
  evCharging?: boolean;
  playground?: boolean;
  meetingRoom?: boolean;
  privateBath?: boolean;
  restaurant?: boolean;
  spa?: boolean;
  coupleRoom?: boolean;
  romanticView?: boolean;
}

export interface SafetyFeaturesInput {
  fireSafety?: boolean;
  securityCameras?: boolean;
  frontDesk24h?: boolean;
  roomSafe?: boolean;
  femaleOnlyFloors?: boolean;
  wellLitParking?: boolean;
}

export interface AgentHotelCreateInput {
  hotelType: HotelType;
  hotelTitle: string;
  hotelLocation: HotelLocation;
  detailedLocation: DetailedLocationInput;
  hotelDesc?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  flexibleCheckIn?: { enabled: boolean; times?: string[]; fee?: number };
  flexibleCheckOut?: { enabled: boolean; times?: string[]; fee?: number };
  cancellationPolicy?: CancellationPolicy;
  ageRestriction?: number;
  petsAllowed?: boolean;
  maxPetWeight?: number;
  smokingAllowed?: boolean;
  amenities?: AmenitiesInput;
  safetyFeatures?: SafetyFeaturesInput;
  suitableFor?: StayPurpose[];
  hotelImages?: string[];
  hotelVideos?: string[];
}

export interface AgentHotelUpdateInput {
  _id: string;
  hotelTitle?: string;
  hotelDesc?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: CancellationPolicy;
  petsAllowed?: boolean;
  maxPetWeight?: number;
  smokingAllowed?: boolean;
  amenities?: AmenitiesInput;
  safetyFeatures?: SafetyFeaturesInput;
  suitableFor?: string[];
  hotelImages?: string[];
  hotelVideos?: string[];
  flexibleCheckIn?: { enabled: boolean; times?: string[]; fee?: number };
  flexibleCheckOut?: { enabled: boolean; times?: string[]; fee?: number };
}

export interface CreateHotelMutationData {
  createHotel: HotelListItem & { hotelStatus: HotelStatus; memberId: string };
}

export interface CreateHotelMutationVars {
  input: AgentHotelCreateInput;
}

export interface UpdateHotelMutationData {
  updateHotel: HotelDetailItem;
}

export interface UpdateHotelMutationVars {
  input: AgentHotelUpdateInput;
}

export interface AgentRoomCreateInput {
  hotelId: string;
  roomType: RoomType;
  roomName: string;
  maxOccupancy: number;
  bedType: BedType;
  bedCount: number;
  basePrice: number;
  totalRooms: number;
  roomNumber?: string;
  roomDesc?: string;
  weekendSurcharge?: number;
  roomSize?: number;
  viewType?: ViewType;
  roomAmenities?: string[];
  roomImages?: string[];
}

export interface AgentRoomUpdateInput {
  _id: string;
  roomName?: string;
  roomDesc?: string;
  basePrice?: number;
  weekendSurcharge?: number;
  roomSize?: number;
  viewType?: ViewType;
  roomAmenities?: string[];
  totalRooms?: number;
  roomImages?: string[];
  roomStatus?: RoomStatus;
}

export interface CreateRoomMutationData {
  createRoom: AgentRoomListItem;
}

export interface CreateRoomMutationVars {
  input: AgentRoomCreateInput;
}

export interface UpdateRoomMutationData {
  updateRoom: AgentRoomListItem;
}

export interface UpdateRoomMutationVars {
  input: AgentRoomUpdateInput;
}
