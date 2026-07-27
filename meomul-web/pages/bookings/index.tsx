import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import { GET_MY_BOOKINGS_QUERY } from "@/graphql/booking.gql";
import { useI18n } from "@/lib/i18n/provider";
import {
  formatBookingDate,
  formatNightsLabel,
  getBookingCopy,
  getBookingStatusLabel,
  getPaymentStatusLabel,
} from "@/lib/bookings/booking-i18n";
import { getErrorMessage } from "@/lib/utils/error";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  Moon,
  Search,
} from "lucide-react";
import type {
  BookingListItem,
  BookingStatus,
  GetMyBookingsQueryData,
  GetMyBookingsQueryVars,
  PaginationInput,
} from "@/types/booking";
import type { NextPageWithAuth } from "@/types/page";

// ─── Constants & maps ─────────────────────────────────────────────────────────

const PAGE_LIMIT = 10;
const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
  "NO_SHOW",
];

const STATUS_DOT: Record<BookingStatus, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-sky-500",
  CHECKED_IN: "bg-emerald-500",
  CHECKED_OUT: "bg-slate-400",
  CANCELLED: "bg-rose-400",
  NO_SHOW: "bg-zinc-400",
};

const STATUS_BADGE: Record<BookingStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-sky-200 bg-sky-50 text-sky-700",
  CHECKED_IN: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CHECKED_OUT: "border-slate-200 bg-slate-50 text-slate-600",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-600",
  NO_SHOW: "border-zinc-200 bg-zinc-50 text-zinc-600",
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

