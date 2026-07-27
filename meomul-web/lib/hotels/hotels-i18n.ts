import type { TranslationKey } from "@/lib/i18n/messages";
import type {
  BedType,
  HotelAmenityKey,
  HotelLocation,
  HotelType,
  RoomType,
  RoomStatus,
  StayPurpose,
  ViewType,
} from "@/types/hotel";

type Translator = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

const LOCATION_LABEL_KEYS: Record<HotelLocation, TranslationKey> = {
  SEOUL: "hotel_location_seoul",
  BUSAN: "hotel_location_busan",
  DAEGU: "hotel_location_daegu",
  DAEJON: "hotel_location_daejeon",
  GWANGJU: "hotel_location_gwangju",
  INCHEON: "hotel_location_incheon",
  JEJU: "hotel_location_jeju",
  GYEONGJU: "hotel_location_gyeongju",
  GANGNEUNG: "hotel_location_gangneung",
};

const PURPOSE_LABEL_KEYS: Record<StayPurpose, TranslationKey> = {
  BUSINESS: "stay_purpose_business",
  ROMANTIC: "stay_purpose_romantic",
  FAMILY: "stay_purpose_family",
  SOLO: "stay_purpose_solo",
  STAYCATION: "stay_purpose_staycation",
  EVENT: "stay_purpose_event",
  MEDICAL: "stay_purpose_medical",
  LONG_TERM: "stay_purpose_long_term",
};

const HOTEL_TYPE_LABEL_KEYS: Record<HotelType, TranslationKey> = {
  HOTEL: "hotel_type_hotel",
  MOTEL: "hotel_type_motel",
  RESORT: "hotel_type_resort",
  GUESTHOUSE: "hotel_type_guesthouse",
  HANOK: "hotel_type_hanok",
  PENSION: "hotel_type_pension",
};

const ROOM_TYPE_LABEL_KEYS: Record<RoomType, TranslationKey> = {
  STANDARD: "room_type_standard",
  DELUXE: "room_type_deluxe",
  SUITE: "room_type_suite",
  FAMILY: "room_type_family",
  PREMIUM: "room_type_premium",
  PENTHOUSE: "room_type_penthouse",
};

const VIEW_TYPE_LABEL_KEYS: Record<ViewType, TranslationKey> = {
  CITY: "view_type_city",
  OCEAN: "view_type_ocean",
  MOUNTAIN: "view_type_mountain",
  GARDEN: "view_type_garden",
  NONE: "view_type_none",
};

const BED_TYPE_LABEL_KEYS: Record<BedType, TranslationKey> = {
  SINGLE: "bed_type_single",
  DOUBLE: "bed_type_double",
  QUEEN: "bed_type_queen",
  KING: "bed_type_king",
  TWIN: "bed_type_twin",
};

const ROOM_STATUS_LABEL_KEYS: Record<RoomStatus, TranslationKey> = {
  AVAILABLE: "room_status_available",
  BOOKED: "room_status_booked",
  MAINTENANCE: "room_status_maintenance",
  INACTIVE: "room_status_inactive",
};

const AMENITY_LABEL_KEYS: Record<HotelAmenityKey, TranslationKey> = {
  wifi: "hotel_amenity_wifi",
  workspace: "hotel_amenity_workspace",
  meetingRoom: "hotel_amenity_meeting_room",
  parking: "hotel_amenity_parking",
  breakfast: "hotel_amenity_breakfast",
  breakfastIncluded: "hotel_amenity_breakfast_included",
  roomService: "hotel_amenity_room_service",
  gym: "hotel_amenity_gym",
  pool: "hotel_amenity_pool",
  spa: "hotel_amenity_spa",
  restaurant: "hotel_amenity_restaurant",
  familyRoom: "hotel_amenity_family_room",
  kidsFriendly: "hotel_amenity_kids_friendly",
  playground: "hotel_amenity_playground",
  coupleRoom: "hotel_amenity_couple_room",
  romanticView: "hotel_amenity_romantic_view",
  privateBath: "hotel_amenity_private_bath",
  airportShuttle: "hotel_amenity_airport_shuttle",
  evCharging: "hotel_amenity_ev_charging",
  wheelchairAccessible: "hotel_amenity_wheelchair_accessible",
  elevator: "hotel_amenity_elevator",
  accessibleBathroom: "hotel_amenity_accessible_bathroom",
  visualAlarms: "hotel_amenity_visual_alarms",
  serviceAnimalsAllowed: "hotel_amenity_service_animals_allowed",
};

