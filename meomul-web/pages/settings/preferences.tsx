import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  GET_MY_RECOMMENDATION_PROFILE_QUERY,
  SAVE_ONBOARDING_PREFERENCES_MUTATION,
} from "@/graphql/recommendation.gql";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { setOnboardingCompletionCachedValue } from "@/lib/auth/onboarding-status";
import { getSessionMember } from "@/lib/auth/session";
import {
  getAmenityOptions,
  getBudgetOptions,
  getDestinationOptions,
  getTravelStyleOptions,
  mapBudgetLevelFromProfile,
  mapPurposesToTravelStyles,
  MAX_AMENITIES,
  MAX_DESTINATIONS,
  MAX_TRAVEL_STYLES,
  toggleWithLimit,
  toValidAmenityList,
  toValidDestinationList,
} from "@/lib/recommendation/onboarding-options";
import { useI18n } from "@/lib/i18n/provider";
import { errorAlert, infoAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import type { HotelLocation } from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import type {
  BudgetLevel,
  GetMyRecommendationProfileQueryData,
  SaveOnboardingPreferencesMutationData,
  SaveOnboardingPreferencesMutationVars,
  TravelStyle,
} from "@/types/recommendation";

const PreferencesPage: NextPageWithAuth = () => {
  const { t } = useI18n();
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [preferredDestinations, setPreferredDestinations] = useState<HotelLocation[]>([]);
  const [preferredAmenities, setPreferredAmenities] = useState<string[]>([]);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isPrefillApplied, setIsPrefillApplied] = useState(false);
  const [hasTrackedViewEvent, setHasTrackedViewEvent] = useState(false);

  const travelStyleOptions = useMemo(() => getTravelStyleOptions(t), [t]);
  const destinationOptions = useMemo(() => getDestinationOptions(t), [t]);
  const amenityOptions = useMemo(() => getAmenityOptions(t), [t]);
  const budgetOptions = useMemo(() => getBudgetOptions(t), [t]);

  const { data, loading, error, refetch } = useQuery<GetMyRecommendationProfileQueryData>(GET_MY_RECOMMENDATION_PROFILE_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (isPrefillApplied || !data) {
      return;
    }

    const profile = data.getMyRecommendationProfile;
    setTravelStyles(mapPurposesToTravelStyles(profile.preferredPurposes));
    setPreferredDestinations(toValidDestinationList(profile.preferredLocations));
    setPreferredAmenities(toValidAmenityList(profile.preferredAmenities));
    setBudgetLevel(mapBudgetLevelFromProfile(profile.avgPriceMax));
    setIsPrefillApplied(true);
  }, [data, isPrefillApplied]);

  useEffect(() => {
    if (hasTrackedViewEvent || loading || !data) {
      return;
    }

    trackAnalyticsEvent("preferences_viewed", {
      hasProfile: data.getMyRecommendationProfile.hasProfile,
      source: data.getMyRecommendationProfile.source ?? null,
    });
    setHasTrackedViewEvent(true);
  }, [data, hasTrackedViewEvent, loading]);

  const [saveOnboardingPreferences, { loading: saving }] = useMutation<
    SaveOnboardingPreferencesMutationData,
    SaveOnboardingPreferencesMutationVars
  >(SAVE_ONBOARDING_PREFERENCES_MUTATION);

  const validationMessage = useMemo(() => {
    if (travelStyles.length === 0) {
      return t("onboarding_validation_travel");
    }
    if (preferredDestinations.length === 0) {
      return t("onboarding_validation_destination");
    }
    return null;
  }, [preferredDestinations.length, t, travelStyles.length]);

  const handleSave = async () => {
    setErrorText(null);

    if (validationMessage) {
      setErrorText(validationMessage);
      await infoAlert(t("settings_preferences_validation_title"), validationMessage);
      return;
    }

    try {
      const response = await saveOnboardingPreferences({
        variables: {
          input: {
            travelStyles,
            preferredAmenities,
            preferredDestinations,
            ...(budgetLevel ? { budgetLevel } : {}),
          },
        },
      });

      const successMessage = response.data?.saveOnboardingPreferences.message ?? t("settings_preferences_saved_body");
      trackAnalyticsEvent("preferences_saved", {
        travelStylesCount: travelStyles.length,
        destinationsCount: preferredDestinations.length,
        amenitiesCount: preferredAmenities.length,
        hasBudgetLevel: Boolean(budgetLevel),
      });

      const sessionMember = getSessionMember();
      if (sessionMember?._id) {
        setOnboardingCompletionCachedValue(sessionMember._id, true);
      }

      await refetch();
      await successAlert(t("settings_preferences_saved_title"), successMessage);
    } catch (saveError) {
      trackAnalyticsEvent("preferences_save_failed", {
        error: getErrorMessage(saveError),
      });
      const message = getErrorMessage(saveError);
      setErrorText(message);
      await errorAlert(t("settings_preferences_failed_title"), message);
    }
  };

  return (
    <main className="w-full space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t("settings_preferences_eyebrow")}</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{t("settings_preferences_title")}</h1>
        <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
          {t("settings_preferences_desc")}
        </p>
      </header>

      {loading && !isPrefillApplied ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">
          {t("settings_preferences_loading")}
        </section>
      ) : null}
      {error ? <ErrorNotice message={getErrorMessage(error)} /> : null}

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{t("onboarding_step_travel")}</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {travelStyles.length}/{MAX_TRAVEL_STYLES}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {travelStyleOptions.map((option) => {
              const selected = travelStyles.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTravelStyles((prev) => toggleWithLimit(prev, option.value, MAX_TRAVEL_STYLES))}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-800"
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className={`mt-1 text-sm ${selected ? "text-slate-200" : "text-slate-600"}`}>{option.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{t("onboarding_step_destinations")}</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {preferredDestinations.length}/{MAX_DESTINATIONS}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {destinationOptions.map((option) => {
              const selected = preferredDestinations.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setPreferredDestinations((prev) => toggleWithLimit(prev, option.value, MAX_DESTINATIONS))
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{t("onboarding_step_amenities")}</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {preferredAmenities.length}/{MAX_AMENITIES}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {amenityOptions.map((option) => {
              const selected = preferredAmenities.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferredAmenities((prev) => toggleWithLimit(prev, option.value, MAX_AMENITIES))}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">{t("onboarding_budget_title")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {budgetOptions.map((option) => {
              const selected = budgetLevel === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBudgetLevel((prev) => (prev === option.value ? undefined : option.value))}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-800"
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className={`mt-1 text-sm ${selected ? "text-slate-200" : "text-slate-600"}`}>{option.range}</p>
                </button>
              );
            })}
          </div>
        </section>

        {errorText ? <ErrorNotice message={errorText} /> : null}
        <footer className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              void handleSave();
            }}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? t("onboarding_saving") : t("settings_preferences_save")}
          </button>
        </footer>
      </section>
    </main>
  );
};

PreferencesPage.auth = { roles: ["USER"] };

export default PreferencesPage;
