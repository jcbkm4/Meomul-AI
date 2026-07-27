import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  DELETE_MEMBER_BY_ADMIN_MUTATION,
  GET_ALL_MEMBERS_BY_ADMIN_QUERY,
  GET_HOST_APPLICATIONS_BY_ADMIN_QUERY,
  REVIEW_HOST_APPLICATION_MUTATION,
  UPDATE_MEMBER_BY_ADMIN_MUTATION,
} from "@/graphql/member.gql";
import { resolveImageUrl } from "@/lib/config/env";
import { confirmAction, errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import type {
  AdminMemberItem,
  DeleteMemberByAdminMutationData,
  DeleteMemberByAdminMutationVars,
  GetAllMembersByAdminQueryData,
  GetAllMembersByAdminQueryVars,
  MemberStatus,
  MemberUpdateInput,
  SubscriptionTier,
  UpdateMemberByAdminMutationData,
  UpdateMemberByAdminMutationVars,
} from "@/types/admin";
import type {
  GetHostApplicationsByAdminQueryData,
  GetHostApplicationsByAdminQueryVars,
  HostAccessStatus,
  MemberType,
  ReviewHostApplicationMutationData,
  ReviewHostApplicationMutationVars,
} from "@/types/auth";
import type { PaginationInput } from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Heart,
  Loader2,
  ArrowUpRight,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCog,
  Users,
  UsersRound,
  X,
  Check,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

const MEMBER_TYPE_COLOR: Record<MemberType, string> = {
  USER: "bg-sky-50 text-sky-700 border-sky-200",
  AGENT: "bg-violet-50 text-violet-700 border-violet-200",
  ADMIN: "bg-rose-50 text-rose-700 border-rose-200",
  ADMIN_OPERATOR: "bg-orange-50 text-orange-700 border-orange-200",
};

const STATUS_COLOR: Record<MemberStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BLOCK: "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-rose-50 text-rose-700 border-rose-200",
};

const TIER_COLOR: Record<SubscriptionTier, string> = {
  FREE: "bg-slate-50 text-slate-600 border-slate-200",
  BASIC: "bg-sky-50 text-sky-700 border-sky-200",
  PREMIUM: "bg-violet-50 text-violet-700 border-violet-200",
  ELITE: "bg-amber-50 text-amber-700 border-amber-200",
};

const HOST_ACCESS_COLOR: Record<HostAccessStatus, string> = {
  NONE: "bg-slate-50 text-slate-600 border-slate-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

type HostAccessFilter = "ALL" | HostAccessStatus;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
}

/* ─── Edit drawer ──────────────────────────────────────────────────────────── */

