import type {
  HotelListItem,
  HotelLocation,
  RecommendedHotelsV2Dto,
  ReviewDto,
  ReviewRatingsSummaryDto,
  RoomType,
  StayPurpose,
} from "@/types/hotel";

export interface HeroSlide {
  _id: string;
  title: string;
  location: string;
  hotelType: string;
  rating: number;
  likes: number;
  imageUrl: string;
}

export interface RecommendedCard {
  _id: string;
  title: string;
  location: string;
  hotelType: string;
  rating: number;
  likes: number;
  imageUrl: string;
  signal: string;
}

export interface TestimonialReviewEntry {
  review: ReviewDto;
  hotelId: string;
  hotelTitle: string;
}

export interface LastMinuteDealCard {
  roomId: string;
  hotelId: string;
  hotelTitle: string;
  hotelLocation: string;
  roomName: string;
  roomType: RoomType | string;
  imageUrl: string;
  basePrice: number;
  dealPrice: number;
  discountPercent: number;
  validUntil: string;
}

export interface EditorialGuideCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  location: HotelLocation;
  purpose: StayPurpose;
  checkIn: string;
  checkOut: string;
  guests: string;
  types?: string;
  href: string;
  imageUrl: string;
}

export interface ValuePillar {
  title: string;
  metric: string;
  detail: string;
}

export interface HomePageProps {
  initialTopHotels: HotelListItem[];
  initialHotelInventoryTotal: number;
  initialTotalVerifiedReviews: number;
  initialTrendingHotels: HotelListItem[];
  initialFeaturedReviews: ReviewDto[];
  initialFeaturedRatingsSummary: ReviewRatingsSummaryDto | null;
  initialTestimonials: TestimonialReviewEntry[];
  initialLastMinuteDeals: LastMinuteDealCard[];
  initialRecommendationResult: RecommendedHotelsV2Dto | null;
  serverTodayIso: string;
  initialLoadError: string | null;
}
