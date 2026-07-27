import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatHotelLocationLabel } from "@/lib/hotels/hotels-ui";
import { useI18n } from "@/lib/i18n/provider";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type { ReviewDto, ReviewRatingsSummaryDto } from "@/types/hotel";
import type { HeroSlide } from "@/types/homepage";
import styles from "@/styles/home-landing-ovastin.module.css";

const HERO_ROTATION_MS = 4000;
const REVIEW_LIMIT = 5;

// ─── Utilities ─────────────────────────────────────────────────────────────────

const formatRatingStars = (rating: number): string => {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
};

const formatReviewCountLabel = (
  count: number,
  translate: (
    key: "home_common_no_reviews" | "home_common_verified_reviews",
    params?: Record<string, string | number>,
  ) => string,
): string => {
  if (!Number.isFinite(count) || count <= 0) {
    return translate("home_common_no_reviews");
  }
  if (count >= 1000) {
    return translate("home_common_verified_reviews", {
      count: `${(count / 1000).toFixed(1)}k`,
    });
  }
  return translate("home_common_verified_reviews", {
    count: count.toLocaleString(),
  });
};

const toReviewerInitial = (review: ReviewDto, index: number): string => {
  const nickname = review.reviewerNick?.trim();
  if (nickname) return nickname.charAt(0).toUpperCase();
  return `${(index + 1) % 10}`;
};

// ─── Component ─────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  slides: HeroSlide[];
  featuredReviews: ReviewDto[];
  ratingsSummary: ReviewRatingsSummaryDto | null;
  totalVerifiedReviews: number;
}

export function HeroSection({
  slides,
  featuredReviews,
  ratingsSummary,
  totalVerifiedReviews,
}: HeroSectionProps) {
  const { t } = useI18n();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (): void => setPrefersReducedMotion(mq.matches);
    sync();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", sync);
      return () => mq.removeEventListener("change", sync);
    }
    mq.addListener(sync);
    return () => mq.removeListener(sync);
  }, []);

  useEffect(() => {
    setActiveSlide(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isSliderPaused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, HERO_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, isSliderPaused, prefersReducedMotion]);

  const activeSlideData = slides[activeSlide] ?? slides[0];
  const activeSlideHref = activeSlideData?._id.startsWith("fallback-")
    ? "/hotels"
    : `/hotels/${activeSlideData?._id ?? ""}`;

  const reviewCount = Math.max(
    0,
    Number.isFinite(totalVerifiedReviews) ? totalVerifiedReviews : 0,
  );
  const reviewRating = ratingsSummary?.overallRating ?? activeSlideData?.rating ?? 0;
  const reviewStars = formatRatingStars(reviewRating);

  return (
    <section className={styles.hero}>
      <div className={styles.heroLeft}>
        <div className={styles.subtitle}>
          <span>{t("home_hero_subtitle")}</span>
        </div>

        <h1 className={styles.title}>{t("home_hero_title")}</h1>

        <div className={styles.primaryRow}>
          <Link href="/hotels" className={styles.serviceButton}>
            <span>{t("home_hero_cta")}</span>
            <span className={styles.serviceButtonArrow}>↗</span>
          </Link>

          <div className={styles.reviewWrap}>
            <div className={styles.reviewLabel}>★ {t("home_common_guest_reviews")}</div>
            <div className={styles.reviewBottom}>
              <div className={styles.avatarStack}>
                {featuredReviews.length > 0
                  ? featuredReviews.slice(0, REVIEW_LIMIT).map((review, index) => {
                      const reviewerImageUrl = resolveMediaUrl(review.reviewerImage);
                      return (
                        <div key={`review-avatar-${review._id}`} className={styles.avatarItem}>
                          {reviewerImageUrl ? (
                            <Image
                              src={reviewerImageUrl}
                              alt={review.reviewerNick ?? t("home_common_guest_reviews")}
                              fill
                              sizes="22px"
                              className={styles.avatarImage}
                            />
                          ) : (
                            <span className={styles.avatarFallback}>
                              {toReviewerInitial(review, index)}
                            </span>
                          )}
                        </div>
                      );
                    })
                  : slides.slice(0, REVIEW_LIMIT).map((slide, index) => (
                      <div
                        key={`review-fallback-avatar-${slide._id}-${index}`}
                        className={styles.avatarItem}
                      >
                        {slide.imageUrl ? (
                          <Image
                            src={slide.imageUrl}
                            alt={slide.title}
                            fill
                            sizes="22px"
                            className={styles.avatarImage}
                          />
                        ) : (
                          <span className={styles.avatarFallback}>{index + 1}</span>
                        )}
                      </div>
                    ))}
              </div>
              <div className={styles.reviewMeta}>
                <div className={styles.stars}>{reviewStars}</div>
                <div>{formatReviewCountLabel(reviewCount, t)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <p className={styles.description}>
            {t("home_hero_description")}
          </p>
          <Link href={activeSlideHref} className={styles.watchBubble}>
            {activeSlideData?.imageUrl ? (
              <img
                src={activeSlideData.imageUrl}
                alt={activeSlideData.title}
                className={styles.watchImage}
              />
            ) : (
              <div className={styles.watchFallback} />
            )}
            <div className={styles.watchOverlay}>
              <span>{t("home_common_preview")}</span>
              <span>▶</span>
            </div>
          </Link>
        </div>
      </div>

      <div
        className={styles.heroRight}
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
      >
        <div className={styles.sliderViewport}>
          {slides.map((slide, index) => {
            const isActive = index === activeSlide;
            const slideHref = slide._id.startsWith("fallback-")
              ? "/hotels"
              : `/hotels/${slide._id}`;

            return (
              <Link
                key={`${slide._id}-${index}`}
                href={slideHref}
                className={`${styles.slide} ${isActive ? styles.slideActive : ""}`}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
              >
                {slide.imageUrl ? (
                  isActive ? (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      priority
                      fetchPriority="high"
                      loading="eager"
                      sizes="(max-width: 767px) calc(100vw - 1.5rem), (max-width: 991px) 720px, 900px"
                      className={styles.slideImage}
                    />
                  ) : (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className={styles.slideImage}
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className={styles.slideFallback} />
                )}
                <div className={styles.slideShade} />
                <div className={styles.slideMeta}>
                  <div className={styles.slideTags}>
                    <span>{formatHotelLocationLabel(slide.location)}</span>
                    <span>{slide.hotelType}</span>
                  </div>
                  <h3>{slide.title}</h3>
                  <p>
                    ⭐ {slide.rating.toFixed(1)} ·{" "}
                    {t("home_common_likes", {
                      count: slide.likes.toLocaleString(),
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className={styles.dots}>
          {slides.map((slide, index) => (
            <button
              key={`dot-${slide._id}-${index}`}
              type="button"
              className={`${styles.dot} ${index === activeSlide ? styles.dotActive : ""}`}
              onClick={() => setActiveSlide(index)}
              aria-label={t("home_hero_slide_aria", { index: index + 1 })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
