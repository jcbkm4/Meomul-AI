import type { HotelLocation } from "@/types/hotel";

export type TravelStyle = "SOLO" | "FAMILY" | "COUPLE" | "FRIENDS" | "BUSINESS";
export type BudgetLevel = "BUDGET" | "MID" | "PREMIUM" | "LUXURY";
export type RecommendationProfileSource = "onboarding" | "computed";

export interface RecommendationProfile {
  hasProfile: boolean;
  source?: RecommendationProfileSource | null;
  preferredLocations: string[];
  preferredTypes: string[];
  preferredPurposes: string[];
  preferredAmenities: string[];
  avgPriceMin?: number | null;
  avgPriceMax?: number | null;
  computedAt?: string | null;
}

export interface GetMyRecommendationProfileQueryData {
  getMyRecommendationProfile: RecommendationProfile;
}

export interface SaveOnboardingPreferencesMutationData {
  saveOnboardingPreferences: {
    success: boolean;
    message: string;
  };
}

export interface OnboardingPreferenceInput {
  travelStyles: TravelStyle[];
  preferredAmenities: string[];
  budgetLevel?: BudgetLevel;
  preferredDestinations: HotelLocation[];
}

export interface SaveOnboardingPreferencesMutationVars {
  input: OnboardingPreferenceInput;
}
