import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type { ReviewDto } from "@/types/hotel";
import type { TestimonialReviewEntry } from "@/types/homepage";
import styles from "@/styles/home-landing-ovastin.module.css";

// ─── Utilities ─────────────────────────────────────────────────────────────────

const toReviewerInitial = (review: ReviewDto, index: number): string => {
  const nickname = review.reviewerNick?.trim();
  if (nickname) return nickname.charAt(0).toUpperCase();
  return `${(index + 1) % 10}`;
};

const toReviewerDisplayName = (review: ReviewDto, index: number): string => {
  const nickname = review.reviewerNick?.trim();
  if (nickname) return nickname;
  const suffix = review.reviewerId?.slice(-4) ?? `${index + 1}`;
  return `guest${suffix}`;
};

const toTestimonialQuote = (review: ReviewDto, fallbackText: string): string => {
  const source =
    review.reviewText?.trim() || review.reviewTitle?.trim() || fallbackText;
  if (source.length <= 160) return source;
  return `${source.slice(0, 157).trimEnd()}...`;
};

const toStayPeriodLabel = (
  review: ReviewDto,
  translate: (key: "home_testimonial_verified_stay" | "home_testimonial_stayed_on", params?: Record<string, string | number>) => string,
): string => {
  const date = review.stayDate?.slice(0, 10);
  if (!date) return translate("home_testimonial_verified_stay");
  return translate("home_testimonial_stayed_on", { date });
};

// ─── Component ─────────────────────────────────────────────────────────────────

interface TestimonialsSectionProps {
  testimonials: TestimonialReviewEntry[];
  totalVerifiedReviews: number;
}

export function TestimonialsSection({ testimonials, totalVerifiedReviews }: TestimonialsSectionProps) {
  const { locale, t } = useI18n();
  const [activeCard, setActiveCard] = useState(0);
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
    if (testimonials.length === 0) {
      setActiveCard(0);
      return;
    }
    if (activeCard >= testimonials.length) {
      setActiveCard(Math.max(0, testimonials.length - 1));
    }
  }, [activeCard, testimonials.length]);

  const autoScrollEnabled = testimonials.length > 1 && !prefersReducedMotion;
  const loopedReviews = useMemo(() => {
    if (!autoScrollEnabled) return testimonials;
    return [...testimonials, ...testimonials];
  }, [autoScrollEnabled, testimonials]);

  const trustMetric = useMemo(() => {
    if (!Number.isFinite(totalVerifiedReviews) || totalVerifiedReviews <= 0) {
      return t("home_common_no_reviews");
    }

    if (totalVerifiedReviews >= 1000) {
      return t("home_common_verified_reviews", {
        count: `${(totalVerifiedReviews / 1000).toLocaleString(locale, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}k`,
      });
    }

    return t("home_common_verified_reviews", {
      count: totalVerifiedReviews.toLocaleString(locale),
    });
  }, [locale, t, totalVerifiedReviews]);

  if (testimonials.length === 0) return null;

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.testimonialsHeader}>
        <div className={styles.testimonialsTopRow}>
          <p className={styles.testimonialsEyebrow}>{t("home_testimonials_eyebrow")}</p>
          <p className={styles.testimonialsEyebrow}>{trustMetric}</p>
        </div>
        <h2 className={styles.testimonialsTitle}>{t("home_testimonials_title")}</h2>
        <p className={styles.testimonialsDescription}>
          {t("home_testimonials_desc")}
        </p>
      </div>

      <div className={styles.testimonialsViewport}>
        <div
          className={`${styles.testimonialsTrack} ${!autoScrollEnabled ? styles.testimonialsTrackStatic : ""}`}
          role="list"
        >
          {loopedReviews.map((entry, index) => {
            const review = entry.review;
            const normalizedIndex =
              testimonials.length > 0 ? index % testimonials.length : index;
            const isActive = normalizedIndex === activeCard;
            const isAccentCard = !isActive && (index + 1) % 4 === 0;
            const filledStars = Math.max(0, Math.min(5, Math.round(review.overallRating || 0)));
            const reviewerImageUrl = resolveMediaUrl(review.reviewerImage);
            const reviewerName = toReviewerDisplayName(review, index);
            const hotelTitle = entry.hotelTitle || "Meomul stay";

            return (
              <article
                key={`testimonial-${review._id}-${entry.hotelId}-${index}`}
                className={`${styles.testimonialCard} ${isActive ? styles.testimonialCardActive : ""} ${isAccentCard ? styles.testimonialCardAccent : ""}`}
                role="listitem"
                onMouseEnter={() => setActiveCard(normalizedIndex)}
                onClick={() => setActiveCard(normalizedIndex)}
                onFocus={() => setActiveCard(normalizedIndex)}
              >
                <header className={styles.testimonialCardHeader}>
                  <div className={styles.testimonialAvatar}>
                    {reviewerImageUrl ? (
                      <Image
                        src={reviewerImageUrl}
                        alt={reviewerName}
                        fill
                        sizes="56px"
                        className={styles.testimonialAvatarImage}
                      />
                    ) : (
                      <span className={styles.testimonialAvatarFallback}>
                        {toReviewerInitial(review, index)}
                      </span>
                    )}
                  </div>
                  <div className={styles.testimonialReviewer}>
                    <h3>{reviewerName}</h3>
                    <p>
                      {toStayPeriodLabel(review, t)} · {hotelTitle}
                    </p>
                  </div>
                </header>

                <div className={styles.testimonialDivider} />

                <div
                  className={styles.testimonialStars}
                  aria-label={`Rated ${filledStars} out of 5`}
                >
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <span
                      key={`review-star-${review._id}-${starIndex}`}
                      className={
                        starIndex < filledStars
                          ? styles.testimonialStarFilled
                          : styles.testimonialStarEmpty
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p className={styles.testimonialQuote}>
                  &ldquo;{toTestimonialQuote(review, t("home_testimonial_default_quote"))}&rdquo;
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
