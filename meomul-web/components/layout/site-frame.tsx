import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { ChatDrawer } from "@/components/chat/chat-drawer";
import { AppLogo } from "@/components/brand/app-logo";
import { Footer } from "@/components/layout/footer";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { PriceLockFab } from "@/components/layout/price-lock-fab";
import { useToast } from "@/components/ui/toast-provider";
import { GET_MY_UNREAD_CHAT_COUNT_QUERY } from "@/graphql/chat.gql";
import { GET_MEMBER_QUERY } from "@/graphql/member.gql";
import {
  GET_MY_NOTIFICATIONS_QUERY,
  GET_UNREAD_COUNT_QUERY,
  MARK_ALL_AS_READ_MUTATION,
  MARK_AS_READ_MUTATION,
} from "@/graphql/notification.gql";
import {
  getAccessToken,
  getSessionMember,
  isAuthenticated,
  logoutSession,
  registerSessionChangeListener,
  unregisterSessionChangeListener,
} from "@/lib/auth/session";
import { hasApprovedAgentAccess } from "@/lib/auth/host-access";
import {
  PROFILE_FALLBACK_IMAGE,
  resolveProfileImageUrl,
} from "@/lib/utils/media-url";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/messages";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { lockBodyScroll } from "@/lib/ui/body-scroll-lock";
import { createNotificationSocket } from "@/lib/socket/notification";
import type { SessionMember } from "@/types/auth";
import type { GetMyUnreadChatCountQueryData } from "@/types/chat";
import {
  Bell,
  BellRing,
  Building2,
  CheckCheck,
  ChevronDown,
  Crown,
  DoorOpen,
  Headset,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Star,
  User,
  Users,
  X,
} from "lucide-react";

const UNREAD_POLL_INTERVAL_MS = 120000;
const NOTIFICATION_POLL_INTERVAL_MS = 180000;

