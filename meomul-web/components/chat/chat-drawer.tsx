import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Socket } from "socket.io-client";
import {
  CLAIM_CHAT_MUTATION,
  GET_CHAT_QUERY,
  GET_MY_CHATS_QUERY,
  GET_OPERATOR_CHATS_QUERY,
  MARK_CHAT_MESSAGES_AS_READ_MUTATION,
  SEND_MESSAGE_MUTATION,
} from "@/graphql/chat.gql";
import { GET_HOTELS_QUERY } from "@/graphql/hotel.gql";
import { getAccessToken, getSessionMember } from "@/lib/auth/session";
import {
  formatChatTime,
  formatChatTimeAgo,
  getChatCopy,
  getLastPreviewLabel,
} from "@/lib/chat/chat-i18n";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { useI18n } from "@/lib/i18n/provider";
import { createChatSocket } from "@/lib/socket/chat";
import {
  avatarBg,
  getGuestAvatarLetter,
  getGuestDisplayName,
} from "@/lib/chat/chat-helpers";
import { getErrorMessage } from "@/lib/utils/error";
import type {
  ClaimChatMutationData,
  ClaimChatMutationVars,
  GetChatQueryData,
  GetChatQueryVars,
  GetMyChatsQueryData,
  GetMyChatsQueryVars,
  GetOperatorChatsQueryData,
  GetOperatorChatsQueryVars,
  MarkChatMessagesAsReadMutationData,
  MarkChatMessagesAsReadMutationVars,
  MessageDto,
  PaginationInput,
  SendMessageMutationData,
  SendMessageMutationVars,
} from "@/types/chat";
import type {
  GetHotelsQueryData,
  GetHotelsQueryVars,
  HotelListItem,
} from "@/types/hotel";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ExternalLink,
  Headset,
  MessageSquare,
  Send,
  SquarePen,
  X,
} from "lucide-react";

// ─── Compact message bubble ───────────────────────────────────────────────────

function Bubble({
  message,
  isOwn,
  isLast,
  locale,
}: {
  message: MessageDto;
  isOwn: boolean;
  isLast: boolean;
  locale: "en" | "ko" | "ru" | "uz";
}) {
  const sent = "bg-[#d4e5f7] text-slate-900 rounded-xl";
  const recv =
    "bg-white text-slate-900 border border-slate-200 shadow-sm rounded-xl";

  return (
    <div
      className={`flex items-end gap-1 ${isOwn ? "justify-end" : "justify-start"} ${isLast ? "mb-2.5" : "mb-0.5"}`}
    >
      {/* Sent: time to the LEFT of bubble */}
      {isOwn && isLast && (
        <div className="flex flex-shrink-0 flex-col items-end gap-0.5 pb-0.5">
          <span className="text-[9px] leading-none text-slate-400">
            {formatChatTime(locale, message.timestamp)}
          </span>
          {message.read ? (
            <CheckCheck size={9} className="text-blue-400" />
          ) : (
            <Check size={9} className="text-slate-300" />
          )}
        </div>
      )}

      <div className={`max-w-[80%] overflow-hidden ${isOwn ? sent : recv}`}>
        {message.messageType === "IMAGE" && message.imageUrl && (
          <a
            href={message.imageUrl}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl}
              alt="Photo"
              loading="lazy"
              className="block max-h-48 w-full object-cover"
            />
          </a>
        )}
        {message.messageType === "FILE" && message.fileUrl && (
          <a
            href={message.fileUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 transition hover:bg-black/5"
          >
            📎 {message.fileUrl.split("/").pop() ?? "Download"}
          </a>
        )}
        {message.messageType === "TEXT" && (
          <p className="break-words px-3 py-2.5 text-sm leading-relaxed">
            {message.content}
          </p>
        )}
      </div>

      {/* Received: time to the RIGHT of bubble */}
      {!isOwn && isLast && (
        <span className="flex-shrink-0 pb-0.5 text-[9px] leading-none text-slate-400">
          {formatChatTime(locale, message.timestamp)}
        </span>
      )}
    </div>
  );
}

// ─── Main ChatDrawer ──────────────────────────────────────────────────────────

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}

