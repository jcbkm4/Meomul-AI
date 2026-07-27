import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatHotelLocationLabel } from "@/lib/hotels/hotels-ui";
import { useI18n } from "@/lib/i18n/provider";
import {
  clearRecentlyViewedHotels,
  readRecentlyViewedHotels,
  type RecentlyViewedHotelEntry,
} from "@/lib/hotels/recently-viewed";
import styles from "@/styles/home-landing-ovastin.module.css";

const MAX_CARDS = 6;

export function RecentlyViewedSection() {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [hotels, setHotels] = useState<RecentlyViewedHotelEntry[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setHotels(readRecentlyViewedHotels());
  }, []);

  const handleClear = useCallback(() => {
    clearRecentlyViewedHotels();
    setHotels([]);
  }, []);

  const cards = hotels.slice(0, MAX_CARDS);

  if (!isMounted || cards.length === 0) return null;

  return (
    <section className={styles.trendingSection}>
      <div className={styles.trendingHeader}>
        <div>
          <p className={styles.trendingEyebrow}>{t("home_recent_eyebrow")}</p>
          <h2 className={styles.trendingTitle}>{t("home_recent_title")}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={styles.trendingLink} onClick={handleClear}>
            {t("home_recent_clear")}
          </button>
          <Link href="/hotels" className={styles.trendingLink}>
            {t("home_browse_all_stays")} <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>

      <div className={styles.trendingRail} role="list">
        {cards.map((hotel) => (
          <article key={`recent-hotel-${hotel.hotelId}`} className={styles.trendingCard} role="listitem">
            <Link href={`/hotels/${hotel.hotelId}`} className={styles.trendingCardLink}>
              {hotel.imageUrl ? (
                <img
                  src={hotel.imageUrl}
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
