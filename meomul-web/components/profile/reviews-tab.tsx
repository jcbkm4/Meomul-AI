import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  DELETE_REVIEW_MUTATION,
  GET_MY_REVIEWS_QUERY,
  UPDATE_REVIEW_MUTATION,
} from "@/graphql/review.gql";
import { GET_HOTEL_CARDS_QUERY } from "@/graphql/hotel.gql";
import { getSessionMember } from "@/lib/auth/session";
import { useI18n } from "@/lib/i18n/provider";
import {
  formatProfileDate,
  getProfileCopy,
} from "@/lib/profile/profile-i18n";
import { lockBodyScroll } from "@/lib/ui/body-scroll-lock";
import { confirmDanger, errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import { ExternalLink, Pencil, Star, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HotelResponse {
  responseText: string;
  respondedBy: string;
  respondedAt: string;
}

interface ReviewDto {
  _id: string;
  hotelId: string;
  bookingId: string;
  overallRating: number;
  cleanlinessRating: number;
  locationRating: number;
  valueRating: number;
  serviceRating: number;
  amenitiesRating: number;
  reviewTitle?: string | null;
  reviewText: string;
  helpfulCount: number;
  hotelResponse?: HotelResponse | null;
  reviewStatus: string;
  createdAt: string;
}

interface GetMyReviewsData {
  getMyReviews: {
    list: ReviewDto[];
    metaCounter: { total: number };
  };
}

interface GetHotelCardData {
  getHotelsByIds: {
    _id: string;
    hotelTitle: string;
    hotelLocation: string;
    hotelType: string;
    hotelImages: string[];
  }[];
}

// ─── HotelMiniHeader ──────────────────────────────────────────────────────────

function HotelMiniHeader({
  hotel,
}: {
  hotel: GetHotelCardData["getHotelsByIds"][number];
}) {
  const coverImage = resolveMediaUrl(hotel.hotelImages[0]);

  return (
    <Link
      href={`/hotels/${hotel._id}`}
      className="group flex items-center gap-2.5 rounded-xl transition hover:bg-slate-50 -mx-1 px-1 py-0.5"
    >
      <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {coverImage && (
          <Image
            src={coverImage}
            alt={hotel.hotelTitle}
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 transition group-hover:text-slate-600">
          {hotel.hotelTitle}
        </p>
        <p className="text-xs text-slate-400">
          {hotel.hotelLocation.charAt(0) +
            hotel.hotelLocation.slice(1).toLowerCase()}{" "}
          · {hotel.hotelType}
        </p>
      </div>
      <ExternalLink
        size={13}
        className="flex-shrink-0 text-slate-300 transition group-hover:text-slate-400"
      />
    </Link>
  );
}

// ─── StarDisplay ──────────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-slate-200"
          }
        />
      ))}
    </div>
  );
}

