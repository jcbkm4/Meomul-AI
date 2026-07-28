export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AmenitiesDto = {
  __typename?: 'AmenitiesDto';
  accessibleBathroom: Scalars['Boolean']['output'];
  airportShuttle: Scalars['Boolean']['output'];
  breakfast: Scalars['Boolean']['output'];
  breakfastIncluded: Scalars['Boolean']['output'];
  coupleRoom: Scalars['Boolean']['output'];
  elevator: Scalars['Boolean']['output'];
  evCharging: Scalars['Boolean']['output'];
  familyRoom: Scalars['Boolean']['output'];
  gym: Scalars['Boolean']['output'];
  kidsFriendly: Scalars['Boolean']['output'];
  meetingRoom: Scalars['Boolean']['output'];
  parking: Scalars['Boolean']['output'];
  parkingFee: Scalars['Int']['output'];
  playground: Scalars['Boolean']['output'];
  pool: Scalars['Boolean']['output'];
  privateBath: Scalars['Boolean']['output'];
  restaurant: Scalars['Boolean']['output'];
  romanticView: Scalars['Boolean']['output'];
  roomService: Scalars['Boolean']['output'];
  serviceAnimalsAllowed: Scalars['Boolean']['output'];
  spa: Scalars['Boolean']['output'];
  visualAlarms: Scalars['Boolean']['output'];
  wheelchairAccessible: Scalars['Boolean']['output'];
  wifi: Scalars['Boolean']['output'];
  wifiSpeed?: Maybe<Scalars['Int']['output']>;
  workspace: Scalars['Boolean']['output'];
};

export type AmenitiesInput = {
  accessibleBathroom?: Scalars['Boolean']['input'];
  airportShuttle?: Scalars['Boolean']['input'];
  breakfast?: Scalars['Boolean']['input'];
  breakfastIncluded?: Scalars['Boolean']['input'];
  coupleRoom?: Scalars['Boolean']['input'];
  elevator?: Scalars['Boolean']['input'];
  evCharging?: Scalars['Boolean']['input'];
  familyRoom?: Scalars['Boolean']['input'];
  gym?: Scalars['Boolean']['input'];
  kidsFriendly?: Scalars['Boolean']['input'];
  meetingRoom?: Scalars['Boolean']['input'];
  parking?: Scalars['Boolean']['input'];
  parkingFee?: Scalars['Int']['input'];
  playground?: Scalars['Boolean']['input'];
  pool?: Scalars['Boolean']['input'];
  privateBath?: Scalars['Boolean']['input'];
  restaurant?: Scalars['Boolean']['input'];
  romanticView?: Scalars['Boolean']['input'];
  roomService?: Scalars['Boolean']['input'];
  serviceAnimalsAllowed?: Scalars['Boolean']['input'];
  spa?: Scalars['Boolean']['input'];
  visualAlarms?: Scalars['Boolean']['input'];
  wheelchairAccessible?: Scalars['Boolean']['input'];
  wifi?: Scalars['Boolean']['input'];
  wifiSpeed?: InputMaybe<Scalars['Int']['input']>;
  workspace?: Scalars['Boolean']['input'];
};