export const getHotelLocationLabelLocalized = (
  value: HotelLocation | string,
  t: Translator,
): string => {
  const key = LOCATION_LABEL_KEYS[value as HotelLocation];
  if (key) {
    return t(key);
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const getStayPurposeLabel = (value: StayPurpose | string, t: Translator): string => {
  const key = PURPOSE_LABEL_KEYS[value as StayPurpose];
  return key ? t(key) : value;
};

export const getHotelTypeLabel = (value: HotelType | string, t: Translator): string => {
  const key = HOTEL_TYPE_LABEL_KEYS[value as HotelType];
  return key ? t(key) : value;
};

export const getRoomTypeLabel = (value: RoomType | string, t: Translator): string => {
  const key = ROOM_TYPE_LABEL_KEYS[value as RoomType];
  return key ? t(key) : value;
};

export const getViewTypeLabel = (value: ViewType | string, t: Translator): string => {
  const key = VIEW_TYPE_LABEL_KEYS[value as ViewType];
  return key ? t(key) : value;
};

export const getBedTypeLabel = (value: BedType | string, t: Translator): string => {
  const key = BED_TYPE_LABEL_KEYS[value as BedType];
  return key ? t(key) : value;
};

export const getRoomStatusLabel = (value: RoomStatus | string, t: Translator): string => {
  const key = ROOM_STATUS_LABEL_KEYS[value as RoomStatus];
  return key ? t(key) : value;
};

export const getHotelAmenityLabel = (
  value: HotelAmenityKey | string,
  t: Translator,
): string => {
  const key = AMENITY_LABEL_KEYS[value as HotelAmenityKey];
  return key ? t(key) : value;
};

export const getHotelsSortLabel = (
  value: "RECOMMENDED" | "NEWEST" | "TOP_RATED" | "MOST_LOVED",
  t: Translator,
): string => {
  switch (value) {
    case "RECOMMENDED":
      return t("hotels_sort_recommended");
    case "NEWEST":
      return t("hotels_sort_newest");
    case "TOP_RATED":
      return t("hotels_sort_top_rated");
    case "MOST_LOVED":
      return t("hotels_sort_most_loved");
    default:
      return value;
  }
};

export const formatCompactHotelDateLocalized = (
  value: string,
  locale: string,
): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  const [yearText, monthText, dayText] = value.split("-");
  const parsed = new Date(
    Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)),
  );

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
};

export const formatHotelDateSummaryLocalized = (
  checkIn: string,
  checkOut: string,
  locale: string,
  t: Translator,
): string => {
  const start = formatCompactHotelDateLocalized(checkIn, locale);
  const end = formatCompactHotelDateLocalized(checkOut, locale);

  if (start && end) {
    return `${start} - ${end}`;
  }
  if (start) {
    return t("hotels_summary_from", { date: start });
  }
  if (end) {
    return t("hotels_summary_until", { date: end });
  }

  return t("hotels_summary_add_dates");
};

export const formatHotelGuestSummaryLocalized = (
  value: string,
  t: Translator,
): string =>
  value
    ? t("hotels_summary_guests", {
        count: value,
        suffix: value === "1" ? "" : "s",
      })
    : t("hotels_summary_add_guests");

export const formatStayCountLabelLocalized = (
  total: number,
  noun: "stay" | "hotel",
  t: Translator,
): string =>
  t(noun === "hotel" ? "hotels_count_hotels" : "hotels_count_stays", {
    count: total.toLocaleString(),
    suffix: total === 1 ? "" : "s",
  });

export const formatHotelsPaginationSummaryLocalized = (
  page: number,
  totalPages: number,
  total: number,
  t: Translator,
): string =>
  t("hotels_results_page", {
    page,
    totalPages,
    total: total.toLocaleString(),
  });
