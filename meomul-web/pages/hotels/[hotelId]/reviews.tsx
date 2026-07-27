import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { GET_HOTEL_QUERY, GET_HOTEL_REVIEWS_QUERY } from "@/graphql/hotel.gql";
import { RESPOND_TO_REVIEW_MUTATION } from "@/graphql/review.gql";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/utils/error";
import { successAlert, errorAlert } from "@/lib/ui/alerts";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type {
  GetHotelQueryData,
  GetHotelQueryVars,
  GetHotelReviewsQueryData,
  GetHotelReviewsQueryVars,
  PaginationInput,
  RespondToReviewMutationData,
  RespondToReviewMutationVars,
  ReviewDto,
  ReviewRatingsSummaryDto,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const RATING_BARS: Array<{
  key: keyof ReviewRatingsSummaryDto;
  label: string;
}> = [
  { key: "overallRating", label: "Overall" },
  { key: "cleanlinessRating", label: "Cleanliness" },
  { key: "locationRating", label: "Location" },
  { key: "serviceRating", label: "Service" },
  { key: "amenitiesRating", label: "Amenities" },
  { key: "valueRating", label: "Value" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (nick?: string | null) =>
  (nick ?? "?").slice(0, 2).toUpperCase();

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
};

const StarRow = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={12}
        className={
          n <= Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "fill-slate-200 text-slate-200"
        }
      />
    ))}
  </span>
);

// ─── Review Card ──────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: ReviewDto;
  respondingId: string | null;
  responseText: string;
  submitting: boolean;
  onRespond: (id: string) => void;
  onCancel: () => void;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  copy: ReturnType<typeof getHotelReviewsCopy>;
}