function EditMemberDrawer({
  member,
  onClose,
  onSaved,
}: {
  member: AdminMemberItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<MemberStatus>(member.memberStatus);
  const [tier, setTier] = useState<SubscriptionTier>(member.subscriptionTier);

  const [updateMember, { loading, error }] = useMutation<
    UpdateMemberByAdminMutationData,
    UpdateMemberByAdminMutationVars
  >(UPDATE_MEMBER_BY_ADMIN_MUTATION);

  const handleSave = async () => {
    const input: MemberUpdateInput = { _id: member._id };
    if (status !== member.memberStatus) input.memberStatus = status;
    if (tier !== member.subscriptionTier) input.subscriptionTier = tier;
    await updateMember({ variables: { input } });
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
              Edit Member
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              {member.memberNick}
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
          {/* read-only info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <InfoRow label="ID" value={member._id} mono />
            <InfoRow label="Phone" value={member.memberPhone} />
            <InfoRow label="Full Name" value={member.memberFullName ?? "-"} />
            <InfoRow label="Type" value={member.memberType} />
            <InfoRow label="Host Access" value={member.hostAccessStatus ?? "NONE"} />
            <InfoRow label="Joined" value={formatDate(member.createdAt)} />
            <InfoRow label="Points" value={formatNumber(member.memberPoints)} />
            <InfoRow label="Rank" value={member.memberRank.toFixed(1)} />
          </div>

          {/* editable status */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MemberStatus)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="BLOCK">BLOCK</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* editable tier */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Subscription Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as SubscriptionTier)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="FREE">FREE</option>
              <option value="BASIC">BASIC</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="ELITE">ELITE</option>
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

const AdminMembersPage: NextPageWithAuth = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [hostAccessFilter, setHostAccessFilter] =
    useState<HostAccessFilter>("ALL");
  const [editingMember, setEditingMember] = useState<AdminMemberItem | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [quickApprovingId, setQuickApprovingId] = useState<string | null>(null);

  const input = useMemo<PaginationInput>(
    () => ({ page, limit: PAGE_SIZE, sort: "createdAt", direction: -1 }),
    [page],
  );

  const { data, loading, error, refetch } = useQuery<
    GetAllMembersByAdminQueryData,
    GetAllMembersByAdminQueryVars
  >(GET_ALL_MEMBERS_BY_ADMIN_QUERY, {
    variables: { input },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const { data: pendingApplicationsData, refetch: refetchPendingApplications } = useQuery<
    GetHostApplicationsByAdminQueryData,
    GetHostApplicationsByAdminQueryVars
  >(GET_HOST_APPLICATIONS_BY_ADMIN_QUERY, {
    variables: { statusFilter: "PENDING" },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const [deleteMember, { loading: deleting }] = useMutation<
    DeleteMemberByAdminMutationData,
    DeleteMemberByAdminMutationVars
  >(DELETE_MEMBER_BY_ADMIN_MUTATION);

  const [reviewHostApplication] = useMutation<
    ReviewHostApplicationMutationData,
    ReviewHostApplicationMutationVars
  >(REVIEW_HOST_APPLICATION_MUTATION);

  const members = useMemo(() => data?.getAllMembersByAdmin.list ?? [], [data?.getAllMembersByAdmin.list]);
  const total = data?.getAllMembersByAdmin.metaCounter.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesHostAccess =
        hostAccessFilter === "ALL" ||
        (m.memberType === "AGENT" &&
          (m.hostAccessStatus ?? "NONE") === hostAccessFilter);

      if (!matchesHostAccess) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      return (
        m.memberNick.toLowerCase().includes(q) ||
        (m.memberFullName?.toLowerCase().includes(q) ?? false) ||
        m.memberPhone.includes(q) ||
        m._id.includes(q)
      );
    });
  }, [hostAccessFilter, members, searchTerm]);

  const pendingAgentCount = useMemo(
    () =>
      members.filter(
        (member) =>
          member.memberType === "AGENT" &&
          (member.hostAccessStatus ?? "NONE") === "PENDING",
      ).length,
    [members],
  );

  const pendingApplicationsByApplicantId = useMemo(
    () =>
      new Map(
        (pendingApplicationsData?.getHostApplicationsByAdmin ?? []).map((application) => [
          application.applicantMemberId,
          application,
        ]),
      ),
    [pendingApplicationsData?.getHostApplicationsByAdmin],
  );

  const handleDelete = useCallback(
    async (memberId: string) => {
      try {
        await deleteMember({ variables: { memberId } });
        setConfirmDelete(null);
        await refetch();
        await successAlert("Member removed", "The member account was deleted.");
      } catch (err) {
        await errorAlert("Delete member", getErrorMessage(err));
      }
    },
    [deleteMember, refetch],
  );

  const handleQuickApprove = useCallback(
    async (member: AdminMemberItem) => {
      const application = pendingApplicationsByApplicantId.get(member._id);
      if (!application) {
        await errorAlert(
          "No pending application found",
          "This member no longer has a pending host application to review.",
        );
        return;
      }

      const confirmed = await confirmAction({
        title: "Approve this pending agent",
        text: `${member.memberNick} will immediately move into approved host access.`,
        confirmText: "Approve agent",
        variant: "profile",
      });
      if (!confirmed) return;

      try {
        setQuickApprovingId(member._id);
        await reviewHostApplication({
          variables: {
            input: {
              applicationId: application._id,
              status: "APPROVED",
            },
          },
        });
        await Promise.all([refetch(), refetchPendingApplications()]);
        await successAlert(
          "Agent access approved",
          `${member.memberNick} now has approved host access.`,
          { variant: "profile" },
        );
      } catch (mutationError) {
        await errorAlert("We couldn’t approve this agent", getErrorMessage(mutationError), {
          variant: "profile",
        });
      } finally {
        setQuickApprovingId(null);
      }
    },
    [pendingApplicationsByApplicantId, reviewHostApplication, refetch, refetchPendingApplications],
  );

  // count by type (from server)
  const typeCounts = data?.getAllMembersByAdmin.typeCounts ?? {
    USER: 0,
    AGENT: 0,
    ADMIN: 0,
    ADMIN_OPERATOR: 0,
  };

  return (
    <main className="w-full space-y-6 pb-12">
      {/* header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-50 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
            Member Management
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            View, search, and manage all platform members. Edit status or
            subscription tiers.
          </p>
        </div>
      </section>

      {/* summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          label="Total"
          value={total}
          icon={<UsersRound size={20} />}
          tone="sky"
        />
        <SummaryCard
          label="Users"
          value={typeCounts.USER}
          icon={<Users size={20} />}
          tone="slate"
        />
        <SummaryCard
          label="Agents"
          value={typeCounts.AGENT}
          icon={<UserCog size={20} />}
          tone="violet"
        />
        <SummaryCard
          label="Admins"
          value={typeCounts.ADMIN + typeCounts.ADMIN_OPERATOR}
          icon={<Shield size={20} />}
          tone="rose"
        />
        <SummaryCard
          label="Pending Agents"
          value={pendingAgentCount}
          icon={<ShieldAlert size={20} />}
          tone="amber"
          href="/admin/host-applications?status=PENDING"
        />
      </section>

      {/* search + table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div className="flex w-full max-w-2xl flex-col gap-3 md:flex-row">
            <div className="relative w-full max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, or ID..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20"
              />
            </div>
            <select
              value={hostAccessFilter}
              onChange={(e) =>
                setHostAccessFilter(e.target.value as HostAccessFilter)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 md:max-w-[220px]"
            >
              <option value="ALL">All host access</option>
              <option value="NONE">Not started</option>
              <option value="PENDING">Pending agents</option>
              <option value="APPROVED">Approved agents</option>
              <option value="REJECTED">Rejected agents</option>
            </select>
          </div>
          <p className="text-xs text-slate-500">
            Showing {filteredMembers.length} of {total} members
          </p>
        </div>

        {error ? (
          <div className="p-6">
            <ErrorNotice message={getErrorMessage(error)} />
          </div>
        ) : null}

        {loading && members.length === 0 ? (
          <div className="flex items-center justify-center gap-3 p-12">
            <Loader2 size={18} className="animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading members...</p>
          </div>
        ) : null}

        {!loading && filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              No members found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : null}

        {filteredMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Member
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Host access
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Subscription
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Stats
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr
                    key={m._id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {m.memberImage ? (
                          <Image
                            src={resolveImageUrl(m.memberImage)}
                            alt={m.memberNick}
                            width={36}
                            height={36}
                            unoptimized
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                            {m.memberNick.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {m.memberNick}
                          </p>
                          <p className="text-xs text-slate-500">
                            {m.memberFullName ?? m.memberPhone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${MEMBER_TYPE_COLOR[m.memberType]}`}
                      >
                        {m.memberType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[m.memberStatus]}`}
                      >
                        {m.memberStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {m.memberType === "AGENT" ? (
                        <div className="flex flex-col items-start gap-1.5">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                              HOST_ACCESS_COLOR[m.hostAccessStatus ?? "NONE"]
                            }`}
                          >
                            {m.hostAccessStatus ?? "NONE"}
                          </span>
                          {(m.hostAccessStatus ?? "NONE") === "PENDING" ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void handleQuickApprove(m)}
                                disabled={
                                  quickApprovingId === m._id ||
                                  !pendingApplicationsByApplicantId.has(m._id)
                                }
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {quickApprovingId === m._id ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : (
                                  <Check size={11} />
                                )}
                                Approve
                              </button>
                              <Link
                                href="/admin/host-applications?status=PENDING"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 transition hover:text-slate-900"
                              >
                                Review
                                <ArrowUpRight size={11} />
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TIER_COLOR[m.subscriptionTier]}`}
                      >
                        {m.subscriptionTier !== "FREE" ? (
                          <Crown size={10} />
                        ) : null}
                        {m.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Eye size={11} />
                          {formatNumber(m.memberViews)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart size={11} />
                          {formatNumber(m.memberLikes)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingMember(m)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                          title="Edit member"
                        >
                          <UserCog size={14} />
                        </button>
                        {confirmDelete === m._id ? (
                          <button
                            type="button"
                            onClick={() => void handleDelete(m._id)}
                            disabled={deleting}
                            className="rounded-lg border border-rose-300 bg-rose-50 p-1.5 text-rose-600 transition hover:bg-rose-100"
                            title="Confirm delete"
                          >
                            {deleting ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <ShieldAlert size={14} />
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(m._id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:border-rose-300 hover:text-rose-500"
                            title="Delete member"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
      {editingMember ? (
        <EditMemberDrawer
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={() => void refetch()}
        />
      ) : null}
    </main>
  );
};

function SummaryCard({
  label,
  value,
  icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "sky" | "slate" | "violet" | "rose" | "amber";
  href?: string;
}) {
  const bg: Record<string, string> = {
    sky: "bg-sky-50 border-sky-200",
    slate: "bg-white border-slate-200",
    violet: "bg-violet-50 border-violet-200",
    rose: "bg-rose-50 border-rose-200",
    amber: "bg-amber-50 border-amber-200",
  };
  const iBg: Record<string, string> = {
    sky: "bg-sky-100 text-sky-600",
    slate: "bg-slate-100 text-slate-600",
    violet: "bg-violet-100 text-violet-600",
    rose: "bg-rose-100 text-rose-600",
    amber: "bg-amber-100 text-amber-600",
  };
  const content = (
    <>
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
      {href ? (
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
          Review applications
          <ArrowUpRight size={12} />
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-slate-300 ${bg[tone]}`}
      >
        {content}
      </Link>
    );
  }

  return <article className={`rounded-2xl border p-4 ${bg[tone]}`}>{content}</article>;
}

AdminMembersPage.auth = {
  roles: ["ADMIN", "ADMIN_OPERATOR"],
};

export default AdminMembersPage;
