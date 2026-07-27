import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  GET_ALL_CHATS_ADMIN_QUERY,
  GET_CHAT_QUERY,
  REASSIGN_CHAT_MUTATION,
} from "@/graphql/chat.gql";
import { GET_ALL_MEMBERS_BY_ADMIN_QUERY } from "@/graphql/member.gql";
import { errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import { formatNumber, timeAgo } from "@/lib/utils/format";
import type {
  GetAllChatsAdminQueryData,
  GetAllChatsAdminQueryVars,
  GetAllMembersByAdminQueryData,
} from "@/types/admin";
import type {
  ChatStatus,
  GetChatQueryData,
  GetChatQueryVars,
  ReassignChatMutationData,
  ReassignChatMutationVars,
} from "@/types/chat";
import type { PaginationInput } from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Hotel,
  Loader2,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Search,
  X,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

const STATUS_COLOR: Record<ChatStatus, string> = {
  WAITING: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
};

const SCOPE_COLOR: Record<string, string> = {
  HOTEL: "bg-sky-50 text-sky-700 border-sky-200",
  SUPPORT: "bg-violet-50 text-violet-700 border-violet-200",
};

const STATUS_TABS: Array<{ label: string; value: ChatStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Waiting", value: "WAITING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Closed", value: "CLOSED" },
];

function formatDateTime(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  });
}

/* ─── Chat detail drawer ───────────────────────────────────────────────────── */

