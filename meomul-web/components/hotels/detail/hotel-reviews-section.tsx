import { memo, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  MapPinned,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { ErrorNotice } from "@/components/ui/error-notice";
import { useI18n } from "@/lib/i18n/provider";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type { ReviewDto, ReviewRatingsSummaryDto } from "@/types/hotel";

interface HotelReviewsSectionProps {
  reviews: ReviewDto[];
  reviewsLoading: boolean;
  reviewsErrorMessage: string | null;
  reviewActionErrorMessage: string | null;
  reviewPage: number;
  reviewTotalPages: number;
  reviewTotal: number;
  ratingsSummary: ReviewRatingsSummaryDto | null;
  onPrevPage: () => void;
  onNextPage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  canMarkHelpful: boolean;
  markingHelpfulReviewId: string | null;
  helpfulCountOverrides: Record<string, number>;
  onMarkHelpful: (reviewId: string) => void;
}

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getReviewerDisplayName = (review: ReviewDto): string => {
  const nick = review.reviewerNick?.trim();
  return nick || review.reviewerId.slice(-4);
};

const reviewMetrics = (
  t: ReturnType<typeof useI18n>["t"],
  summary: ReviewRatingsSummaryDto,
) => [
  {
    label: t("review_label_cleanliness"),
    rating: summary.cleanlinessRating,
    icon: Sparkles,
  },
  {
    label: t("review_label_service"),
    rating: summary.serviceRating,
    icon: BadgeCheck,
  },
  {
    label: t("review_label_location"),
    rating: summary.locationRating,
    icon: MapPinned,
  },
  {
    label: t("review_label_amenities"),
    rating: summary.amenitiesRating,
    icon: ShieldCheck,
  },
  {
    label: t("review_label_value"),
    rating: summary.valueRating,
    icon: Wallet,
  },
  {
    label: t("review_label_overall"),
    rating: summary.overallRating,
    icon: MessageCircleMore,
  },
];

export const HotelReviewsSection = memo(function HotelReviewsSection({
  reviews,
  reviewsLoading,
  reviewsErrorMessage,
  reviewActionErrorMessage,
  reviewPage,
  reviewTotalPages,
  ratingsSummary,
  onPrevPage,
  onNextPage,
  canGoPrev,
  canGoNext,
  canMarkHelpful,
  markingHelpfulReviewId,
  helpfulCountOverrides,
  onMarkHelpful,
}: HotelReviewsSectionProps) {
  const { t } = useI18n();
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  if (reviewsLoading && reviews.length === 0) {
    return (
      <section id="reviews" className="space-y-4 pt-2 sm:pt-4">
        <div className="text-lg text-stone-600">{t("hotel_reviews_loading")}</div>
      </section>
    );
  }

  if (!reviewsLoading && reviews.length === 0) {
    return (
      <section id="reviews" className="space-y-4 pt-2 sm:pt-4">
        <div className="text-lg text-stone-600">{t("hotel_reviews_empty")}</div>
      </section>
    );
  }

  return (
    <section id="reviews" className="space-y-8 pt-2 sm:space-y-10 sm:pt-4">
      <div className="space-y-6">
        <h2 className="flex items-center gap-2 text-[1.8rem] font-semibold tracking-tight text-stone-950 sm:text-[2.2rem]">
          <Star className="h-6 w-6 shrink-0 fill-current sm:h-7 sm:w-7" />
          {(ratingsSummary?.overallRating ?? 0).toFixed(2)} · {ratingsSummary?.totalReviews ?? reviews.length} reviews
        </h2>

        {reviewsErrorMessage ? <ErrorNotice message={reviewsErrorMessage} /> : null}
        {reviewActionErrorMessage ? <ErrorNotice message={reviewActionErrorMessage} /> : null}

        {ratingsSummary ? (
          <div className="grid grid-cols-3 gap-0 border-t border-b border-stone-200 py-5 sm:py-8 lg:grid-cols-6">
            {reviewMetrics(t, ratingsSummary).map((metric) => {
              const Icon = metric.icon;
              return (
                <article
                  key={metric.label}
                  className="space-y-2 py-3 lg:border-r lg:border-stone-200 lg:px-6 lg:last:border-r-0"
                >
                  <div className="space-y-1">
                    <p className="text-base font-semibold tracking-tight text-stone-950 sm:text-[1.35rem]">
                      {metric.label}
                    </p>
                    <p className="text-[1.55rem] font-semibold text-stone-950 sm:text-[1.9rem]">{metric.rating.toFixed(1)}</p>
                  </div>
                  <Icon className="h-7 w-7 text-stone-950 sm:h-8 sm:w-8" />
                </article>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-2">
        {reviews.map((review) => {
          const reviewerName = getReviewerDisplayName(review);
          const reviewerImage = resolveMediaUrl(review.reviewerImage);
          const helpfulCount = helpfulCountOverrides[review._id] ?? review.helpfulCount;
          const isMarkingHelpful = markingHelpfulReviewId === review._id;
          const isExpanded = expandedReviews[review._id] ?? false;
          const updatedLabel =
            review.updatedAt && review.updatedAt !== review.createdAt
              ? formatDateTime(review.updatedAt)
              : "";

          return (
            <article key={review._id} className="space-y-5">
              <div className="flex items-center gap-4">
                {reviewerImage ? (
                  <Image
                    src={reviewerImage}
                    alt={reviewerName}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-lg font-semibold text-stone-950">
                    {reviewerName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-[1.2rem] font-semibold tracking-tight text-stone-950 sm:text-[1.45rem]">
                    {reviewerName}
                  </p>
                  <p className="text-base text-stone-600 sm:text-lg">{t("hotel_reviews_verified_stay")}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-stone-700 sm:text-lg">
                <span className="inline-flex items-center gap-1 text-stone-950">
                  <Star className="h-4 w-4 fill-current" />
                  {review.overallRating.toFixed(1)}
                </span>
                <span>·</span>
                <span>{formatDate(review.createdAt)}</span>
                {typeof review.reviewViews === "number" ? (
                  <>
                    <span>·</span>
                    <span>{review.reviewViews} views</span>
                  </>
                ) : null}
                {updatedLabel ? (
                  <>
                    <span>·</span>
                    <span>Edited {updatedLabel}</span>
                  </>
                ) : null}
              </div>

              <p className={`${isExpanded ? "" : "line-clamp-4"} text-base leading-7 text-stone-800 sm:text-[1.06rem] sm:leading-8`}>
                {review.reviewText}
              </p>

              {review.hotelResponse ? (
                <div className="rounded-2xl bg-stone-50 px-5 py-4">
                  <p className="text-base font-semibold text-stone-950">{t("hotel_reviews_response")}</p>
                  <p className="mt-2 text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">{review.hotelResponse.responseText}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedReviews((prev) => ({
                      ...prev,
                      [review._id]: !isExpanded,
                    }))
                  }
                  className="text-sm font-semibold underline underline-offset-2 sm:text-[1.02rem]"
                >
                  {isExpanded ? t("hotel_airbnb_show_less") : t("hotel_airbnb_show_more")}
                </button>
                <button
                  type="button"
                  onClick={canMarkHelpful ? () => onMarkHelpful(review._id) : undefined}
                  disabled={!canMarkHelpful || isMarkingHelpful}
                  className="text-sm font-semibold underline underline-offset-2 disabled:opacity-50 sm:text-[1.02rem]"
                >
                  {isMarkingHelpful ? t("hotel_reviews_updating") : t("hotel_reviews_mark_helpful")}
                </button>
                <span className="text-sm text-stone-600 sm:text-[1.02rem]">{helpfulCount}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
        <p className="text-sm text-stone-600 sm:text-lg">
          {t("hotel_reviews_pagination", {
            page: reviewPage,
            totalPages: reviewTotalPages,
            total: ratingsSummary?.totalReviews ?? reviews.length,
          })}
        </p>
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={!canGoPrev}
            className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-950 disabled:opacity-50 sm:flex-none sm:px-5 sm:text-base"
          >
            {t("hotel_reviews_previous")}
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canGoNext}
            className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-950 disabled:opacity-50 sm:flex-none sm:px-5 sm:text-base"
          >
            {t("hotel_reviews_next")}
          </button>
        </div>
      </div>
    </section>
  );
});
