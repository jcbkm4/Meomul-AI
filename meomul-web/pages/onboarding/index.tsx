import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import { SAVE_ONBOARDING_PREFERENCES_MUTATION } from "@/graphql/recommendation.gql";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { setOnboardingCompletionCachedValue } from "@/lib/auth/onboarding-status";
import { getSessionMember } from "@/lib/auth/session";
import {
  getAmenityOptions,
  getBudgetOptions,
  getDestinationOptions,
  getTravelStyleOptions,
  MAX_AMENITIES,
  MAX_DESTINATIONS,
  MAX_TRAVEL_STYLES,
  toggleWithLimit,
} from "@/lib/recommendation/onboarding-options";
import { useI18n } from "@/lib/i18n/provider";
import { errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import type { HotelLocation } from "@/types/hotel";
import type {
  BudgetLevel,
  SaveOnboardingPreferencesMutationData,
  SaveOnboardingPreferencesMutationVars,
  TravelStyle,
} from "@/types/recommendation";
import type { NextPageWithAuth } from "@/types/page";

const ONBOARDING_REFRESH_QUERY_KEY = "onboarding";
const ONBOARDING_REFRESH_QUERY_VALUE = "complete";

const appendRecommendationRefreshFlag = (path: string): string => {
  const parsed = new URL(path, "http://localhost");
  parsed.searchParams.set(ONBOARDING_REFRESH_QUERY_KEY, ONBOARDING_REFRESH_QUERY_VALUE);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
};

const OnboardingPage: NextPageWithAuth = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [preferredDestinations, setPreferredDestinations] = useState<HotelLocation[]>([]);
  const [preferredAmenities, setPreferredAmenities] = useState<string[]>([]);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);
  const lastTrackedStepRef = useRef<number | null>(null);

  const stepLabels = useMemo(
    () => [
      t("onboarding_step_travel"),
      t("onboarding_step_destinations"),
      t("onboarding_step_amenities"),
      t("onboarding_step_budget"),
    ] as const,
    [t],
  );
  const travelStyleOptions = useMemo(() => getTravelStyleOptions(t), [t]);
  const destinationOptions = useMemo(() => getDestinationOptions(t), [t]);
  const amenityOptions = useMemo(() => getAmenityOptions(t), [t]);
  const budgetOptions = useMemo(() => getBudgetOptions(t), [t]);

  const redirectTarget = useMemo(() => {
    if (typeof router.query.next !== "string") {
      return "/";
    }

    return router.query.next.startsWith("/") ? router.query.next : "/";
  }, [router.query.next]);

  const [saveOnboardingPreferences, { loading }] = useMutation<
    SaveOnboardingPreferencesMutationData,
    SaveOnboardingPreferencesMutationVars
  >(SAVE_ONBOARDING_PREFERENCES_MUTATION);

  const stepValidationMessage = useMemo(() => {
    if (step === 0 && travelStyles.length === 0) {
      return t("onboarding_validation_travel");
    }
    if (step === 1 && preferredDestinations.length === 0) {
      return t("onboarding_validation_destination");
    }
    return null;
  }, [preferredDestinations.length, step, t, travelStyles.length]);

  const canGoBack = step > 0 && !loading;
  const canGoNext = !stepValidationMessage && !loading;
  const isLastStep = step === stepLabels.length - 1;

  useEffect(() => {
    trackAnalyticsEvent("onboarding_viewed");
  }, []);

  useEffect(() => {
    if (lastTrackedStepRef.current === step) {
      return;
    }

    trackAnalyticsEvent("onboarding_step_viewed", {
      stepIndex: step + 1,
      stepName: stepLabels[step],
    });
    lastTrackedStepRef.current = step;
  }, [step, stepLabels]);

  const handleBack = () => {
    if (!canGoBack) return;
    setErrorText(null);
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = async () => {
    if (!canGoNext) return;
    setErrorText(null);

    if (!isLastStep) {
      trackAnalyticsEvent("onboarding_step_completed", {
        stepIndex: step + 1,
        stepName: stepLabels[step],
        travelStylesCount: travelStyles.length,
        destinationsCount: preferredDestinations.length,
        amenitiesCount: preferredAmenities.length,
      });
      setStep((prev) => Math.min(stepLabels.length - 1, prev + 1));
      return;
    }

    try {
      await saveOnboardingPreferences({
        variables: {
          input: {
            travelStyles,
            preferredAmenities,
            preferredDestinations,
            ...(budgetLevel ? { budgetLevel } : {}),
          },
        },
      });
      trackAnalyticsEvent("onboarding_completed", {
        travelStylesCount: travelStyles.length,
        destinationsCount: preferredDestinations.length,
        amenitiesCount: preferredAmenities.length,
        hasBudgetLevel: Boolean(budgetLevel),
      });

      const sessionMember = getSessionMember();
      if (sessionMember?._id) {
        setOnboardingCompletionCachedValue(sessionMember._id, true);
      }

      await successAlert(t("onboarding_complete_title"), t("onboarding_complete_body"));
      await router.push(appendRecommendationRefreshFlag(redirectTarget));
    } catch (error) {
      trackAnalyticsEvent("onboarding_submit_failed", {
        error: getErrorMessage(error),
      });
      const message = getErrorMessage(error);
      setErrorText(message);
      await errorAlert(t("onboarding_failed_title"), message);
    }
  };

  return (
    <main className="w-full space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t("onboarding_eyebrow")}</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{t("onboarding_title")}</h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          {t("onboarding_desc")}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {stepLabels.map((label, index) => (
              <span key={label} className={index === step ? "text-slate-900" : undefined}>
                {index + 1}. {label}
              </span>
            ))}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
            />
          </div>
        </div>

        {step === 0 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">{t("onboarding_travel_title")}</h2>
            <p className="text-sm text-slate-600">{t("onboarding_travel_desc", { count: MAX_TRAVEL_STYLES })}</p>
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
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">{t("onboarding_destinations_title")}</h2>
            <p className="text-sm text-slate-600">{t("onboarding_destinations_desc", { count: MAX_DESTINATIONS })}</p>
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
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">{t("onboarding_amenities_title")}</h2>
            <p className="text-sm text-slate-600">{t("onboarding_amenities_desc", { count: MAX_AMENITIES })}</p>
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
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">{t("onboarding_budget_title")}</h2>
            <p className="text-sm text-slate-600">{t("onboarding_budget_desc")}</p>
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
          </div>
        ) : null}

        {stepValidationMessage ? <ErrorNotice className="mt-5" tone="warn" message={stepValidationMessage} /> : null}
        {errorText ? <ErrorNotice className="mt-5" message={errorText} /> : null}

        <footer className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={!canGoBack}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("onboarding_back")}
          </button>

          <button
            type="button"
            onClick={() => {
              void handleNext();
            }}
            disabled={!canGoNext}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("onboarding_saving") : isLastStep ? t("onboarding_finish") : t("onboarding_next")}
          </button>
        </footer>
      </section>
    </main>
  );
};

OnboardingPage.auth = { roles: ["USER"] };

export default OnboardingPage;
