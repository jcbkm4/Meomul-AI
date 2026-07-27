import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import { CHECK_AUTH_QUERY } from "@/graphql/auth.gql";
import { GET_ANALYTICS_EVENTS_ADMIN_QUERY } from "@/graphql/analytics.gql";
import { GET_ALL_BOOKINGS_ADMIN_QUERY, GET_AGENT_BOOKINGS_QUERY } from "@/graphql/booking.gql";
import {
  GET_AGENT_HOTELS_QUERY,
  GET_ALL_HOTELS_ADMIN_QUERY,
  GET_DASHBOARD_STATS_QUERY,
} from "@/graphql/hotel.gql";
import { GET_ALL_REVIEWS_ADMIN_QUERY } from "@/graphql/review.gql";
import { getSessionMember } from "@/lib/auth/session";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import type { CheckAuthQueryData, MemberType } from "@/types/auth";
import type {
  AnalyticsEventSearchInput,
  GetAnalyticsEventsAdminQueryData,
  GetAnalyticsEventsAdminQueryVars,
} from "@/types/analytics";
import type {
  BookingStatus,
  GetAgentBookingsQueryData,
  GetAgentBookingsQueryVars,
  GetAllBookingsAdminQueryData,
  GetAllBookingsAdminQueryVars,
} from "@/types/booking";
import type {
  AdminHotelListItem,
  GetAgentHotelsQueryData,
  GetAgentHotelsQueryVars,
  GetAllHotelsAdminQueryData,
  GetAllHotelsAdminQueryVars,
  GetAllReviewsAdminQueryData,
  GetAllReviewsAdminQueryVars,
  GetDashboardStatsQueryData,
  PaginationInput,
  ReviewStatus,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  AlertCircle,
  ArrowUpRight,
  BellRing,
  BookCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  DoorOpen,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Star,
  UsersRound,
  Wallet,
} from "lucide-react";

const SEOUL_TIMEZONE = "Asia/Seoul";
const DASHBOARD_REFRESH_COOLDOWN_MS = 60000;
const ANALYTICS_LIST_LIMIT = 10;
const ADMIN_HOTELS_INPUT: PaginationInput = {
  page: 1,
  limit: 100,
  sort: "createdAt",
  direction: -1,
};
const AGENT_HOTELS_INPUT: PaginationInput = {
  page: 1,
  limit: 8,
  sort: "createdAt",
  direction: -1,
};
const ADMIN_BOOKINGS_INPUT: PaginationInput = {
  page: 1,
  limit: 80,
  sort: "createdAt",
  direction: -1,
};
const ADMIN_REVIEWS_INPUT: PaginationInput = {
  page: 1,
  limit: 10,
  sort: "createdAt",
  direction: -1,
};
const WEEK_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  CHECKED_OUT: "Checked out",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

const BOOKING_STATUS_COLOR: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  CHECKED_IN: "bg-emerald-100 text-emerald-700",
  CHECKED_OUT: "bg-indigo-100 text-indigo-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  NO_SHOW: "bg-slate-100 text-slate-700",
};

interface AnalyticsFilterFormState {
  eventName: string;
  memberId: string;
  memberType: "" | MemberType;
  source: string;
  fromDate: string;
  toDate: string;
}

const INITIAL_ANALYTICS_FILTERS: AnalyticsFilterFormState = {
  eventName: "",
  memberId: "",
  memberType: "",
  source: "",
  fromDate: "",
  toDate: "",
};

function toDayKey(input: string): string {
  return input.slice(0, 10);
}

function monthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, delta: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1),
  );
}

function buildCalendarDays(cursor: Date): Date[] {
  const firstOfMonth = monthStart(cursor);
  const weekday = firstOfMonth.getUTCDay();
  const mondayBasedOffset = weekday === 0 ? 6 : weekday - 1;
  const start = new Date(
    Date.UTC(
      firstOfMonth.getUTCFullYear(),
      firstOfMonth.getUTCMonth(),
      1 - mondayBasedOffset,
    ),
  );
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    return day;
  });
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDateShort(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: SEOUL_TIMEZONE,
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: SEOUL_TIMEZONE,
  });
}

function memberTypeTone(memberType: MemberType): string {
  if (memberType === "ADMIN" || memberType === "ADMIN_OPERATOR")
    return "bg-rose-100 text-rose-700";
  if (memberType === "AGENT") return "bg-violet-100 text-violet-700";
  return "bg-sky-100 text-sky-700";
}

