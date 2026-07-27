import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  DELETE_REVIEW_MUTATION,
  GET_ALL_REVIEWS_ADMIN_QUERY,
  UPDATE_REVIEW_STATUS_MUTATION,
} from "@/graphql/review.gql";
import { resolveImageUrl } from "@/lib/config/env";
import { errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import type {
  GetAllReviewsAdminQueryData,
  GetAllReviewsAdminQueryVars,
  PaginationInput,
  ReviewDto,
  ReviewStatus,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  Loader2,
  MessageSquareText,
  Search,
  Star,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

const STATUS_COLOR: Record<ReviewStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FLAGGED: "bg-rose-50 text-rose-700 border-rose-200",
  REMOVED: "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_TABS: Array<{ label: string; value: ReviewStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Flagged", value: "FLAGGED" },
  { label: "Removed", value: "REMOVED" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          className={
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-slate-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

/* ─── Detail drawer ────────────────────────────────────────────────────────── */

function ReviewDetailDrawer({
  review,
  onClose,
  onStatusChanged,
}: {
  review: ReviewDto;
  onClose: () => void;
  onStatusChanged: () => void;
}) {
  const [updateStatus, { loading }] = useMutation(
    UPDATE_REVIEW_STATUS_MUTATION,
  );
  const [deleteReview, { loading: deleting }] = useMutation(
    DELETE_REVIEW_MUTATION,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleStatus = async (status: ReviewStatus) => {
    try {
      await updateStatus({ variables: { reviewId: review._id, status } });
      onStatusChanged();
      onClose();
      await successAlert("Review status saved", `This review is now marked as ${status.toLowerCase()}.`, {
        variant: "review",
      });
    } catch (err) {
      await errorAlert("We couldn’t update this review", getErrorMessage(err), {
        variant: "review",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview({ variables: { reviewId: review._id } });
      onStatusChanged();
      onClose();
      await successAlert("Review removed", "The review has been removed from the platform.", {
        variant: "trash",
      });
    } catch (err) {
      await errorAlert("We couldn’t remove this review", getErrorMessage(err), {
        variant: "review",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Review Detail
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              {review.reviewTitle ?? "Untitled Review"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* reviewer info */}
          <div className="flex items-center gap-3">
            {review.reviewerImage ? (
              <Image
                src={resolveImageUrl(review.reviewerImage)}
                alt={review.reviewerNick ?? "reviewer"}
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                {(review.reviewerNick ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">
                {review.reviewerNick ?? "Anonymous"}
              </p>
              <p className="text-xs text-slate-500">
                {review.verifiedStay ? "Verified Stay" : "Unverified"} ·{" "}
                {formatDate(review.stayDate)}
              </p>
            </div>
            <span
              className={`ml-auto rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[review.reviewStatus]}`}
            >
              {review.reviewStatus}
            </span>
          </div>

          {/* ratings */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Overall</span>
              <RatingStars rating={review.overallRating} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Cleanliness</span>
              <RatingStars rating={review.cleanlinessRating} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Location</span>
              <RatingStars rating={review.locationRating} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Service</span>
              <RatingStars rating={review.serviceRating} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Amenities</span>
              <RatingStars rating={review.amenitiesRating} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Value</span>
              <RatingStars rating={review.valueRating} />
            </div>
          </div>

          {/* review text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
              Review
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {review.reviewText}
            </p>
          </div>

          {/* guest photos */}
          {review.guestPhotos.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
                Photos
              </p>
              <div className="flex flex-wrap gap-2">
                {review.guestPhotos.map((photo, i) => (
                  <Image
                    key={i}
                    src={resolveImageUrl(photo)}
                    alt={`Guest photo ${i + 1}`}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* hotel response */}
          {review.hotelResponse && (
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 mb-2">
                Hotel Response
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {review.hotelResponse.responseText}
              </p>
              {review.hotelResponse.respondedAt && (
                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(review.hotelResponse.respondedAt)}
                </p>
              )}
            </div>
          )}

          {/* meta info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <InfoRow label="Review ID" value={review._id} mono />
            <InfoRow label="Hotel ID" value={review.hotelId} mono />
            <InfoRow label="Booking ID" value={review.bookingId} mono />
            <InfoRow label="Helpful" value={String(review.helpfulCount)} />
            <InfoRow label="Created" value={formatDate(review.createdAt)} />
          </div>

          {/* status actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              Change Status
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                ["APPROVED", "FLAGGED", "REMOVED", "PENDING"] as ReviewStatus[]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={loading || review.reviewStatus === s}
                  onClick={() => void handleStatus(s)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${STATUS_COLOR[s]}`}
                >
                  {loading ? "..." : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Close
          </button>
          {confirmDelete ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex-1 rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <span className="inline-flex items-center gap-1.5">
                <Trash2 size={14} /> Delete Review
              </span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`text-sm font-medium text-slate-900 ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────────────────── */

const AdminReviewsPage: NextPageWithAuth = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "ALL">("ALL");
  const [selectedReview, setSelectedReview] = useState<ReviewDto | null>(null);

  const input = useMemo<PaginationInput>(
    () => ({ page, limit: PAGE_SIZE, sort: "createdAt", direction: -1 }),
    [page],
  );

  const { data, loading, error, refetch } = useQuery<
    GetAllReviewsAdminQueryData,
    GetAllReviewsAdminQueryVars
  >(GET_ALL_REVIEWS_ADMIN_QUERY, {
    variables: {
      input,
      ...(statusFilter !== "ALL" ? { statusFilter } : {}),
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const reviews = useMemo(() => data?.getAllReviewsAdmin.list ?? [], [data?.getAllReviewsAdmin.list]);
  const total = data?.getAllReviewsAdmin.metaCounter.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = data?.getAllReviewsAdmin.ratingsSummary;

  const filteredReviews = useMemo(() => {
    if (!searchTerm.trim()) return reviews;
    const q = searchTerm.toLowerCase();
    return reviews.filter(
      (r) =>
        (r.reviewTitle?.toLowerCase().includes(q) ?? false) ||
        r.reviewText.toLowerCase().includes(q) ||
        (r.reviewerNick?.toLowerCase().includes(q) ?? false) ||
        r._id.includes(q),
    );
  }, [reviews, searchTerm]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      FLAGGED: 0,
      REMOVED: 0,
    };
    reviews.forEach((r) => {
      if (c[r.reviewStatus] !== undefined) c[r.reviewStatus] += 1;
    });
    return c;
  }, [reviews]);

  const handleTabChange = useCallback((val: ReviewStatus | "ALL") => {
    setStatusFilter(val);
    setPage(1);
  }, []);

  return (
    <main className="w-full space-y-6 pb-12">
      {/* header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-50 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
            Review Moderation
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Review, approve, flag, or remove guest reviews. Monitor ratings and
            content quality.
          </p>
        </div>
      </section>

      {/* summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total"
          value={total}
          icon={<MessageSquareText size={20} />}
          tone="sky"
        />
        <SummaryCard
          label="Pending"
          value={statusCounts.PENDING}
          icon={<Eye size={20} />}
          tone="amber"
        />
        <SummaryCard
          label="Flagged"
          value={statusCounts.FLAGGED}
          icon={<Flag size={20} />}
          tone="rose"
        />
        {summary ? (
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Avg Rating
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
                  {summary.overallRating.toFixed(1)}
                </p>
              </div>
              <span className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
                <Star size={20} />
              </span>
            </div>
          </article>
        ) : (
          <SummaryCard
            label="Approved"
            value={statusCounts.APPROVED}
            icon={<BadgeCheck size={20} />}
            tone="emerald"
          />
        )}
      </section>

      {/* table section */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        {/* tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === tab.value
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, reviewer, or ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20"
            />
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <ErrorNotice message={getErrorMessage(error)} />
          </div>
        ) : null}

        {loading && reviews.length === 0 ? (
          <div className="flex items-center justify-center gap-3 p-12">
            <Loader2 size={18} className="animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading reviews...</p>
          </div>
        ) : null}

        {!loading && filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              No reviews found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : null}

        {filteredReviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Reviewer
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Verified
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Stats
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/50"
                  >
                    {/* Reviewer */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {r.reviewerImage ? (
                          <Image
                            src={resolveImageUrl(r.reviewerImage)}
                            alt={r.reviewerNick ?? "reviewer"}
                            width={32}
                            height={32}
                            unoptimized
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                            {(r.reviewerNick ?? "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="font-semibold text-slate-900">
                          {r.reviewerNick ?? "Anonymous"}
                        </p>
                      </div>
                    </td>
                    {/* Title */}
                    <td className="max-w-[200px] px-4 py-3.5">
                      <p className="truncate text-sm text-slate-700">
                        {r.reviewTitle ?? (
                          <span className="italic text-slate-400">
                            No title
                          </span>
                        )}
                      </p>
                    </td>
                    {/* Rating */}
                    <td className="px-4 py-3.5">
                      <RatingStars rating={r.overallRating} />
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[r.reviewStatus]}`}
                      >
                        {r.reviewStatus}
                      </span>
                    </td>
                    {/* Verified */}
                    <td className="px-4 py-3.5">
                      {r.verifiedStay ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                          <BadgeCheck size={12} /> Yes
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No</span>
                      )}
                    </td>
                    {/* Stats */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp size={11} />
                          {r.helpfulCount}
                        </span>
                        {r.guestPhotos.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-sky-600">
                            {r.guestPhotos.length} pic
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatDate(r.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedReview(r)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                        title="View detail"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* pagination */}
        {total > PAGE_SIZE ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* detail drawer */}
      {selectedReview ? (
        <ReviewDetailDrawer
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onStatusChanged={() => void refetch()}
        />
      ) : null}
    </main>
  );
};

/* ─── Summary card ─────────────────────────────────────────────────────────── */

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "sky" | "amber" | "rose" | "emerald";
}) {
  const bg: Record<string, string> = {
    sky: "bg-sky-50 border-sky-200",
    amber: "bg-amber-50 border-amber-200",
    rose: "bg-rose-50 border-rose-200",
    emerald: "bg-emerald-50 border-emerald-200",
  };
  const iBg: Record<string, string> = {
    sky: "bg-sky-100 text-sky-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };
  return (
    <article className={`rounded-2xl border p-4 ${bg[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
            {formatNumber(value)}
          </p>
        </div>
        <span className={`rounded-xl p-2.5 ${iBg[tone]}`}>{icon}</span>
      </div>
    </article>
  );
}

AdminReviewsPage.auth = {
  roles: ["ADMIN", "ADMIN_OPERATOR"],
};

export default AdminReviewsPage;