const normalizeNotificationLink = (link: string | null | undefined): string | null => {
  if (!link) return null;
  const adminChatMatch = link.match(/^\/admin\/chats\/([^/?#]+)$/);
  if (adminChatMatch) {
    return `/chats/${adminChatMatch[1]}`;
  }
  return link;
};

// ─── Role-aware navigation ────────────────────────────────────────────────────

const NAV_LINKS = {
  guest: [
    { href: "/", labelKey: "nav_home" },
    { href: "/hotels", labelKey: "nav_hotels" },
    { href: "/become-a-host", labelKey: "nav_become_host" },
    { href: "/about", labelKey: "nav_about" },
    { href: "/support", labelKey: "nav_support" },
  ],
  user: [
    { href: "/", labelKey: "nav_home" },
    { href: "/hotels", labelKey: "nav_hotels" },
    { href: "/bookings", labelKey: "nav_my_bookings" },
    { href: "/about", labelKey: "nav_about" },
    { href: "/support", labelKey: "nav_support" },
  ],
  pendingAgent: [
    { href: "/", labelKey: "nav_home" },
    { href: "/hotels", labelKey: "nav_hotels" },
    { href: "/hotels/manage", labelKey: "nav_my_hotels" },
    { href: "/chats", labelKey: "nav_chats" },
    { href: "/support", labelKey: "nav_support" },
  ],
  staff: [
    { href: "/", labelKey: "nav_home" },
    { href: "/hotels", labelKey: "nav_hotels" },
    { href: "/hotels/manage", labelKey: "nav_my_hotels" },
    { href: "/bookings/manage", labelKey: "nav_bookings" },
    { href: "/chats", labelKey: "nav_chats" },
    { href: "/dashboard", labelKey: "nav_dashboard" },
  ],
  admin: [
    { href: "/", labelKey: "nav_home" },
    { href: "/hotels", labelKey: "nav_hotels" },
    { href: "/hotels/manage", labelKey: "nav_my_hotels" },
    { href: "/bookings/manage", labelKey: "nav_bookings" },
    { href: "/chats", labelKey: "nav_chats" },
    { href: "/dashboard", labelKey: "nav_dashboard" },
  ],
} as const;

const ADMIN_PAGES = [
  { href: "/admin/members", labelKey: "nav_admin_members", icon: Users },
  {
    href: "/admin/host-applications",
    labelKey: "nav_admin_host_applications",
    icon: ShieldCheck,
  },
  { href: "/admin/hotels", labelKey: "nav_admin_hotels", icon: Building2 },
  { href: "/admin/rooms", labelKey: "nav_admin_rooms", icon: DoorOpen },
  { href: "/admin/reviews", labelKey: "nav_admin_reviews", icon: Star },
  { href: "/admin/chats", labelKey: "nav_chats", icon: MessageSquare },
  {
    href: "/admin/notifications",
    labelKey: "nav_admin_notifications",
    icon: BellRing,
  },
  {
    href: "/admin/subscriptions",
    labelKey: "nav_admin_subscriptions",
    icon: Crown,
  },
] as const;

function getNavLinks(member: SessionMember | null) {
  if (!member) return NAV_LINKS.guest;
  if (member.memberType === "USER") return NAV_LINKS.user;
  if (member.memberType === "AGENT" && !hasApprovedAgentAccess(member.hostAccessStatus)) {
    return NAV_LINKS.pendingAgent;
  }
  if (member.memberType === "ADMIN" || member.memberType === "ADMIN_OPERATOR")
    return NAV_LINKS.admin;
  return NAV_LINKS.staff;
}

const isActive = (pathname: string, href: string): boolean => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

// ─── Avatar colors by role ────────────────────────────────────────────────────

const ROLE_COLOR: Record<string, string> = {
  USER: "bg-sky-500",
  AGENT: "bg-violet-500",
  ADMIN: "bg-rose-500",
  ADMIN_OPERATOR: "bg-rose-500",
};

function memberAvatar(member: SessionMember) {
  const bg = ROLE_COLOR[member.memberType] ?? "bg-slate-500";
  const initials = member.memberNick.slice(0, 2).toUpperCase();
  if (member.memberImage) {
    return (
      <div className={`h-full w-full overflow-hidden rounded-full ${bg}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveProfileImageUrl(member.memberImage)}
          alt={initials}
          className="h-full w-full object-cover"
          onError={(event) => {
            const image = event.currentTarget;
            if (!image.src.endsWith(PROFILE_FALLBACK_IMAGE)) {
              image.src = PROFILE_FALLBACK_IMAGE;
            }
          }}
        />
      </div>
    );
  }
  return <span>{initials}</span>;
}

// ─── User avatar dropdown ─────────────────────────────────────────────────────

function UserAvatarMenu({
  member,
  onLogout,
  t,
}: {
  member: SessionMember;
  onLogout: () => void;
  t: (key: TranslationKey) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bg = ROLE_COLOR[member.memberType] ?? "bg-slate-500";
  const roleLabel =
    member.memberType === "ADMIN" || member.memberType === "ADMIN_OPERATOR"
      ? t("label_role_admin")
      : member.memberType === "AGENT" && !hasApprovedAgentAccess(member.hostAccessStatus)
        ? "pending agent"
      : member.memberType.replace("_", " ").toLowerCase();
  const canAccessSettings = member.memberType !== "AGENT";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} text-[11px] font-bold text-white transition hover:opacity-90 hover:ring-2 hover:ring-sky-300 hover:ring-offset-1`}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {memberAvatar(member)}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
          <div className="border-b border-slate-50 px-4 pb-3 pt-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {member.memberNick}
            </p>
            <p className="text-[11px] capitalize text-slate-400">{roleLabel}</p>
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <User size={14} className="text-slate-400" />
              {t("action_profile")}
            </Link>
            {member.memberType === "AGENT" && !hasApprovedAgentAccess(member.hostAccessStatus) ? (
              <Link
                href="/host/apply"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Building2 size={14} className="text-slate-400" />
                Host application
              </Link>
            ) : null}
            {canAccessSettings ? (
              <Link
                href="/settings/preferences"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Settings size={14} className="text-slate-400" />
                {t("action_settings")}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 transition hover:bg-rose-50"
            >
              <LogOut size={14} />
              {t("action_sign_out")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin dropdown menu ──────────────────────────────────────────────────────

function AdminDropdown({
  pathname,
  t,
}: {
  pathname: string;
  t: (key: TranslationKey) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const anyActive = ADMIN_PAGES.some((p) => isActive(pathname, p.href));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition ${
          anyActive
            ? "bg-slate-950 text-white"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <ShieldCheck size={14} />
        {t("nav_admin")}
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.32)]">
          {ADMIN_PAGES.map((page) => {
            const Icon = page.icon;
            const active = isActive(pathname, page.href);
            return (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                  active
                    ? "bg-slate-50 font-semibold text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon
                  size={14}
                  className={active ? "text-sky-500" : "text-slate-400"}
                />
                {t(page.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Notification type icons ──────────────────────────────────────────────────

const NOTIF_TYPE_COLOR: Record<string, string> = {
  BOOKING: "bg-sky-50 text-sky-500",
  REVIEW: "bg-amber-50 text-amber-500",
  CHAT: "bg-violet-50 text-violet-500",
  SYSTEM: "bg-slate-50 text-slate-500",
  PRICE_DROP: "bg-emerald-50 text-emerald-500",
  RECOMMENDATION: "bg-rose-50 text-rose-500",
};

function notifDot(type: string) {
  const cls = NOTIF_TYPE_COLOR[type] ?? "bg-slate-50 text-slate-400";
  return (
    <span
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${cls}`}
    >
      {type.charAt(0)}
    </span>
  );
}

function timeAgoShort(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(ms / 3600000);
  if (h < 24) return `${h}h`;
  const d = Math.floor(ms / 86400000);
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface NotifItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

// ─── Notification bell + drawer ───────────────────────────────────────────────

function NotificationBellDrawer({
  unreadCount,
  onCountChange,
}: {
  unreadCount: number;
  onCountChange: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, loading, refetch } = useQuery<{
    getMyNotifications: NotifItem[];
  }>(GET_MY_NOTIFICATIONS_QUERY, {
    skip: !open,
    fetchPolicy: "network-only",
  });

  const [markAsRead] = useMutation(MARK_AS_READ_MUTATION);
  const [markAllAsRead] = useMutation(MARK_ALL_AS_READ_MUTATION);

  const notifications = data?.getMyNotifications ?? [];
  // Show only latest 6 in the quick drawer
  const visible = notifications.slice(0, 6);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [router.asPath]);

  const handleToggle = () => {
    setOpen((o) => !o);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      onCountChange();
      void refetch();
    } catch {
      // silent
    }
  };

  const handleClickNotif = async (item: NotifItem) => {
    if (!item.read) {
      try {
        await markAsRead({ variables: { notificationId: item._id } });
        onCountChange();
        void refetch();
      } catch {
        // silent
      }
    }
    setOpen(false);
    const resolvedLink = normalizeNotificationLink(item.link);
    if (resolvedLink) {
      void router.push(resolvedLink);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-3 right-3 top-[76px] z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:w-96 sm:animate-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    void handleMarkAllRead();
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-sky-500 transition hover:text-sky-600"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 sm:hidden"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[min(58vh,340px)] overflow-y-auto">
            {loading && visible.length === 0 ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                      <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              visible.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => {
                    void handleClickNotif(item);
                  }}
                  className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    !item.read ? "bg-sky-50/40" : ""
                  }`}
                >
                  {notifDot(item.type)}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        item.read
                          ? "font-medium text-slate-600"
                          : "font-semibold text-slate-900"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                      {item.message}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-300">
                      {timeAgoShort(item.createdAt)}
                    </span>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {visible.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 text-center">
              <Link
                href="/notifications"
                className="text-xs font-medium text-sky-500 transition hover:text-sky-600"
                onClick={() => setOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
}

function SupportFab({
  hasPriceLockWidget,
  isRoomDetailPage,
  onStartSupport,
  onOpenInbox,
}: {
  hasPriceLockWidget: boolean;
  isRoomDetailPage: boolean;
  onStartSupport: () => void;
  onOpenInbox: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!panelRef.current || panelRef.current.contains(event.target as Node))
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const containerBottom = hasPriceLockWidget
    ? isRoomDetailPage
      ? "bottom-[calc(env(safe-area-inset-bottom)+10.75rem)] sm:bottom-44"
      : "bottom-[calc(env(safe-area-inset-bottom)+9rem)] sm:bottom-40"
    : "bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:bottom-6";

  return (
    <div
      className={`fixed right-3 z-40 sm:right-5 ${containerBottom}`}
      ref={panelRef}
    >
      <div
        className={`absolute bottom-[4.35rem] right-0 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onStartSupport();
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Headset size={14} className="text-sky-500" />
          Contact support
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onOpenInbox();
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <MessageSquare size={14} className="text-slate-500" />
          Open inbox
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-2xl transition hover:scale-[1.02] hover:bg-sky-500"
        aria-label="Support options"
        aria-expanded={open}
      >
        <Headset size={20} />
      </button>
    </div>
  );
}

// ─── SiteFrame ────────────────────────────────────────────────────────────────

export function SiteFrame({ children }: PropsWithChildren) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const isHomeRoute = router.pathname === "/";
  const isHotelDetailRoute = router.pathname === "/hotels/[hotelId]";
  const isHotelsRoute = router.pathname === "/hotels";
  const isBecomeHostRoute = router.pathname === "/become-a-host";
  const isHostSignupRoute = router.pathname === "/host/signup";
  const isHostApplyRoute = router.pathname === "/host/apply";
  const isHostFlowRoute = isBecomeHostRoute || isHostSignupRoute || isHostApplyRoute;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const releaseScrollLock = lockBodyScroll();
    return releaseScrollLock;
  }, [isMobileMenuOpen]);

  // Refresh member on every route change (captures login/logout navigation)
  const [member, setMember] = useState<SessionMember | null>(null);
  useEffect(() => {
    setMember(getSessionMember());
  }, [router.asPath]);

  useEffect(() => {
    const syncMember = (): void => {
      setMember(getSessionMember());
    };

    registerSessionChangeListener(syncMember);
    return () => {
      unregisterSessionChangeListener();
    };
  }, []);

  // Subscribe to Apollo cache for live memberImage updates when profile is saved.
  // fetchPolicy:"cache-only" means no extra network request — it just reads
  // whatever the profile page already fetched and updates when the mutation fires.
  const { data: memberCacheData } = useQuery<{
    getMember: {
      _id: string;
      memberImage?: string | null;
      hostAccessStatus?: SessionMember["hostAccessStatus"];
    };
  }>(GET_MEMBER_QUERY, { skip: !member, fetchPolicy: "cache-only" });
  const liveMemberMatchesSession =
    !!member &&
    memberCacheData?.getMember._id === member._id;
  // Merge live profile fields into member so nav/avatar reflect profile updates immediately.
  const memberWithLiveState = member
    ? {
        ...member,
        memberImage:
          liveMemberMatchesSession
            ? memberCacheData?.getMember.memberImage ?? member.memberImage
            : member.memberImage,
        hostAccessStatus:
          liveMemberMatchesSession
            ? memberCacheData?.getMember.hostAccessStatus ??
              member.hostAccessStatus
            : member.hostAccessStatus,
      }
    : null;

  const isPageVisible = usePageVisible();
  const hasValidSession = Boolean(member) && isAuthenticated();
  const canTrackUnread = hasValidSession;
  const isChatRoute =
    router.pathname === "/chats" || router.pathname === "/chats/[chatId]";
  const showFloatingWidgets = !isChatRoute && !isHostFlowRoute;
  const isRoomDetailPage = router.pathname === "/rooms/[roomId]";
  const isNotificationsRoute = router.pathname === "/notifications";
  const shouldShowPriceLockWidget = true;
  const canPollUnread =
    canTrackUnread && isPageVisible && !isChatRoute && !isChatPanelOpen;
  const canPollNotifications =
    canTrackUnread && isPageVisible && !isNotificationsRoute;
  const previousUnreadRef = useRef<number | null>(null);
  const hasPolledOnVisibleRef = useRef(false);

  const navLinks = getNavLinks(memberWithLiveState ?? member);
  const isStaff =
    (memberWithLiveState ?? member)?.memberType === "AGENT" ||
    (memberWithLiveState ?? member)?.memberType === "ADMIN" ||
    (memberWithLiveState ?? member)?.memberType === "ADMIN_OPERATOR";
  const handleLogout = () => {
    void (async () => {
      await logoutSession();
      await router.replace("/auth/login");
    })();
  };

  // Stable variable references prevent Apollo from re-subscribing on every render
  const emptyVars = useMemo(() => ({}), []);

  const { data: unreadData, refetch: refetchUnread } =
    useQuery<GetMyUnreadChatCountQueryData>(GET_MY_UNREAD_CHAT_COUNT_QUERY, {
      variables: emptyVars,
      skip: !canPollUnread,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
      pollInterval: isPageVisible ? UNREAD_POLL_INTERVAL_MS : 0,
      notifyOnNetworkStatusChange: false,
    });

  const unreadCount = unreadData?.getMyUnreadChatCount ?? 0;

  // ── Notification unread count ──
  const { data: notifUnreadData, refetch: refetchNotifUnread } = useQuery<{
    getUnreadCount: number;
  }>(GET_UNREAD_COUNT_QUERY, {
    variables: emptyVars,
    skip: !canPollNotifications,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    pollInterval: canPollNotifications ? NOTIFICATION_POLL_INTERVAL_MS : 0,
    notifyOnNetworkStatusChange: false,
  });

  const notifUnreadCount = notifUnreadData?.getUnreadCount ?? 0;

  // ── Notification socket ──
  const handleNotificationEvent = useCallback(
    (payload: { title?: string; message?: string }) => {
      void refetchNotifUnread();
      const text =
        payload?.title || payload?.message || "You have a new notification.";
      toast.info(text);
    },
    [refetchNotifUnread, toast],
  );

  useEffect(() => {
    if (!member) return;
    const token = getAccessToken();

    const socket = createNotificationSocket(token);

    socket.on("connect", () => {
      socket.emit(
        "authenticate",
        {},
        (ack: { success: boolean; error?: string }) => {
          if (!ack?.success) {
            console.warn("[notification-socket] auth ACK failed:", ack?.error);
          }
        },
      );
    });

    socket.on("notification", handleNotificationEvent);

    socket.on("error", (err: { message?: string }) => {
      console.warn("[notification-socket] server error:", err?.message);
    });

    socket.on("connect_error", (err: Error) => {
      console.warn("[notification-socket] connect error:", err.message);
    });

    return () => {
      socket.off("notification", handleNotificationEvent);
      socket.off("error");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [member, handleNotificationEvent]);

  useEffect(() => {
    if (!canPollUnread) {
      hasPolledOnVisibleRef.current = false;
      return;
    }
    if (!hasPolledOnVisibleRef.current) {
      hasPolledOnVisibleRef.current = true;
      void refetchUnread();
    }
  }, [canPollUnread, refetchUnread]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsChatPanelOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (!canTrackUnread) {
      previousUnreadRef.current = null;
      return;
    }
    if (!canPollUnread) return;

    const previousUnread = previousUnreadRef.current;
    if (
      previousUnread !== null &&
      unreadCount > previousUnread &&
      router.pathname !== "/chats/[chatId]"
    ) {
      const delta = unreadCount - previousUnread;
      toast.info(
        delta === 1
          ? "You have 1 new chat message."
          : `You have ${delta} new chat messages.`,
      );
    }

    previousUnreadRef.current = unreadCount;
  }, [canPollUnread, canTrackUnread, router.pathname, toast, unreadCount]);

  // Chat icon button — only for logged-in members not already on chat routes.
  // Staff (AGENT/ADMIN) navigate to the full /chats dashboard; users open the drawer.
  const chatIconButton =
    member && !isChatRoute ? (
      <button
        type="button"
        onClick={() => {
          if (isStaff) {
            void router.push("/chats");
          } else {
            setIsChatPanelOpen((prev) => !prev);
          }
        }}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
        aria-label="Open chat"
      >
        <MessageSquare size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sky-500 px-0.5 text-[9px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    ) : null;

  // Notification bell button with drawer
  const notifBellButton = member ? (
    <NotificationBellDrawer
      unreadCount={notifUnreadCount}
      onCountChange={() => {
        void refetchNotifUnread();
      }}
    />
  ) : null;

  const openLogin = () => {
    void router.push({
      pathname: "/auth/login",
      query: { next: router.asPath },
    });
  };

  const openSupportChat = () => {
    if (!hasValidSession) {
      openLogin();
      return;
    }

    void router.push({
      pathname: "/chats",
      query: {
        openNew: "1",
        openSupport: "1",
        sourcePath: router.asPath,
      },
    });
  };

  const openInbox = () => {
    if (!hasValidSession) {
      openLogin();
      return;
    }

    void router.push("/chats");
  };

  const sharedHeader = (
    <header className="sticky top-0 z-90 w-screen border-b border-slate-200 bg-white">
      <div className="flex h-[72px] w-full items-center justify-between px-3 sm:px-6">
        {/* Logo */}
        <AppLogo href="/" compact />

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(router.pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            {(member?.memberType === "ADMIN" ||
              member?.memberType === "ADMIN_OPERATOR") && (
              <AdminDropdown pathname={router.pathname} t={t} />
            )}
          </nav>

          {/* Divider + right-side actions */}
          <div className="ml-3 flex items-center gap-2 border-l border-slate-200 pl-4">
            <LanguageSwitcher />
            {member ? (
              <>
                {notifBellButton}
                {chatIconButton}
                <UserAvatarMenu
                  member={memberWithLiveState ?? member}
                  onLogout={handleLogout}
                  t={t}
                />
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-400"
                >
                  {t("action_log_in")}
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  {t("action_sign_up")}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile: notification bell + chat icon + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {notifBellButton}
          {chatIconButton}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-50"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-x-0 bottom-0 top-[73px] z-40 bg-slate-950/20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            id="mobile-main-nav"
            className="fixed inset-x-0 bottom-0 top-[73px] z-50 border-t border-slate-100 bg-white md:hidden"
          >
          <div className="h-full w-full overflow-y-auto overscroll-contain px-4 py-5 [touch-action:pan-y]">
            {/* Logged-in member card */}
            {member && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ${ROLE_COLOR[member.memberType] ?? "bg-slate-500"} text-[11px] font-bold text-white`}
                >
                  {memberAvatar(memberWithLiveState ?? member)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900">
                    {member.memberNick}
                  </p>
                  <p className="text-[11px] capitalize text-slate-400">
                    {member.memberType.replace("_", " ").toLowerCase()}
                  </p>
                </div>
              </div>
            )}

            {/* Role-based nav links */}
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActive(router.pathname, link.href);
                return (
                  <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-2xl px-4 py-3.5 text-base font-medium transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
            </nav>

            {/* Admin management links */}
            {(member?.memberType === "ADMIN" ||
              member?.memberType === "ADMIN_OPERATOR") && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {t("label_admin_section")}
                </p>
                <nav className="flex flex-col gap-1">
                  {ADMIN_PAGES.map((page) => {
                    const Icon = page.icon;
                    const active = isActive(router.pathname, page.href);
                    return (
                      <Link
                        key={`mobile-${page.href}`}
                        href={page.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-medium transition ${
                          active
                            ? "bg-slate-900 text-white"
                            : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <Icon
                          size={17}
                          className={active ? "text-white" : "text-slate-400"}
                        />
                        {t(page.labelKey)}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Bottom section: settings/logout or auth buttons */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              {member ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base text-slate-700 transition hover:bg-slate-100"
                  >
                    <User size={17} className="text-slate-400" />
                    {t("action_profile")}
                  </Link>
                  {member.memberType !== "AGENT" ? (
                    <Link
                      href="/settings/preferences"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base text-slate-700 transition hover:bg-slate-100"
                    >
                      <Settings size={17} className="text-slate-400" />
                      {t("action_settings")}
                    </Link>
                  ) : null}
                  <div className="px-1 py-2">
                    <LanguageSwitcher mobile />
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base text-rose-500 transition hover:bg-rose-50"
                  >
                    <LogOut size={17} />
                    {t("action_sign_out")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="px-1">
                    <LanguageSwitcher mobile />
                  </div>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-base font-medium text-slate-900 transition hover:bg-white"
                  >
                    {t("action_log_in")}
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-2xl bg-slate-900 px-4 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    {t("action_sign_up")}
                  </Link>
                </div>
              )}
            </div>
          </div>
          </div>
        </>
      )}
    </header>
  );

  return (
    <div className="min-h-screen w-screen overflow-x-clip">
      {isHostFlowRoute ? null : sharedHeader}
      {isHostFlowRoute ? (
        children
      ) : isHomeRoute ? (
        children
      ) : isHotelDetailRoute ? (
        <div className="w-full px-3 pb-8 pt-0 sm:px-6 sm:py-10">{children}</div>
      ) : isHotelsRoute ? (
        <div className="w-full px-3 pb-8 pt-2 sm:px-6 sm:pb-10 sm:pt-5">{children}</div>
      ) : (
        <div className="w-full px-3 py-8 sm:px-6 sm:py-10">
          {children}
        </div>
      )}
      {showFloatingWidgets && shouldShowPriceLockWidget ? (
        <PriceLockFab
          isAuthenticated={hasValidSession}
          memberType={member?.memberType}
          onAuthRequired={hasValidSession ? undefined : openLogin}
        />
      ) : null}
      {showFloatingWidgets ? (
        <SupportFab
          hasPriceLockWidget={shouldShowPriceLockWidget}
          isRoomDetailPage={isRoomDetailPage}
          onStartSupport={openSupportChat}
          onOpenInbox={openInbox}
        />
      ) : null}
      <ChatDrawer
        isOpen={isChatPanelOpen}
        onClose={() => setIsChatPanelOpen(false)}
        unreadCount={unreadCount}
      />
      {isHostFlowRoute ? null : <Footer />}
    </div>
  );
}
