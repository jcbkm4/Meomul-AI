import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useMemo, useState, useCallback } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  GET_ALL_ROOMS_ADMIN_QUERY,
  UPDATE_ROOM_BY_ADMIN_MUTATION,
} from "@/graphql/hotel.gql";
import { resolveImageUrl } from "@/lib/config/env";
import { getErrorMessage } from "@/lib/utils/error";
import { formatCurrencyKrw, formatNumber } from "@/lib/utils/format";
import type {
  AdminRoomListItem,
  GetAllRoomsAdminQueryData,
  GetAllRoomsAdminQueryVars,
  PaginationInput,
  RoomStatus,
  RoomType,
  UpdateRoomByAdminMutationData,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  Bed,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Eye,
  Loader2,
  Pencil,
  Ruler,
  Search,
  Wrench,
  X,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

const ROOM_STATUS_COLOR: Record<RoomStatus, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BOOKED: "bg-sky-50 text-sky-700 border-sky-200",
  MAINTENANCE: "bg-amber-50 text-amber-700 border-amber-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
};

const ROOM_TYPE_COLOR: Record<RoomType, string> = {
  STANDARD: "bg-slate-50 text-slate-600 border-slate-200",
  DELUXE: "bg-sky-50 text-sky-700 border-sky-200",
  SUITE: "bg-violet-50 text-violet-700 border-violet-200",
  FAMILY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PREMIUM: "bg-amber-50 text-amber-700 border-amber-200",
  PENTHOUSE: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_TABS: Array<{ label: string; value: RoomStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Booked", value: "BOOKED" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Inactive", value: "INACTIVE" },
];

/* ─── Edit drawer ──────────────────────────────────────────────────────────── */

