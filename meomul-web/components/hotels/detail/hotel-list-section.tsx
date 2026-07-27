import { memo } from "react";
import { HotelCard } from "@/components/hotels/hotel-card";
import { RecommendationReasonPanel } from "@/components/hotels/recommendation-reason-panel";
import type { HotelCardTrackingContext } from "@/components/hotels/hotel-card";
import { ErrorNotice } from "@/components/ui/error-notice";
import { useI18n } from "@/lib/i18n/provider";
import type { HotelListItem, RecommendationExplanationDto } from "@/types/hotel";

interface HotelListSectionProps {
  title: string;
  description: string;
  hotels: HotelListItem[];
  loading: boolean;
  loadingText: string;
  errorMessage: string | null;
  layout?: "grid" | "horizontal";
  trackingContext?: HotelCardTrackingContext;
  recommendationExplanations?: Map<string, RecommendationExplanationDto>;
}

export const HotelListSection = memo(function HotelListSection({
  title,
  description,
  hotels,
  loading,
  loadingText,
  errorMessage,
  layout = "grid",
  trackingContext,
  recommendationExplanations,
}: HotelListSectionProps) {
  const { t } = useI18n();
  const isHorizontal = layout === "horizontal";

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 hover-lift font-[family-name:var(--font-airbnb)]">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t("hotel_list_eyebrow")}</p>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </header>

      {errorMessage ? <ErrorNotice message={errorMessage} /> : null}
      {loading && hotels.length === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">{loadingText}</section>
      ) : null}
      {hotels.length > 0 ? (
        isHorizontal ? (
          <div className="flex gap-4 overflow-x-auto pb-1 pr-1 snap-x snap-mandatory">
            {hotels.map((entry, index) => (
              <div key={entry._id} className="min-w-[16rem] flex-[0_0_16rem] snap-start space-y-3 sm:min-w-[18rem] sm:flex-[0_0_18rem]">
                <HotelCard
                  hotel={entry}
                  trackingContext={trackingContext}
                  imagePriority={index === 0}
                  imageSizes="(max-width: 639px) 16rem, 18rem"
                />
                <RecommendationReasonPanel explanation={recommendationExplanations?.get(entry._id)} compact />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((entry, index) => (
              <div key={entry._id} className="space-y-3">
                <HotelCard
                  hotel={entry}
                  trackingContext={trackingContext}
                  imagePriority={index === 0}
                  imageSizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 22rem"
                />
                <RecommendationReasonPanel explanation={recommendationExplanations?.get(entry._id)} />
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
});