const ReviewCard = ({
  review,
  respondingId,
  responseText,
  submitting,
  onRespond,
  onCancel,
  onChangeText,
  onSubmit,
  copy,
}: ReviewCardProps) => {
  const isResponding = respondingId === review._id;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Reviewer header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
            {getInitials(review.reviewerNick)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {review.reviewerNick ?? copy.guest}
              {review.verifiedStay && (
                <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {copy.verifiedStay}
                </span>
              )}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <StarRow rating={review.overallRating} />
              <span className="text-xs text-slate-400">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <span className="text-sm font-bold text-slate-700">
          {review.overallRating.toFixed(1)}
        </span>
      </div>

      {/* Review text */}
      {review.reviewTitle && (
        <p className="mt-3 text-sm font-semibold text-slate-800">
          {review.reviewTitle}
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {review.reviewText}
      </p>

      {/* Guest photos */}
      {review.guestPhotos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {review.guestPhotos.slice(0, 4).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={resolveMediaUrl(url)}
              alt=""
              loading="lazy"
              className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
            />
          ))}
        </div>
      )}

      {/* Sub-ratings */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        {[
          { label: copy.cleanliness, val: review.cleanlinessRating },
          { label: copy.location, val: review.locationRating },
          { label: copy.service, val: review.serviceRating },
          { label: copy.value, val: review.valueRating },
        ].map(({ label, val }) => (
          <span key={label}>
            {label}{" "}
            <span className="font-semibold text-slate-700">
              {val.toFixed(1)}
            </span>
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-slate-100" />

      {/* Hotel response or respond button */}
      {review.hotelResponse ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-500">
            {copy.hotelResponse} ·{" "}
            {review.hotelResponse.respondedAt
              ? formatDate(review.hotelResponse.respondedAt)
              : ""}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {review.hotelResponse.responseText}
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {!isResponding ? (
            <button
              onClick={() => onRespond(review._id)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <MessageSquare size={13} />
              {copy.respondToReview}
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={responseText}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder={copy.responsePlaceholder}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={onCancel}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {copy.cancel}
                </button>
                <button
                  onClick={onSubmit}
                  disabled={submitting || !responseText.trim()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {submitting ? copy.sending : copy.sendResponse}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const HotelReviewsPage: NextPageWithAuth = () => {
  const { locale } = useI18n();
  const copy = getHotelReviewsCopy(locale);
  const router = useRouter();
  const hotelId =
    typeof router.query.hotelId === "string" ? router.query.hotelId : "";

  const [page, setPage] = useState(1);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const PAGINATION: PaginationInput = {
    page,
    limit: PAGE_SIZE,
    sort: "createdAt",
    direction: -1,
  };

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: hotelData } = useQuery<GetHotelQueryData, GetHotelQueryVars>(
    GET_HOTEL_QUERY,
    { variables: { hotelId }, skip: !hotelId },
  );

  const {
    data: reviewsData,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery<GetHotelReviewsQueryData, GetHotelReviewsQueryVars>(
    GET_HOTEL_REVIEWS_QUERY,
    {
      variables: { hotelId, input: PAGINATION },
      skip: !hotelId,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  // ── Mutation ──────────────────────────────────────────────────────────────

  const [respondToReview, { loading: submitting }] = useMutation<
    RespondToReviewMutationData,
    RespondToReviewMutationVars
  >(RESPOND_TO_REVIEW_MUTATION);

  // ── Derived ──────────────────────────────────────────────────────────────

  const hotel = hotelData?.getHotel;
  const reviews = reviewsData?.getHotelReviews.list ?? [];
  const total = reviewsData?.getHotelReviews.metaCounter.total ?? 0;
  const summary = reviewsData?.getHotelReviews.ratingsSummary;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openRespond = (id: string) => {
    setRespondingId(id);
    setResponseText("");
  };

  const closeRespond = () => {
    setRespondingId(null);
    setResponseText("");
  };

  const handleSubmitResponse = async () => {
    if (!respondingId || !responseText.trim()) return;
    try {
      await respondToReview({
        variables: {
          reviewId: respondingId,
          responseText: responseText.trim(),
        },
      });
      await successAlert("Reply posted", copy.responsePosted, {
        variant: "review",
      });
      closeRespond();
      void refetchReviews();
    } catch (err) {
      await errorAlert("We couldn’t post this reply", getErrorMessage(err), {
        variant: "review",
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes reviewFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .review-card { animation: reviewFadeIn 0.18s ease-out both; }
      `}</style>

      <main className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href={`/hotels/${hotelId}/edit`}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft size={15} />
            {copy.editHotel}
          </Link>
          <span className="text-slate-300">/</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {copy.reviewManagement}
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold text-slate-900">
              {hotel?.hotelTitle ?? copy.hotel}{" "}
              {total > 0 && (
                <span className="text-lg font-normal text-slate-400">
                  — {total.toLocaleString(locale)} {copy.reviewsCount(total)}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Error */}
        {reviewsError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {reviewsError.message}
          </div>
        )}

        {/* Rating summary */}
        {summary && summary.totalReviews > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-900">
                  {summary.overallRating.toFixed(1)}
                </p>
                <StarRow rating={summary.overallRating} />
                <p className="mt-1 text-xs text-slate-500">
                  {summary.totalReviews.toLocaleString(locale)} {copy.reviewsCount(summary.totalReviews)}
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {RATING_BARS.filter((r) => r.key !== "overallRating").map(
                  ({ key, label }) => {
                    const val = (summary[key] as number) ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-24 flex-shrink-0 text-right text-xs text-slate-500">
                          {label}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all"
                            style={{ width: `${(val / 5) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-xs font-semibold text-slate-700">
                          {val.toFixed(1)}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {reviewsLoading && reviews.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-2 w-20 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!reviewsLoading && reviews.length === 0 && (
          <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
            <Star size={36} className="text-slate-300" />
            <p className="mt-4 font-semibold text-slate-700">{copy.noReviewsYet}</p>
            <p className="mt-1 text-sm text-slate-500">
              {copy.noReviewsBody}
            </p>
          </div>
        )}

        {/* Review list */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div
                key={review._id}
                className="review-card"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <ReviewCard
                  review={review}
                  respondingId={respondingId}
                  responseText={responseText}
                  submitting={submitting}
                  onRespond={openRespond}
                  onCancel={closeRespond}
                  onChangeText={setResponseText}
                  onSubmit={() => void handleSubmitResponse()}
                  copy={copy}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              ← {copy.prev}
            </button>
            <span className="text-sm text-slate-500">
              {copy.page} {page} {copy.of} {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              {copy.next} →
            </button>
          </div>
        )}
      </main>
    </>
  );
};

HotelReviewsPage.auth = {
  roles: ["AGENT", "ADMIN", "ADMIN_OPERATOR"],
  requireApprovedHostAccess: true,
};

export default HotelReviewsPage;

function getHotelReviewsCopy(locale: string) {
  const make = (count: number, one: string, many: string) =>
    count === 1 ? one : many;

  if (locale === "ko") {
    return {
      overall: "종합",
      cleanliness: "청결",
      location: "위치",
      service: "서비스",
      amenities: "편의시설",
      value: "가성비",
      guest: "투숙객",
      verifiedStay: "인증된 투숙",
      hotelResponse: "호텔 답변",
      respondToReview: "후기에 답변하기",
      responsePlaceholder: "이 후기에 대한 전문적인 답변을 작성해 주세요...",
      cancel: "취소",
      sending: "전송 중...",
      sendResponse: "답변 보내기",
      responsePosted: "답변이 등록되었습니다.",
      editHotel: "호텔 수정",
      reviewManagement: "후기 관리",
      hotel: "호텔",
      noReviewsYet: "아직 후기가 없습니다",
      noReviewsBody: "투숙 후 작성된 후기가 여기에 표시됩니다.",
      prev: "이전",
      next: "다음",
      page: "페이지",
      of: "/",
      reviewsCount: (count: number) => `${make(count, "후기", "후기")} ${count === 1 ? "1건" : `${count}건`}`,
    };
  }
  if (locale === "ru") {
    return {
      overall: "Общая",
      cleanliness: "Чистота",
      location: "Расположение",
      service: "Сервис",
      amenities: "Удобства",
      value: "Цена/качество",
      guest: "Гость",
      verifiedStay: "Подтвержденное проживание",
      hotelResponse: "Ответ отеля",
      respondToReview: "Ответить на отзыв",
      responsePlaceholder: "Напишите профессиональный ответ на отзыв гостя...",
      cancel: "Отмена",
      sending: "Отправка...",
      sendResponse: "Отправить ответ",
      responsePosted: "Ответ успешно опубликован.",
      editHotel: "Редактировать отель",
      reviewManagement: "Управление отзывами",
      hotel: "Отель",
      noReviewsYet: "Отзывов пока нет",
      noReviewsBody: "Отзывы гостей появятся здесь после проживания.",
      prev: "Назад",
      next: "Далее",
      page: "Страница",
      of: "из",
      reviewsCount: (count: number) => `${count} ${make(count, "отзыв", "отзывов")}`,
    };
  }
  if (locale === "uz") {
    return {
      overall: "Umumiy",
      cleanliness: "Tozalik",
      location: "Joylashuv",
      service: "Xizmat",
      amenities: "Qulayliklar",
      value: "Qiymat",
      guest: "Mehmon",
      verifiedStay: "Tasdiqlangan turar joy",
      hotelResponse: "Mehmonxona javobi",
      respondToReview: "Sharhga javob berish",
      responsePlaceholder: "Mehmon sharhiga professional javob yozing...",
      cancel: "Bekor qilish",
      sending: "Yuborilmoqda...",
      sendResponse: "Javob yuborish",
      responsePosted: "Javob muvaffaqiyatli yuborildi.",
      editHotel: "Mehmonxonani tahrirlash",
      reviewManagement: "Sharhlarni boshqarish",
      hotel: "Mehmonxona",
      noReviewsYet: "Hali sharhlar yo'q",
      noReviewsBody: "Mehmon sharhlari turar joydan so'ng shu yerda paydo bo'ladi.",
      prev: "Oldingi",
      next: "Keyingi",
      page: "Sahifa",
      of: "/",
      reviewsCount: (count: number) => `${count} ta sharh`,
    };
  }
  return {
    overall: "Overall",
    cleanliness: "Cleanliness",
    location: "Location",
    service: "Service",
    amenities: "Amenities",
    value: "Value",
    guest: "Guest",
    verifiedStay: "Verified Stay",
    hotelResponse: "Hotel response",
    respondToReview: "Respond to review",
    responsePlaceholder: "Write a professional response to this guest review...",
    cancel: "Cancel",
    sending: "Sending...",
    sendResponse: "Send Response",
    responsePosted: "Response posted successfully.",
    editHotel: "Edit hotel",
    reviewManagement: "Review Management",
    hotel: "Hotel",
    noReviewsYet: "No reviews yet",
    noReviewsBody: "Guest reviews will appear here after their stay.",
    prev: "Prev",
    next: "Next",
    page: "Page",
    of: "of",
    reviewsCount: (count: number) => `${count} ${make(count, "review", "reviews")}`,
  };
}
