import Link from "next/link";
import { formatHotelLocationLabel } from "@/lib/hotels/hotels-ui";
import { useI18n } from "@/lib/i18n/provider";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type { HotelListItem } from "@/types/hotel";
import styles from "@/styles/home-landing-ovastin.module.css";

interface TrendingSectionProps {
  hotels: HotelListItem[];
}

export function TrendingSection({ hotels }: TrendingSectionProps) {
  const { t } = useI18n();
  if (hotels.length === 0) return null;

  return (
    <section className={styles.trendingSection}>
      <div className={styles.trendingHeader}>
        <div>
          <p className={styles.trendingEyebrow}>{t("home_trending_eyebrow")}</p>
          <h2 className={styles.trendingTitle}>{t("home_trending_title")}</h2>
        </div>
        <Link href="/hotels" className={styles.trendingLink}>
          {t("home_browse_all_stays")} <span aria-hidden>↗</span>
        </Link>
      </div>

      <div className={styles.trendingRail} role="list">
        {hotels.map((hotel) => (
          <article key={`trending-hotel-${hotel._id}`} className={styles.trendingCard} role="listitem">
            <Link href={`/hotels/${hotel._id}`} className={styles.trendingCardLink}>
              {hotel.hotelImages[0] ? (
                <img
                  src={resolveMediaUrl(hotel.hotelImages[0])}
                  alt={hotel.hotelTitle}
                  className={styles.trendingCardImage}
                />
              ) : (
                <div className={styles.trendingCardFallback} />
              )}
              <div className={styles.trendingCardShade} />
              <div className={styles.trendingCardContent}>
                <h3>{hotel.hotelTitle}</h3>
                <p className={styles.trendingMeta}>
                  {formatHotelLocationLabel(hotel.hotelLocation)} · {hotel.hotelType}
                </p>
                <div className={styles.trendingStats}>
                  <span>★ {hotel.hotelRating.toFixed(1)}</span>
                  <span>
                    {t("home_common_likes", {
                      count: hotel.hotelLikes.toLocaleString(),
                    })}
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
