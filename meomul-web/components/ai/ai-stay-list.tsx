import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrencyKrw } from "@/lib/utils/format";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type { AiStayCard } from "./use-ai-chat";

const CITY_NAMES: Record<string, string> = {
  SEOUL: "Seoul",
  BUSAN: "Busan",
  INCHEON: "Incheon",
  DAEGU: "Daegu",
  GWANGJU: "Gwangju",
  DAEJON: "Daejeon",
  JEJU: "Jeju",
  GYEONGJU: "Gyeongju",
  GANGNEUNG: "Gangneung",
};

const placeOf = (stay: AiStayCard): string =>
  [stay.district, stay.location ? CITY_NAMES[stay.location] ?? stay.location : null].filter(Boolean).join(", ");

/** Claude's shortlist: one calm row per stay, the whole row opens the hotel. */
export function AiStayList({ stays }: { stays: AiStayCard[] }) {
  const { t } = useI18n();

  return (
    <ul className="meomul-ai-settle space-y-2.5" aria-label={t("ai_stays_label")}>
      {stays.map((stay) => {
        const image = stay.image ? resolveMediaUrl(stay.image) : "";
        const place = placeOf(stay);
        const price = stay.pricePerNight ? formatCurrencyKrw(stay.pricePerNight) : null;
        return (
          <li key={stay.hotelId}>
            <Link
              href={`/hotels/${stay.hotelId}`}
              className="group flex items-center gap-3.5 rounded-2xl border border-line bg-paper p-2 pr-4 transition-[border-color,box-shadow,transform] duration-200 hover:border-line-strong active:scale-[0.995] hover:shadow-md hover:shadow-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="relative block h-[5.25rem] w-[6.5rem] shrink-0 overflow-hidden rounded-xl bg-sunk sm:h-[5.75rem] sm:w-[8rem]">
                {image ? <Image src={image} alt="" fill sizes="128px" className="object-cover" /> : null}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-[15px] font-semibold leading-5 text-ink group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
                  {stay.title}
                </span>
                <span className="flex min-w-0 items-center gap-3 text-sm leading-5 text-quiet">
                  {place ? <span className="truncate">{place}</span> : null}
                  {stay.rating ? (
                    <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
                      <Star size={13} className="fill-star text-star" aria-hidden="true" />
                      {stay.rating.toFixed(1)}
                    </span>
                  ) : null}
                </span>
                {price ? (
                  <span className="text-sm leading-5 text-quiet sm:hidden">
                    <span className="font-semibold tabular-nums text-ink">{price}</span> {t("ai_match_per_night")}
                  </span>
                ) : null}
              </span>
              {price ? (
                <span className="hidden shrink-0 flex-col items-end sm:flex">
                  <span className="text-[17px] font-semibold tabular-nums leading-6 text-ink">{price}</span>
                  <span className="text-xs leading-4 text-quiet">{t("ai_match_per_night")}</span>
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Placeholder rows in the shortlist's shape while Meomul AI is searching. */
export function AiStayListSkeleton() {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {[0, 1].map((row) => (
        <div key={row} className="flex items-center gap-3.5 rounded-2xl border border-line bg-paper p-2 pr-4">
          <div className="h-[5.25rem] w-[6.5rem] shrink-0 rounded-xl bg-sunk motion-safe:animate-pulse sm:h-[5.75rem] sm:w-[8rem]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/2 rounded-full bg-sunk motion-safe:animate-pulse" />
            <div className="h-3 w-1/3 rounded-full bg-sunk motion-safe:animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