function KpiCard({
  title,
  value,
  sub,
  tone,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  tone: "sky" | "emerald" | "amber" | "rose";
  icon: React.ReactNode;
}) {
  const iconBg: Record<typeof tone, string> = {
    sky: "bg-sky-100 text-sky-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </p>
        <span className={`rounded-xl p-2 ${iconBg[tone]}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>
    </article>
  );
}

const DashboardPage: NextPageWithAuth = () => {
  const member = useMemo(() => getSessionMember(), []);
  const isPageVisible = usePageVisible();
  const hasVisibilityMountedRef = useRef(false);
  const wasVisibleRef = useRef(false);
  const lastRefreshAtRef = useRef(0);

  const [monthCursor, setMonthCursor] = useState(() => monthStart(new Date()));
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsDraftFilters, setAnalyticsDraftFilters] =
    useState<AnalyticsFilterFormState>(INITIAL_ANALYTICS_FILTERS);
  const [analyticsAppliedFilters, setAnalyticsAppliedFilters] =
    useState<AnalyticsFilterFormState>(INITIAL_ANALYTICS_FILTERS);

  const memberType = member?.memberType;
  const isAdminArea = memberType === "ADMIN" || memberType === "ADMIN_OPERATOR";

  const analyticsSearch = useMemo<AnalyticsEventSearchInput | undefined>(() => {
    if (!isAdminArea) return undefined;
    const eventName = analyticsAppliedFilters.eventName.trim();
    const memberId = analyticsAppliedFilters.memberId.trim();
    const source = analyticsAppliedFilters.source.trim();
    const search: AnalyticsEventSearchInput = {};
    if (eventName) search.eventName = eventName;
    if (memberId) search.memberId = memberId;
    if (analyticsAppliedFilters.memberType)
      search.memberType = analyticsAppliedFilters.memberType;
    if (source) search.source = source;
    if (analyticsAppliedFilters.fromDate)
      search.fromDate = analyticsAppliedFilters.fromDate;
    if (analyticsAppliedFilters.toDate)
      search.toDate = analyticsAppliedFilters.toDate;
    return Object.keys(search).length > 0 ? search : undefined;
  }, [analyticsAppliedFilters, isAdminArea]);

  const {
    data: authData,
    loading: authLoading,
    error: authError,
    refetch: refetchAuth,
  } = useQuery<CheckAuthQueryData>(CHECK_AUTH_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const {
    data: dashboardStatsData,
    loading: dashboardStatsLoading,
    error: dashboardStatsError,
    refetch: refetchDashboardStats,
  } = useQuery<GetDashboardStatsQueryData>(GET_DASHBOARD_STATS_QUERY, {
    skip: !isAdminArea,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const {
    data: adminHotelsData,
    loading: adminHotelsLoading,
    error: adminHotelsError,
    refetch: refetchAdminHotels,
  } = useQuery<GetAllHotelsAdminQueryData, GetAllHotelsAdminQueryVars>(
    GET_ALL_HOTELS_ADMIN_QUERY,
    {
      skip: !isAdminArea,
      variables: { input: ADMIN_HOTELS_INPUT },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const {
    data: allBookingsData,
    loading: allBookingsLoading,
    error: allBookingsError,
    refetch: refetchAllBookings,
  } = useQuery<GetAllBookingsAdminQueryData, GetAllBookingsAdminQueryVars>(
    GET_ALL_BOOKINGS_ADMIN_QUERY,
    {
      skip: !isAdminArea,
      variables: { input: ADMIN_BOOKINGS_INPUT },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const {
    data: allReviewsData,
    loading: allReviewsLoading,
    error: allReviewsError,
    refetch: refetchAllReviews,
  } = useQuery<GetAllReviewsAdminQueryData, GetAllReviewsAdminQueryVars>(
    GET_ALL_REVIEWS_ADMIN_QUERY,
    {
      skip: !isAdminArea,
      variables: {
        input: ADMIN_REVIEWS_INPUT,
        statusFilter: "APPROVED" satisfies ReviewStatus,
      },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const {
    data: analyticsEventsData,
    loading: analyticsEventsLoading,
    error: analyticsEventsError,
    refetch: refetchAnalyticsEvents,
  } = useQuery<
    GetAnalyticsEventsAdminQueryData,
    GetAnalyticsEventsAdminQueryVars
  >(GET_ANALYTICS_EVENTS_ADMIN_QUERY, {
    skip: !isAdminArea,
    variables: {
      input: {
        page: analyticsPage,
        limit: ANALYTICS_LIST_LIMIT,
        sort: "createdAt",
        direction: -1,
      },
      ...(analyticsSearch ? { search: analyticsSearch } : {}),
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const {
    data: agentHotelsData,
    loading: agentHotelsLoading,
    error: agentHotelsError,
  } = useQuery<GetAgentHotelsQueryData, GetAgentHotelsQueryVars>(
    GET_AGENT_HOTELS_QUERY,
    {
      skip: isAdminArea,
      variables: { input: AGENT_HOTELS_INPUT },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  const agentHotelList = useMemo(
    () => agentHotelsData?.getAgentHotels.list ?? [],
    [agentHotelsData],
  );

  // Derive effective hotel ID immediately — no async state cycle needed
  const effectiveHotelId = selectedHotelId || agentHotelList[0]?._id || "";

  const {
    data: agentBookingsData,
    loading: agentBookingsLoading,
    refetch: refetchAgentBookings,
  } = useQuery<GetAgentBookingsQueryData, GetAgentBookingsQueryVars>(
    GET_AGENT_BOOKINGS_QUERY,
    {
      skip: !effectiveHotelId,
      variables: {
        hotelId: effectiveHotelId,
        input: { page: 1, limit: 100, sort: "createdAt", direction: -1 },
      },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  useEffect(() => {
    if (!isPageVisible) {
      wasVisibleRef.current = false;
      return;
    }

    const becameVisible = !wasVisibleRef.current;
    wasVisibleRef.current = true;
    if (!hasVisibilityMountedRef.current) {
      hasVisibilityMountedRef.current = true;
      return;
    }
    if (!becameVisible) return;

    const nowMs = Date.now();
    if (nowMs - lastRefreshAtRef.current < DASHBOARD_REFRESH_COOLDOWN_MS)
      return;
    lastRefreshAtRef.current = nowMs;

    void refetchAuth();
    if (isAdminArea) {
      void refetchDashboardStats();
      void refetchAdminHotels();
      void refetchAllBookings();
      void refetchAllReviews();
      void refetchAnalyticsEvents();
    } else {
      void refetchAgentBookings();
    }
  }, [
    isAdminArea,
    isPageVisible,
    refetchAdminHotels,
    refetchAgentBookings,
    refetchAllBookings,
    refetchAllReviews,
    refetchAnalyticsEvents,
    refetchAuth,
    refetchDashboardStats,
  ]);

  const hotels = useMemo(
    () => adminHotelsData?.getAllHotelsAdmin.list ?? [],
    [adminHotelsData],
  );
  const hotelsMap = useMemo(() => {
    const map = new Map<string, AdminHotelListItem>();
    hotels.forEach((hotel) => {
      map.set(hotel._id, hotel);
    });
    return map;
  }, [hotels]);

  const stats = dashboardStatsData?.getDashboardStats;
  const recentBookings = useMemo(
    () => allBookingsData?.getAllBookingsAdmin.list ?? [],
    [allBookingsData],
  );
  const recentReviews = useMemo(
    () => allReviewsData?.getAllReviewsAdmin.list ?? [],
    [allReviewsData],
  );
  const analyticsEvents =
    analyticsEventsData?.getAnalyticsEventsAdmin.list ?? [];
  const analyticsTotal =
    analyticsEventsData?.getAnalyticsEventsAdmin.metaCounter.total ?? 0;
  const analyticsTotalPages = Math.max(
    1,
    Math.ceil(analyticsTotal / ANALYTICS_LIST_LIMIT),
  );

  const bookingCounts = useMemo(() => {
    const counts: Record<BookingStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      CHECKED_IN: 0,
      CHECKED_OUT: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    };
    recentBookings.forEach((booking) => {
      counts[booking.bookingStatus] += 1;
    });
    return counts;
  }, [recentBookings]);

  const bookingDensityByDay = useMemo(() => {
    const map = new Map<string, number>();
    recentBookings.forEach((booking) => {
      const key = toDayKey(booking.checkInDate);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [recentBookings]);

  const calendarDays = useMemo(
    () => buildCalendarDays(monthCursor),
    [monthCursor],
  );
  const monthLabel = useMemo(
    () => formatMonthLabel(monthCursor),
    [monthCursor],
  );
  const activeMonth = monthCursor.getUTCMonth();
  const todayKey = useMemo(() => toDayKey(new Date().toISOString()), []);

  const applyAnalyticsFilters = () => {
    setAnalyticsPage(1);
    setAnalyticsAppliedFilters(analyticsDraftFilters);
  };

  const resetAnalyticsFilters = () => {
    setAnalyticsPage(1);
    setAnalyticsDraftFilters(INITIAL_ANALYTICS_FILTERS);
    setAnalyticsAppliedFilters(INITIAL_ANALYTICS_FILTERS);
  };

  const handleAnalyticsPageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > analyticsTotalPages) return;
    setAnalyticsPage(nextPage);
  };

  if (!isAdminArea) {
    const allBookings = agentBookingsData?.getAgentBookings.list ?? [];
    const today = new Date().toISOString().slice(0, 10);

    const pending      = allBookings.filter(b => b.bookingStatus === "PENDING").length;
    const confirmed    = allBookings.filter(b => b.bookingStatus === "CONFIRMED").length;
    const checkedIn    = allBookings.filter(b => b.bookingStatus === "CHECKED_IN").length;
    const arrivalsToday   = allBookings.filter(b => b.bookingStatus === "CONFIRMED" && b.checkInDate?.slice(0, 10) === today).length;
    const departuresToday = allBookings.filter(b => b.bookingStatus === "CHECKED_IN" && b.checkOutDate?.slice(0, 10) === today).length;
    const newToday     = allBookings.filter(b => b.createdAt?.slice(0, 10) === today).length;
    const estimatedRevenue = allBookings
      .filter(b => b.bookingStatus !== "CANCELLED" && b.bookingStatus !== "NO_SHOW")
      .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

    const agentBookingDensity = new Map<string, number>();
    allBookings.forEach(b => {
      const key = toDayKey(b.checkInDate);
      agentBookingDensity.set(key, (agentBookingDensity.get(key) ?? 0) + 1);
    });

    const recentBookings = [...allBookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
    const selectedHotel = agentHotelList.find(h => h._id === effectiveHotelId);

    return (
      <main className="w-full space-y-6">
        {/* ── Header ── */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              My Dashboard
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-900">
              Welcome back{member ? `, ${member.memberNick}` : ""}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white">
                {member?.memberType ?? "AGENT"}
              </span>
              {agentHotelList.length > 1 && (
                <select
                  value={effectiveHotelId}
                  onChange={e => setSelectedHotelId(e.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-0.5 text-[11px] font-semibold text-slate-700 focus:outline-none"
                >
                  {agentHotelList.map(h => (
                    <option key={h._id} value={h._id}>{h.hotelTitle}</option>
                  ))}
                </select>
              )}
              {agentHotelList.length === 1 && selectedHotel && (
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {selectedHotel.hotelTitle}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void refetchAgentBookings()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
            >
              <RefreshCcw size={13} />
              Refresh
            </button>
            <Link
              href="/bookings/manage"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              Manage bookings
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </header>

        {agentHotelsError && <ErrorNotice message={getErrorMessage(agentHotelsError)} />}

        {/* ── Quick Actions ── */}
        <nav className="flex flex-wrap gap-2" aria-label="Agent quick actions">
          {(
            [
              { href: "/hotels/manage",   label: "My Hotels",  Icon: Building2 },
              { href: "/bookings/manage", label: "Bookings",   Icon: BookCheck },
              ...(effectiveHotelId ? [
                { href: `/hotels/${effectiveHotelId}/rooms`,   label: "Rooms",   Icon: DoorOpen },
                { href: `/hotels/${effectiveHotelId}/reviews`, label: "Reviews", Icon: Star },
              ] : []),
              { href: "/chats",           label: "Chats",      Icon: MessageSquare },
            ] as const
          ).map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <a.Icon size={14} className="text-slate-400 transition group-hover:text-slate-600" />
              {a.label}
            </Link>
          ))}
        </nav>

        {/* ── KPI Cards ── */}
        {agentBookingsLoading && !agentBookingsData ? (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </section>
        ) : (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total Bookings"
              value={formatNumber(allBookings.length)}
              sub={`${formatNumber(confirmed)} confirmed`}
              tone="sky"
              icon={<BookCheck size={18} />}
            />
            <KpiCard
              title="Pending Action"
              value={formatNumber(pending)}
              sub="awaiting confirmation"
              tone="amber"
              icon={<AlertCircle size={18} />}
            />
            <KpiCard
              title="Checked In"
              value={formatNumber(checkedIn)}
              sub="active stays"
              tone="emerald"
              icon={<DoorOpen size={18} />}
            />
            <KpiCard
              title="Est. Revenue"
              value={`₩ ${formatNumber(estimatedRevenue)}`}
              sub="excl. cancelled"
              tone="rose"
              icon={<Wallet size={18} />}
            />
          </section>
        )}

        {/* ── Main Grid ── */}
        <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Booking Calendar */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Booking Calendar
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-slate-900">{monthLabel}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMonthCursor(prev => addMonths(prev, -1))}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthCursor(prev => addMonths(prev, 1))}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                    aria-label="Next month"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                  {WEEK_LABELS.map(label => (
                    <div key={label} className="bg-slate-50 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {label}
                    </div>
                  ))}
                  {calendarDays.map(day => {
                    const key = toDayKey(day.toISOString());
                    const inCurrentMonth = day.getUTCMonth() === activeMonth;
                    const dayCount = agentBookingDensity.get(key) ?? 0;
                    const isToday = key === todayKey;
                    return (
                      <div
                        key={`${key}-${inCurrentMonth ? "c" : "e"}`}
                        className={`relative min-h-[52px] bg-white px-1.5 py-1 ${!inCurrentMonth ? "bg-slate-50/60" : ""} ${isToday ? "ring-2 ring-inset ring-sky-400" : ""}`}
                      >
                        <p className={`text-xs font-semibold ${inCurrentMonth ? "text-slate-700" : "text-slate-300"}`}>
                          {day.getUTCDate()}
                        </p>
                        {dayCount > 0 ? (
                          <span className="absolute bottom-1 left-1 rounded bg-sky-100 px-1 py-px text-[9px] font-bold text-sky-600">
                            {dayCount}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Recent Bookings */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-bold text-slate-900">Recent Bookings</h3>
                <Link href="/bookings/manage" className="text-xs font-semibold text-sky-600 transition hover:text-sky-700">
                  View all →
                </Link>
              </div>
              {agentBookingsLoading && recentBookings.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500">Loading…</p>
              ) : recentBookings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentBookings.map(booking => (
                    <Link
                      key={booking._id}
                      href={`/bookings/${booking._id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          #{booking.bookingCode}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {formatDateShort(booking.checkInDate)} – {formatDateShort(booking.checkOutDate)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2.5">
                        <span className="text-xs font-semibold text-slate-700">
                          ₩ {formatNumber(booking.totalPrice)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BOOKING_STATUS_COLOR[booking.bookingStatus]}`}>
                          {BOOKING_STATUS_LABEL[booking.bookingStatus]}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-4 text-sm text-slate-400">No bookings yet.</p>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Needs Attention */}
            <section className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Needs Attention</h3>
              </div>
              <div className="space-y-1.5">
                {(
                  [
                    { label: "Bookings awaiting confirmation", count: pending,         href: "/bookings/manage" },
                    { label: "Arrivals today",                 count: arrivalsToday,   href: "/bookings/manage" },
                    { label: "Departures today",               count: departuresToday, href: "/bookings/manage" },
                  ] as const
                )
                  .filter(item => item.count > 0)
                  .map(item => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2.5 text-sm transition hover:bg-white"
                    >
                      <span className="text-slate-600">{item.label}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                        {formatNumber(item.count)}
                      </span>
                    </Link>
                  ))}
                {pending === 0 && arrivalsToday === 0 && departuresToday === 0 && (
                  <p className="py-2 text-center text-sm text-emerald-600">
                    All clear — nothing needs attention.
                  </p>
                )}
              </div>
            </section>

            {/* Today's Activity */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-900">Today&apos;s Activity</h3>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { label: "New Bookings",  val: formatNumber(newToday),        c: "text-sky-600" },
                    { label: "Check-ins",     val: formatNumber(arrivalsToday),   c: "text-emerald-600" },
                    { label: "Check-outs",    val: formatNumber(departuresToday), c: "text-indigo-600" },
                    { label: "Pending",       val: formatNumber(pending),         c: "text-amber-600" },
                  ] as const
                ).map(item => (
                  <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className={`text-lg font-bold ${item.c}`}>{item.val}</p>
                    <p className="text-[11px] font-medium text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Booking Status */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Booking Status</h3>
                <span className="text-[11px] text-slate-400">{allBookings.length} records</span>
              </div>
              <div className="space-y-3">
                {(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"] as const).map(status => {
                  const count = allBookings.filter(b => b.bookingStatus === status).length;
                  const pct = allBookings.length > 0 ? (count / allBookings.length) * 100 : 0;
                  const barColor: Record<string, string> = {
                    PENDING: "bg-amber-400", CONFIRMED: "bg-sky-400", CHECKED_IN: "bg-emerald-400",
                    CHECKED_OUT: "bg-indigo-400", CANCELLED: "bg-rose-400", NO_SHOW: "bg-slate-400",
                  };
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">{BOOKING_STATUS_LABEL[status]}</span>
                        <span className="text-xs font-bold text-slate-800">{formatNumber(count)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full transition-all ${barColor[status]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* My Hotels */}
            {agentHotelList.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <h3 className="text-sm font-bold text-slate-900">My Hotels</h3>
                  <Link href="/hotels/manage" className="text-xs font-semibold text-sky-600 transition hover:text-sky-700">
                    Manage →
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {agentHotelList.map(hotel => (
                    <div key={hotel._id} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{hotel.hotelTitle}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {hotel.hotelLocation} · ★ {hotel.hotelRating.toFixed(1)}
                        </p>
                      </div>
                      <div className="ml-3 flex flex-shrink-0 gap-1.5">
                        <Link href={`/hotels/${hotel._id}/rooms`} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">Rooms</Link>
                        <Link href={`/hotels/${hotel._id}/edit`} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">Edit</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!agentHotelsLoading && agentHotelList.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                No hotels yet.{" "}
                <Link href="/hotels/create" className="font-semibold text-slate-900 hover:underline">Register →</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full space-y-6">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Admin Dashboard
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-900">
            Welcome back{member ? `, ${member.memberNick}` : ""}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white">
              {member?.memberType ?? "ADMIN"}
            </span>
            {authData?.checkAuth ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 size={10} />
                Verified
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void refetchDashboardStats();
              void refetchAllBookings();
              void refetchAllReviews();
              void refetchAnalyticsEvents();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
          >
            <RefreshCcw size={13} />
            Refresh
          </button>
          <Link
            href="/bookings/manage"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Manage bookings
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </header>
      {authLoading ? (
        <p className="text-xs text-slate-400">Checking session…</p>
      ) : null}
      {authError ? <ErrorNotice message={getErrorMessage(authError)} /> : null}

      {/* ── Quick Actions ── */}
      <nav className="flex flex-wrap gap-2" aria-label="Admin quick actions">
        {(
          [
            { href: "/admin/members", label: "Members", Icon: UsersRound },
            { href: "/admin/hotels", label: "Hotels", Icon: Building2 },
            { href: "/admin/rooms", label: "Rooms", Icon: DoorOpen },
            { href: "/admin/reviews", label: "Reviews", Icon: Star },
            { href: "/admin/chats", label: "Chats", Icon: MessageSquare },
            {
              href: "/admin/notifications",
              label: "Notifications",
              Icon: BellRing,
            },
            {
              href: "/admin/subscriptions",
              label: "Subscriptions",
              Icon: Crown,
            },
          ] as const
        ).map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <a.Icon
              size={14}
              className="text-slate-400 transition group-hover:text-slate-600"
            />
            {a.label}
          </Link>
        ))}
      </nav>

      {dashboardStatsError ? (
        <ErrorNotice message={getErrorMessage(dashboardStatsError)} />
      ) : null}
      {dashboardStatsLoading && !stats ? (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <Loader2 size={14} className="animate-spin" />
          Loading dashboard…
        </div>
      ) : null}

      {stats ? (
        <>
          {/* ── KPI Cards ── */}
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Members"
              value={formatNumber(stats.totalMembers)}
              sub={`+${formatNumber(stats.newMembersToday)} today`}
              tone="sky"
              icon={<UsersRound size={18} />}
            />
            <KpiCard
              title="Hotels"
              value={formatNumber(stats.totalHotels)}
              sub={`${formatNumber(stats.activeHotels)} active`}
              tone="emerald"
              icon={<Building2 size={18} />}
            />
            <KpiCard
              title="Bookings"
              value={formatNumber(stats.totalBookings)}
              sub={`${formatNumber(stats.confirmedBookings)} confirmed`}
              tone="amber"
              icon={<BookCheck size={18} />}
            />
            <KpiCard
              title="Revenue"
              value={`₩ ${formatNumber(stats.totalRevenue)}`}
              sub={`₩ ${formatNumber(stats.todayRevenue)} today`}
              tone="rose"
              icon={<Wallet size={18} />}
            />
          </section>

          {/* ── Main Grid ── */}
          <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Calendar */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Booking Calendar
                    </p>
                    <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                      {monthLabel}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setMonthCursor((prev) => addMonths(prev, -1))
                      }
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMonthCursor((prev) => addMonths(prev, 1))
                      }
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                      aria-label="Next month"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                    {WEEK_LABELS.map((label) => (
                      <div
                        key={label}
                        className="bg-slate-50 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
                      >
                        {label}
                      </div>
                    ))}
                    {calendarDays.map((day) => {
                      const key = toDayKey(day.toISOString());
                      const inCurrentMonth = day.getUTCMonth() === activeMonth;
                      const dayCount = bookingDensityByDay.get(key) ?? 0;
                      const isToday = key === todayKey;
                      return (
                        <div
                          key={`${key}-${inCurrentMonth ? "c" : "e"}`}
                          className={`relative min-h-[52px] bg-white px-1.5 py-1 ${
                            !inCurrentMonth ? "bg-slate-50/60" : ""
                          } ${isToday ? "ring-2 ring-inset ring-sky-400" : ""}`}
                        >
                          <p
                            className={`text-xs font-semibold ${
                              inCurrentMonth
                                ? "text-slate-700"
                                : "text-slate-300"
                            }`}
                          >
                            {day.getUTCDate()}
                          </p>
                          {dayCount > 0 ? (
                            <span className="absolute bottom-1 left-1 rounded bg-sky-100 px-1 py-px text-[9px] font-bold text-sky-600">
                              {dayCount}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Recent Bookings */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Bookings
                  </h3>
                  <Link
                    href="/bookings/manage"
                    className="text-xs font-semibold text-sky-600 transition hover:text-sky-700"
                  >
                    View all →
                  </Link>
                </div>
                {allBookingsError ? (
                  <ErrorNotice message={getErrorMessage(allBookingsError)} />
                ) : null}
                {allBookingsLoading && recentBookings.length === 0 ? (
                  <p className="text-sm text-slate-600">Loading…</p>
                ) : null}
                {recentBookings.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentBookings.slice(0, 8).map((booking) => {
                      const hotel = hotelsMap.get(booking.hotelId);
                      return (
                        <Link
                          key={booking._id}
                          href={`/bookings/${booking._id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {hotel?.hotelTitle ?? "Unknown Hotel"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              #{booking.bookingCode} ·{" "}
                              {formatDateShort(booking.checkInDate)} –{" "}
                              {formatDateShort(booking.checkOutDate)}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2.5">
                            <span className="text-xs font-semibold text-slate-700">
                              ₩ {formatNumber(booking.totalPrice)}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BOOKING_STATUS_COLOR[booking.bookingStatus]}`}
                            >
                              {BOOKING_STATUS_LABEL[booking.bookingStatus]}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Needs Attention */}
              <section className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle size={15} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Needs Attention
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {(
                    [
                      {
                        label: "Hotels pending verification",
                        count: stats.pendingHotels,
                        href: "/admin/hotels",
                      },
                      {
                        label: "Bookings awaiting action",
                        count: stats.pendingBookings,
                        href: "/bookings/manage",
                      },
                      {
                        label: "Chats waiting for response",
                        count: stats.waitingChats,
                        href: "/admin/chats",
                      },
                      {
                        label: "Unread notifications",
                        count: stats.unreadNotifications,
                        href: "/admin/notifications",
                      },
                      {
                        label: "Rooms in maintenance",
                        count: stats.maintenanceRooms,
                        href: "/admin/rooms",
                      },
                    ] as const
                  )
                    .filter((item) => item.count > 0)
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2.5 text-sm transition hover:bg-white"
                      >
                        <span className="text-slate-600">{item.label}</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          {formatNumber(item.count)}
                        </span>
                      </Link>
                    ))}
                  {stats.pendingHotels === 0 &&
                    stats.pendingBookings === 0 &&
                    stats.waitingChats === 0 &&
                    stats.unreadNotifications === 0 &&
                    stats.maintenanceRooms === 0 && (
                      <p className="py-2 text-center text-sm text-emerald-600">
                        All clear — nothing needs attention.
                      </p>
                    )}
                </div>
              </section>

              {/* Today's Activity */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Today&apos;s Activity
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        label: "New Bookings",
                        val: formatNumber(stats.newBookingsToday),
                        c: "text-sky-600",
                      },
                      {
                        label: "Check-ins",
                        val: formatNumber(stats.checkInsToday),
                        c: "text-emerald-600",
                      },
                      {
                        label: "Check-outs",
                        val: formatNumber(stats.checkOutsToday),
                        c: "text-indigo-600",
                      },
                      {
                        label: "New Reviews",
                        val: formatNumber(stats.newReviewsToday),
                        c: "text-amber-600",
                      },
                      {
                        label: "New Members",
                        val: formatNumber(stats.newMembersToday),
                        c: "text-violet-600",
                      },
                      {
                        label: "Revenue",
                        val: `₩${formatNumber(stats.todayRevenue)}`,
                        c: "text-rose-600",
                      },
                    ] as const
                  ).map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl bg-slate-50 px-3 py-2.5"
                    >
                      <p className={`text-lg font-bold ${item.c}`}>
                        {item.val}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Booking Status */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Booking Status
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {recentBookings.length} records
                  </span>
                </div>
                <div className="space-y-3">
                  {(
                    [
                      "PENDING",
                      "CONFIRMED",
                      "CHECKED_IN",
                      "CHECKED_OUT",
                      "CANCELLED",
                      "NO_SHOW",
                    ] as const
                  ).map((status) => {
                    const count = bookingCounts[status];
                    const pct =
                      recentBookings.length > 0
                        ? (count / recentBookings.length) * 100
                        : 0;
                    const bar: Record<string, string> = {
                      PENDING: "bg-amber-400",
                      CONFIRMED: "bg-sky-400",
                      CHECKED_IN: "bg-emerald-400",
                      CHECKED_OUT: "bg-indigo-400",
                      CANCELLED: "bg-rose-400",
                      NO_SHOW: "bg-slate-400",
                    };
                    return (
                      <div key={status}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-600">
                            {BOOKING_STATUS_LABEL[status]}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {formatNumber(count)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${bar[status]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Latest Reviews */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Latest Reviews
                  </h3>
                  {allReviewsData?.getAllReviewsAdmin.ratingsSummary ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      Avg{" "}
                      {allReviewsData.getAllReviewsAdmin.ratingsSummary.overallRating.toFixed(
                        1,
                      )}
                      ★
                    </span>
                  ) : null}
                </div>
                {allReviewsError ? (
                  <div className="p-4">
                    <ErrorNotice message={getErrorMessage(allReviewsError)} />
                  </div>
                ) : null}
                {allReviewsLoading && recentReviews.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">Loading…</div>
                ) : null}
                {recentReviews.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentReviews.slice(0, 4).map((review) => {
                      const hotel = hotelsMap.get(review.hotelId);
                      return (
                        <div key={review._id} className="px-5 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">
                                {review.reviewerNick ?? "Guest"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {hotel?.hotelTitle ?? "Unknown"} ·{" "}
                                {formatDateShort(review.createdAt)}
                              </p>
                            </div>
                            <span className="flex-shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                              {review.overallRating.toFixed(1)}★
                            </span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                            {review.reviewText}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            </div>
          </div>

          {/* ── Analytics Event Stream (Collapsible) ── */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowAnalytics((prev) => !prev)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Onboarding Analytics
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  Event Stream
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  {formatNumber(analyticsTotal)} events
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${showAnalytics ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {showAnalytics ? (
              <div className="border-t border-slate-100 p-5">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <input
                    value={analyticsDraftFilters.eventName}
                    onChange={(e) =>
                      setAnalyticsDraftFilters((prev) => ({
                        ...prev,
                        eventName: e.target.value,
                      }))
                    }
                    placeholder="Event name"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                  <input
                    value={analyticsDraftFilters.memberId}
                    onChange={(e) =>
                      setAnalyticsDraftFilters((prev) => ({
                        ...prev,
                        memberId: e.target.value,
                      }))
                    }
                    placeholder="Member ID"
                    className="rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                  <input
                    value={analyticsDraftFilters.source}
                    onChange={(e) =>
                      setAnalyticsDraftFilters((prev) => ({
                        ...prev,
                        source: e.target.value,
                      }))
                    }
                    placeholder="Source"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                  <select
                    value={analyticsDraftFilters.memberType}
                    onChange={(e) =>
                      setAnalyticsDraftFilters((prev) => ({
                        ...prev,
                        memberType: e.target
                          .value as AnalyticsFilterFormState["memberType"],
                      }))
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="">All types</option>
                    <option value="USER">USER</option>
                    <option value="AGENT">AGENT</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="ADMIN_OPERATOR">ADMIN_OPERATOR</option>
                  </select>
                  <input
                    type="date"
                    value={analyticsDraftFilters.fromDate}
                    onChange={(e) =>
                      setAnalyticsDraftFilters((prev) => ({
                        ...prev,
                        fromDate: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                  <input
                    type="date"
                    value={analyticsDraftFilters.toDate}
                    onChange={(e) =>
                      setAnalyticsDraftFilters((prev) => ({
                        ...prev,
                        toDate: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={applyAnalyticsFilters}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={resetAnalyticsFilters}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {analyticsEventsError ? (
                    <ErrorNotice
                      message={getErrorMessage(analyticsEventsError)}
                    />
                  ) : null}
                  {analyticsEventsLoading && analyticsEvents.length === 0 ? (
                    <p className="text-sm text-slate-500">Loading events…</p>
                  ) : null}
                  {!analyticsEventsLoading && analyticsEvents.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No events match the current filters.
                    </p>
                  ) : null}
                  {analyticsEvents.map((ev) => (
                    <article
                      key={ev._id}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            {ev.eventName}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${memberTypeTone(ev.memberType)}`}
                          >
                            {ev.memberType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {formatDateTime(ev.createdAt)}
                        </p>
                      </div>
                      <div className="mt-2 grid gap-1 text-[11px] text-slate-500 md:grid-cols-3">
                        <p className="truncate font-mono">{ev.memberId}</p>
                        <p>{ev.eventPath ?? "—"}</p>
                        <p>{ev.source ?? "—"}</p>
                      </div>
                      {ev.payload ? (
                        <p className="mt-1.5 line-clamp-2 text-[11px] text-slate-500">
                          {ev.payload.length > 180
                            ? `${ev.payload.slice(0, 180)}…`
                            : ev.payload}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>

                {analyticsTotal > 0 ? (
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">
                      Page {analyticsPage} / {analyticsTotalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={analyticsPage <= 1}
                        onClick={() =>
                          handleAnalyticsPageChange(analyticsPage - 1)
                        }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={analyticsPage >= analyticsTotalPages}
                        onClick={() =>
                          handleAnalyticsPageChange(analyticsPage + 1)
                        }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {adminHotelsError ? (
        <ErrorNotice message={getErrorMessage(adminHotelsError)} />
      ) : null}
      {adminHotelsLoading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          <Loader2 size={14} className="animate-spin" />
          Loading hotel context…
        </div>
      ) : null}
    </main>
  );
};

DashboardPage.auth = {
  roles: ["AGENT", "ADMIN", "ADMIN_OPERATOR"],
  requireApprovedHostAccess: true,
};

export default DashboardPage;