// ─── StarPicker ───────────────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { locale } = useI18n();
  const copy = getProfileCopy(locale);
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} ${copy.overallRating}`}
        >
          <Star
            size={26}
            className={
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-100 text-slate-200"
            }
          />
        </button>
      ))}
    </div>
  );
}

// ─── EditReviewModal ──────────────────────────────────────────────────────────

function EditReviewModal({
  review,
  onClose,
  onSaved,
}: {
  review: ReviewDto;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { locale } = useI18n();
  const copy = getProfileCopy(locale);
  const [overallRating, setOverallRating] = useState(review.overallRating);
  const [title, setTitle] = useState(review.reviewTitle ?? "");
  const [text, setText] = useState(review.reviewText);

  const [updateReview, { loading }] = useMutation(UPDATE_REVIEW_MUTATION);

  // Lock body scroll while the modal is open
  useEffect(() => {
    const releaseScrollLock = lockBodyScroll();
    return releaseScrollLock;
  }, []);

  const handleSave = async () => {
    if (!text.trim() || text.trim().length < 10) {
      await errorAlert(copy.editReview, copy.reviewTooShort, {
        variant: "review",
      });
      return;
    }
    try {
      await updateReview({
        variables: {
          input: {
            _id: review._id,
            overallRating,
            reviewTitle: title.trim() || undefined,
            reviewText: text.trim(),
          },
        },
      });
      await successAlert(copy.reviewUpdated, undefined, {
        variant: "review",
      });
      onSaved();
    } catch (err) {
      await errorAlert(copy.editReview, getErrorMessage(err), {
        variant: "review",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={copy.close}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
        <h3 className="text-base font-bold text-slate-900">{copy.editReview}</h3>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {copy.overallRating}
            </label>
            <StarPicker value={overallRating} onChange={setOverallRating} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {copy.title}{" "}
              <span className="font-normal normal-case text-slate-400">
                ({copy.optional})
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder={copy.summarizeStay}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {copy.review}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
            />
            <span className="mt-0.5 block text-right text-xs text-slate-400">
              {text.length}/2000
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={loading || !text.trim()}
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? copy.saving : copy.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ReviewsTab ───────────────────────────────────────────────────────────────

const LIMIT = 10;

const DIMS = [
  { key: "cleanlinessRating", labelKey: "cleanliness" },
  { key: "locationRating", labelKey: "location" },
  { key: "valueRating", labelKey: "value" },
  { key: "serviceRating", labelKey: "service" },
  { key: "amenitiesRating", labelKey: "amenities" },
] as const;

export function ReviewsTab() {
  const { locale } = useI18n();
  const copy = getProfileCopy(locale);
  const member = useMemo(() => getSessionMember(), []);
  const [editing, setEditing] = useState<ReviewDto | null>(null);
  const [extraReviews, setExtraReviews] = useState<ReviewDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, loading, error, refetch, fetchMore } =
    useQuery<GetMyReviewsData>(GET_MY_REVIEWS_QUERY, {
      skip: !member,
      variables: {
        input: { page: 1, limit: LIMIT, sort: "createdAt", direction: -1 },
      },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    });

  const [deleteReviewMutation] = useMutation(DELETE_REVIEW_MUTATION);
  const firstPageReviews = useMemo(
    () => data?.getMyReviews.list ?? [],
    [data?.getMyReviews.list],
  );
  const reviews = useMemo(
    () => [...firstPageReviews, ...extraReviews],
    [extraReviews, firstPageReviews],
  );
  const total = data?.getMyReviews.metaCounter.total ?? 0;
  const hasMore = reviews.length < total;
  const reviewHotelIds = useMemo(
    () => Array.from(new Set(reviews.map((review) => review.hotelId))),
    [reviews],
  );
  const { data: hotelsData, loading: hotelsLoading } = useQuery<GetHotelCardData>(
    GET_HOTEL_CARDS_QUERY,
    {
      skip: reviewHotelIds.length === 0,
      variables: { hotelIds: reviewHotelIds },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );
  const hotelMap = useMemo(
    () =>
      new Map((hotelsData?.getHotelsByIds ?? []).map((hotel) => [hotel._id, hotel])),
    [hotelsData],
  );

  const resetPagination = () => {
    setExtraReviews([]);
    setCurrentPage(1);
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const { data: moreData } = await fetchMore({
        variables: {
          input: {
            page: nextPage,
            limit: LIMIT,
            sort: "createdAt",
            direction: -1,
          },
        },
      });
      const newItems = moreData?.getMyReviews.list ?? [];
      setExtraReviews((prev) => [...prev, ...newItems]);
      setCurrentPage(nextPage);
    } catch {
      // Network errors are surfaced by the query's error state
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    const confirmed = await confirmDanger({
      title: copy.deleteReviewTitle,
      text: copy.deleteReviewText,
      confirmText: copy.deleteReviewConfirm,
    });
    if (!confirmed) return;
    setDeletingId(reviewId);
    try {
      await deleteReviewMutation({ variables: { reviewId } });
      await successAlert(copy.reviewDeleted, undefined, {
        variant: "trash",
      });
      resetPagination();
      void refetch();
    } catch (err) {
      await errorAlert(copy.deleteReviewTitle, getErrorMessage(err), {
        variant: "trash",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {editing && (
        <EditReviewModal
          review={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            resetPagination();
            void refetch();
          }}
        />
      )}

      <div className="space-y-4">
        {error && <ErrorNotice message={getErrorMessage(error)} />}

        {/* Loading skeleton */}
        {(loading || hotelsLoading) && reviews.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 bg-white p-5"
              >
                <div className="space-y-3">
                  <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-slate-50" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-50" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && reviews.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <Star size={24} className="fill-amber-200 text-amber-300" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">
              {copy.noReviewsYet}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {copy.reviewsAppearHint}
            </p>
          </div>
        )}

        {/* Review list */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4"
              >
                {hotelMap.get(review.hotelId) ? (
                  <HotelMiniHeader hotel={hotelMap.get(review.hotelId)!} />
                ) : null}
                <div className="border-t border-slate-50" />

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={review.overallRating} />
                      <span className="text-sm font-bold text-slate-900">
                        {review.overallRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {formatProfileDate(locale, review.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing(review)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                    >
                      <Pencil size={12} />
                      {copy.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(review._id);
                      }}
                      disabled={deletingId === review._id}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      {deletingId === review._id ? copy.deleting : copy.delete}
                    </button>
                  </div>
                </div>

                {review.reviewTitle && (
                  <p className="font-semibold text-slate-900">
                    {review.reviewTitle}
                  </p>
                )}
                <p className="text-sm text-slate-700 leading-relaxed">
                  {review.reviewText}
                </p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
                  {DIMS.map(({ key, labelKey }) => {
                    const val = review[key];
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-slate-400">{copy[labelKey]}</span>
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-16 rounded-full bg-slate-100">
                            <div
                              className="h-1 rounded-full bg-amber-400"
                              style={{ width: `${(val / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            {val.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {review.hotelResponse && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="mb-1 text-xs font-semibold text-slate-500">
                      {copy.hotelResponse}
                    </p>
                    <p className="text-sm text-slate-700">
                      {review.hotelResponse.responseText}
                    </p>
                  </div>
                )}

                {review.reviewStatus !== "APPROVED" && (
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      review.reviewStatus === "PENDING"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {review.reviewStatus === "PENDING"
                      ? copy.reviewPending
                      : copy.reviewRejected}
                  </span>
                )}
              </div>
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => {
                  void handleLoadMore();
                }}
                disabled={loadingMore}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {loadingMore ? copy.loading : copy.loadMore}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