function ChatDetailDrawer({
  chatId,
  onClose,
}: {
  chatId: string;
  onClose: () => void;
}) {
  const [newAgentId, setNewAgentId] = useState("");

  const { data, loading, refetch } = useQuery<
    GetChatQueryData,
    GetChatQueryVars
  >(GET_CHAT_QUERY, {
    variables: { chatId },
    fetchPolicy: "cache-and-network",
  });
  const chat = data?.getChat;

  const agentsInput = useMemo(
    () => ({ page: 1, limit: 50, sort: "createdAt", direction: -1 as const }),
    [],
  );
  const { data: agentsData } = useQuery<GetAllMembersByAdminQueryData>(
    GET_ALL_MEMBERS_BY_ADMIN_QUERY,
    { variables: { input: agentsInput }, fetchPolicy: "cache-first" },
  );
  const agents = (agentsData?.getAllMembersByAdmin.list ?? []).filter(
    (m) => m.memberType === "AGENT",
  );

  const [reassignChat, { loading: reassigning }] = useMutation<
    ReassignChatMutationData,
    ReassignChatMutationVars
  >(REASSIGN_CHAT_MUTATION, {
    onCompleted: async () => {
      setNewAgentId("");
      void refetch();
      await successAlert("Chat reassigned", "The conversation is now assigned to the selected agent.", {
        variant: "chat",
      });
    },
    onError: async (err) =>
      errorAlert("We couldn’t reassign this chat", getErrorMessage(err), {
        variant: "chat",
      }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Chat Detail
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              {chat?.chatScope === "SUPPORT" ? "Support Chat" : "Hotel Chat"}
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
          {loading && !chat ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Loader2 size={18} className="animate-spin text-slate-400" />
              <p className="text-sm text-slate-500">Loading chat...</p>
            </div>
          ) : chat ? (
            <>
              {/* meta */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <InfoRow label="Chat ID" value={chat._id} mono />
                <InfoRow label="Guest ID" value={chat.guestId} mono />
                {chat.hotelId && (
                  <InfoRow label="Hotel ID" value={chat.hotelId} mono />
                )}
                {chat.bookingId && (
                  <InfoRow label="Booking ID" value={chat.bookingId} mono />
                )}
                <InfoRow label="Scope" value={chat.chatScope} />
                {chat.supportTopic && (
                  <InfoRow label="Topic" value={chat.supportTopic} />
                )}
                <InfoRow label="Status" value={chat.chatStatus} />
                <InfoRow
                  label="Assigned Agent"
                  value={chat.assignedAgentId ?? "None"}
                />
                <InfoRow
                  label="Created"
                  value={formatDateTime(chat.createdAt)}
                />
                <InfoRow
                  label="Last Message"
                  value={timeAgo(chat.lastMessageAt)}
                />
                <InfoRow
                  label="Unread (Guest)"
                  value={String(chat.unreadGuestMessages)}
                />
                <InfoRow
                  label="Unread (Agent)"
                  value={String(chat.unreadAgentMessages)}
                />
              </div>

              {/* reassign */}
              {(chat.chatStatus === "WAITING" ||
                chat.chatStatus === "ACTIVE") && (
                <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Reassign Agent
                  </p>
                  <select
                    value={newAgentId}
                    onChange={(e) => setNewAgentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Select an agent…</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.memberNick}
                        {a.memberFullName ? ` (${a.memberFullName})` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!newAgentId || reassigning}
                    onClick={() =>
                      void reassignChat({ variables: { chatId, newAgentId } })
                    }
                    className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {reassigning ? "Reassigning…" : "Reassign"}
                  </button>
                </div>
              )}

              {/* messages */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Messages ({chat.messages?.length ?? 0})
                </p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {(chat.messages?.length ?? 0) === 0 ? (
                    <p className="text-sm text-slate-400 italic">No messages</p>
                  ) : (
                    chat.messages!.map((msg, i) => (
                      <div
                        key={i}
                        className={`rounded-xl p-3 text-sm ${
                          msg.senderType === "GUEST"
                            ? "bg-slate-100 text-slate-700 mr-8"
                            : "bg-sky-50 text-sky-800 ml-8"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wide">
                            {msg.senderType}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {timeAgo(msg.timestamp)}
                          </span>
                        </div>
                        {msg.content && (
                          <p className="leading-relaxed">{msg.content}</p>
                        )}
                        {msg.imageUrl && (
                          <Image
                            src={resolveMediaUrl(msg.imageUrl)}
                            alt="chat image"
                            width={512}
                            height={384}
                            unoptimized
                            className="mt-2 h-32 w-auto rounded-lg object-cover"
                          />
                        )}
                        {msg.fileUrl && (
                          <a
                            href={resolveMediaUrl(msg.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-sky-600 underline"
                          >
                            View file
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Close
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

const AdminChatsPage: NextPageWithAuth = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChatStatus | "ALL">("ALL");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const input = useMemo<PaginationInput>(
    () => ({ page, limit: PAGE_SIZE, sort: "lastMessageAt", direction: -1 }),
    [page],
  );

  const { data, loading, error } = useQuery<
    GetAllChatsAdminQueryData,
    GetAllChatsAdminQueryVars
  >(GET_ALL_CHATS_ADMIN_QUERY, {
    variables: {
      input,
      ...(statusFilter !== "ALL" ? { statusFilter } : {}),
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const chats = useMemo(() => data?.getAllChatsAdmin.list ?? [], [data?.getAllChatsAdmin.list]);
  const total = data?.getAllChatsAdmin.metaCounter.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    const q = searchTerm.toLowerCase();
    return chats.filter(
      (c) =>
        c._id.includes(q) ||
        c.guestId.includes(q) ||
        (c.hotelId?.includes(q) ?? false) ||
        (c.supportTopic?.toLowerCase().includes(q) ?? false),
    );
  }, [chats, searchTerm]);

  // Separate count queries per status for platform-wide totals
  const countInput = useMemo(
    () => ({
      page: 1,
      limit: 1,
      sort: "lastMessageAt",
      direction: -1 as const,
    }),
    [],
  );
  const { data: waitingCountData } = useQuery<
    GetAllChatsAdminQueryData,
    GetAllChatsAdminQueryVars
  >(GET_ALL_CHATS_ADMIN_QUERY, {
    variables: { input: countInput, statusFilter: "WAITING" },
    fetchPolicy: "cache-and-network",
  });
  const { data: activeCountData } = useQuery<
    GetAllChatsAdminQueryData,
    GetAllChatsAdminQueryVars
  >(GET_ALL_CHATS_ADMIN_QUERY, {
    variables: { input: countInput, statusFilter: "ACTIVE" },
    fetchPolicy: "cache-and-network",
  });
  const { data: closedCountData } = useQuery<
    GetAllChatsAdminQueryData,
    GetAllChatsAdminQueryVars
  >(GET_ALL_CHATS_ADMIN_QUERY, {
    variables: { input: countInput, statusFilter: "CLOSED" },
    fetchPolicy: "cache-and-network",
  });
  const statusCounts = {
    WAITING: waitingCountData?.getAllChatsAdmin.metaCounter.total ?? 0,
    ACTIVE: activeCountData?.getAllChatsAdmin.metaCounter.total ?? 0,
    CLOSED: closedCountData?.getAllChatsAdmin.metaCounter.total ?? 0,
  };

  const handleTabChange = useCallback((val: ChatStatus | "ALL") => {
    setStatusFilter(val);
    setPage(1);
  }, []);

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
            Chat Management
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Monitor all active and closed chats. View message history and track
            response times.
          </p>
        </div>
      </section>

      {/* summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total"
          value={total}
          icon={<MessagesSquare size={20} />}
          tone="sky"
        />
        <SummaryCard
          label="Waiting"
          value={statusCounts.WAITING}
          icon={<Clock size={20} />}
          tone="amber"
        />
        <SummaryCard
          label="Active"
          value={statusCounts.ACTIVE}
          icon={<MessageCircle size={20} />}
          tone="emerald"
        />
        <SummaryCard
          label="Closed"
          value={statusCounts.CLOSED}
          icon={<MessageSquare size={20} />}
          tone="slate"
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
              placeholder="Search by ID, guest, hotel, or topic..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20"
            />
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <ErrorNotice message={getErrorMessage(error)} />
          </div>
        ) : null}

        {loading && chats.length === 0 ? (
          <div className="flex items-center justify-center gap-3 p-12">
            <Loader2 size={18} className="animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading chats...</p>
          </div>
        ) : null}

        {!loading && filteredChats.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              No chats found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : null}

        {filteredChats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Chat
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Scope
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Messages
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Unread
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Last Msg
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredChats.map((c) => {
                  const totalUnread =
                    c.unreadGuestMessages + c.unreadAgentMessages;
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/50"
                    >
                      {/* Chat info */}
                      <td className="px-6 py-3.5">
                        <div className="min-w-0">
                          <p className="font-mono text-[11px] text-slate-500 truncate">
                            {c._id}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {c.chatScope === "SUPPORT" ? (
                              <span className="inline-flex items-center gap-1">
                                <Headphones size={10} />
                                {c.supportTopic ?? "General"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <Hotel size={10} />
                                Hotel Chat
                              </span>
                            )}
                          </p>
                        </div>
                      </td>
                      {/* Scope */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${SCOPE_COLOR[c.chatScope] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
                        >
                          {c.chatScope}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[c.chatStatus]}`}
                        >
                          {c.chatStatus}
                        </span>
                      </td>
                      {/* Messages count */}
                      <td className="px-4 py-3.5 text-sm text-slate-400">—</td>
                      {/* Unread */}
                      <td className="px-4 py-3.5">
                        {totalUnread > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                            {totalUnread}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0</span>
                        )}
                      </td>
                      {/* Last message */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-500">
                          {c.lastMessageAt ? timeAgo(c.lastMessageAt) : "—"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedChatId(c._id)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                          title="View chat"
                        >
                          <MessageSquare size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* chat detail drawer */}
      {selectedChatId ? (
        <ChatDetailDrawer
          chatId={selectedChatId}
          onClose={() => setSelectedChatId(null)}
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
  tone: "sky" | "amber" | "emerald" | "slate";
}) {
  const bg: Record<string, string> = {
    sky: "bg-sky-50 border-sky-200",
    amber: "bg-amber-50 border-amber-200",
    emerald: "bg-emerald-50 border-emerald-200",
    slate: "bg-white border-slate-200",
  };
  const iBg: Record<string, string> = {
    sky: "bg-sky-100 text-sky-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
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

AdminChatsPage.auth = {
  roles: ["ADMIN", "ADMIN_OPERATOR"],
};

export default AdminChatsPage;
