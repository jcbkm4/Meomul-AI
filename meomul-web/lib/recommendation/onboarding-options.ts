import type { HotelLocation } from "@/types/hotel";
import type { TranslationKey } from "@/lib/i18n/messages";
import { getHotelAmenityLabel, getHotelLocationLabelLocalized } from "@/lib/hotels/hotels-i18n";
import type { BudgetLevel, TravelStyle } from "@/types/recommendation";

export const MAX_TRAVEL_STYLES = 3;
export const MAX_DESTINATIONS = 4;
export const MAX_AMENITIES = 5;

type Translator = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

export const TRAVEL_STYLE_VALUES: TravelStyle[] = ["SOLO", "FAMILY", "COUPLE", "FRIENDS", "BUSINESS"];

export const DESTINATION_VALUES: HotelLocation[] = [
  "SEOUL",
  "BUSAN",
  "INCHEON",
  "DAEGU",
  "GWANGJU",
  "DAEJON",
  "JEJU",
  "GYEONGJU",
  "GANGNEUNG",
];

export const AMENITY_VALUES = [
  "wifi",
  "workspace",
  "meetingRoom",
  "parking",
  "breakfast",
  "roomService",
  "gym",
  "pool",
  "spa",
  "restaurant",
  "familyRoom",
  "kidsFriendly",
  "playground",
  "coupleRoom",
  "romanticView",
  "privateBath",
  "airportShuttle",
  "wheelchairAccessible",
  "elevator",
  "serviceAnimalsAllowed",
] as const;

export const BUDGET_VALUES: BudgetLevel[] = ["BUDGET", "MID", "PREMIUM", "LUXURY"];

export const getTravelStyleOptions = (t: Translator): Array<{ value: TravelStyle; label: string; description: string }> => [
  { value: "SOLO", label: t("onboarding_travel_solo"), description: t("onboarding_travel_solo_desc") },
  { value: "FAMILY", label: t("onboarding_travel_family"), description: t("onboarding_travel_family_desc") },
  { value: "COUPLE", label: t("onboarding_travel_couple"), description: t("onboarding_travel_couple_desc") },
  { value: "FRIENDS", label: t("onboarding_travel_friends"), description: t("onboarding_travel_friends_desc") },
  { value: "BUSINESS", label: t("onboarding_travel_business"), description: t("onboarding_travel_business_desc") },
];

export const getDestinationOptions = (t: Translator): Array<{ value: HotelLocation; label: string }> =>
  DESTINATION_VALUES.map((value) => ({ value, label: getHotelLocationLabelLocalized(value, t) }));

export const getAmenityOptions = (t: Translator): Array<{ value: string; label: string }> =>
  AMENITY_VALUES.map((value) => ({ value, label: getHotelAmenityLabel(value, t) }));

export const getBudgetOptions = (t: Translator): Array<{ value: BudgetLevel; label: string; range: string }> => [
  { value: "BUDGET", label: t("onboarding_budget_budget"), range: t("onboarding_budget_budget_range") },
  { value: "MID", label: t("onboarding_budget_mid"), range: t("onboarding_budget_mid_range") },
  { value: "PREMIUM", label: t("onboarding_budget_premium"), range: t("onboarding_budget_premium_range") },
  { value: "LUXURY", label: t("onboarding_budget_luxury"), range: t("onboarding_budget_luxury_range") },
];

const DESTINATION_SET = new Set<HotelLocation>(DESTINATION_VALUES);
const AMENITY_SET = new Set<string>(AMENITY_VALUES);
const PURPOSE_TO_TRAVEL_STYLE: Record<string, TravelStyle | undefined> = {
  SOLO: "SOLO",
  FAMILY: "FAMILY",
  ROMANTIC: "COUPLE",
  STAYCATION: "FRIENDS",
  BUSINESS: "BUSINESS",
};

export const toggleWithLimit = <T extends string>(current: T[], nextValue: T, limit: number): T[] => {
  if (current.includes(nextValue)) {
    return current.filter((item) => item !== nextValue);
  }

  if (current.length >= limit) {
    return current;
  }

  return [...current, nextValue];
};

export const toValidDestinationList = (locations: string[] | undefined): HotelLocation[] => {
  if (!locations || locations.length === 0) {
    return [];
  }

  return locations.filter((location): location is HotelLocation => DESTINATION_SET.has(location as HotelLocation));
};

export const toValidAmenityList = (amenities: string[] | undefined): string[] => {
  if (!amenities || amenities.length === 0) {
    return [];
  }

  return amenities.filter((amenity) => AMENITY_SET.has(amenity));
};

export const mapPurposesToTravelStyles = (purposes: string[] | undefined): TravelStyle[] => {
  if (!purposes || purposes.length === 0) {
    return [];
  }

  const mapped = purposes
    .map((purpose) => PURPOSE_TO_TRAVEL_STYLE[purpose])
    .filter((value): value is TravelStyle => typeof value === "string");
  return Array.from(new Set(mapped)).slice(0, MAX_TRAVEL_STYLES);
};

export const mapBudgetLevelFromProfile = (avgPriceMax?: number | null): BudgetLevel | undefined => {
  if (!avgPriceMax || avgPriceMax <= 0) {
    return undefined;
  }

  if (avgPriceMax <= 80_000) {
    return "BUDGET";
  }
  if (avgPriceMax <= 150_000) {
    return "MID";
  }
  if (avgPriceMax <= 300_000) {
    return "PREMIUM";
  }
  return "LUXURY";
};
