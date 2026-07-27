import Link from "next/link";
import { formatHotelLocationLabel } from "@/lib/hotels/hotels-ui";
import { useI18n } from "@/lib/i18n/provider";
import type { LastMinuteDealCard } from "@/types/homepage";
import styles from "@/styles/home-landing-ovastin.module.css";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const formatDealExpiryLabel = (
  validUntil: string,
  translate: (key: "home_deals_ends_soon" | "home_deals_ends_on", params?: Record<string, string | number>) => string,
): string => {
  const expiresAt = new Date(validUntil);
  if (Number.isNaN(expiresAt.getTime())) return translate("home_deals_ends_soon");
  return translate("home_deals_ends_on", {
    month: MONTH_LABELS[expiresAt.getUTCMonth()],
    day: expiresAt.getUTCDate(),
  });
};

interface LastMinuteDealsSectionProps {
  deals: LastMinuteDealCard[];
}

export function LastMinuteDealsSection({ deals }: LastMinuteDealsSectionProps) {
  const { t } = useI18n();
  if (deals.length === 0) return null;

  return (
    <section className={styles.dealsSection}>
      <div className={styles.dealsHeader}>
        <div>
          <p className={styles.dealsEyebrow}>{t("home_deals_eyebrow")}</p>
          <h2 className={styles.dealsTitle}>{t("home_deals_title")}</h2>
        </div>
        <Link href="/hotels" className={styles.dealsLink}>
          {t("home_browse_all_stays")} <span aria-hidden>↗</span>
        </Link>
      </div>

      <div className={styles.dealsRail} role="list">
        {deals.map((deal) => (
          <article key={`deal-room-${deal.roomId}`} className={styles.dealCard} role="listitem">
            <Link href={`/rooms/${deal.roomId}`} className={styles.dealCardLink}>
              {deal.imageUrl ? (
                <img
                  src={deal.imageUrl}
                  alt={`${deal.roomName} at ${deal.hotelTitle}`}
                  className={styles.dealCardImage}
                />
              ) : (
                <div className={styles.dealCardFallback} />
              )}
              <div className={styles.dealCardShade} />
              <div className={styles.dealBadge}>-{Math.round(deal.discountPercent)}%</div>
              <div className={styles.dealCardContent}>
                <p className={styles.dealHotelMeta}>
                  {formatHotelLocationLabel(deal.hotelLocation)} · {deal.hotelTitle}
                </p>
                <h3>{deal.roomName}</h3>
                <p className={styles.dealRoomMeta}>{deal.roomType} room</p>
                <div className={styles.dealPriceRow}>
                  <span className={styles.dealPrice}>₩ {deal.dealPrice.toLocaleString()}</span>
                  <span className={styles.dealOriginalPrice}>₩ {deal.basePrice.toLocaleString()}</span>
                </div>
                <p className={styles.dealExpiry}>{formatDealExpiryLabel(deal.validUntil, t)}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