function EditRoomDrawer({
  room,
  onClose,
  onSaved,
}: {
  room: AdminRoomListItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<RoomStatus>(room.roomStatus);

  const [updateRoom, { loading, error }] =
    useMutation<UpdateRoomByAdminMutationData>(UPDATE_ROOM_BY_ADMIN_MUTATION);

  const handleSave = async () => {
    await updateRoom({
      variables: {
        input: {
          _id: room._id,
          roomStatus: status,
        },
      },
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Edit Room
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              {room.roomName}
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
          {room.roomImages.length > 0 && (
            <div className="relative h-44 overflow-hidden rounded-xl">
              <Image
                src={resolveImageUrl(room.roomImages[0])}
                alt={room.roomName}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 28rem"
                className="object-cover"
              />
            </div>
          )}

          {/* read-only info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <InfoRow label="ID" value={room._id} mono />
            <InfoRow label="Hotel ID" value={room.hotelId} mono />
            <InfoRow label="Type" value={room.roomType} />
            <InfoRow label="Bed" value={room.bedType} />
            <InfoRow label="View" value={room.viewType} />
            <InfoRow label="Max Guests" value={String(room.maxOccupancy)} />
            <InfoRow
              label="Size"
              value={room.roomSize ? `${room.roomSize} m²` : "N/A"}
            />
            <InfoRow label="Price" value={formatCurrencyKrw(room.basePrice)} />
            <InfoRow label="Available" value={String(room.availableRooms)} />
          </div>

          {/* editable status */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Room Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BOOKED">BOOKED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="INACTIVE">INACTIVE</option>
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

/* ─── Main page ────────────────────────────────────────────────────────────── */

const AdminRoomsPage: NextPageWithAuth = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "ALL">("ALL");
  const [editingRoom, setEditingRoom] = useState<AdminRoomListItem | null>(
    null,
  );

  const input = useMemo<PaginationInput>(
    () => ({ page, limit: PAGE_SIZE, sort: "createdAt", direction: -1 }),
    [page],
  );

  const { data, loading, error, refetch } = useQuery<
    GetAllRoomsAdminQueryData,
    GetAllRoomsAdminQueryVars
  >(GET_ALL_ROOMS_ADMIN_QUERY, {
    variables: {
      input,
      ...(statusFilter !== "ALL" ? { statusFilter } : {}),
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const rooms = useMemo(() => data?.getAllRoomsAdmin.list ?? [], [data?.getAllRoomsAdmin.list]);
  const total = data?.getAllRoomsAdmin.metaCounter.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) return rooms;
    const q = searchTerm.toLowerCase();
    return rooms.filter(
      (r) =>
        r.roomName.toLowerCase().includes(q) ||
        r.roomType.toLowerCase().includes(q) ||
        r._id.includes(q) ||
        r.hotelId.includes(q),
    );
  }, [rooms, searchTerm]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {
      AVAILABLE: 0,
      BOOKED: 0,
      MAINTENANCE: 0,
      INACTIVE: 0,
    };
    rooms.forEach((r) => {
      if (c[r.roomStatus] !== undefined) c[r.roomStatus] += 1;
    });
    return c;
  }, [rooms]);

  const handleTabChange = useCallback((val: RoomStatus | "ALL") => {
    setStatusFilter(val);
    setPage(1);
  }, []);

  return (
    <main className="w-full space-y-6 pb-12">
      {/* header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-50 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
            Room Management
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Monitor all rooms across hotels. Change room statuses and review
            availability.
          </p>
        </div>
      </section>

      {/* summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total"
          value={total}
          icon={<DoorOpen size={20} />}
          tone="sky"
        />
        <SummaryCard
          label="Available"
          value={statusCounts.AVAILABLE}
          icon={<BedDouble size={20} />}
          tone="emerald"
        />
        <SummaryCard
          label="Booked"
          value={statusCounts.BOOKED}
          icon={<Bed size={20} />}
          tone="violet"
        />
        <SummaryCard
          label="Maintenance"
          value={statusCounts.MAINTENANCE}
          icon={<Wrench size={20} />}
          tone="amber"
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
              placeholder="Search by name, type, room or hotel ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20"
            />
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <ErrorNotice message={getErrorMessage(error)} />
          </div>
        ) : null}

        {loading && rooms.length === 0 ? (
          <div className="flex items-center justify-center gap-3 p-12">
            <Loader2 size={18} className="animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading rooms...</p>
          </div>
        ) : null}

        {!loading && filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              No rooms found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : null}

        {filteredRooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Room
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Bed / View
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Size
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Avail
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/50"
                  >
                    {/* Room with thumbnail */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {r.roomImages.length > 0 ? (
                          <Image
                            src={resolveImageUrl(r.roomImages[0])}
                            alt={r.roomName}
                            width={56}
                            height={40}
                            unoptimized
                            className="h-10 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100">
                            <Bed size={16} className="text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {r.roomName}
                          </p>
                          <p className="mt-0.5 text-[11px] font-mono text-slate-400 truncate">
                            {r.hotelId}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${ROOM_TYPE_COLOR[r.roomType]}`}
                      >
                        {r.roomType}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${ROOM_STATUS_COLOR[r.roomStatus]}`}
                      >
                        {r.roomStatus}
                      </span>
                    </td>
                    {/* Bed / View */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <BedDouble size={11} />
                          {r.bedType}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye size={11} />
                          {r.viewType}
                        </span>
                      </div>
                    </td>
                    {/* Size */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Ruler size={11} />
                        {r.roomSize ? `${r.roomSize} m²` : "-"}
                      </span>
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {formatCurrencyKrw(r.basePrice)}
                    </td>
                    {/* Available */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-sm font-semibold ${r.availableRooms > 0 ? "text-emerald-600" : "text-rose-500"}`}
                      >
                        {r.availableRooms}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setEditingRoom(r)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                        title="Edit room"
                      >
                        <Pencil size={14} />
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

      {/* edit drawer */}
      {editingRoom ? (
        <EditRoomDrawer
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSaved={() => void refetch()}
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
  tone: "sky" | "emerald" | "violet" | "amber";
}) {
  const bg: Record<string, string> = {
    sky: "bg-sky-50 border-sky-200",
    emerald: "bg-emerald-50 border-emerald-200",
    violet: "bg-violet-50 border-violet-200",
    amber: "bg-amber-50 border-amber-200",
  };
  const iBg: Record<string, string> = {
    sky: "bg-sky-100 text-sky-600",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
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

AdminRoomsPage.auth = {
  roles: ["ADMIN", "ADMIN_OPERATOR"],
};

export default AdminRoomsPage;
