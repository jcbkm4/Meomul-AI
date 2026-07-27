import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ErrorNotice } from "@/components/ui/error-notice";
import { GET_MY_BOOKINGS_QUERY } from "@/graphql/booking.gql";
import { GET_HOTEL_CARDS_QUERY } from "@/graphql/hotel.gql";
import { getSessionMember } from "@/lib/auth/session";
import {
  formatBookingDate,
  formatNightsLabel,
  getBookingCopy,
  getBookingStatusLabel,
  getPaymentStatusLabel,
} from "@/lib/bookings/booking-i18n";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Moon,
  Search,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingRoom {
  roomType: string;
  quantity: number;
  guestName: string;
}

interface BookingListItem {
  _id: string;
  bookingCode: string;
  bookingStatus: string;
  paymentStatus: string;
  paidAmount: number;
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  hotelId: string;
  rooms: BookingRoom[];
}

interface GetMyBookingsData {
  getMyBookings: {
    list: BookingListItem[];
    metaCounter: { total: number };
  };
}

interface GetHotelCardData {
  getHotelsByIds: {
    _id: string;
    hotelTitle: string;
    hotelImages: string[];
    hotelLocation?: string;
  }[];
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-sky-200 bg-sky-50 text-sky-700",
  CHECKED_IN: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CHECKED_OUT: "border-slate-200 bg-slate-50 text-slate-600",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-600",
};

const PAYMENT_BADGE: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PARTIAL: "border-violet-200 bg-violet-50 text-violet-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-rose-200 bg-rose-50 text-rose-600",
  REFUNDED: "border-slate-200 bg-slate-50 text-slate-600",
};

function diffNights(checkIn: string, checkOut: string): number {
  const msPerDay = 86_400_000;
  return Math.max(
    0,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay,
    ),
  );
}

// ─── BookingRow ───────────────────────────────────────────────────────────────