// ─── BookingCard ──────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  index,
  locale,
}: {
  booking: BookingListItem;
  index: number;
  locale: "en" | "ko" | "ru" | "uz";
}) {
  const cover = booking.hotelImages?.[0];
  const statusClass =
    STATUS_BADGE[booking.bookingStatus] ??
    "border-slate-200 bg-slate-50 text-slate-600";
  const statusLabel = getBookingStatusLabel(locale, booking.bookingStatus);
  const paymentClass =
    PAYMENT_BADGE[booking.paymentStatus] ??
    "border-slate-200 bg-slate-50 text-slate-600";
  const paymentLabel = getPaymentStatusLabel(locale, booking.paymentStatus);
  const nights = diffNights(booking.checkInDate, booking.checkOutDate);

  const stagger = Math.min(index, 5);

  return (
    <Link
      href={`/bookings/${booking._id}`}
      className={`group motion-fade-up motion-delay-${stagger} flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)] transition-all hover:border-slate-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] sm:gap-5 sm:p-5`}
    >
      {/* Hotel cover */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-36">
        {cover ? (
          <Image
            src={cover}
            alt={booking.hotelTitle ?? ""}
            fill
            sizes="(max-width: 640px) 96px, 144px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CalendarDays size={20} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Top row: title + badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-display)] text-base font-semibold text-slate-900 sm:text-lg">
              {booking.hotelTitle ?? `Hotel #${booking.hotelId.slice(-6)}`}
            </p>
            {booking.hotelLocation && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={10} className="flex-shrink-0" />
                <span className="truncate">{booking.hotelLocation}</span>
              </div>
            )}
          </div>
          <div className="flex flex-shrink-0 gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Details row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CalendarDays size={11} className="text-slate-400" />
            {formatBookingDate(locale, booking.checkInDate)} –{" "}
            {formatBookingDate(locale, booking.checkOutDate)}
          </span>
          <span className="flex items-center gap-1">
            <Moon size={11} className="text-slate-400" />
            {formatNightsLabel(locale, nights)}
          </span>
          <span className="flex items-center gap-1">
            <CreditCard size={11} className="text-slate-400" />
            <span
              className={`rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.04em] ${paymentClass}`}
            >
              {paymentLabel}
            </span>
          </span>
        </div>

        {/* Bottom row: code + price */}
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-500">
            {booking.bookingCode}
          </span>
          <span className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-900">
            ₩{booking.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      <ChevronRight
        size={16}
        className="mt-1 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

// ─── Summary stat ─────────────────────────────────────────────────────────────

function SummaryStat({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      <div>
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-900">
          {value}
        </p>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MyBookingsPage: NextPageWithAuth = () => {
  const { locale } = useI18n();
  const copy = getBookingCopy(locale);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(
    "ALL",
  );

  const paginationInput = useMemo<PaginationInput>(
    () => ({ page, limit: PAGE_LIMIT, sort: "createdAt", direction: -1 }),
    [page],
  );

  const { data, loading, error } = useQuery<
    GetMyBookingsQueryData,
    GetMyBookingsQueryVars
  >(GET_MY_BOOKINGS_QUERY, {
    variables: {
      input: paginationInput,
      ...(statusFilter !== "ALL" ? { statusFilter } : {}),
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const bookings = data?.getMyBookings.list ?? [];
  const total = data?.getMyBookings.metaCounter.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const countInput = useMemo<PaginationInput>(
    () => ({ page: 1, limit: 1, sort: "createdAt", direction: -1 }),
    [],
  );

  const { data: confirmedData } = useQuery<GetMyBookingsQueryData, GetMyBookingsQueryVars>(
    GET_MY_BOOKINGS_QUERY,
    { variables: { input: countInput, statusFilter: "CONFIRMED" }, fetchPolicy: "cache-and-network" },
  );
  const { data: pendingData } = useQuery<GetMyBookingsQueryData, GetMyBookingsQueryVars>(
    GET_MY_BOOKINGS_QUERY,
    { variables: { input: countInput, statusFilter: "PENDING" }, fetchPolicy: "cache-and-network" },
  );
  const { data: checkedInData } = useQuery<GetMyBookingsQueryData, GetMyBookingsQueryVars>(
    GET_MY_BOOKINGS_QUERY,
    { variables: { input: countInput, statusFilter: "CHECKED_IN" }, fetchPolicy: "cache-and-network" },
  );
  const { data: checkedOutData } = useQuery<GetMyBookingsQueryData, GetMyBookingsQueryVars>(
    GET_MY_BOOKINGS_QUERY,
    { variables: { input: countInput, statusFilter: "CHECKED_OUT" }, fetchPolicy: "cache-and-network" },
  );

  const upcoming =
    (confirmedData?.getMyBookings.metaCounter.total ?? 0) +
    (pendingData?.getMyBookings.metaCounter.total ?? 0);
  const active = checkedInData?.getMyBookings.metaCounter.total ?? 0;
  const completed = checkedOutData?.getMyBookings.metaCounter.total ?? 0;

  const handleStatusChange = (status: BookingStatus | "ALL") => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <main className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {copy.reservationsEyebrow}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-900">
            {copy.myBookingsTitle}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {copy.myBookingsDescription}
          </p>
        </div>
        <Link
          href="/hotels"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
        >
          {copy.browseHotels}
        </Link>
      </header>

      {error && <ErrorNotice message={getErrorMessage(error)} />}

      {/* ── Summary strip ──────────────────────────────────────────────── */}
      {!loading && bookings.length > 0 && (
        <div className="motion-fade-up flex flex-wrap gap-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] sm:gap-10">
          <SummaryStat label={copy.total} value={total} />
          <div className="w-px self-stretch bg-slate-100" />
          <SummaryStat label={copy.upcoming} value={upcoming} dot="bg-sky-500" />
          <SummaryStat label={copy.active} value={active} dot="bg-emerald-500" />
          <SummaryStat label={copy.completed} value={completed} dot="bg-slate-400" />
        </div>
      )}

      {/* ── Status filter pills ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", ...BOOKING_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleStatusChange(s)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition ${
              statusFilter === s
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {s !== "ALL" && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusFilter === s ? "bg-white/60" : STATUS_DOT[s]}`}
              />
            )}
            {s === "ALL" ? copy.all : getBookingStatusLabel(locale, s)}
          </button>
        ))}
      </div>

      {/* ── Loading skeleton ───────────────────────────────────────────── */}
      {loading && bookings.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-28 w-36 flex-shrink-0 animate-pulse rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-5 w-3/5 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-3 w-2/5 animate-pulse rounded-lg bg-slate-50" />
                <div className="h-3 w-1/3 animate-pulse rounded-lg bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {!loading && bookings.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Search size={24} className="text-slate-400" />
          </div>
          <p className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-800">
            {statusFilter === "ALL"
              ? copy.noBookingsYet
              : copy.noFilteredBookings}
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-slate-400">
            {statusFilter === "ALL"
              ? copy.noBookingsDescription
              : copy.tryAnotherFilter}
          </p>
          {statusFilter === "ALL" && (
            <Link
              href="/hotels"
              className="mt-6 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            >
              {copy.browseHotels}
            </Link>
          )}
        </div>
      )}

      {/* ── Booking list ───────────────────────────────────────────────── */}
      {bookings.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">
              {copy.showing} {bookings.length} {copy.ofBookings
                .replace("{{count}}", total.toString())
                .replace("{{suffix}}", total !== 1 ? "s" : "")}
            </p>
            {statusFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => handleStatusChange("ALL")}
                className="text-xs font-medium text-slate-500 underline underline-offset-2 transition hover:text-slate-700"
              >
                {copy.clearFilter}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {bookings.map((b, i) => (
              <BookingCard key={b._id} booking={b} index={i} locale={locale} />
            ))}
          </div>

          {/* ── Pagination ─────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5">
              <p className="text-sm text-slate-500">
                {copy.page}{" "}
                <span className="font-semibold text-slate-700">{page}</span> of{" "}
                <span className="font-semibold text-slate-700">
                  {totalPages}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1 || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft size={12} />
                  {copy.previous}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:opacity-40"
                >
                  {copy.next}
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
};

MyBookingsPage.auth = {
  roles: ["USER", "AGENT", "ADMIN"],
};

export default MyBookingsPage;
