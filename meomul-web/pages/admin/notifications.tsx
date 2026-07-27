import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState, useCallback } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  DELETE_NOTIFICATION_MUTATION,
  GET_ALL_NOTIFICATIONS_ADMIN_QUERY,
  MARK_AS_READ_MUTATION,
} from "@/graphql/notification.gql";
import { errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber, timeAgo } from "@/lib/utils/format";
import type {
  GetAllNotificationsAdminQueryData,
  GetAllNotificationsAdminQueryVars,
  NotificationItem,
} from "@/types/admin";
import type { PaginationInput } from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  Bell,
  BellOff,
  BellRing,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Mail,
  MailOpen,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  BOOKING: {
    icon: <BookOpen size={14} />,
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  REVIEW: {
    icon: <Mail size={14} />,
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  CHAT: {
    icon: <Bell size={14} />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  SYSTEM: {
    icon: <ShieldAlert size={14} />,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  SUBSCRIPTION: {
    icon: <BellRing size={14} />,
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const DEFAULT_TYPE = {
  icon: <Bell size={14} />,
  color: "bg-slate-50 text-slate-600 border-slate-200",
};

const READ_FILTER_TABS: Array<{
  label: string;
  value: "ALL" | "READ" | "UNREAD";
}> = [
  { label: "All", value: "ALL" },
  { label: "Unread", value: "UNREAD" },
  { label: "Read", value: "READ" },
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

function normalizeNotificationLink(link: string | null | undefined): string | null {
  if (!link) return null;
  const adminChatMatch = link.match(/^\/admin\/chats\/([^/?#]+)$/);
  if (adminChatMatch) {
    return `/chats/${adminChatMatch[1]}`;
  }
  return link;
}


/* ─── Detail drawer ────────────────────────────────────────────────────────── */

function NotificationDetailDrawer({
  notification,
  onClose,
  onAction,
}: {
  notification: NotificationItem;
  onClose: () => void;
  onAction: () => void;
}) {
  const [markRead, { loading: marking }] = useMutation(MARK_AS_READ_MUTATION);
  const [deleteNotification, { loading: deleting }] = useMutation(
    DELETE_NOTIFICATION_MUTATION,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleMarkRead = async () => {
    try {
      await markRead({ variables: { notificationId: notification._id } });
      onAction();
      onClose();
      await successAlert("Notification marked as read", "This notification has been updated.", {
        variant: "chat",
      });
    } catch (err) {
      await errorAlert("We couldn’t update this notification", getErrorMessage(err), {
        variant: "chat",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotification({
        variables: { notificationId: notification._id },
      });
      onAction();
      onClose();
      await successAlert("Notification removed", "The notification has been deleted.", {
        variant: "trash",
      });
    } catch (err) {
      await errorAlert("We couldn’t delete this notification", getErrorMessage(err), {
        variant: "chat",
      });
    }
  };

  const typeConf = TYPE_CONFIG[notification.type] ?? DEFAULT_TYPE;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Notification Detail
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              {notification.title}
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
          {/* type badge + read status */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${typeConf.color}`}
            >
              {typeConf.icon}
              {notification.type}
            </span>
            {notification.read ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                <MailOpen size={10} /> Read
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                <Mail size={10} /> Unread
              </span>
            )}
          </div>

          {/* message */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-sm leading-relaxed text-slate-700">
              {notification.message}
            </p>
          </div>

          {/* link */}
          {normalizeNotificationLink(notification.link) && (
            <a
              href={normalizeNotificationLink(notification.link)!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 transition"
            >
              <ExternalLink size={14} />
              {normalizeNotificationLink(notification.link)}
            </a>
          )}

          {/* meta */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <InfoRow label="ID" value={notification._id} mono />
            <InfoRow
              label="User"
              value={notification.userNick ?? notification.userId}
            />
            <InfoRow
              label="Created"
              value={formatDateTime(notification.createdAt)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
          {!notification.read && (
            <button
              type="button"
              onClick={() => void handleMarkRead()}
              disabled={marking}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {marking ? "..." : "Mark as Read"}
            </button>
          )}
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
                <Trash2 size={14} /> Delete
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

const AdminNotificationsPage: NextPageWithAuth = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [readFilter, setReadFilter] = useState<"ALL" | "READ" | "UNREAD">(
    "ALL",
  );
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(
    null,
  );

  const input = useMemo<PaginationInput>(
    () => ({ page, limit: PAGE_SIZE, sort: "createdAt", direction: -1 }),
    [page],
  );

  const { data, loading, error, refetch } = useQuery<
    GetAllNotificationsAdminQueryData,
    GetAllNotificationsAdminQueryVars
  >(GET_ALL_NOTIFICATIONS_ADMIN_QUERY, {
    variables: { input },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const notifications = useMemo(
    () => data?.getAllNotificationsAdmin.list ?? [],
    [data?.getAllNotificationsAdmin.list],
  );
  const total = data?.getAllNotificationsAdmin.metaCounter.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filteredNotifications = useMemo(() => {
    let list = notifications;

    // read filter
    if (readFilter === "UNREAD") list = list.filter((n) => !n.read);
    else if (readFilter === "READ") list = list.filter((n) => n.read);

    // search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q) ||
          n._id.includes(q) ||
          n.userId.includes(q) ||
          (n.userNick?.toLowerCase().includes(q) ?? false),
      );
    }

    return list;
  }, [notifications, readFilter, searchTerm]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const handleTabChange = useCallback((val: "ALL" | "READ" | "UNREAD") => {
    setReadFilter(val);
  }, []);

  return (
    <main className="w-full space-y-6 pb-12">
      {/* header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-rose-50 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
            Notification Management
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            View and manage all system notifications. Mark as read or delete
            obsolete entries.
          </p>
        </div>
      </section>

      {/* summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          label="Total"
          value={total}
          icon={<Bell size={20} />}
          tone="sky"
        />
        <SummaryCard
          label="Unread"
          value={unreadCount}
          icon={<BellRing size={20} />}
          tone="amber"
        />
        <SummaryCard
          label="Read"
          value={total - unreadCount}
          icon={<BellOff size={20} />}
          tone="slate"
        />
      </section>

      {/* table section */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        {/* tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-1">
            {READ_FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  readFilter === tab.value
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
              placeholder="Search by title, message, type, or ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20"
            />
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <ErrorNotice message={getErrorMessage(error)} />
          </div>
        ) : null}

        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center gap-3 p-12">
            <Loader2 size={18} className="animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading notifications...</p>
          </div>
        ) : null}

        {!loading && filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              No notifications found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : null}

        {filteredNotifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="w-8 px-4 py-3" />
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Message
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Time
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((n) => {
                  const typeConf = TYPE_CONFIG[n.type] ?? DEFAULT_TYPE;
                  return (
                    <tr
                      key={n._id}
                      className={`border-b border-slate-100 transition hover:bg-slate-50/50 ${!n.read ? "bg-sky-50/30" : ""}`}
                    >
                      {/* read indicator */}
                      <td className="px-4 py-3.5">
                        {!n.read ? (
                          <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
                        ) : (
                          <Check size={12} className="text-slate-300" />
                        )}
                      </td>
                      {/* type */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${typeConf.color}`}
                        >
                          {typeConf.icon}
                          {n.type}
                        </span>
                      </td>
                      {/* title */}
                      <td className="max-w-[180px] px-4 py-3.5">
                        <p
                          className={`truncate text-sm ${!n.read ? "font-semibold text-slate-900" : "text-slate-700"}`}
                        >
                          {n.title}
                        </p>
                      </td>
                      {/* message */}
                      <td className="max-w-[220px] px-4 py-3.5">
                        <p className="truncate text-xs text-slate-500">
                          {n.message}
                        </p>
                      </td>
                      {/* user */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-slate-600 truncate max-w-[120px] font-medium">
                          {n.userNick ?? n.userId}
                        </p>
                      </td>
                      {/* time */}
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {timeAgo(n.createdAt)}
                      </td>
                      {/* actions */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedNotif(n)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                          title="View detail"
                        >
                          <Bell size={14} />
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

      {/* detail drawer */}
      {selectedNotif ? (
        <NotificationDetailDrawer
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          onAction={() => void refetch()}
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
  tone: "sky" | "amber" | "slate";
}) {
  const bg: Record<string, string> = {
    sky: "bg-sky-50 border-sky-200",
    amber: "bg-amber-50 border-amber-200",
    slate: "bg-white border-slate-200",
  };
  const iBg: Record<string, string> = {
    sky: "bg-sky-100 text-sky-600",
    amber: "bg-amber-100 text-amber-600",
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

AdminNotificationsPage.auth = {
  roles: ["ADMIN", "ADMIN_OPERATOR"],
};

export default AdminNotificationsPage;