function BookingRow({
  booking,
  hotel,
}: {
  booking: BookingListItem;
  hotel?: GetHotelCardData["getHotelsByIds"][number];
}) {
  const { locale } = useI18n();
  const cover = resolveMediaUrl(hotel?.hotelImages[0]);
  const statusClass =
    STATUS_BADGE[booking.bookingStatus] ??
    "border-slate-200 bg-slate-50 text-slate-600";
  const statusLabel = getBookingStatusLabel(
    locale,
    booking.bookingStatus as never,
  );
  const paymentClass =
    PAYMENT_BADGE[booking.paymentStatus] ??
    "border-slate-200 bg-slate-50 text-slate-600";
  const paymentLabel = getPaymentStatusLabel(locale, booking.paymentStatus);
  const nights = diffNights(booking.checkInDate, booking.checkOutDate);

  return (
    <Link
      href={`/bookings/${booking._id}`}
      className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)] transition-all hover:border-slate-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)]"
    >
      {/* Hotel thumbnail */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-28">
        {cover ? (
          <Image
            src={cover}
            alt={hotel?.hotelTitle ?? ""}
            fill
            sizes="(max-width: 640px) 80px, 112px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CalendarDays size={18} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-display)] text-sm font-semibold text-slate-900 sm:text-base">
              {hotel?.hotelTitle ?? `Hotel #${booking.hotelId.slice(-6)}`}
            </p>
            {hotel?.hotelLocation && (
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin size={9} className="flex-shrink-0" />
                <span className="truncate">{hotel.hotelLocation}</span>
              </div>
            )}
          </div>
          <span
            className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CalendarDays size={10} className="text-slate-400" />
            {formatBookingDate(locale, booking.checkInDate)} –{" "}
            {formatBookingDate(locale, booking.checkOutDate)}
          </span>
          <span className="flex items-center gap-1">
            <Moon size={10} className="text-slate-400" />
            {formatNightsLabel(locale, nights)}
          </span>
          <span
            className={`rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.04em] ${paymentClass}`}
          >
            {paymentLabel}
          </span>
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="rounded-md bg-slate-100 px-1.5 py-px font-mono text-[10px] font-medium text-slate-500">
            {booking.bookingCode}
          </span>
          <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-slate-900">
            ₩{booking.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      <ChevronRight
        size={14}
        className="mt-1 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

// ─── BookingsTab ──────────────────────────────────────────────────────────────

const LIMIT = 10;

export function BookingsTab() {
  const { locale } = useI18n();
  const copy = getBookingCopy(locale);
  const listCopy =
    locale === "ko"
      ? {
          viewAll: "전체 보기",
          loadMore: "더 보기",
          totalBookings: "총 {{count}}건",
        }
      : locale === "ru"
        ? {
            viewAll: "Смотреть все",
            loadMore: "Показать еще",
            totalBookings: "Всего {{count}}",
          }
        : locale === "uz"
          ? {
              viewAll: "Barchasini ko'rish",
              loadMore: "Yana ko'rsatish",
              totalBookings: "Jami {{count}} ta",
            }
          : {
              viewAll: "View all",
              loadMore: "Load more",
              totalBookings: "{{count}} total",
            };
  const member = useMemo(() => getSessionMember(), []);
  const [extraBookings, setExtraBookings] = useState<BookingListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, fetchMore } = useQuery<GetMyBookingsData>(
    GET_MY_BOOKINGS_QUERY,
    {
      skip: !member,
      variables: { input: { page: 1, limit: LIMIT, direction: -1 } },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const firstPageBookings = useMemo(
    () => data?.getMyBookings.list ?? [],
    [data?.getMyBookings.list],
  );
  const bookings = useMemo(
    () => [...firstPageBookings, ...extraBookings],
    [extraBookings, firstPageBookings],
  );
  const total = data?.getMyBookings.metaCounter.total ?? 0;
  const hasMore = bookings.length < total;
  const bookingHotelIds = useMemo(
    () => Array.from(new Set(bookings.map((booking) => booking.hotelId))),
    [bookings],
  );
  const { data: hotelsData, loading: hotelsLoading } = useQuery<GetHotelCardData>(
    GET_HOTEL_CARDS_QUERY,
    {
      skip: bookingHotelIds.length === 0,
      variables: { hotelIds: bookingHotelIds },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );
  const hotelMap = useMemo(
    () =>
      new Map((hotelsData?.getHotelsByIds ?? []).map((hotel) => [hotel._id, hotel])),
    [hotelsData],
  );

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const { data: moreData } = await fetchMore({
        variables: { input: { page: nextPage, limit: LIMIT, direction: -1 } },
      });
      const newItems = moreData?.getMyBookings.list ?? [];
      setExtraBookings((prev) => [...prev, ...newItems]);
      setCurrentPage(nextPage);
    } catch {
      // Network errors are surfaced by the query's error state
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <ErrorNotice message={getErrorMessage(error)} />}

      {/* Loading skeleton */}
      {(loading || hotelsLoading) && bookings.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="h-24 w-28 flex-shrink-0 animate-pulse rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded-lg bg-slate-50" />
                <div className="h-3 w-1/3 animate-pulse rounded-lg bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && bookings.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Search size={20} className="text-slate-400" />
          </div>
          <p className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-slate-800">
            {copy.noBookingsYet}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {copy.noBookingsDescription}
          </p>
          <Link
            href="/hotels"
            className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
          >
            {copy.browseHotels}
          </Link>
        </div>
      )}

      {/* Booking list */}
      {bookings.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">
              {listCopy.totalBookings.replace("{{count}}", total.toLocaleString(locale))}
            </p>
            <Link
              href="/bookings"
              className="text-xs font-semibold text-slate-500 underline underline-offset-2 transition hover:text-slate-700"
            >
              {listCopy.viewAll}
            </Link>
          </div>
          <div className="space-y-3">
            {bookings.map((b) => (
              <BookingRow key={b._id} booking={b} hotel={hotelMap.get(b.hotelId)} />
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => {
                void handleLoadMore();
              }}
              disabled={loadingMore}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
            >
              {loadingMore ? copy.next + "..." : listCopy.loadMore}
            </button>
          )}
        </>
      )}
    </div>
  );
}
