import type { HotelAmenityKey, HotelLocation, HotelType, RoomType, StayPurpose } from "@/types/hotel";

export const HOTELS_PAGE_SIZE = 12;

export type HotelsSortBy = "RECOMMENDED" | "NEWEST" | "TOP_RATED" | "MOST_LOVED";

export interface HotelsSortOption {
  value: HotelsSortBy;
  label: string;
  sort: string;
  direction: 1 | -1;
}

export const HOTELS_SORT_OPTIONS: HotelsSortOption[] = [
  { value: "RECOMMENDED", label: "Recommended", sort: "hotelRank", direction: -1 },
  { value: "NEWEST", label: "Newest", sort: "createdAt", direction: -1 },
  { value: "TOP_RATED", label: "Top rated", sort: "hotelRating", direction: -1 },
  { value: "MOST_LOVED", label: "Most loved", sort: "hotelLikes", direction: -1 },
];

export const HOTEL_LOCATIONS: HotelLocation[] = [
  "SEOUL",
  "BUSAN",
  "DAEGU",
  "DAEJON",
  "GWANGJU",
  "INCHEON",
  "JEJU",
  "GYEONGJU",
  "GANGNEUNG",
];

export const HOTEL_TYPES: HotelType[] = ["HOTEL", "MOTEL", "RESORT", "GUESTHOUSE", "HANOK", "PENSION"];
export const ROOM_TYPES: RoomType[] = ["STANDARD", "DELUXE", "SUITE", "FAMILY", "PREMIUM", "PENTHOUSE"];
export const STAR_RATINGS = [1, 2, 3, 4, 5] as const;
export const MIN_RATING_OPTIONS = [5, 4.5, 4, 3.5, 3, 2.5, 2] as const;

export const STAY_PURPOSE_OPTIONS: Array<{ value: StayPurpose; label: string }> = [
  { value: "BUSINESS", label: "Business" },
  { value: "ROMANTIC", label: "Romantic" },
  { value: "FAMILY", label: "Family" },
  { value: "SOLO", label: "Solo" },
  { value: "STAYCATION", label: "Staycation" },
  { value: "EVENT", label: "Event" },
  { value: "MEDICAL", label: "Medical" },
  { value: "LONG_TERM", label: "Long-term" },
];

export const AMENITY_OPTIONS: Array<{ key: HotelAmenityKey; label: string }> = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "workspace", label: "Workspace" },
  { key: "meetingRoom", label: "Meeting room" },
  { key: "parking", label: "Parking" },
  { key: "breakfast", label: "Breakfast" },
  { key: "breakfastIncluded", label: "Breakfast included" },
  { key: "roomService", label: "Room service" },
  { key: "gym", label: "Gym" },
  { key: "pool", label: "Pool" },
  { key: "spa", label: "Spa" },
  { key: "restaurant", label: "Restaurant" },
  { key: "familyRoom", label: "Family room" },
  { key: "kidsFriendly", label: "Kids friendly" },
  { key: "playground", label: "Playground" },
  { key: "coupleRoom", label: "Couple room" },
  { key: "romanticView", label: "Romantic view" },
  { key: "privateBath", label: "Private bath" },
  { key: "airportShuttle", label: "Airport shuttle" },
  { key: "evCharging", label: "EV charging" },
  { key: "wheelchairAccessible", label: "Wheelchair accessible" },
  { key: "elevator", label: "Elevator" },
  { key: "accessibleBathroom", label: "Accessible bathroom" },
  { key: "visualAlarms", label: "Visual alarms" },
  { key: "serviceAnimalsAllowed", label: "Service animals allowed" },
];
