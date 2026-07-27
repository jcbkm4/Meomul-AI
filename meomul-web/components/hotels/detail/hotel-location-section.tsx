import { memo, type RefObject } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { HotelDetailItem } from "@/types/hotel";

interface HotelLocationSectionProps {
  hotel: HotelDetailItem;
  mapSectionRef: RefObject<HTMLElement | null>;
  shouldLoadMap: boolean;
  mapEmbedUrl: string;
  mapUrl: string;
}

export const HotelLocationSection = memo(function HotelLocationSection({
  hotel,
  mapSectionRef,
  shouldLoadMap,
  mapEmbedUrl,
  mapUrl,
}: HotelLocationSectionProps) {
  const { t } = useI18n();
  return (
    <section id="location" ref={mapSectionRef} className="space-y-4 sm:space-y-5">
      <header className="space-y-2 font-[family-name:var(--font-airbnb)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {t("hotel_location_eyebrow")}
        </p>
        <h2 className="text-[1.75rem] font-semibold text-slate-900 sm:text-3xl">
          {t("hotel_location_title")}
        </h2>
        <p className="text-sm text-slate-600">
          {t("hotel_location_desc")}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover-lift font-[family-name:var(--font-airbnb)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {t("hotel_features_address")}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {hotel.detailedLocation?.address || "-"}
          </p>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                {t("hotel_location_district")}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {hotel.detailedLocation?.district || "-"}
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                {t("hotel_location_subway")}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {hotel.detailedLocation?.nearestSubway || "-"}
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                {t("hotel_location_walk")}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {hotel.detailedLocation?.walkingDistance != null
                  ? t("hotel_location_walk_minutes", { count: hotel.detailedLocation.walkingDistance })
                  : "-"}
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                {t("hotel_location_city")}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {hotel.detailedLocation?.city || "-"}
              </p>
            </article>
          </div>

          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            {t("hotel_location_open_maps")}
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 hover-lift font-[family-name:var(--font-airbnb)]">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {shouldLoadMap ? (
              <iframe
                title={`${hotel.hotelTitle} map`}
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full sm:h-80 lg:h-[22.5rem]"
                allowFullScreen
              />
            ) : (
              <div className="flex h-64 items-center justify-center bg-slate-100 text-sm text-slate-600 sm:h-80 lg:h-[22.5rem]">
                {t("hotel_location_loading_map")}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});