export type AnalyticsEventDto = {
  __typename?: 'AnalyticsEventDto';
  _id: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  eventName: Scalars['String']['output'];
  eventPath?: Maybe<Scalars['String']['output']>;
  memberId: Scalars['String']['output'];
  memberType: MemberType;
  payload?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type AnalyticsEventSearchInput = {
  eventName?: InputMaybe<Scalars['String']['input']>;
  fromDate?: InputMaybe<Scalars['String']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  memberType?: InputMaybe<MemberType>;
  source?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};

export type AnalyticsEventsDto = {
  __typename?: 'AnalyticsEventsDto';
  list: Array<AnalyticsEventDto>;
  metaCounter: MetaCounterDto;
};

export type AskStayConciergeInput = {
  budgetMax?: InputMaybe<Scalars['Int']['input']>;
  checkIn?: InputMaybe<Scalars['String']['input']>;
  checkOut?: InputMaybe<Scalars['String']['input']>;
  guests?: InputMaybe<Scalars['Int']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
};

export type AuthMemberDto = {
  __typename?: 'AuthMemberDto';
  _id: Scalars['String']['output'];
  accessToken: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  hostAccessStatus: HostAccessStatus;
  memberAddress?: Maybe<Scalars['String']['output']>;
  memberArticles: Scalars['Int']['output'];
  memberAuthType: MemberAuthType;
  memberBadges: Array<Scalars['String']['output']>;
  memberComments: Scalars['Int']['output'];
  memberDesc?: Maybe<Scalars['String']['output']>;
  memberFollowers: Scalars['Int']['output'];
  memberFollowings: Scalars['Int']['output'];
  memberFullName?: Maybe<Scalars['String']['output']>;
  memberImage?: Maybe<Scalars['String']['output']>;
  memberLikes: Scalars['Int']['output'];
  memberNick: Scalars['String']['output'];
  memberPhone: Scalars['String']['output'];
  memberPoints: Scalars['Int']['output'];
  memberProperties: Scalars['Int']['output'];
  memberRank: Scalars['Float']['output'];
  memberStatus: MemberStatus;
  memberType: MemberType;
  memberViews: Scalars['Int']['output'];
  subscriptionExpiry?: Maybe<Scalars['DateTime']['output']>;
  subscriptionTier: SubscriptionTier;
  updatedAt: Scalars['DateTime']['output'];
};

export type BadgeLevel =
  | 'INSPECTED'
  | 'NONE'
  | 'SUPERHOST'
  | 'VERIFIED';

export type BedType =
  | 'DOUBLE'
  | 'KING'
  | 'QUEEN'
  | 'SINGLE'
  | 'TWIN';

export type BookedRoomDto = {
  __typename?: 'BookedRoomDto';
  guestName?: Maybe<Scalars['String']['output']>;
  pricePerNight: Scalars['Int']['output'];
  quantity: Scalars['Int']['output'];
  roomId: Scalars['String']['output'];
  roomType: Scalars['String']['output'];
};

export type BookedRoomInput = {
  guestName?: InputMaybe<Scalars['String']['input']>;
  pricePerNight: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
  roomId: Scalars['String']['input'];
  roomType: Scalars['String']['input'];
};

export type BookingDto = {
  __typename?: 'BookingDto';
  _id: Scalars['String']['output'];
  adultCount: Scalars['Int']['output'];
  ageVerified: Scalars['Boolean']['output'];
  bookingCode: Scalars['String']['output'];
  bookingStatus: BookingStatus;
  cancellationDate?: Maybe<Scalars['DateTime']['output']>;
  cancellationFlow?: Maybe<CancellationFlow>;
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledByMemberId?: Maybe<Scalars['String']['output']>;
  cancelledByMemberType?: Maybe<MemberType>;
  checkInDate: Scalars['DateTime']['output'];
  checkOutDate: Scalars['DateTime']['output'];
  childCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  discount: Scalars['Int']['output'];
  earlyCheckIn: Scalars['Boolean']['output'];
  earlyCheckInFee: Scalars['Int']['output'];
  guestId: Scalars['String']['output'];
  hotelId: Scalars['String']['output'];
  hotelImages?: Maybe<Array<Scalars['String']['output']>>;
  hotelLocation?: Maybe<Scalars['String']['output']>;
  hotelTitle?: Maybe<Scalars['String']['output']>;
  hotelType?: Maybe<HotelType>;
  lateCheckOut: Scalars['Boolean']['output'];
  lateCheckOutFee: Scalars['Int']['output'];
  nights: Scalars['Int']['output'];
  paidAmount: Scalars['Int']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  qrCode?: Maybe<Scalars['String']['output']>;
  refundAmount?: Maybe<Scalars['Int']['output']>;
  refundDate?: Maybe<Scalars['DateTime']['output']>;
  refundEvidence?: Maybe<Array<Scalars['String']['output']>>;
  refundReason?: Maybe<Scalars['String']['output']>;
  rooms: Array<BookedRoomDto>;
  serviceFee: Scalars['Int']['output'];
  specialRequests?: Maybe<Scalars['String']['output']>;
  subtotal: Scalars['Int']['output'];
  taxes: Scalars['Int']['output'];
  totalPrice: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  verificationMethod?: Maybe<Scalars['String']['output']>;
  weekendSurcharge: Scalars['Int']['output'];
};

export type BookingGuestCandidateDto = {
  __typename?: 'BookingGuestCandidateDto';
  _id: Scalars['String']['output'];
  memberFullName?: Maybe<Scalars['String']['output']>;
  memberNick: Scalars['String']['output'];
  memberPhone: Scalars['String']['output'];
};

export type BookingInput = {
  adultCount: Scalars['Int']['input'];
  checkInDate: Scalars['DateTime']['input'];
  checkOutDate: Scalars['DateTime']['input'];
  childCount?: Scalars['Int']['input'];
  earlyCheckIn?: Scalars['Boolean']['input'];
  guestId?: InputMaybe<Scalars['String']['input']>;
  hotelId: Scalars['String']['input'];
  lateCheckOut?: Scalars['Boolean']['input'];
  paymentMethod: PaymentMethod;
  rooms: Array<BookedRoomInput>;
  specialRequests?: InputMaybe<Scalars['String']['input']>;
};

export type BookingStatus =
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CONFIRMED'
  | 'NO_SHOW'
  | 'PENDING';

export type BookingsDto = {
  __typename?: 'BookingsDto';
  list: Array<BookingDto>;
  metaCounter: MetaCounterDto;
};

export type BudgetLevel =
  | 'BUDGET'
  | 'LUXURY'
  | 'MID'
  | 'PREMIUM';

export type CancellationFlow =
  | 'GUEST'
  | 'OPERATOR';

export type CancellationPolicy =
  | 'FLEXIBLE'
  | 'MODERATE'
  | 'STRICT';

export type ChatDto = {
  __typename?: 'ChatDto';
  _id: Scalars['String']['output'];
  assignedAgentId?: Maybe<Scalars['String']['output']>;
  bookingId?: Maybe<Scalars['String']['output']>;
  chatScope: ChatScope;
  chatStatus: ChatStatus;
  createdAt: Scalars['DateTime']['output'];
  guestId: Scalars['String']['output'];
  guestImage?: Maybe<Scalars['String']['output']>;
  guestMemberType?: Maybe<MemberType>;
  guestNick?: Maybe<Scalars['String']['output']>;
  hotelId?: Maybe<Scalars['String']['output']>;
  lastMessage?: Maybe<MessageDto>;
  lastMessageAt: Scalars['DateTime']['output'];
  messages?: Maybe<Array<MessageDto>>;
  sourcePath?: Maybe<Scalars['String']['output']>;
  supportTopic?: Maybe<Scalars['String']['output']>;
  unreadAgentMessages: Scalars['Int']['output'];
  unreadGuestMessages: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ChatScope =
  | 'HOTEL'
  | 'SUPPORT';

export type ChatStatus =
  | 'ACTIVE'
  | 'CLOSED'
  | 'WAITING';

export type ChatsDto = {
  __typename?: 'ChatsDto';
  list: Array<ChatDto>;
  metaCounter: MetaCounterDto;
};

export type CheapestDateDto = {
  __typename?: 'CheapestDateDto';
  date: Scalars['String']['output'];
  price: Scalars['Int']['output'];
};

export type ClaimChatInput = {
  chatId: Scalars['String']['input'];
};

export type CoordinatesDto = {
  __typename?: 'CoordinatesDto';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type CoordinatesInput = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type CreatePriceLockInput = {
  currentPrice: Scalars['Int']['input'];
  roomId: Scalars['String']['input'];
};

export type DashboardStatsDto = {
  __typename?: 'DashboardStatsDto';
  activeChats: Scalars['Int']['output'];
  activeHotels: Scalars['Int']['output'];
  availableRooms: Scalars['Int']['output'];
  checkInsToday: Scalars['Int']['output'];
  checkOutsToday: Scalars['Int']['output'];
  confirmedBookings: Scalars['Int']['output'];
  maintenanceRooms: Scalars['Int']['output'];
  newBookingsToday: Scalars['Int']['output'];
  newMembersToday: Scalars['Int']['output'];
  newReviewsToday: Scalars['Int']['output'];
  pendingBookings: Scalars['Int']['output'];
  pendingHotels: Scalars['Int']['output'];
  todayRevenue: Scalars['Int']['output'];
  totalBookings: Scalars['Int']['output'];
  totalChats: Scalars['Int']['output'];
  totalHotels: Scalars['Int']['output'];
  totalMembers: Scalars['Int']['output'];
  totalNotifications: Scalars['Int']['output'];
  totalRevenue: Scalars['Int']['output'];
  totalReviews: Scalars['Int']['output'];
  totalRooms: Scalars['Int']['output'];
  unreadNotifications: Scalars['Int']['output'];
  waitingChats: Scalars['Int']['output'];
};

export type DayPriceDto = {
  __typename?: 'DayPriceDto';
  availableRooms?: Maybe<Scalars['Int']['output']>;
  date: Scalars['String']['output'];
  demandLevel: DemandLevel;
  isWeekend: Scalars['Boolean']['output'];
  localEvent?: Maybe<Scalars['String']['output']>;
  price: Scalars['Int']['output'];
};

export type DemandLevel =
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

export type DetailedLocationDto = {
  __typename?: 'DetailedLocationDto';
  address: Scalars['String']['output'];
  city: HotelLocation;
  coordinates: CoordinatesDto;
  district?: Maybe<Scalars['String']['output']>;
  dong?: Maybe<Scalars['String']['output']>;
  nearestSubway?: Maybe<Scalars['String']['output']>;
  subwayExit?: Maybe<Scalars['String']['output']>;
  subwayLines?: Maybe<Array<Scalars['Int']['output']>>;
  walkingDistance?: Maybe<Scalars['Int']['output']>;
};

export type DetailedLocationInput = {
  address: Scalars['String']['input'];
  city: HotelLocation;
  coordinates: CoordinatesInput;
  district?: InputMaybe<Scalars['String']['input']>;
  dong?: InputMaybe<Scalars['String']['input']>;
  nearestSubway?: InputMaybe<Scalars['String']['input']>;
  subwayExit?: InputMaybe<Scalars['String']['input']>;
  subwayLines?: InputMaybe<Array<Scalars['Int']['input']>>;
  walkingDistance?: InputMaybe<Scalars['Int']['input']>;
};

export type FlexibleTimingDto = {
  __typename?: 'FlexibleTimingDto';
  enabled: Scalars['Boolean']['output'];
  fee: Scalars['Int']['output'];
  times: Array<Scalars['String']['output']>;
};

export type FlexibleTimingInput = {
  enabled: Scalars['Boolean']['input'];
  fee?: Scalars['Int']['input'];
  times?: Array<Scalars['String']['input']>;
};

export type FollowDto = {
  __typename?: 'FollowDto';
  _id: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  followerData?: Maybe<MemberBasicDto>;
  followerId: Scalars['String']['output'];
  followingData?: Maybe<MemberBasicDto>;
  followingId: Scalars['String']['output'];
  meFollowed?: Maybe<Scalars['Boolean']['output']>;
  meLiked?: Maybe<Scalars['Boolean']['output']>;
};

export type FollowInput = {
  followingId: Scalars['String']['input'];
};

export type FollowInquiry = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type Followers = {
  __typename?: 'Followers';
  list: Array<FollowDto>;
  metaCounter: MetaCounterDto;
};

export type Followings = {
  __typename?: 'Followings';
  list: Array<FollowDto>;
  metaCounter: MetaCounterDto;
};

export type HomeFeedDto = {
  __typename?: 'HomeFeedDto';
  featuredRatingsSummary?: Maybe<ReviewRatingsSummaryDto>;
  featuredReviews: Array<ReviewDto>;
  hotelInventoryTotal: Scalars['Int']['output'];
  lastMinuteDeals: Array<HomeLastMinuteDealDto>;
  recommendationMeta?: Maybe<RecommendationMetaDto>;
  recommendationResult?: Maybe<RecommendedHotelsV2Dto>;
  testimonials: Array<HomeTestimonialDto>;
  topHotels: Array<HotelDto>;
  totalVerifiedReviews: Scalars['Int']['output'];
  trendingHotels: Array<HotelDto>;
};

export type HomeFeedInput = {
  dealsLimit?: InputMaybe<Scalars['Int']['input']>;
  featuredReviewLimit?: InputMaybe<Scalars['Int']['input']>;
  heroLimit?: InputMaybe<Scalars['Int']['input']>;
  recommendationLimit?: InputMaybe<Scalars['Int']['input']>;
  testimonialsLimit?: InputMaybe<Scalars['Int']['input']>;
  trendingLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type HomeLastMinuteDealDto = {
  __typename?: 'HomeLastMinuteDealDto';
  basePrice: Scalars['Int']['output'];
  dealPrice: Scalars['Int']['output'];
  discountPercent: Scalars['Float']['output'];
  hotelId: Scalars['String']['output'];
  hotelLocation: Scalars['String']['output'];
  hotelTitle: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  roomId: Scalars['String']['output'];
  roomName: Scalars['String']['output'];
  roomType: Scalars['String']['output'];
  validUntil: Scalars['DateTime']['output'];
};

export type HomeTestimonialDto = {
  __typename?: 'HomeTestimonialDto';
  hotelId: Scalars['String']['output'];
  hotelTitle: Scalars['String']['output'];
  review: ReviewDto;
};

export type HostAccessStatus =
  | 'APPROVED'
  | 'NONE'
  | 'PENDING'
  | 'REJECTED';

export type HostApplicationDto = {
  __typename?: 'HostApplicationDto';
  _id: Scalars['String']['output'];
  applicantMemberId: Scalars['String']['output'];
  applicantMemberNick?: Maybe<Scalars['String']['output']>;
  businessDescription: Scalars['String']['output'];
  businessEmail?: Maybe<Scalars['String']['output']>;
  businessName: Scalars['String']['output'];
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  hotelType: HotelType;
  intendedHotelLocation?: Maybe<HotelLocation>;
  intendedHotelName?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  reviewNote?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedByMemberId?: Maybe<Scalars['String']['output']>;
  reviewedByMemberNick?: Maybe<Scalars['String']['output']>;
  status: HostApplicationStatus;
  suitableFor: Array<StayPurpose>;
  updatedAt: Scalars['DateTime']['output'];
};

export type HostApplicationInput = {
  businessDescription: Scalars['String']['input'];
  businessEmail?: InputMaybe<Scalars['String']['input']>;
  businessName: Scalars['String']['input'];
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  hotelType: HotelType;
  intendedHotelLocation?: InputMaybe<HotelLocation>;
  intendedHotelName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  suitableFor?: Array<StayPurpose>;
};

export type HostApplicationReviewInput = {
  applicationId: Scalars['String']['input'];
  reviewNote?: InputMaybe<Scalars['String']['input']>;
  status: HostApplicationStatus;
};

export type HostApplicationStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED';

export type HotelDto = {
  __typename?: 'HotelDto';
  _id: Scalars['String']['output'];
  ageRestriction: Scalars['Int']['output'];
  amenities: AmenitiesDto;
  badgeLevel: BadgeLevel;
  cancellationPolicy: CancellationPolicy;
  checkInTime: Scalars['String']['output'];
  checkOutTime: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  detailedLocation: DetailedLocationDto;
  flexibleCheckIn: FlexibleTimingDto;
  flexibleCheckOut: FlexibleTimingDto;
  hotelDesc: Scalars['String']['output'];
  hotelImages: Array<Scalars['String']['output']>;
  hotelLikes: Scalars['Int']['output'];
  hotelLocation: HotelLocation;
  hotelRank: Scalars['Float']['output'];
  hotelRating: Scalars['Float']['output'];
  hotelReviews: Scalars['Int']['output'];
  hotelStatus: HotelStatus;
  hotelTitle: Scalars['String']['output'];
  hotelType: HotelType;
  hotelVideos: Array<Scalars['String']['output']>;
  hotelViews: Scalars['Int']['output'];
  lastInspectionDate?: Maybe<Scalars['DateTime']['output']>;
  maxPetWeight?: Maybe<Scalars['Int']['output']>;
  memberId: Scalars['String']['output'];
  petsAllowed: Scalars['Boolean']['output'];
  safeStayCertified: Scalars['Boolean']['output'];
  safetyFeatures: SafetyFeaturesDto;
  smokingAllowed: Scalars['Boolean']['output'];
  starRating: Scalars['Int']['output'];
  startingPrice: Scalars['Int']['output'];
  strikeHistory: Array<StrikeHistoryDto>;
  suitableFor: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  verificationDocs: VerificationDocsDto;
  verificationStatus: VerificationStatus;
  warningStrikes: Scalars['Int']['output'];
};

export type HotelInput = {
  ageRestriction?: Scalars['Int']['input'];
  amenities?: InputMaybe<AmenitiesInput>;
  cancellationPolicy?: CancellationPolicy;
  checkInTime?: Scalars['String']['input'];
  checkOutTime?: Scalars['String']['input'];
  detailedLocation: DetailedLocationInput;
  flexibleCheckIn?: InputMaybe<FlexibleTimingInput>;
  flexibleCheckOut?: InputMaybe<FlexibleTimingInput>;
  hotelDesc?: Scalars['String']['input'];
  hotelImages?: Array<Scalars['String']['input']>;
  hotelLocation: HotelLocation;
  hotelTitle: Scalars['String']['input'];
  hotelType: HotelType;
  hotelVideos?: Array<Scalars['String']['input']>;
  maxPetWeight?: InputMaybe<Scalars['Int']['input']>;
  petsAllowed?: Scalars['Boolean']['input'];
  safetyFeatures?: InputMaybe<SafetyFeaturesInput>;
  smokingAllowed?: Scalars['Boolean']['input'];
  starRating?: Scalars['Int']['input'];
  suitableFor?: Array<Scalars['String']['input']>;
};

export type HotelLocation =
  | 'BUSAN'
  | 'DAEGU'
  | 'DAEJON'
  | 'GANGNEUNG'
  | 'GWANGJU'
  | 'GYEONGJU'
  | 'INCHEON'
  | 'JEJU'
  | 'SEOUL';

export type HotelResponseDto = {
  __typename?: 'HotelResponseDto';
  respondedAt?: Maybe<Scalars['DateTime']['output']>;
  respondedBy?: Maybe<Scalars['String']['output']>;
  responseText: Scalars['String']['output'];
};

export type HotelSearchInput = {
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  checkInDate?: InputMaybe<Scalars['DateTime']['input']>;
  checkOutDate?: InputMaybe<Scalars['DateTime']['input']>;
  dong?: InputMaybe<Scalars['String']['input']>;
  guestCount?: InputMaybe<Scalars['Int']['input']>;
  hotelTypes?: InputMaybe<Array<HotelType>>;
  location?: InputMaybe<HotelLocation>;
  maxWalkingDistance?: InputMaybe<Scalars['Int']['input']>;
  minRating?: InputMaybe<Scalars['Float']['input']>;
  nearestSubway?: InputMaybe<Scalars['String']['input']>;
  petsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  priceRange?: InputMaybe<PriceRangeInput>;
  purpose?: InputMaybe<StayPurpose>;
  roomTypes?: InputMaybe<Array<RoomType>>;
  starRatings?: InputMaybe<Array<Scalars['Int']['input']>>;
  subwayLines?: InputMaybe<Array<Scalars['Int']['input']>>;
  text?: InputMaybe<Scalars['String']['input']>;
  verifiedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  wheelchairAccessible?: InputMaybe<Scalars['Boolean']['input']>;
};

export type HotelStatus =
  | 'ACTIVE'
  | 'DELETE'
  | 'INACTIVE'
  | 'PENDING'
  | 'SUSPENDED';

export type HotelType =
  | 'GUESTHOUSE'
  | 'HANOK'
  | 'HOTEL'
  | 'MOTEL'
  | 'PENSION'
  | 'RESORT';

export type HotelUpdate = {
  _id: Scalars['String']['input'];
  amenities?: InputMaybe<AmenitiesInput>;
  badgeLevel?: InputMaybe<BadgeLevel>;
  cancellationPolicy?: InputMaybe<CancellationPolicy>;
  checkInTime?: InputMaybe<Scalars['String']['input']>;
  checkOutTime?: InputMaybe<Scalars['String']['input']>;
  flexibleCheckIn?: InputMaybe<FlexibleTimingInput>;
  flexibleCheckOut?: InputMaybe<FlexibleTimingInput>;
  hotelDesc?: InputMaybe<Scalars['String']['input']>;
  hotelImages?: InputMaybe<Array<Scalars['String']['input']>>;
  hotelStatus?: InputMaybe<HotelStatus>;
  hotelTitle?: InputMaybe<Scalars['String']['input']>;
  hotelVideos?: InputMaybe<Array<Scalars['String']['input']>>;
  maxPetWeight?: InputMaybe<Scalars['Int']['input']>;
  petsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  safetyFeatures?: InputMaybe<SafetyFeaturesInput>;
  smokingAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  starRating?: InputMaybe<Scalars['Int']['input']>;
  suitableFor?: InputMaybe<Array<Scalars['String']['input']>>;
  verificationStatus?: InputMaybe<VerificationStatus>;
};

export type HotelsDto = {
  __typename?: 'HotelsDto';
  list: Array<HotelDto>;
  metaCounter: MetaCounterDto;
};

export type LastMinuteDealDto = {
  __typename?: 'LastMinuteDealDto';
  dealPrice: Scalars['Int']['output'];
  discountPercent: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  originalPrice: Scalars['Int']['output'];
  validUntil: Scalars['DateTime']['output'];
};

export type LikeDto = {
  __typename?: 'LikeDto';
  _id: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  likeGroup: LikeGroup;
  likeRefId: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
};

export type LikeGroup =
  | 'ARTICLE'
  | 'HOTEL'
  | 'MEMBER'
  | 'REVIEW';

export type LikeInput = {
  likeGroup: LikeGroup;
  likeRefId: Scalars['String']['input'];
};

export type LoginInput = {
  memberNick: Scalars['String']['input'];
  memberPassword: Scalars['String']['input'];
};

export type MemberAuthType =
  | 'EMAIL'
  | 'GOOGLE'
  | 'KAKAO'
  | 'NAVER'
  | 'PHONE';

export type MemberBasicDto = {
  __typename?: 'MemberBasicDto';
  _id: Scalars['String']['output'];
  memberFollowers: Scalars['Int']['output'];
  memberFollowings: Scalars['Int']['output'];
  memberFullName?: Maybe<Scalars['String']['output']>;
  memberImage?: Maybe<Scalars['String']['output']>;
  memberNick: Scalars['String']['output'];
  memberStatus: MemberStatus;
};

export type MemberDto = {
  __typename?: 'MemberDto';
  _id: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  hostAccessStatus: HostAccessStatus;
  memberAddress?: Maybe<Scalars['String']['output']>;
  memberArticles: Scalars['Int']['output'];
  memberAuthType: MemberAuthType;
  memberBadges: Array<Scalars['String']['output']>;
  memberComments: Scalars['Int']['output'];
  memberDesc?: Maybe<Scalars['String']['output']>;
  memberFollowers: Scalars['Int']['output'];
  memberFollowings: Scalars['Int']['output'];
  memberFullName?: Maybe<Scalars['String']['output']>;
  memberImage?: Maybe<Scalars['String']['output']>;
  memberLikes: Scalars['Int']['output'];
  memberNick: Scalars['String']['output'];
  memberPhone: Scalars['String']['output'];
  memberPoints: Scalars['Int']['output'];
  memberProperties: Scalars['Int']['output'];
  memberRank: Scalars['Float']['output'];
  memberStatus: MemberStatus;
  memberType: MemberType;
  memberViews: Scalars['Int']['output'];
  subscriptionExpiry?: Maybe<Scalars['DateTime']['output']>;
  subscriptionTier: SubscriptionTier;
  updatedAt: Scalars['DateTime']['output'];
};

export type MemberInput = {
  memberAddress?: InputMaybe<Scalars['String']['input']>;
  memberAuthType: MemberAuthType;
  memberFullName?: InputMaybe<Scalars['String']['input']>;
  memberImage?: InputMaybe<Scalars['String']['input']>;
  memberNick: Scalars['String']['input'];
  memberPassword: Scalars['String']['input'];
  memberPhone: Scalars['String']['input'];
  memberType: MemberType;
};

export type MemberStatus =
  | 'ACTIVE'
  | 'BLOCK'
  | 'DELETE';

export type MemberType =
  | 'ADMIN'
  | 'ADMIN_OPERATOR'
  | 'AGENT'
  | 'USER';

export type MemberTypeCounts = {
  __typename?: 'MemberTypeCounts';
  ADMIN: Scalars['Int']['output'];
  ADMIN_OPERATOR: Scalars['Int']['output'];
  AGENT: Scalars['Int']['output'];
  USER: Scalars['Int']['output'];
};

export type MemberUpdate = {
  _id?: InputMaybe<Scalars['String']['input']>;
  memberAddress?: InputMaybe<Scalars['String']['input']>;
  memberDesc?: InputMaybe<Scalars['String']['input']>;
  memberFullName?: InputMaybe<Scalars['String']['input']>;
  memberImage?: InputMaybe<Scalars['String']['input']>;
  memberNick?: InputMaybe<Scalars['String']['input']>;
  memberStatus?: InputMaybe<MemberStatus>;
  subscriptionTier?: InputMaybe<SubscriptionTier>;
};

export type MembersDto = {
  __typename?: 'MembersDto';
  list: Array<MemberDto>;
  metaCounter: MetaCounterDto;
  typeCounts?: Maybe<MemberTypeCounts>;
};

export type MessageDto = {
  __typename?: 'MessageDto';
  content?: Maybe<Scalars['String']['output']>;
  fileUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  messageType: MessageType;
  read: Scalars['Boolean']['output'];
  senderId: Scalars['String']['output'];
  senderType: SenderType;
  timestamp: Scalars['DateTime']['output'];
};

export type MessageType =
  | 'FILE'
  | 'IMAGE'
  | 'TEXT';

export type MetaCounterDto = {
  __typename?: 'MetaCounterDto';
  total: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  approveSubscription: MemberDto;
  askStayConcierge: StayConciergeResultDto;
  cancelBooking: BookingDto;
  cancelBookingByOperator: BookingDto;
  cancelMySubscription: ResponseDto;
  cancelPriceLock: Scalars['Boolean']['output'];
  cancelSubscription: MemberDto;
  claimChat: ChatDto;
  clearMySearchHistory: Scalars['Int']['output'];
  closeChat: ChatDto;
  createBooking: BookingDto;
  createHotel: HotelDto;
  createNotification: NotificationDto;
  createReview: ReviewDto;
  createRoom: RoomDto;
  deleteMemberByAdmin: MemberDto;
  deleteNotification: Scalars['Boolean']['output'];
  deleteReview: ReviewDto;
  deleteSearchHistoryItem: Scalars['Boolean']['output'];
  denySubscription: ResponseDto;
  lockPrice: PriceLockDto;
  loginMember: AuthMemberDto;
  logout: ResponseDto;
  markAllAsRead: Scalars['Int']['output'];
  markAsRead: NotificationDto;
  markChatMessagesAsRead: ChatDto;
  markHelpful: ReviewDto;
  reassignChat: ChatDto;
  refreshToken: AuthMemberDto;
  requestHostApplication: HostApplicationDto;
  requestPasswordReset: ResponseDto;
  requestSubscription: ResponseDto;
  resetPassword: ResponseDto;
  respondToReview: ReviewDto;
  reviewHostApplication: HostApplicationDto;
  saveOnboardingPreferences: ResponseDto;
  sendMessage: ChatDto;
  signupMember: AuthMemberDto;
  startChat: ChatDto;
  startSupportChat: ChatDto;
  toggleFollow: ToggleFollowDto;
  toggleLike: ToggleLikeDto;
  trackAnalyticsEvent: Scalars['Boolean']['output'];
  updateBookingStatus: BookingDto;
  updateHotel: HotelDto;
  updateHotelByAdmin: HotelDto;
  updateMember: MemberDto;
  updateMemberByAdmin: MemberDto;
  updatePaymentStatus: BookingDto;
  updateReview: ReviewDto;
  updateReviewStatus: ReviewDto;
  updateRoom: RoomDto;
  updateRoomByAdmin: RoomDto;
};


export type MutationApproveSubscriptionArgs = {
  durationDays: Scalars['Int']['input'];
  memberId: Scalars['String']['input'];
  tier: SubscriptionTier;
};


export type MutationAskStayConciergeArgs = {
  input: AskStayConciergeInput;
};


export type MutationCancelBookingArgs = {
  bookingId: Scalars['String']['input'];
  evidencePhotos?: InputMaybe<Array<Scalars['String']['input']>>;
  reason: Scalars['String']['input'];
};


export type MutationCancelBookingByOperatorArgs = {
  bookingId: Scalars['String']['input'];
  evidencePhotos?: InputMaybe<Array<Scalars['String']['input']>>;
  reason: Scalars['String']['input'];
};


export type MutationCancelPriceLockArgs = {
  priceLockId: Scalars['String']['input'];
};


export type MutationCancelSubscriptionArgs = {
  memberId: Scalars['String']['input'];
};


export type MutationClaimChatArgs = {
  input: ClaimChatInput;
};


export type MutationCloseChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationCreateBookingArgs = {
  input: BookingInput;
};


export type MutationCreateHotelArgs = {
  input: HotelInput;
};


export type MutationCreateNotificationArgs = {
  input: NotificationInput;
};


export type MutationCreateReviewArgs = {
  input: ReviewInput;
};


export type MutationCreateRoomArgs = {
  input: RoomInput;
};


export type MutationDeleteMemberByAdminArgs = {
  memberId: Scalars['String']['input'];
};


export type MutationDeleteNotificationArgs = {
  notificationId: Scalars['String']['input'];
};


export type MutationDeleteReviewArgs = {
  reviewId: Scalars['String']['input'];
};


export type MutationDeleteSearchHistoryItemArgs = {
  historyId: Scalars['String']['input'];
};


export type MutationDenySubscriptionArgs = {
  memberId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationLockPriceArgs = {
  input: CreatePriceLockInput;
};


export type MutationLoginMemberArgs = {
  input: LoginInput;
};


export type MutationMarkAsReadArgs = {
  notificationId: Scalars['String']['input'];
};


export type MutationMarkChatMessagesAsReadArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationMarkHelpfulArgs = {
  reviewId: Scalars['String']['input'];
};


export type MutationReassignChatArgs = {
  chatId: Scalars['String']['input'];
  newAgentId: Scalars['String']['input'];
};


export type MutationRequestHostApplicationArgs = {
  input: HostApplicationInput;
};


export type MutationRequestPasswordResetArgs = {
  input: RequestPasswordResetInput;
};


export type MutationRequestSubscriptionArgs = {
  requestedTier: SubscriptionTier;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationRespondToReviewArgs = {
  responseText: Scalars['String']['input'];
  reviewId: Scalars['String']['input'];
};


export type MutationReviewHostApplicationArgs = {
  input: HostApplicationReviewInput;
};


export type MutationSaveOnboardingPreferencesArgs = {
  input: OnboardingPreferenceInput;
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationSignupMemberArgs = {
  input: MemberInput;
};


export type MutationStartChatArgs = {
  input: StartChatInput;
};


export type MutationStartSupportChatArgs = {
  input: StartSupportChatInput;
};


export type MutationToggleFollowArgs = {
  input: FollowInput;
};


export type MutationToggleLikeArgs = {
  input: LikeInput;
};


export type MutationTrackAnalyticsEventArgs = {
  input: TrackAnalyticsEventInput;
};


export type MutationUpdateBookingStatusArgs = {
  bookingId: Scalars['String']['input'];
  status: BookingStatus;
};


export type MutationUpdateHotelArgs = {
  input: HotelUpdate;
};


export type MutationUpdateHotelByAdminArgs = {
  input: HotelUpdate;
};


export type MutationUpdateMemberArgs = {
  input: MemberUpdate;
};


export type MutationUpdateMemberByAdminArgs = {
  input: MemberUpdate;
};


export type MutationUpdatePaymentStatusArgs = {
  bookingId: Scalars['String']['input'];
  paidAmount: Scalars['Float']['input'];
  paymentStatus: PaymentStatus;
};


export type MutationUpdateReviewArgs = {
  input: ReviewUpdate;
};


export type MutationUpdateReviewStatusArgs = {
  reviewId: Scalars['String']['input'];
  status: ReviewStatus;
};


export type MutationUpdateRoomArgs = {
  input: RoomUpdate;
};


export type MutationUpdateRoomByAdminArgs = {
  input: RoomUpdate;
};

export type NotificationDto = {
  __typename?: 'NotificationDto';
  _id: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  link?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  read: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  type: NotificationType;
  userId: Scalars['String']['output'];
  userNick?: Maybe<Scalars['String']['output']>;
};

export type NotificationInput = {
  link?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: NotificationType;
  userId: Scalars['String']['input'];
};

export type NotificationType =
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REMINDER'
  | 'CHAT_MESSAGE'
  | 'HOTEL_REPLY'
  | 'LOW_AVAILABILITY'
  | 'NEW_BOOKING'
  | 'NEW_HOTEL'
  | 'NEW_MEMBER'
  | 'NEW_REVIEW'
  | 'POINTS_EARNED'
  | 'PRICE_DROP'
  | 'REVIEW_REQUEST'
  | 'SUBSCRIPTION_APPROVED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'SUBSCRIPTION_DENIED'
  | 'SUBSCRIPTION_REQUEST';

export type NotificationsDto = {
  __typename?: 'NotificationsDto';
  list: Array<NotificationDto>;
  metaCounter: MetaCounterDto;
};

export type OnboardingPreferenceInput = {
  budgetLevel?: InputMaybe<BudgetLevel>;
  preferredAmenities: Array<Scalars['String']['input']>;
  preferredDestinations: Array<HotelLocation>;
  travelStyles: Array<TravelStyle>;
};

export type PaginationInput = {
  direction?: InputMaybe<Scalars['Int']['input']>;
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
};

export type PaymentMethod =
  | 'AT_HOTEL'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'KAKAOPAY'
  | 'NAVERPAY'
  | 'TOSS';

export type PaymentStatus =
  | 'FAILED'
  | 'PAID'
  | 'PARTIAL'
  | 'PENDING'
  | 'REFUNDED';

export type PriceCalendarDto = {
  __typename?: 'PriceCalendarDto';
  averagePrice: Scalars['Int']['output'];
  calendar: Array<DayPriceDto>;
  cheapestDate: CheapestDateDto;
  mostExpensiveDate: CheapestDateDto;
  savings: Scalars['Int']['output'];
};

export type PriceCalendarInput = {
  month?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['String']['input'];
};

export type PriceLockDto = {
  __typename?: 'PriceLockDto';
  _id: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  lockedPrice: Scalars['Int']['output'];
  roomId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type PriceRangeInput = {
  end?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  checkAuth: Scalars['String']['output'];
  checkAuthRoles: ResponseDto;
  getAgentBookings: BookingsDto;
  getAgentHotels: HotelsDto;
  getAgentRooms: RoomsDto;
  getAllBookingsAdmin: BookingsDto;
  getAllChatsAdmin: ChatsDto;
  getAllHotelsAdmin: HotelsDto;
  getAllMembersByAdmin: MembersDto;
  getAllNotificationsAdmin: NotificationsDto;
  getAllReviewsAdmin: ReviewsDto;
  getAllRoomsAdmin: RoomsDto;
  getAnalyticsEventsAdmin: AnalyticsEventsDto;
  getBooking: BookingDto;
  getChat: ChatDto;
  getDashboardStats: DashboardStatsDto;
  getFollowerCount: Scalars['Int']['output'];
  getFollowers: Array<FollowDto>;
  getFollowingCount: Scalars['Int']['output'];
  getHomeFeed: HomeFeedDto;
  getHomeLastMinuteDeals: Array<HomeLastMinuteDealDto>;
  getHomeTestimonials: Array<HomeTestimonialDto>;
  getHostApplicationsByAdmin: Array<HostApplicationDto>;
  getHotel: HotelDto;
  getHotelChats: ChatsDto;
  getHotelReviews: ReviewsDto;
  getHotels: HotelsDto;
  getHotelsByIds: Array<HotelDto>;
  getHotelsCount: MetaCounterDto;
  getLikeCount: Scalars['Int']['output'];
  getMember: MemberDto;
  getMemberByAdmin: MemberDto;
  getMemberFollowersPaginated: Followers;
  getMemberFollowingsPaginated: Followings;
  getMyBookings: BookingsDto;
  getMyChats: ChatsDto;
  getMyFollowers: Array<FollowDto>;
  getMyFollowing: Array<FollowDto>;
  getMyHostApplication?: Maybe<HostApplicationDto>;
  getMyLikes: Array<LikeDto>;
  getMyNotifications: Array<NotificationDto>;
  getMyPriceLock?: Maybe<PriceLockDto>;
  getMyPriceLocks: Array<PriceLockDto>;
  getMyRecommendationProfile: RecommendationProfileDto;
  getMyReviews: ReviewsDto;
  getMySearchHistory: Array<SearchHistoryDto>;
  getMyUnreadChatCount: Scalars['Int']['output'];
  getNotification: NotificationDto;
  getOperatorChats: ChatsDto;
  getPriceCalendar: PriceCalendarDto;
  getRecommendedHotels: Array<HotelDto>;
  getRecommendedHotelsV2: RecommendedHotelsV2Dto;
  getReview: ReviewDto;
  getRoom: RoomDto;
  getRoomsByHotel: RoomsDto;
  getSimilarHotels: Array<HotelDto>;
  getSubscriptionRequests: Array<NotificationDto>;
  getSubscriptionStatus: SubscriptionStatusDto;
  getTrendingByLocation: Array<HotelDto>;
  getTrendingHotels: Array<HotelDto>;
  getUnreadCount: Scalars['Int']['output'];
  hasLiked: Scalars['Boolean']['output'];
  hello: Scalars['String']['output'];
  isFollowing: Scalars['Boolean']['output'];
  searchMembersForBooking: Array<BookingGuestCandidateDto>;
};


export type QueryGetAgentBookingsArgs = {
  hotelId: Scalars['String']['input'];
  input: PaginationInput;
};


export type QueryGetAgentHotelsArgs = {
  input: PaginationInput;
};


export type QueryGetAgentRoomsArgs = {
  hotelId: Scalars['String']['input'];
  input: PaginationInput;
};


export type QueryGetAllBookingsAdminArgs = {
  input: PaginationInput;
  statusFilter?: InputMaybe<BookingStatus>;
};


export type QueryGetAllChatsAdminArgs = {
  input: PaginationInput;
  statusFilter?: InputMaybe<ChatStatus>;
};


export type QueryGetAllHotelsAdminArgs = {
  input: PaginationInput;
  statusFilter?: InputMaybe<HotelStatus>;
};


export type QueryGetAllMembersByAdminArgs = {
  input: PaginationInput;
};


export type QueryGetAllNotificationsAdminArgs = {
  input: PaginationInput;
};


export type QueryGetAllReviewsAdminArgs = {
  input: PaginationInput;
  statusFilter?: InputMaybe<ReviewStatus>;
};


export type QueryGetAllRoomsAdminArgs = {
  input: PaginationInput;
  statusFilter?: InputMaybe<RoomStatus>;
};


export type QueryGetAnalyticsEventsAdminArgs = {
  input: PaginationInput;
  search?: InputMaybe<AnalyticsEventSearchInput>;
};


export type QueryGetBookingArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryGetChatArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryGetFollowerCountArgs = {
  memberId: Scalars['String']['input'];
};


export type QueryGetFollowersArgs = {
  memberId: Scalars['String']['input'];
};


export type QueryGetFollowingCountArgs = {
  memberId: Scalars['String']['input'];
};


export type QueryGetHomeFeedArgs = {
  input?: InputMaybe<HomeFeedInput>;
};


export type QueryGetHomeLastMinuteDealsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetHomeTestimonialsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetHostApplicationsByAdminArgs = {
  statusFilter?: InputMaybe<HostApplicationStatus>;
};


export type QueryGetHotelArgs = {
  hotelId: Scalars['String']['input'];
};


export type QueryGetHotelChatsArgs = {
  hotelId: Scalars['String']['input'];
  input: PaginationInput;
  statusFilter?: InputMaybe<ChatStatus>;
};


export type QueryGetHotelReviewsArgs = {
  hotelId: Scalars['String']['input'];
  input: PaginationInput;
};


export type QueryGetHotelsArgs = {
  input: PaginationInput;
  search?: InputMaybe<HotelSearchInput>;
};


export type QueryGetHotelsByIdsArgs = {
  hotelIds: Array<Scalars['String']['input']>;
};


export type QueryGetHotelsCountArgs = {
  search?: InputMaybe<HotelSearchInput>;
};


export type QueryGetLikeCountArgs = {
  likeGroup: LikeGroup;
  likeRefId: Scalars['String']['input'];
};


export type QueryGetMemberByAdminArgs = {
  memberId: Scalars['String']['input'];
};


export type QueryGetMemberFollowersPaginatedArgs = {
  input: FollowInquiry;
  memberId: Scalars['String']['input'];
};


export type QueryGetMemberFollowingsPaginatedArgs = {
  input: FollowInquiry;
  memberId: Scalars['String']['input'];
};


export type QueryGetMyBookingsArgs = {
  input: PaginationInput;
  statusFilter?: InputMaybe<BookingStatus>;
};


export type QueryGetMyChatsArgs = {
  input: PaginationInput;
};


export type QueryGetMyLikesArgs = {
  likeGroup: LikeGroup;
};


export type QueryGetMyNotificationsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetMyPriceLockArgs = {
  roomId: Scalars['String']['input'];
};


export type QueryGetMyReviewsArgs = {
  input: PaginationInput;
};


export type QueryGetMySearchHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetNotificationArgs = {
  notificationId: Scalars['String']['input'];
};


export type QueryGetOperatorChatsArgs = {
  hotelId?: InputMaybe<Scalars['String']['input']>;
  input: PaginationInput;
  scopeFilter?: InputMaybe<ChatScope>;
  statusFilter?: InputMaybe<ChatStatus>;
};


export type QueryGetPriceCalendarArgs = {
  input: PriceCalendarInput;
};


export type QueryGetRecommendedHotelsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetRecommendedHotelsV2Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetReviewArgs = {
  reviewId: Scalars['String']['input'];
};


export type QueryGetRoomArgs = {
  roomId: Scalars['String']['input'];
};


export type QueryGetRoomsByHotelArgs = {
  hotelId: Scalars['String']['input'];
  input: PaginationInput;
};


export type QueryGetSimilarHotelsArgs = {
  hotelId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetTrendingByLocationArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  location: HotelLocation;
};


export type QueryGetTrendingHotelsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryHasLikedArgs = {
  likeGroup: LikeGroup;
  likeRefId: Scalars['String']['input'];
};


export type QueryIsFollowingArgs = {
  followingId: Scalars['String']['input'];
};


export type QuerySearchMembersForBookingArgs = {
  keyword: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type RecommendationExplanationDto = {
  __typename?: 'RecommendationExplanationDto';
  fromFallback: Scalars['Boolean']['output'];
  hotelId: Scalars['String']['output'];
  likedSimilar: Scalars['Boolean']['output'];
  matchedAmenities: Array<Scalars['String']['output']>;
  matchedLocation: Scalars['Boolean']['output'];
  matchedPrice: Scalars['Boolean']['output'];
  matchedPurposes: Array<Scalars['String']['output']>;
  matchedType: Scalars['Boolean']['output'];
  signals: Array<Scalars['String']['output']>;
  stage: Scalars['String']['output'];
};

export type RecommendationMetaDto = {
  __typename?: 'RecommendationMetaDto';
  behaviorWeight: Scalars['Float']['output'];
  fallbackCount: Scalars['Int']['output'];
  generalStageCount: Scalars['Int']['output'];
  matchedLocationCount: Scalars['Int']['output'];
  onboardingWeight: Scalars['Float']['output'];
  profileSource: Scalars['String']['output'];
  relaxedStageCount: Scalars['Int']['output'];
  strictStageCount: Scalars['Int']['output'];
};

export type RecommendationProfileDto = {
  __typename?: 'RecommendationProfileDto';
  avgPriceMax?: Maybe<Scalars['Float']['output']>;
  avgPriceMin?: Maybe<Scalars['Float']['output']>;
  computedAt?: Maybe<Scalars['DateTime']['output']>;
  hasProfile: Scalars['Boolean']['output'];
  preferredAmenities: Array<Scalars['String']['output']>;
  preferredLocations: Array<Scalars['String']['output']>;
  preferredPurposes: Array<Scalars['String']['output']>;
  preferredTypes: Array<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
};

export type RecommendedHotelsV2Dto = {
  __typename?: 'RecommendedHotelsV2Dto';
  explanations: Array<RecommendationExplanationDto>;
  list: Array<HotelDto>;
  meta: RecommendationMetaDto;
};

export type RequestPasswordResetInput = {
  memberNick: Scalars['String']['input'];
  memberPhone: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  code: Scalars['String']['input'];
  memberNick: Scalars['String']['input'];
  memberPhone: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ResponseDto = {
  __typename?: 'ResponseDto';
  data?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ReviewDto = {
  __typename?: 'ReviewDto';
  _id: Scalars['String']['output'];
  amenitiesRating: Scalars['Float']['output'];
  bookingId: Scalars['String']['output'];
  cleanlinessRating: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  guestPhotos: Array<Scalars['String']['output']>;
  helpfulCount: Scalars['Int']['output'];
  hotelId: Scalars['String']['output'];
  hotelResponse?: Maybe<HotelResponseDto>;
  locationRating: Scalars['Float']['output'];
  overallRating: Scalars['Float']['output'];
  reviewStatus: ReviewStatus;
  reviewText: Scalars['String']['output'];
  reviewTitle?: Maybe<Scalars['String']['output']>;
  reviewViews: Scalars['Int']['output'];
  reviewerId: Scalars['String']['output'];
  reviewerImage?: Maybe<Scalars['String']['output']>;
  reviewerNick?: Maybe<Scalars['String']['output']>;
  serviceRating: Scalars['Float']['output'];
  stayDate: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  valueRating: Scalars['Float']['output'];
  verifiedStay: Scalars['Boolean']['output'];
};

export type ReviewInput = {
  amenitiesRating: Scalars['Float']['input'];
  bookingId: Scalars['String']['input'];
  cleanlinessRating: Scalars['Float']['input'];
  guestPhotos?: Array<Scalars['String']['input']>;
  locationRating: Scalars['Float']['input'];
  overallRating: Scalars['Float']['input'];
  reviewText: Scalars['String']['input'];
  reviewTitle?: InputMaybe<Scalars['String']['input']>;
  serviceRating: Scalars['Float']['input'];
  valueRating: Scalars['Float']['input'];
};

export type ReviewRatingsSummaryDto = {
  __typename?: 'ReviewRatingsSummaryDto';
  amenitiesRating: Scalars['Float']['output'];
  cleanlinessRating: Scalars['Float']['output'];
  locationRating: Scalars['Float']['output'];
  overallRating: Scalars['Float']['output'];
  serviceRating: Scalars['Float']['output'];
  totalReviews: Scalars['Int']['output'];
  valueRating: Scalars['Float']['output'];
};

export type ReviewStatus =
  | 'APPROVED'
  | 'FLAGGED'
  | 'PENDING'
  | 'REMOVED';

export type ReviewUpdate = {
  _id: Scalars['String']['input'];
  overallRating?: InputMaybe<Scalars['Int']['input']>;
  reviewStatus?: InputMaybe<Scalars['String']['input']>;
  reviewText?: InputMaybe<Scalars['String']['input']>;
  reviewTitle?: InputMaybe<Scalars['String']['input']>;
};

export type ReviewsDto = {
  __typename?: 'ReviewsDto';
  list: Array<ReviewDto>;
  metaCounter: MetaCounterDto;
  ratingsSummary?: Maybe<ReviewRatingsSummaryDto>;
};

export type RoomDto = {
  __typename?: 'RoomDto';
  _id: Scalars['String']['output'];
  availableRooms: Scalars['Int']['output'];
  basePrice: Scalars['Int']['output'];
  bedCount: Scalars['Int']['output'];
  bedType: BedType;
  createdAt: Scalars['DateTime']['output'];
  currentViewers: Scalars['Int']['output'];
  hotelId: Scalars['String']['output'];
  lastMinuteDeal?: Maybe<LastMinuteDealDto>;
  maxOccupancy: Scalars['Int']['output'];
  roomAmenities: Array<Scalars['String']['output']>;
  roomDesc: Scalars['String']['output'];
  roomImages: Array<Scalars['String']['output']>;
  roomName: Scalars['String']['output'];
  roomNumber?: Maybe<Scalars['String']['output']>;
  roomSize: Scalars['Int']['output'];
  roomStatus: RoomStatus;
  roomType: RoomType;
  totalRooms: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewType: ViewType;
  weekendSurcharge: Scalars['Int']['output'];
};

export type RoomInput = {
  basePrice: Scalars['Int']['input'];
  bedCount: Scalars['Int']['input'];
  bedType: BedType;
  hotelId: Scalars['String']['input'];
  maxOccupancy: Scalars['Int']['input'];
  roomAmenities?: Array<Scalars['String']['input']>;
  roomDesc?: Scalars['String']['input'];
  roomImages?: Array<Scalars['String']['input']>;
  roomName: Scalars['String']['input'];
  roomNumber?: InputMaybe<Scalars['String']['input']>;
  roomSize?: Scalars['Int']['input'];
  roomType: RoomType;
  totalRooms: Scalars['Int']['input'];
  viewType?: ViewType;
  weekendSurcharge?: Scalars['Int']['input'];
};

export type RoomStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'INACTIVE'
  | 'MAINTENANCE';

export type RoomType =
  | 'DELUXE'
  | 'FAMILY'
  | 'PENTHOUSE'
  | 'PREMIUM'
  | 'STANDARD'
  | 'SUITE';

export type RoomUpdate = {
  _id: Scalars['String']['input'];
  basePrice?: InputMaybe<Scalars['Int']['input']>;
  roomAmenities?: InputMaybe<Array<Scalars['String']['input']>>;
  roomDesc?: InputMaybe<Scalars['String']['input']>;
  roomImages?: InputMaybe<Array<Scalars['String']['input']>>;
  roomName?: InputMaybe<Scalars['String']['input']>;
  roomSize?: InputMaybe<Scalars['Int']['input']>;
  roomStatus?: InputMaybe<RoomStatus>;
  totalRooms?: InputMaybe<Scalars['Int']['input']>;
  viewType?: InputMaybe<ViewType>;
  weekendSurcharge?: InputMaybe<Scalars['Int']['input']>;
};

export type RoomsDto = {
  __typename?: 'RoomsDto';
  list: Array<RoomDto>;
  metaCounter: MetaCounterDto;
};

export type SafetyFeaturesDto = {
  __typename?: 'SafetyFeaturesDto';
  femaleOnlyFloors: Scalars['Boolean']['output'];
  fireSafety: Scalars['Boolean']['output'];
  frontDesk24h: Scalars['Boolean']['output'];
  roomSafe: Scalars['Boolean']['output'];
  securityCameras: Scalars['Boolean']['output'];
  wellLitParking: Scalars['Boolean']['output'];
};

export type SafetyFeaturesInput = {
  femaleOnlyFloors?: Scalars['Boolean']['input'];
  fireSafety?: Scalars['Boolean']['input'];
  frontDesk24h?: Scalars['Boolean']['input'];
  roomSafe?: Scalars['Boolean']['input'];
  securityCameras?: Scalars['Boolean']['input'];
  wellLitParking?: Scalars['Boolean']['input'];
};

export type SearchHistoryDto = {
  __typename?: 'SearchHistoryDto';
  _id: Scalars['String']['output'];
  amenities?: Maybe<Array<Scalars['String']['output']>>;
  createdAt: Scalars['DateTime']['output'];
  guestCount?: Maybe<Scalars['Int']['output']>;
  hotelTypes?: Maybe<Array<HotelType>>;
  location?: Maybe<HotelLocation>;
  memberId: Scalars['String']['output'];
  priceMax?: Maybe<Scalars['Int']['output']>;
  priceMin?: Maybe<Scalars['Int']['output']>;
  purpose?: Maybe<StayPurpose>;
  starRatings?: Maybe<Array<Scalars['Float']['output']>>;
  text?: Maybe<Scalars['String']['output']>;
};

export type SendMessageInput = {
  chatId: Scalars['String']['input'];
  content?: InputMaybe<Scalars['String']['input']>;
  fileUrl?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  messageType: MessageType;
};

export type SenderType =
  | 'AGENT'
  | 'GUEST';

export type StartChatInput = {
  bookingId?: InputMaybe<Scalars['String']['input']>;
  hotelId: Scalars['String']['input'];
  initialMessage: Scalars['String']['input'];
};

export type StartSupportChatInput = {
  bookingId?: InputMaybe<Scalars['String']['input']>;
  initialMessage: Scalars['String']['input'];
  sourcePath?: InputMaybe<Scalars['String']['input']>;
  topic?: InputMaybe<Scalars['String']['input']>;
};

export type StayCandidateDto = {
  __typename?: 'StayCandidateDto';
  cheapestDate?: Maybe<Scalars['String']['output']>;
  cheapestPrice?: Maybe<Scalars['Int']['output']>;
  estimatedPrice?: Maybe<Scalars['Int']['output']>;
  fitScore: Scalars['Int']['output'];
  hotelId: Scalars['String']['output'];
  hotelTitle: Scalars['String']['output'];
  priceInsights: Array<Scalars['String']['output']>;
  reasons: Array<Scalars['String']['output']>;
  roomId?: Maybe<Scalars['String']['output']>;
  roomName?: Maybe<Scalars['String']['output']>;
  tradeoffs: Array<Scalars['String']['output']>;
  trustSignals: Array<Scalars['String']['output']>;
};

export type StayConciergeResultDto = {
  __typename?: 'StayConciergeResultDto';
  candidates: Array<StayCandidateDto>;
  clarifyingQuestions: Array<Scalars['String']['output']>;
  intent: StayIntentDto;
  nextAction: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  summary: Scalars['String']['output'];
};

export type StayIntentDto = {
  __typename?: 'StayIntentDto';
  amenities: Array<Scalars['String']['output']>;
  budgetMax?: Maybe<Scalars['Int']['output']>;
  budgetMin?: Maybe<Scalars['Int']['output']>;
  checkIn?: Maybe<Scalars['String']['output']>;
  checkOut?: Maybe<Scalars['String']['output']>;
  confidence: Scalars['Float']['output'];
  district?: Maybe<Scalars['String']['output']>;
  guests?: Maybe<Scalars['Int']['output']>;
  language: Scalars['String']['output'];
  location?: Maybe<HotelLocation>;
  purpose?: Maybe<StayPurpose>;
  roomPreferences: Array<Scalars['String']['output']>;
  safetyPreferences: Array<Scalars['String']['output']>;
  transportPreferences: Array<Scalars['String']['output']>;
};

export type StayPurpose =
  | 'BUSINESS'
  | 'EVENT'
  | 'FAMILY'
  | 'LONG_TERM'
  | 'MEDICAL'
  | 'ROMANTIC'
  | 'SOLO'
  | 'STAYCATION';

export type StrikeHistoryDto = {
  __typename?: 'StrikeHistoryDto';
  bookingId: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  reason: Scalars['String']['output'];
};

export type SubscriptionStatusDto = {
  __typename?: 'SubscriptionStatusDto';
  active: Scalars['Boolean']['output'];
  daysRemaining?: Maybe<Scalars['Int']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  pendingRequestedTier?: Maybe<Scalars['String']['output']>;
  tier: SubscriptionTier;
};

export type SubscriptionTier =
  | 'BASIC'
  | 'ELITE'
  | 'FREE'
  | 'PREMIUM';

export type ToggleFollowDto = {
  __typename?: 'ToggleFollowDto';
  follow?: Maybe<FollowDto>;
  followerCount: Scalars['Int']['output'];
  following: Scalars['Boolean']['output'];
};

export type ToggleLikeDto = {
  __typename?: 'ToggleLikeDto';
  like?: Maybe<LikeDto>;
  likeCount: Scalars['Int']['output'];
  liked: Scalars['Boolean']['output'];
};

export type TrackAnalyticsEventInput = {
  eventName: Scalars['String']['input'];
  eventPath?: InputMaybe<Scalars['String']['input']>;
  payload?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  userAgent?: InputMaybe<Scalars['String']['input']>;
};

export type TravelStyle =
  | 'BUSINESS'
  | 'COUPLE'
  | 'FAMILY'
  | 'FRIENDS'
  | 'SOLO';

export type VerificationDocsDto = {
  __typename?: 'VerificationDocsDto';
  businessLicense?: Maybe<Scalars['String']['output']>;
  propertyOwnership?: Maybe<Scalars['String']['output']>;
  touristLicense?: Maybe<Scalars['String']['output']>;
};

export type VerificationStatus =
  | 'PENDING'
  | 'REJECTED'
  | 'VERIFIED';

export type ViewType =
  | 'CITY'
  | 'GARDEN'
  | 'MOUNTAIN'
  | 'NONE'
  | 'OCEAN';
