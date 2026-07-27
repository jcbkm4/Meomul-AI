import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useMemo, useEffect, useRef } from "react";
import { GET_AGENT_HOTELS_QUERY } from "@/graphql/hotel.gql";
import { getSessionMember } from "@/lib/auth/session";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { useI18n } from "@/lib/i18n/provider";
import {
  getHotelLocationLabelLocalized,
  getHotelTypeLabel,
} from "@/lib/hotels/hotels-i18n";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type {
  GetAgentHotelsQueryData,
  GetAgentHotelsQueryVars,
  HotelStatus,
  HotelType,
  PaginationInput,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  Building2,
  ChevronRight,
  DoorOpen,
  PenLine,
  Plus,
  Star,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGINATION: PaginationInput = {
  page: 1,
  limit: 50,
  sort: "createdAt",
  direction: -1,
};

const STATUS_CONFIG: Record<HotelStatus, { key: string; className: string }> = {
    PENDING: {
      key: "pendingReview",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    ACTIVE: {
      key: "active",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    INACTIVE: {
      key: "inactive",
      className: "bg-slate-100 text-slate-500 border border-slate-200",
    },
    SUSPENDED: {
      key: "suspended",
      className: "bg-rose-50 text-rose-600 border border-rose-200",
    },
    DELETE: {
      key: "deleted",
      className: "bg-slate-100 text-slate-400 border border-slate-200",
    },
  };

// ─── Page ─────────────────────────────────────────────────────────────────────

const HotelsManagePage: NextPageWithAuth = () => {
  const { locale, t } = useI18n();
  const member = useMemo(() => getSessionMember(), []);
  const isPageVisible = usePageVisible();
  const copy =
    locale === "ko"
      ? {
          eyebrow: "숙소 관리",
          title: "내 호텔",
          register: "호텔 등록",
          emptyTitle: "아직 등록된 호텔이 없습니다",
          emptyBody: "첫 숙소를 등록하고 예약을 받아보세요.",
          reviewNotice: "관리자 검토 중입니다. 승인되면 호텔이 공개됩니다.",
          rooms: "객실",
          reviews: "후기",
          edit: "수정",
          publicPage: "공개 페이지 보기",
          registered: "등록됨",
          status: {
            pendingReview: "검토 대기",
            active: "운영 중",
            inactive: "비활성",
            suspended: "중지됨",
            deleted: "삭제됨",
          },
        }
      : locale === "ru"
        ? {
            eyebrow: "Управление объектами",
            title: "Мои отели",
            register: "Добавить отель",
            emptyTitle: "Отелей пока нет",
            emptyBody: "Добавьте первый объект и начните принимать бронирования.",
            reviewNotice: "Объект на проверке администратора и станет доступен после одобрения.",
            rooms: "Номера",
            reviews: "Отзывы",
            edit: "Изменить",
            publicPage: "Открыть публичную страницу",
            registered: "зарегистрировано",
            status: {
              pendingReview: "На проверке",
              active: "Активен",
              inactive: "Неактивен",
              suspended: "Приостановлен",
              deleted: "Удален",
            },
          }
        : locale === "uz"
          ? {
              eyebrow: "Obyekt boshqaruvi",
              title: "Mening mehmonxonalarim",
              register: "Mehmonxona qo'shish",
              emptyTitle: "Hali mehmonxonalar yo'q",
              emptyBody: "Birinchi obyektni qo'shing va bronlarni qabul qilishni boshlang.",
              reviewNotice: "Obyekt admin tekshiruvida. Tasdiqlangach ochiladi.",
              rooms: "Xonalar",
              reviews: "Sharhlar",
              edit: "Tahrirlash",
              publicPage: "Ochiq sahifani ko'rish",
              registered: "ta ro'yxatdan o'tgan",
              status: {
                pendingReview: "Tekshiruvda",
                active: "Faol",
                inactive: "Nofaol",
                suspended: "To'xtatilgan",
                deleted: "O'chirilgan",
              },
            }
          : {
              eyebrow: "Property Management",
              title: "My Hotels",
              register: "Register Hotel",
              emptyTitle: "No hotels yet",
              emptyBody: "Register your first property to start accepting bookings.",
              reviewNotice: "Under admin review — your hotel will go live once approved.",
              rooms: "Rooms",
              reviews: "Reviews",
              edit: "Edit",
              publicPage: "View public page",
              registered: "registered",
              status: {
                pendingReview: "Pending Review",
                active: "Active",
                inactive: "Inactive",
                suspended: "Suspended",
                deleted: "Deleted",
              },
            };

  const { data, loading, error, refetch } = useQuery<
    GetAgentHotelsQueryData,
    GetAgentHotelsQueryVars
  >(GET_AGENT_HOTELS_QUERY, {
    variables: { input: PAGINATION },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  // Refetch when tab regains focus
  const wasVisibleRef = useRef(false);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (isPageVisible) {
      if (!mountedRef.current) {
        mountedRef.current = true;
      } else if (!wasVisibleRef.current) {
        wasVisibleRef.current = true;
        void refetch();
      }
    } else {
      wasVisibleRef.current = false;
    }
  }, [isPageVisible, refetch]);

  const hotels = data?.getAgentHotels.list ?? [];
  const isAgent = member?.memberType === "AGENT";

  return (
    <>
      <style>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hotel-card { animation: cardFadeIn 0.2s ease-out both; }
      `}</style>

      <main className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {copy.eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {copy.title}
            </h1>
          </div>
          <Link
            href="/hotels/create"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Plus size={15} />
            {copy.register}
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error.message}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && hotels.length === 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-40 animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && hotels.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
            <Building2 size={40} className="text-slate-300" />
            <p className="mt-4 font-semibold text-slate-700">{copy.emptyTitle}</p>
            <p className="mt-1 text-sm text-slate-500">
              {copy.emptyBody}
            </p>
            <Link
              href="/hotels/create"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus size={14} />
              {copy.register}
            </Link>
          </div>
        )}

        {/* Hotel grid */}
        {hotels.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {hotels.map((hotel, idx) => {
              const thumbnail = hotel.hotelImages?.[0];
              const status = (
                hotel as typeof hotel & { hotelStatus?: HotelStatus }
              ).hotelStatus;
              const statusCfg = status ? STATUS_CONFIG[status] : null;

              return (
                <div
                  key={hotel._id}
                  className="hotel-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveMediaUrl(thumbnail)}
                        alt={hotel.hotelTitle}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 size={36} className="text-slate-300" />
                      </div>
                    )}
                    {statusCfg && (
                      <span
                        className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.className}`}
                      >
                        {copy.status[statusCfg.key as keyof typeof copy.status]}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {hotel.hotelTitle}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {getHotelTypeLabel(hotel.hotelType as HotelType, t)} ·{" "}
                          {getHotelLocationLabelLocalized(hotel.hotelLocation, t)}
                        </p>
                      </div>
                      {hotel.hotelRating > 0 && (
                        <div className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-slate-700">
                          <Star
                            size={13}
                            className="fill-amber-400 text-amber-400"
                          />
                          {hotel.hotelRating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* Pending notice for agents */}
                    {isAgent && status === "PENDING" && (
                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-600">
                        {copy.reviewNotice}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/hotels/${hotel._id}/rooms`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        <DoorOpen size={13} />
                        {copy.rooms}
                      </Link>
                      <Link
                        href={`/hotels/${hotel._id}/reviews`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        <Star size={13} />
                        {copy.reviews}
                      </Link>
                      <Link
                        href={`/hotels/${hotel._id}/edit`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        <PenLine size={13} />
                        {copy.edit}
                      </Link>
                      <Link
                        href={`/hotels/${hotel._id}`}
                        className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-slate-500 transition hover:border-slate-400 hover:bg-slate-50"
                        title={copy.publicPage}
                      >
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats bar */}
        {hotels.length > 0 && (
          <p className="text-center text-xs text-slate-400">
            {hotels.length.toLocaleString(locale)} {copy.registered}
          </p>
        )}
      </main>
    </>
  );
};

HotelsManagePage.auth = {
  roles: ["AGENT", "ADMIN", "ADMIN_OPERATOR"],
  requireApprovedHostAccess: true,
};

export default HotelsManagePage;
