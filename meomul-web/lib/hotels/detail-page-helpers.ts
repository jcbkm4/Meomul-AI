import type { HotelDetailItem, HotelListItem } from "@/types/hotel";

export const ROOM_PAGE_SIZE = 12;
export const REVIEW_PAGE_SIZE = 2;
export const CARD_LIST_LIMIT = 6;

export const amenityLabels: Partial<
  Record<keyof HotelDetailItem["amenities"], string>
> = {
  wifi: "Fast Wi-Fi",
  wifiSpeed: "High-speed Wi-Fi",
  parking: "Parking",
  parkingFee: "Paid Parking",
  breakfast: "Breakfast",
  breakfastIncluded: "Breakfast Included",
  roomService: "Room Service",
  gym: "Gym",
  pool: "Pool",
  workspace: "Workspace",
  familyRoom: "Family Room",
  kidsFriendly: "Kids Friendly",
  wheelchairAccessible: "Wheelchair Accessible",
  elevator: "Elevator",
  accessibleBathroom: "Accessible Bathroom",
  visualAlarms: "Visual Alarms",
  serviceAnimalsAllowed: "Service Animals Allowed",
  airportShuttle: "Airport Shuttle",
  evCharging: "EV Charging",
  playground: "Playground",
  meetingRoom: "Meeting Room",
  privateBath: "Private Bath",
  restaurant: "Restaurant",
  spa: "Spa",
  coupleRoom: "Couple Room",
  romanticView: "Romantic View",
};

export const asPercent = (rating: number): string =>
  `${Math.round((rating / 5) * 100)}%`;

export const shortenText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

export const canUsePersonalizedRecommendations = (
  memberType: string | undefined,
): boolean => {
  return (
    memberType === "USER" ||
    memberType === "AGENT" ||
    memberType === "ADMIN" ||
    memberType === "ADMIN_OPERATOR"
  );
};

export const canUseMemberActions = (
  memberType: string | undefined,
): boolean => {
  return (
    memberType === "USER" ||
    memberType === "AGENT" ||
    memberType === "ADMIN" ||
    memberType === "ADMIN_OPERATOR"
  );
};

export const uniqueHotels = (
  hotels: HotelListItem[],
  excludeHotelId: string,
): HotelListItem[] => {
  const seen = new Set<string>();
  return hotels.filter((hotel) => {
    if (hotel._id === excludeHotelId) {
      return false;
    }
    if (seen.has(hotel._id)) {
      return false;
    }
    seen.add(hotel._id);
    return true;
  });
};

export const getPolicyText = (
  policy: HotelDetailItem["cancellationPolicy"],
): string => {
  if (policy === "FLEXIBLE") {
    return "Flexible cancellation";
  }
  if (policy === "STRICT") {
    return "Strict cancellation";
  }
  return "Moderate cancellation";
};

export const getMapLink = (hotel: HotelDetailItem): string => {
  const coords = hotel.detailedLocation?.coordinates;
  const lat = coords?.lat;
  const lng = coords?.lng;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://maps.google.com/?q=${lat},${lng}`;
  }
  const address = hotel.detailedLocation?.address;
  return address
    ? `https://maps.google.com/?q=${encodeURIComponent(address)}`
    : "https://maps.google.com/";
};

export const getMapEmbedLink = (hotel: HotelDetailItem): string => {
  const coords = hotel.detailedLocation?.coordinates;
  const lat = coords?.lat;
  const lng = coords?.lng;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }
  const address = hotel.detailedLocation?.address;
  return address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
    : `https://maps.google.com/maps?z=5&output=embed`;
};
