import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  DELETE_NOTIFICATION_MUTATION,
  GET_MY_NOTIFICATIONS_QUERY,
  GET_UNREAD_COUNT_QUERY,
  MARK_ALL_AS_READ_MUTATION,
  MARK_AS_READ_MUTATION,
} from "@/graphql/notification.gql";
import { getSessionMember } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/utils/error";
import type { NextPageWithAuth } from "@/types/page";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCheck,
  Crown,
  MessageSquare,
  Star,
  TrendingDown,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | "PRICE_DROP"
  | "BOOKING_REMINDER"
  | "REVIEW_REQUEST"
  | "HOTEL_REPLY"
  | "LOW_AVAILABILITY"
  | "CHAT_MESSAGE"
  | "POINTS_EARNED"
  | "NEW_HOTEL"
  | "NEW_BOOKING"
  | "BOOKING_CANCELLED"
  | "NEW_REVIEW"
  | "NEW_MEMBER"
  | "SUBSCRIPTION_REQUEST"
  | "SUBSCRIPTION_APPROVED"
  | "SUBSCRIPTION_DENIED"
  | "SUBSCRIPTION_CANCELLED";

interface NotificationDto {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

interface GetMyNotificationsData {
  getMyNotifications: NotificationDto[];
}

interface MarkAsReadData {
  markAsRead: NotificationDto;
}

interface MarkAllAsReadData {
  markAllAsRead: number;
}

interface DeleteNotificationData {
  deleteNotification: boolean;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_CONFIG: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  CHAT_MESSAGE: { icon: MessageSquare, color: "text-sky-500", bg: "bg-sky-50" },
  HOTEL_REPLY: { icon: MessageSquare, color: "text-sky-500", bg: "bg-sky-50" },
  BOOKING_REMINDER: {
    icon: Calendar,
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
  NEW_BOOKING: { icon: Calendar, color: "text-slate-500", bg: "bg-slate-100" },
  BOOKING_CANCELLED: {
    icon: Calendar,
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
  PRICE_DROP: {
    icon: TrendingDown,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  REVIEW_REQUEST: { icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  NEW_REVIEW: { icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  SUBSCRIPTION_APPROVED: {
    icon: Crown,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  SUBSCRIPTION_DENIED: {
    icon: Crown,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  SUBSCRIPTION_CANCELLED: {
    icon: Crown,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  SUBSCRIPTION_REQUEST: {
    icon: Crown,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  NEW_MEMBER: { icon: Users, color: "text-slate-500", bg: "bg-slate-100" },
  POINTS_EARNED: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  LOW_AVAILABILITY: {
    icon: AlertTriangle,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  NEW_HOTEL: { icon: Bell, color: "text-slate-500", bg: "bg-slate-100" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeNotificationLink(link: string | null | undefined): string | null {
  if (!link) return null;
  const adminChatMatch = link.match(/^\/admin\/chats\/([^/?#]+)$/);
  if (adminChatMatch) {
    return `/chats/${adminChatMatch[1]}`;
  }
  return link;
}

function resolveLink(notification: NotificationDto): string | null {
  const normalizedLink = normalizeNotificationLink(notification.link);
  if (normalizedLink) return normalizedLink;

  // Attempt to derive a link from the notification type
  // Backend stores `link` in most cases, but fall back based on type
  switch (notification.type) {
    case "NEW_BOOKING":
    case "BOOKING_REMINDER":
    case "BOOKING_CANCELLED":
      return "/bookings";
    case "CHAT_MESSAGE":
    case "HOTEL_REPLY":
      return "/chats";
    case "REVIEW_REQUEST":
    case "NEW_REVIEW":
      return "/hotels";
    case "PRICE_DROP":
    case "LOW_AVAILABILITY":
      return "/hotels";
    default:
      return null;
  }
}

function formatNotificationTimeAgo(locale: string, value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffMs) < hour) {
    return rtf.format(Math.round(diffMs / minute), "minute");
  }
  if (Math.abs(diffMs) < day) {
    return rtf.format(Math.round(diffMs / hour), "hour");
  }
  if (Math.abs(diffMs) < 7 * day) {
    return rtf.format(Math.round(diffMs / day), "day");
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

// ─── Notification item ────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: NotificationDto;
  onRead: (id: string, link: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const { locale } = useI18n();
  const copy =
    locale === "ko"
      ? { delete: "알림 삭제" }
      : locale === "ru"
        ? { delete: "Удалить уведомление" }
        : locale === "uz"
          ? { delete: "Bildirishnomani o'chirish" }
          : { delete: "Delete notification" };
  const cfg = ICON_CONFIG[notification.type] ?? ICON_CONFIG.NEW_HOTEL;
  const Icon = cfg.icon;
  const link = resolveLink(notification);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onRead(notification._id, link)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onRead(notification._id, link);
        }
      }}
      className={`group flex items-start gap-3.5 rounded-2xl px-4 py-3.5 transition cursor-pointer ${
        notification.read
          ? "bg-white hover:bg-slate-50"
          : "bg-sky-50/50 hover:bg-sky-50"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
      >
        <Icon size={18} className={cfg.color} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              notification.read
                ? "font-medium text-slate-700"
                : "font-semibold text-slate-900"
            }`}
          >
            {notification.title}
          </p>
          <span className="flex-shrink-0 text-[11px] text-slate-400">
            {formatNotificationTimeAgo(locale, notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Unread dot + delete */}
      <div className="flex flex-shrink-0 flex-col items-center gap-2 pt-1">
        {!notification.read && (
          <span className="h-2 w-2 rounded-full bg-sky-500" />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
          aria-label={copy.delete}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const NotificationsPage: NextPageWithAuth = () => {
  const { locale } = useI18n();
  const copy =
    locale === "ko"
      ? {
          title: "알림",
          unread: "읽지 않음",
          markAll: "모두 읽음 처리",
          all: "전체",
          caughtUp: "모든 알림을 확인했습니다",
          noUnread: "지금은 읽지 않은 알림이 없습니다.",
          empty: "알림을 받으면 여기에 표시됩니다.",
        }
      : locale === "ru"
        ? {
            title: "Уведомления",
            unread: "непрочитано",
            markAll: "Прочитать все",
            all: "Все",
            caughtUp: "У вас нет новых уведомлений",
            noUnread: "Сейчас нет непрочитанных уведомлений.",
            empty: "Когда вы получите уведомления, они появятся здесь.",
          }
        : locale === "uz"
          ? {
              title: "Bildirishnomalar",
              unread: "o'qilmagan",
              markAll: "Hammasini o'qilgan deb belgilash",
              all: "Barchasi",
              caughtUp: "Siz barcha bildirishnomalarni ko'rdingiz",
              noUnread: "Hozir o'qilmagan bildirishnomalar yo'q.",
              empty: "Bildirishnoma olganingizda ular shu yerda ko'rinadi.",
            }
          : {
              title: "Notifications",
              unread: "unread",
              markAll: "Mark all read",
              all: "All",
              caughtUp: "You're all caught up",
              noUnread: "No unread notifications right now.",
              empty: "When you receive notifications, they’ll show up here.",
            };
  const router = useRouter();
  const member = useMemo(() => getSessionMember(), []);
  const [tab, setTab] = useState<"all" | "unread">("all");

  // Redirect non-authenticated users
  useEffect(() => {
    if (!member) {
      void router.replace("/auth/login");
    }
  }, [member, router]);

  const unreadOnly = tab === "unread" ? true : undefined;

  const { data, loading, error } = useQuery<GetMyNotificationsData>(
    GET_MY_NOTIFICATIONS_QUERY,
    {
      skip: !member,
      variables: { unreadOnly, limit: 50 },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const [markAsRead] = useMutation<MarkAsReadData>(MARK_AS_READ_MUTATION, {
    refetchQueries: [
      {
        query: GET_MY_NOTIFICATIONS_QUERY,
        variables: { unreadOnly, limit: 50 },
      },
      { query: GET_UNREAD_COUNT_QUERY },
    ],
  });

  const [markAllAsRead, { loading: markAllLoading }] =
    useMutation<MarkAllAsReadData>(MARK_ALL_AS_READ_MUTATION, {
      refetchQueries: [
        {
          query: GET_MY_NOTIFICATIONS_QUERY,
          variables: { unreadOnly, limit: 50 },
        },
        { query: GET_UNREAD_COUNT_QUERY },
      ],
    });

  const [deleteNotification] = useMutation<DeleteNotificationData>(
    DELETE_NOTIFICATION_MUTATION,
    {
      refetchQueries: [
        {
          query: GET_MY_NOTIFICATIONS_QUERY,
          variables: { unreadOnly, limit: 50 },
        },
        { query: GET_UNREAD_COUNT_QUERY },
      ],
    },
  );

  const notifications = useMemo(() => data?.getMyNotifications ?? [], [data?.getMyNotifications]);
  const unreadTotal = notifications.filter((n) => !n.read).length;

  const handleRead = useCallback(
    async (notificationId: string, link: string | null) => {
      const notification = notifications.find((n) => n._id === notificationId);
      if (notification && !notification.read) {
        try {
          await markAsRead({ variables: { notificationId } });
        } catch {
          // Silently continue — navigating is more important
        }
      }
      if (link) {
        void router.push(link);
      }
    },
    [markAsRead, notifications, router],
  );

  const handleDelete = useCallback(
    async (notificationId: string) => {
      try {
        await deleteNotification({ variables: { notificationId } });
      } catch {
        // Handled by Apollo error link if needed
      }
    },
    [deleteNotification],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch {
      // Silently fail
    }
  }, [markAllAsRead]);

  if (!member) return null;

  return (
    <main className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{copy.title}</h1>
          {unreadTotal > 0 && (
            <p className="mt-0.5 text-sm text-slate-500">
              {unreadTotal} {copy.unread}
            </p>
          )}
        </div>
        {unreadTotal > 0 && (
          <button
            type="button"
            onClick={() => {
              void handleMarkAllAsRead();
            }}
            disabled={markAllLoading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-sky-500 transition hover:bg-sky-50 disabled:opacity-50"
          >
            <CheckCheck size={15} />
            {copy.markAll}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1.5">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t === "all" ? copy.all : copy.unread}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && <ErrorNotice message={getErrorMessage(error)} />}

      {/* Loading skeleton */}
      {loading && notifications.length === 0 && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 rounded-2xl px-4 py-3.5"
            >
              <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2 pt-0.5">
                <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-full animate-pulse rounded-full bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Bell size={28} className="text-slate-300" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-700">
            {copy.caughtUp}
          </p>
          <p className="mt-1.5 text-sm text-slate-400">
            {tab === "unread"
              ? copy.noUnread
              : copy.empty}
          </p>
        </div>
      )}

      {/* Notification list */}
      {notifications.length > 0 && (
        <div className="space-y-1">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onRead={(id, link) => {
                void handleRead(id, link);
              }}
              onDelete={(id) => {
                void handleDelete(id);
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
};

NotificationsPage.auth = {
  roles: ["USER", "AGENT", "ADMIN", "ADMIN_OPERATOR"],
};

export default NotificationsPage;