export function ChatDrawer({
  isOpen,
  onClose,
  unreadCount: _unreadCount,
}: ChatDrawerProps) {
  const { locale } = useI18n();
  const copy = getChatCopy(locale);
  const member = useMemo(() => getSessionMember(), []);
  const isUser = member?.memberType === "USER";
  void _unreadCount;

  const [view, setView] = useState<"list" | "thread">("list");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatHotelName, setActiveChatHotelName] =
    useState<string>(copy.hotelSupport);

  // Mount/unmount with exit animation support
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setView("list");
        setActiveChatId(null);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop — above header (z-30), below drawer (z-40) */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[35] bg-black/25 transition-opacity duration-280 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel — slides in from right */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-white sm:inset-auto sm:bottom-0 sm:right-0 sm:top-[57px] sm:w-[380px] sm:border-l sm:border-slate-200 sm:shadow-2xl transition-transform duration-280 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {view === "list" ? (
          <ListView
            isUser={isUser}
            isOpen={isOpen}
            onClose={onClose}
            locale={locale}
            copy={copy}
            onSelectChat={(id, hotelName) => {
              setActiveChatId(id);
              setActiveChatHotelName(hotelName);
              setView("thread");
            }}
          />
        ) : (
          <ThreadView
            chatId={activeChatId ?? ""}
            hotelName={activeChatHotelName}
            isUser={isUser}
            isOpen={isOpen}
            locale={locale}
            copy={copy}
            onBack={() => setView("list")}
            onClose={onClose}
          />
        )}
      </div>
    </>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────

