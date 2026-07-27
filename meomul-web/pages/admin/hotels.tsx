import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  GET_ALL_HOTELS_ADMIN_QUERY,
  UPDATE_HOTEL_BY_ADMIN_MUTATION,
} from "@/graphql/hotel.gql";
import { resolveImageUrl } from "@/lib/config/env";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import type {
  AdminHotelListItem,
  BadgeLevel,
  GetAllHotelsAdminQueryData,
  GetAllHotelsAdminQueryVars,
  HotelStatus,
  HotelUpdateInput,
  PaginationInput,
  UpdateHotelByAdminMutationData,
  UpdateHotelByAdminMutationVars,
  VerificationStatus,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Hotel,
  Loader2,
  MapPin,
  Pencil,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

const HOTEL_STATUS_COLOR: Record<HotelStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
  SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

const VERIFICATION_COLOR: Record<VerificationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

const BADGE_COLOR: Record<BadgeLevel, string> = {
  NONE: "bg-slate-50 text-slate-500 border-slate-200",
  VERIFIED: "bg-sky-50 text-sky-700 border-sky-200",
  SUPERHOST: "bg-violet-50 text-violet-700 border-violet-200",
  INSPECTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
}

/* ─── Edit drawer ──────────────────────────────────────────────────────────── */

function EditHotelDrawer({
  hotel,
  onClose,
  onSaved,
}: {
  hotel: AdminHotelListItem;
  onClose: () => void;
  onSaved: () => Promise<unknown> | void;
}) {
  const [status, setStatus] = useState<HotelStatus>(hotel.hotelStatus);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    hotel.verificationStatus,
  );
  const [badge, setBadge] = useState<BadgeLevel>(hotel.badgeLevel);

  const [updateHotel, { loading, error }] = useMutation<
    UpdateHotelByAdminMutationData,
    UpdateHotelByAdminMutationVars
  >(UPDATE_HOTEL_BY_ADMIN_MUTATION);

  const handleSave = async () => {
    const input: HotelUpdateInput = { _id: hotel._id };
    if (status !== hotel.hotelStatus) input.hotelStatus = status;
    if (verificationStatus !== hotel.verificationStatus) {
      input.verificationStatus = verificationStatus;
    }
    if (badge !== hotel.badgeLevel) input.badgeLevel = badge;
    await updateHotel({ variables: { input } });
    await Promise.resolve(onSaved());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Edit Hotel
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              {hotel.hotelTitle}
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
          {/* thumbnail */}
          {hotel.hotelImages.length > 0 && (
            <div className="relative h-44 overflow-hidden rounded-xl">
              <Image
                src={resolveImageUrl(hotel.hotelImages[0])}
                alt={hotel.hotelTitle}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 28rem"
                className="object-cover"
              />
            </div>
          )}

          {/* read-only info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <InfoRow label="ID" value={hotel._id} mono />
            <InfoRow label="Location" value={hotel.hotelLocation} />
            <InfoRow label="Type" value={hotel.hotelType} />
            <InfoRow label="Rating" value={hotel.hotelRating.toFixed(1)} />
            <InfoRow label="Likes" value={formatNumber(hotel.hotelLikes)} />
            <InfoRow
              label="Star Rating"
              value={hotel.starRating ? `${hotel.starRating} Star` : "N/A"}
            />
            <InfoRow label="Verification" value={hotel.verificationStatus} />
            <InfoRow
              label="Safe Stay"
              value={hotel.safeStayCertified ? "Yes" : "No"}
            />
            <InfoRow label="Strikes" value={String(hotel.warningStrikes)} />
            {hotel.createdAt && (
              <InfoRow label="Created" value={formatDate(hotel.createdAt)} />
            )}
          </div>

          {/* editable status */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Hotel Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as HotelStatus)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          {/* editable badge */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Verification
            </label>
            <select
              value={verificationStatus}
              onChange={(e) =>
                setVerificationStatus(e.target.value as VerificationStatus)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="PENDING">PENDING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Badge Level
            </label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value as BadgeLevel)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="NONE">NONE</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="SUPERHOST">SUPERHOST</option>
              <option value="INSPECTED">INSPECTED</option>
            </select>
          </div>

          {error ? <ErrorNotice message={getErrorMessage(error)} /> : null}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
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

/* ─── Status filter tabs ───────────────────────────────────────────────────── */

const STATUS_TABS: Array<{ label: string; value: HotelStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

/* ─── Main page ────────────────────────────────────────────────────────────── */

const AdminHotelsPage: NextPageWithAuth = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<HotelStatus | "ALL">("ALL");
  const [editingHotel, setEditingHotel] = useState<AdminHotelListItem | null>(
    null,
  );

  const input = useMemo<PaginationInput>(
    () => ({ page, limit: PAGE_SIZE, sort: "createdAt", direction: -1 }),
    [page],
  );

  const { data, loading, error, refetch } = useQuery<
    GetAllHotelsAdminQueryData,
    GetAllHotelsAdminQueryVars
  >(GET_ALL_HOTELS_ADMIN_QUERY, {
    variables: {
      input,
      ...(statusFilter !== "ALL" ? { statusFilter } : {}),
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const hotels = useMemo(() => data?.getAllHotelsAdmin.list ?? [], [data?.getAllHotelsAdmin.list]);
  const total = data?.getAllHotelsAdmin.metaCounter.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filteredHotels = useMemo(() => {
    if (!searchTerm.trim()) return hotels;
    const q = searchTerm.toLowerCase();
    return hotels.filter(
      (h) =>
        h.hotelTitle.toLowerCase().includes(q) ||
        h.hotelLocation.toLowerCase().includes(q) ||
        h._id.includes(q),
    );
  }, [hotels, searchTerm]);

  // counts per status from current page data
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {
      PENDING: 0,
      ACTIVE: 0,
      INACTIVE: 0,
      SUSPENDED: 0,
    };
    hotels.forEach((h) => {
      if (c[h.hotelStatus] !== undefined) c[h.hotelStatus] += 1;
    });
    return c;
  }, [hotels]);

  const handleTabChange = useCallback((val: HotelStatus | "ALL") => {
    setStatusFilter(val);
    setPage(1);
  }, []);

  return (
    <main className="w-full space-y-6 pb-12">
      {/* header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-50 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
            Hotel Management
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Review, approve, and manage all hotels on the platform. Change
            status, badge levels, and monitor strikes.
          </p>
        </div>
      </section>

      {/* summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total"
          value={total}
          icon={<Building2 size={20} />}
          tone="sky"
        />
        <SummaryCard
          label="Active"
          value={statusCounts.ACTIVE}
          icon={<ShieldCheck size={20} />}
          tone="emerald"
        />
        <SummaryCard
          label="Pending"
          value={statusCounts.PENDING}
          icon={<Hotel size={20} />}
          tone="amber"
        />
        <SummaryCard
          label="Suspended"
          value={statusCounts.SUSPENDED}
          icon={<AlertTriangle size={20} />}
          tone="rose"
        />
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
              placeholder="Search by title, location, or ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20"
            />
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <ErrorNotice message={getErrorMessage(error)} />
          </div>
        ) : null}

        {loading && hotels.length === 0 ? (
          <div className="flex items-center justify-center gap-3 p-12">
            <Loader2 size={18} className="animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading hotels...</p>
          </div>
        ) : null}

        {!loading && filteredHotels.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              No hotels found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : null}

        {filteredHotels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Hotel
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Verification
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Badge
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Stats
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Strikes
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((h) => (
                  <tr
                    key={h._id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/50"
                  >
                    {/* Hotel cell with thumbnail */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {h.hotelImages.length > 0 ? (
                          <Image
                            src={resolveImageUrl(h.hotelImages[0])}
                            alt={h.hotelTitle}
                            width={56}
                            height={40}
                            unoptimized
                            className="h-10 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100">
                            <Hotel size={16} className="text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {h.hotelTitle}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={10} />
                            {h.hotelLocation}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3.5">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {h.hotelType}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${HOTEL_STATUS_COLOR[h.hotelStatus]}`}
                      >
                        {h.hotelStatus}
                      </span>
                    </td>
                    {/* Verification */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${VERIFICATION_COLOR[h.verificationStatus]}`}
                      >
                        {h.verificationStatus === "VERIFIED" ? (
                          <BadgeCheck size={10} />
                        ) : null}
                        {h.verificationStatus}
                      </span>
                    </td>
                    {/* Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${BADGE_COLOR[h.badgeLevel]}`}
                      >
                        {h.badgeLevel !== "NONE" ? <Award size={10} /> : null}
                        {h.badgeLevel}
                      </span>
                    </td>
                    {/* Stats */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Star size={11} className="text-amber-500" />
                          {h.hotelRating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart size={11} />
                          {formatNumber(h.hotelLikes)}
                        </span>
                      </div>
                    </td>
                    {/* Strikes */}
                    <td className="px-4 py-3.5">
                      {h.warningStrikes > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          <AlertTriangle size={10} />
                          {h.warningStrikes}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">0</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingHotel(h)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                          title="Edit hotel"
                        >
                          <Pencil size={14} />
                        </button>
                        <a
                          href={`/hotels/${h._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                          title="View hotel page"
                        >
                          <Eye size={14} />
                        </a>
                      </div>
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

      {/* edit drawer */}
        {editingHotel ? (
          <EditHotelDrawer
            hotel={editingHotel}
            onClose={() => setEditingHotel(null)}
            onSaved={() => refetch()}
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
  tone: "sky" | "emerald" | "amber" | "rose";
}) {
  const bg: Record<string, string> = {
    sky: "bg-sky-50 border-sky-200",
    emerald: "bg-emerald-50 border-emerald-200",
    amber: "bg-amber-50 border-amber-200",
    rose: "bg-rose-50 border-rose-200",
  };
  const iBg: Record<string, string> = {
    sky: "bg-sky-100 text-sky-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
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

AdminHotelsPage.auth = {
  roles: ["ADMIN", "ADMIN_OPERATOR"],
};

export default AdminHotelsPage;
