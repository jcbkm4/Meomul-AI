import { gql } from "@apollo/client";

export const GET_MY_RECOMMENDATION_PROFILE_QUERY = gql`
  query GetMyRecommendationProfile {
    getMyRecommendationProfile {
      hasProfile
      source
      preferredLocations
      preferredTypes
      preferredPurposes
      preferredAmenities
      avgPriceMin
      avgPriceMax
      computedAt
    }
  }
`;

export const SAVE_ONBOARDING_PREFERENCES_MUTATION = gql`
  mutation SaveOnboardingPreferences($input: OnboardingPreferenceInput!) {
    saveOnboardingPreferences(input: $input) {
      success
      message
    }
  }
`;
