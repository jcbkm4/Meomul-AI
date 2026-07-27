import { memo, useMemo, useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { DetailIcon, type DetailIconName } from "@/components/rooms/detail/detail-icon";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/utils/format";
import type { RoomDetailItem } from "@/types/hotel";

export interface RoomFactCard {
  label: string;
  value: string;
  icon: "status" | "capacity" | "bed" | "view" | "size" | "inventory" | "surcharge" | "eyes" | "clock";
}

export interface RoomAmenityCard {
  amenity: string;
  label: string;
  icon: DetailIconName;
  styles: {
    card: string;
    icon: string;
    badge: string;
  };
}

interface RoomOverviewSectionProps {
  roomTypeLine: string;
  hotelTitle?: string;
  hotelCheckInTime?: string;
  hotelCheckOutTime?: string;
  hotelCancellationPolicy?: string;
  deal?: RoomDetailItem["lastMinuteDeal"];
  roomDesc: string;
  factCards: RoomFactCard[];
  isSafeStayCertified?: boolean;
}

export const RoomOverviewSection = memo(function RoomOverviewSection({
  roomTypeLine,
  hotelTitle,
  hotelCheckInTime,
  hotelCheckOutTime,
  hotelCancellationPolicy,
  deal,
  roomDesc,
  factCards,
  isSafeStayCertified,
}: RoomOverviewSectionProps) {
  const { t } = useI18n();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const primaryFacts = useMemo(() => factCards.slice(0, 4), [factCards]);
  const secondaryFacts = useMemo(() => factCards.slice(4), [factCards]);

  return (
    <div className="order-2 space-y-7 lg:order-1 lg:pr-2">
      <section className="space-y-7 sm:space-y-8">
        <div className="border-b border-stone-200 pb-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              {hotelTitle ? <p className="text-base font-medium text-stone-600">{hotelTitle}</p> : null}
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-stone-950 sm:text-[2.2rem]">
                {roomTypeLine}
              </h2>
            </div>
            {deal?.isActive ? (
              <div className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-4 text-right shadow-sm sm:w-auto sm:min-w-[14rem]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">{t("room_detail_last_minute_deal")}</p>
                <p className="mt-1 text-3xl font-semibold text-stone-950">₩ {formatNumber(deal.dealPrice)}</p>
                <p className="text-xs text-stone-500 line-through">₩ {formatNumber(deal.originalPrice)}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-950">
              <BadgeCheck className="h-4 w-4" />
              <span>{t("hotel_detail_badge_verified")}</span>
            </div>
            {isSafeStayCertified ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-950">
                <ShieldCheck className="h-4 w-4" />
                <span>{t("hotel_detail_safe_stay")}</span>
              </div>
            ) : null}
          </div>
        </div>

        {primaryFacts.length > 0 ? (
          <div className={`border-b border-stone-200 pb-7 ${primaryFacts.length > 2 ? "grid gap-6 sm:grid-cols-2" : "space-y-6"}`}>
            {primaryFacts.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <DetailIcon name={item.icon} className="mt-1 h-5 w-5 shrink-0 text-stone-950 sm:h-6 sm:w-6" />
                <div>
                  <p className="text-lg font-semibold tracking-tight text-stone-950 sm:text-[1.15rem]">{item.label}</p>
                  <p className="mt-1 text-sm leading-7 text-stone-600 sm:text-[1.02rem] sm:leading-8">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-4">
          <p className={`text-base leading-7 text-stone-800 sm:text-[1.05rem] sm:leading-8 ${showFullDescription ? "" : "line-clamp-5"}`}>
            {roomDesc || t("room_detail_overview_desc_fallback")}
          </p>
          <button
            type="button"
            onClick={() => setShowFullDescription((previous) => !previous)}
            className="text-sm font-semibold underline underline-offset-2 sm:text-[1.02rem]"
          >
            {showFullDescription ? t("hotel_airbnb_show_less") : t("hotel_airbnb_show_more")}
          </button>
        </div>

        {(hotelCheckInTime || hotelCheckOutTime || hotelCancellationPolicy) && (
          <div className="grid gap-6 border-t border-b border-stone-200 py-6 sm:grid-cols-3">
            <article>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{t("room_detail_checkin")}</p>
              <p className="mt-1 text-base font-semibold text-stone-950">{hotelCheckInTime || "-"}</p>
            </article>
            <article>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{t("room_detail_checkout")}</p>
              <p className="mt-1 text-base font-semibold text-stone-950">{hotelCheckOutTime || "-"}</p>
            </article>
            <article>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{t("room_detail_cancellation")}</p>
              <p className="mt-1 text-base font-semibold text-stone-950">{hotelCancellationPolicy || "-"}</p>
            </article>
          </div>
        )}

        {secondaryFacts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {secondaryFacts.map((item) => (
              <article key={item.label} className="flex items-start gap-4">
                <DetailIcon name={item.icon} className="mt-1 h-5 w-5 shrink-0 text-stone-950 sm:h-6 sm:w-6" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{item.label}</p>
                  <p className="mt-1 text-base font-semibold text-stone-950">{item.value}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
});