function ListView({
  isUser,
  isOpen,
  onClose,
  onSelectChat,
  locale,
  copy,
}: {
  isUser: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string, hotelName: string) => void;
  locale: "en" | "ko" | "ru" | "uz";
  copy: ReturnType<typeof getChatCopy>;
}) {
  const listInput = useMemo<PaginationInput>(
    () => ({ page: 1, limit: 15, sort: "lastMessageAt", direction: -1 }),
    [],
  );
  const isPageVisible = usePageVisible();
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const hotelsInput = useMemo(
    () => ({ page: 1, limit: 20, sort: "createdAt", direction: -1 as const }),
    [],
  );

  const { data: chatsData, loading: chatsLoading, refetch: refetchChats } = useQuery<
    GetMyChatsQueryData,
    GetMyChatsQueryVars
  >(GET_MY_CHATS_QUERY, {
    skip: !isUser || !isOpen,
    variables: { input: listInput },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    pollInterval: isOpen && isPageVisible && !socketConnected ? 120000 : 0,
  });

  const { data: operatorChatsData, loading: operatorChatsLoading, refetch: refetchOperatorChats } = useQuery<
    GetOperatorChatsQueryData,
    GetOperatorChatsQueryVars
  >(GET_OPERATOR_CHATS_QUERY, {
    skip: isUser || !isOpen,
    variables: { input: listInput },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    pollInterval: isOpen && isPageVisible && !socketConnected ? 120000 : 0,
  });

  const { data: hotelsData } = useQuery<GetHotelsQueryData, GetHotelsQueryVars>(
    GET_HOTELS_QUERY,
    {
      skip: !isOpen,
      variables: { input: hotelsInput },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const hotelsMap = useMemo<Map<string, HotelListItem>>(() => {
    const map = new Map<string, HotelListItem>();
    for (const h of hotelsData?.getHotels.list ?? []) map.set(h._id, h);
    return map;
  }, [hotelsData]);

  const chats = chatsData?.getMyChats.list ?? [];
  const operatorChats = operatorChatsData?.getOperatorChats.list ?? [];
  const visibleChats = isUser ? chats : operatorChats;
  const isListLoading = isUser ? chatsLoading : operatorChatsLoading;

  const STATUS_DOT: Record<string, string> = {
    ACTIVE: "bg-emerald-400",
    WAITING: "bg-amber-400",
    CLOSED: "bg-slate-300",
  };

  useEffect(() => {
    if (!isOpen || !isPageVisible) {
      return;
    }

    const token = getAccessToken();
    const socket = createChatSocket(token);
    socketRef.current = socket;

    const handleListUpdate = (): void => {
      if (isUser) {
        void refetchChats();
        return;
      }
      void refetchOperatorChats();
    };

    const handleConnect = (): void => {
      setSocketConnected(true);
      socket.emit("authenticate", token ? { token } : {});
    };

    const handleDisconnect = (): void => {
      setSocketConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleDisconnect);
    socket.on("chatListUpdated", handleListUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleDisconnect);
      socket.off("chatListUpdated", handleListUpdate);
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [isOpen, isPageVisible, isUser, refetchChats, refetchOperatorChats]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-none items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <p className="text-base font-bold text-slate-900">{copy.messages}</p>
        <div className="flex items-center gap-1">
          <Link
            href="/chats"
            onClick={onClose}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-sky-500 transition hover:bg-sky-50"
          >
            {copy.viewAll}
            <ExternalLink size={11} />
          </Link>
          {isUser && (
            <Link
              href="/chats?openNew=1"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              title={copy.newConversation}
              aria-label={copy.newConversation}
            >
              <SquarePen size={15} />
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100"
            aria-label={copy.close}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading skeletons */}
        {isListLoading && visibleChats.length === 0 && (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isListLoading && visibleChats.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <MessageSquare size={28} className="mb-3 text-slate-200" />
            <p className="font-semibold text-slate-700">{copy.noConversations}</p>
            <p className="mt-1.5 text-sm text-slate-400">
              {isUser ? copy.noConversationsDesc : copy.noUnreadConversations}
            </p>
            <div className="mt-5 flex w-full flex-col gap-2">
              {isUser ? (
                <>
                  <Link
                    href="/chats?openNew=1"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    <SquarePen size={13} />
                    {copy.newMessage}
                  </Link>
                  <Link
                    href="/chats?openNew=1&openSupport=1"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Headset size={13} />
                    {copy.contactSupport}
                  </Link>
                </>
              ) : (
                <Link
                  href="/chats"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  <ExternalLink size={13} />
                  {copy.openChatManagement}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Chat list */}
        {visibleChats.length > 0 && (
          <div className="divide-y divide-slate-50">
            {visibleChats.map((chat) => {
              const isSupportChat = chat.chatScope === "SUPPORT";
              const hotel =
                !isSupportChat && chat.hotelId
                  ? hotelsMap.get(chat.hotelId)
                  : undefined;
              const hotelName = isSupportChat
                ? copy.supportTitle
                : (hotel?.hotelTitle ?? copy.hotelSupport);
              const guestName = getGuestDisplayName(chat, copy.guest);
              const unread = isUser
                ? chat.unreadGuestMessages
                : chat.unreadAgentMessages;
              const preview = getLastPreviewLabel(locale, chat);
              const time = formatChatTimeAgo(locale, chat.lastMessageAt);
              const color = avatarBg(chat.hotelId ?? chat._id);

              return (
                <button
                  key={chat._id}
                  type="button"
                  onClick={() => onSelectChat(chat._id, hotelName)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 active:bg-slate-100"
                >
                  {/* Avatar with status dot */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold uppercase text-white ${
                        isSupportChat ? "bg-teal-500" : color
                      }`}
                    >
                      {isSupportChat ? (
                        isUser ? <Headset size={18} /> : getGuestAvatarLetter(chat)
                      ) : (
                        isUser ? hotelName.charAt(0) : getGuestAvatarLetter(chat)
                      )}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                        STATUS_DOT[chat.chatStatus] ?? "bg-slate-300"
                      }`}
                    />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <p
                        className={`truncate text-sm ${
                          unread > 0
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-800"
                        }`}
                      >
                        {isUser ? hotelName : guestName}
                      </p>
                      <span
                        className={`flex-shrink-0 text-[10px] ${
                          unread > 0
                            ? "font-semibold text-sky-500"
                            : "text-slate-400"
                        }`}
                      >
                        {time}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-1">
                      <p
                        className={`truncate text-xs ${
                          unread > 0
                            ? "font-medium text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        {isUser ? preview : `${hotelName} · ${preview}`}
                      </p>
                      {unread > 0 && (
                        <span className="flex min-w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-sky-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {isUser && (
              <Link
                href="/chats?openNew=1&openSupport=1"
                onClick={onClose}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 active:bg-slate-100"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                  <Headset size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {copy.contactSupport}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {copy.platformSupport}
                  </p>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Thread view ──────────────────────────────────────────────────────────────

function ThreadView({
  chatId,
  hotelName,
  isUser,
  isOpen,
  locale,
  copy,
  onBack,
  onClose,
}: {
  chatId: string;
  hotelName: string;
  isUser: boolean;
  isOpen: boolean;
  locale: "en" | "ko" | "ru" | "uz";
  copy: ReturnType<typeof getChatCopy>;
  onBack: () => void;
  onClose: () => void;
}) {
  const member = useMemo(() => getSessionMember(), []);
  const [messageInput, setMessageInput] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const isPageVisible = usePageVisible();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const refocusAfterSendRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const lastMarkedRef = useRef("");

  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery<
    GetChatQueryData,
    GetChatQueryVars
  >(GET_CHAT_QUERY, {
    skip: !chatId || !isOpen,
    variables: { chatId },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const [sendMessage, { loading: sending }] = useMutation<
    SendMessageMutationData,
    SendMessageMutationVars
  >(SEND_MESSAGE_MUTATION);

  const [claimChat, { loading: claiming }] = useMutation<
    ClaimChatMutationData,
    ClaimChatMutationVars
  >(CLAIM_CHAT_MUTATION);

  const [markRead] = useMutation<
    MarkChatMessagesAsReadMutationData,
    MarkChatMessagesAsReadMutationVars
  >(MARK_CHAT_MESSAGES_AS_READ_MUTATION);

  const chat = data?.getChat;
  const isGuestParticipant = Boolean(chat && chat.guestId === member?._id);
  const unreadForMe = chat
    ? isGuestParticipant
      ? chat.unreadGuestMessages
      : chat.unreadAgentMessages
    : 0;

  // Auto mark-as-read
  useEffect(() => {
    if (!chat || unreadForMe === 0) return;
    const key = `${chat._id}:${(chat.messages ?? []).length}:${unreadForMe}`;
    if (lastMarkedRef.current === key) return;
    lastMarkedRef.current = key;
    void markRead({ variables: { chatId: chat._id } }).catch(() => undefined);
  }, [chat, markRead, unreadForMe]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length]);

  useEffect(() => {
    if (sending || !refocusAfterSendRef.current) return;
    refocusAfterSendRef.current = false;
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true });
    });
  }, [sending]);

  // Fallback polling when socket is disconnected
  useEffect(() => {
    if (!chatId || !isOpen || !isPageVisible || socketConnected) {
      stopPolling();
      return;
    }
    startPolling(120000);
    return () => {
      stopPolling();
    };
  }, [chatId, isOpen, isPageVisible, socketConnected, startPolling, stopPolling]);

  // Socket — connect only when open
  useEffect(() => {
    if (!chatId || !isOpen || !isPageVisible) return;
    const token = getAccessToken();

    const socket = createChatSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("authenticate", token ? { token } : {}, () => {
        socket.emit("joinChat", { chatId });
      });
    });
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("newMessage", (payload: { chatId: string }) => {
      if (payload?.chatId === chatId) void refetch();
    });
    socket.on("messagesRead", (payload: { chatId: string }) => {
      if (payload?.chatId === chatId) void refetch();
    });

    return () => {
      socket.emit("leaveChat", { chatId });
      socket.off("newMessage");
      socket.off("messagesRead");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [chatId, isOpen, isPageVisible, refetch]);

  const onSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chat) return;
    const content = messageInput.trim();
    if (!content || sending) return;
    try {
      await sendMessage({
        variables: {
          input: { chatId: chat._id, messageType: "TEXT", content },
        },
      });
      refocusAfterSendRef.current = true;
      setMessageInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      // silent — user can retry
    }
  };

  const onClaimChat = async () => {
    if (!chat) return;
    try {
      await claimChat({ variables: { input: { chatId: chat._id } } });
      await refetch();
    } catch {
      // silent — user can retry
    }
  };

  const hotelColor = avatarBg(chatId);
  const guestName = chat ? getGuestDisplayName(chat, copy.guest) : copy.guest;
  const canClaim = Boolean(
    chat &&
      !isGuestParticipant &&
      !chat.assignedAgentId &&
      chat.chatStatus !== "CLOSED",
  );
  const canSend = Boolean(
    chat &&
      chat.chatStatus !== "CLOSED" &&
      (isGuestParticipant || chat.assignedAgentId === member?._id),
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-none items-center gap-2.5 border-b border-slate-100 px-3 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sky-500 transition hover:bg-sky-50"
          aria-label={copy.backToChats}
        >
          <ArrowLeft size={18} />
        </button>

        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase text-white ${
            hotelName === copy.supportTitle ? "bg-teal-500" : hotelColor
          }`}
        >
          {hotelName === copy.supportTitle ? (
            <Headset size={14} />
          ) : (
            hotelName.charAt(0)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {chat?.chatStatus === "CLOSED" ? copy.closed : hotelName}
          </p>
          {chat && (
            <p className="text-[10px] text-slate-400">
              {isGuestParticipant
                ? chat.chatStatus === "ACTIVE"
                  ? copy.active
                  : chat.chatStatus === "WAITING"
                    ? copy.waiting
                    : copy.closed
                : `${guestName} · ${
                    chat.chatStatus === "ACTIVE"
                      ? copy.active
                      : chat.chatStatus === "WAITING"
                        ? copy.waiting
                        : copy.closed
                  }`}
            </p>
          )}
        </div>

        <Link
          href={`/chats/${chatId}`}
          onClick={onClose}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100"
          title={copy.openFullPage}
        >
          <ExternalLink size={15} />
        </Link>
        {canClaim && (
          <button
            type="button"
            onClick={() => {
              void onClaimChat();
            }}
            disabled={claiming}
            className="flex h-8 items-center justify-center rounded-full bg-sky-500 px-3 text-xs font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
          >
            {claiming ? copy.claiming : copy.claim}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100"
          aria-label={copy.close}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3">
        {loading && !chat && (
          <div className="flex flex-col gap-3">
            {[false, true, false, true].map((own, i) => (
              <div
                key={i}
                className={`flex ${own ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`h-8 animate-pulse rounded-2xl ${
                    own ? "w-32 bg-blue-100/60" : "w-44 bg-white"
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-center text-xs text-rose-500">
            {getErrorMessage(error)}
          </p>
        )}

        {chat && (chat.messages ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="mb-2 text-3xl">💬</span>
            <p className="text-xs text-slate-400">{copy.noConversations}</p>
          </div>
        )}

        {chat && (chat.messages ?? []).length > 0 && (
          <>
            {(chat.messages ?? []).map((message, index) => {
              const isOwn =
                (message.senderType === "GUEST" && isGuestParticipant) ||
                (message.senderType === "AGENT" && !isGuestParticipant);
              const nextMessage =
                index < (chat.messages ?? []).length - 1
                  ? (chat.messages ?? [])[index + 1]
                  : null;
              const isLastInGroup =
                !nextMessage || nextMessage.senderType !== message.senderType;

              return (
                <Bubble
                  key={`${message.senderId}-${message.timestamp}-${index}`}
                  message={message}
                  isOwn={isOwn}
                  isLast={isLastInGroup}
                  locale={locale}
                />
              );
            })}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-none border-t border-slate-200 bg-white px-3 py-2.5">
        {!canSend ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs text-slate-500">
            {canClaim ? copy.claimRequiredNotice : copy.closedNotice}{" "}
            <Link
              href={`/chats/${chatId}`}
              onClick={onClose}
              className="text-sky-500"
            >
              {copy.viewAll}
            </Link>
          </div>
        ) : (
          <form onSubmit={onSend}>
            <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.closest("form")?.requestSubmit();
                  }
                }}
                placeholder={copy.sendMessagePlaceholder}
                rows={1}
                disabled={sending}
                className="flex-1 resize-none bg-transparent py-1 text-sm text-slate-900 placeholder-slate-400 outline-none"
                style={{ minHeight: "32px", maxHeight: "120px" }}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sending}
                className={`mb-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                  messageInput.trim()
                    ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-95"
                    : "text-slate-300"
                }`}
                aria-label={copy.sendMessage}
              >
                <Send size={13} />
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
