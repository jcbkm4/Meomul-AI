import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { Socket } from "socket.io-client";
import { useToast } from "@/components/ui/toast-provider";
import {
  CLAIM_CHAT_MUTATION,
  GET_CHAT_QUERY,
  MARK_CHAT_MESSAGES_AS_READ_MUTATION,
  SEND_MESSAGE_MUTATION,
} from "@/graphql/chat.gql";
import { getAccessToken, getSessionMember } from "@/lib/auth/session";
import {
  formatChatDateSeparator,
  formatChatTime,
  getChatCopy,
} from "@/lib/chat/chat-i18n";
import { useI18n } from "@/lib/i18n/provider";
import { createChatSocket } from "@/lib/socket/chat";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { uploadImageFile } from "@/lib/uploads/upload-image";
import { confirmAction, errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import { avatarBg, getGuestDisplayName } from "@/lib/chat/chat-helpers";
import type {
  ClaimChatMutationData,
  ClaimChatMutationVars,
  GetChatQueryData,
  GetChatQueryVars,
  MarkChatMessagesAsReadMutationData,
  MarkChatMessagesAsReadMutationVars,
  MessageDto,
  SendMessageMutationData,
  SendMessageMutationVars,
} from "@/types/chat";
import {
  Check,
  CheckCheck,
  Download,
  File,
  Headset,
  ImagePlus,
  Maximize2,
  MessageSquare,
  Send,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

// ─── Hotel title query ─────────────────────────────────────────────────────

const GET_HOTEL_TITLE_QUERY = gql`
  query GetHotelTitleForPopup($hotelId: String!) {
    getHotel(hotelId: $hotelId) {
      _id
      hotelTitle
      hotelLocation
    }
  }
`;

interface HotelTitleResult {
  getHotel: { _id: string; hotelTitle: string; hotelLocation: string };
}

// ─── Socket types ──────────────────────────────────────────────────────────

interface SocketAck {
  success: boolean;
  error?: string;
}

interface ChatRoomEventPayload {
  chatId: string;
}

interface TypingEventPayload extends ChatRoomEventPayload {
  userId: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// ─── Typing indicator ──────────────────────────────────────────────────────

function TypingIndicator({
  firstLetter,
  isSupport,
}: {
  firstLetter: string;
  isSupport: boolean;
}) {
  return (
    <div className="flex items-end gap-2 py-1">
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
          isSupport ? "bg-teal-500" : "bg-slate-400"
        }`}
        aria-hidden
      >
        {isSupport ? <Headset size={10} /> : firstLetter.toUpperCase()}
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm">
        {[0, 160, 320].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"
            style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Message bubble ────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
  isLastInGroup,
  copy,
}: {
  message: MessageDto;
  isOwn: boolean;
  isLastInGroup: boolean;
  copy: ReturnType<typeof getChatCopy>;
}) {
  const sentCls = `bg-[#d4e5f7] text-slate-900 ${isLastInGroup ? "rounded-2xl rounded-br-sm" : "rounded-2xl"}`;
  const recvCls = `bg-white text-slate-900 border border-slate-100 shadow-sm ${isLastInGroup ? "rounded-2xl rounded-bl-sm" : "rounded-2xl"}`;

  return (
    <div className={`relative overflow-hidden ${isOwn ? sentCls : recvCls}`}>
      {message.messageType === "IMAGE" && message.imageUrl && (
        <a
          href={resolveMediaUrl(message.imageUrl)}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveMediaUrl(message.imageUrl)}
            alt="Shared image"
            loading="lazy"
            className="block max-h-64 w-full object-cover"
          />
        </a>
      )}
      {message.messageType === "FILE" && message.fileUrl && (
        <a
          href={resolveMediaUrl(message.fileUrl)}
          download
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-4 py-3 transition hover:bg-black/5"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/60">
            <File size={16} className="text-slate-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {message.fileUrl.split("/").pop() ?? copy.attachment}
            </p>
            <p className="text-xs text-slate-500">{copy.attachment}</p>
          </div>
          <Download size={13} className="text-slate-400" />
        </a>
      )}
      {message.messageType === "TEXT" && (
        <p className="break-words px-3.5 py-2.5 text-sm leading-relaxed">
          {message.content}
        </p>
      )}
    </div>
  );
}

// ─── Popup ─────────────────────────────────────────────────────────────────

interface ChatThreadPopupProps {
  chatId: string;
  onClose: () => void;
}

export function ChatThreadPopup({ chatId, onClose }: ChatThreadPopupProps) {
  const { locale } = useI18n();
  const copy = getChatCopy(locale);
  const toast = useToast();
  const member = useMemo(() => getSessionMember(), []);
  const isPageVisible = usePageVisible();
  const memberType = member?.memberType;
  const isUser = memberType === "USER";

  const [messageInput, setMessageInput] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImage, setPendingImage] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refocusAfterSendRef = useRef(false);
  const pendingImageRef = useRef<{ file: File; previewUrl: string } | null>(
    null,
  );
  const lastMarkedKeyRef = useRef("");
  const socketRef = useRef<Socket | null>(null);
  const remoteTypingTimeoutRef = useRef<number | null>(null);
  const localTypingTimeoutRef = useRef<number | null>(null);
  const localTypingSentRef = useRef(false);
  const socketJoinFailedRef = useRef(false);
  const lastEventRefetchAtRef = useRef(0);
  const queuedEventRefetchTimeoutRef = useRef<number | null>(null);
  const prevMessageCountRef = useRef(0);

  /** QUERIES **/

  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery<
    GetChatQueryData,
    GetChatQueryVars
  >(GET_CHAT_QUERY, {
    skip: !chatId,
    variables: { chatId },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const chat = data?.getChat;

  const { data: hotelData } = useQuery<HotelTitleResult>(
    GET_HOTEL_TITLE_QUERY,
    {
      skip: !chat?.hotelId,
      variables: { hotelId: chat?.hotelId ?? "" },
      fetchPolicy: "cache-and-network",
    },
  );

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

  /** EFFECTS **/

  // Keep pendingImageRef in sync for unmount cleanup
  useEffect(() => {
    pendingImageRef.current = pendingImage;
  }, [pendingImage]);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (pendingImageRef.current)
        URL.revokeObjectURL(pendingImageRef.current.previewUrl);
    };
  }, []);

  const isGuestParticipant = Boolean(chat && chat.guestId === member?._id);
  const unreadForMe = chat
    ? isGuestParticipant
      ? chat.unreadGuestMessages
      : chat.unreadAgentMessages
    : 0;

  // Auto mark-as-read
  useEffect(() => {
    if (!chat || unreadForMe === 0) return;
    const markKey = `${chat._id}:${(chat.messages ?? []).length}:${unreadForMe}`;
    if (lastMarkedKeyRef.current === markKey) return;
    lastMarkedKeyRef.current = markKey;
    void markRead({ variables: { chatId: chat._id } }).catch(() => undefined);
  }, [chat, markRead, unreadForMe]);

  // Fallback polling when socket disconnected
  useEffect(() => {
    if (!chatId || socketConnected || !isPageVisible) {
      stopPolling();
      return;
    }
    startPolling(180000);
    return () => {
      stopPolling();
    };
  }, [chatId, isPageVisible, socketConnected, startPolling, stopPolling]);

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

  // Track previous message count for animation
  useEffect(() => {
    prevMessageCountRef.current = chat?.messages?.length ?? 0;
  }, [chat?.messages?.length]);

  // Socket setup
  useEffect(() => {
    if (!chatId || !isPageVisible) return;
    const token = getAccessToken();

    const socket = createChatSocket(token);
    socketRef.current = socket;
    socketJoinFailedRef.current = false;

    const requestRefetch = (): void => {
      const nowMs = Date.now();
      const elapsedMs = nowMs - lastEventRefetchAtRef.current;
      const minIntervalMs = 800;
      if (elapsedMs >= minIntervalMs) {
        lastEventRefetchAtRef.current = nowMs;
        void refetch();
        return;
      }
      if (queuedEventRefetchTimeoutRef.current !== null) return;
      const waitMs = minIntervalMs - elapsedMs;
      queuedEventRefetchTimeoutRef.current = window.setTimeout(() => {
        queuedEventRefetchTimeoutRef.current = null;
        lastEventRefetchAtRef.current = Date.now();
        void refetch();
      }, waitMs);
    };

    const clearRemoteTyping = () => {
      if (remoteTypingTimeoutRef.current) {
        window.clearTimeout(remoteTypingTimeoutRef.current);
        remoteTypingTimeoutRef.current = null;
      }
      setTypingUserId(null);
    };

    const onConnect = () => {
      setSocketConnected(true);
      socket.emit(
        "authenticate",
        token ? { token } : {},
        (authAck?: SocketAck) => {
        if (!authAck?.success) {
          if (!socketJoinFailedRef.current) {
            toast.info(
              authAck?.error ?? copy.pollingFallback,
            );
            socketJoinFailedRef.current = true;
          }
          return;
        }
        socket.emit("joinChat", { chatId }, (joinAck?: SocketAck) => {
          if (!joinAck?.success && !socketJoinFailedRef.current) {
            socketJoinFailedRef.current = true;
            return;
          }
          requestRefetch();
        });
        },
      );
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      clearRemoteTyping();
    };
    const onConnectError = () => {
      setSocketConnected(false);
    };

    const onRoomEvent = (payload: ChatRoomEventPayload) => {
      if (!payload?.chatId || payload.chatId !== chatId) return;
      requestRefetch();
    };

    const onUserTyping = (payload: TypingEventPayload) => {
      if (!payload?.chatId || payload.chatId !== chatId) return;
      if (!payload.userId || payload.userId === member?._id) return;
      setTypingUserId(payload.userId);
      if (remoteTypingTimeoutRef.current)
        window.clearTimeout(remoteTypingTimeoutRef.current);
      remoteTypingTimeoutRef.current = window.setTimeout(() => {
        setTypingUserId(null);
        remoteTypingTimeoutRef.current = null;
      }, 2000);
    };

    const onUserStopTyping = (payload: TypingEventPayload) => {
      if (!payload?.chatId || payload.chatId !== chatId) return;
      if (!payload.userId || payload.userId === member?._id) return;
      clearRemoteTyping();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("newMessage", onRoomEvent);
    socket.on("chatClaimed", onRoomEvent);
    socket.on("chatClosed", onRoomEvent);
    socket.on("messagesRead", onRoomEvent);
    socket.on("userTyping", onUserTyping);
    socket.on("userStopTyping", onUserStopTyping);

    return () => {
      if (localTypingTimeoutRef.current) {
        window.clearTimeout(localTypingTimeoutRef.current);
        localTypingTimeoutRef.current = null;
      }
      if (queuedEventRefetchTimeoutRef.current !== null) {
        window.clearTimeout(queuedEventRefetchTimeoutRef.current);
        queuedEventRefetchTimeoutRef.current = null;
      }
      if (localTypingSentRef.current) {
        socket.emit("stopTyping", { chatId });
        localTypingSentRef.current = false;
      }
      clearRemoteTyping();
      socket.emit("leaveChat", { chatId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("newMessage", onRoomEvent);
      socket.off("chatClaimed", onRoomEvent);
      socket.off("chatClosed", onRoomEvent);
      socket.off("messagesRead", onRoomEvent);
      socket.off("userTyping", onUserTyping);
      socket.off("userStopTyping", onUserStopTyping);
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [chatId, copy.pollingFallback, isPageVisible, member?._id, refetch, toast]);

  /** HANDLERS **/

  const stopTypingSignal = () => {
    if (!chat || !localTypingSentRef.current) return;
    const socket = socketRef.current;
    if (!socket) {
      localTypingSentRef.current = false;
      return;
    }
    socket.emit("stopTyping", { chatId: chat._id });
    localTypingSentRef.current = false;
  };

  const scheduleStopTyping = () => {
    if (localTypingTimeoutRef.current)
      window.clearTimeout(localTypingTimeoutRef.current);
    localTypingTimeoutRef.current = window.setTimeout(() => {
      stopTypingSignal();
      localTypingTimeoutRef.current = null;
    }, 1200);
  };

  const emitTypingSignal = () => {
    if (!chat || !socketConnected) return;
    const socket = socketRef.current;
    if (!socket) return;
    if (!localTypingSentRef.current) {
      socket.emit("typing", { chatId: chat._id });
      localTypingSentRef.current = true;
    }
    scheduleStopTyping();
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
    if (!value.trim()) {
      stopTypingSignal();
      return;
    }
    emitTypingSignal();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.closest("form")?.requestSubmit();
    }
  };

  const onSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chat) return;
    const content = messageInput.trim();
    if (!content) return;
    try {
      await sendMessage({
        variables: {
          input: { chatId: chat._id, messageType: "TEXT", content },
        },
      });
      stopTypingSignal();
      refocusAfterSendRef.current = true;
      setMessageInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (mutationError) {
      await errorAlert(
        copy.sendMessage,
        getErrorMessage(mutationError),
      );
    }
  };

  const onSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      await errorAlert(
        copy.uploadImage,
        "Please select a JPEG, PNG, WebP, or GIF image.",
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      await errorAlert(copy.uploadImage, "Images must be under 10 MB.");
      return;
    }
    // Revoke previous preview URL if any
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const clearPendingImage = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
  };

  const sendPendingImage = async () => {
    if (!pendingImage || !chat) return;
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImageFile(pendingImage.file, "chat");
      await sendMessage({
        variables: {
          input: { chatId: chat._id, messageType: "IMAGE", imageUrl },
        },
      });
      clearPendingImage();
    } catch (uploadError) {
      await errorAlert(copy.uploadImage, getErrorMessage(uploadError));
    } finally {
      setUploadingImage(false);
    }
  };

  const onClaimChat = async () => {
    if (!chat) return;
    const confirmed = await confirmAction({
      title: "Claim this chat?",
      text: copy.claim,
      confirmText: copy.claim,
    });
    if (!confirmed) return;
    try {
      await claimChat({ variables: { input: { chatId: chat._id } } });
      await refetch();
      await successAlert(copy.claim);
    } catch (mutationError) {
      await errorAlert(copy.claim, getErrorMessage(mutationError));
    }
  };

  /** COMPUTED **/

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

  const isSupportChat = chat?.chatScope === "SUPPORT";
  const hotelTitle = isSupportChat
    ? copy.supportTitle
    : (hotelData?.getHotel.hotelTitle ?? copy.hotelSupport);
  const hotelLocation = isSupportChat
    ? ""
    : (hotelData?.getHotel.hotelLocation ?? "");
  const supportMeta =
    chat?.supportTopic?.trim() ||
    (chat?.sourcePath ? `${copy.contextFromPage}: ${chat.sourcePath}` : copy.platformSupport);
  const hotelAvatarColor = avatarBg(chat?.hotelId ?? chat?._id ?? hotelTitle);
  const guestName = chat ? getGuestDisplayName(chat, copy.guest) : copy.guest;

  const statusSubtitle = chat
    ? isSupportChat
      ? !isGuestParticipant
        ? `${guestName}${supportMeta ? ` · ${supportMeta}` : ""}`
        : supportMeta
      : !isGuestParticipant
        ? `${guestName}${hotelLocation ? ` · ${hotelLocation}` : ""}`
        : hotelLocation || (chat.chatStatus === "CLOSED" ? copy.closed : "")
    : null;

  return (
    <>
      <style>{`
        @keyframes popupFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popupSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popupMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popupTypingFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px]"
        style={{ animation: "popupFadeIn 0.2s ease-out both" }}
        onClick={onClose}
      />

      {/* Phone-sized panel */}
      <div
        className="fixed inset-x-0 bottom-0 z-[130] flex max-h-[92svh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[700px] sm:w-[390px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        style={{
          animation: "popupSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* ── Header ── */}
        <div className="flex flex-none items-center gap-2.5 border-b border-slate-100 bg-white px-4 py-3">
          {/* Avatar */}
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
              isSupportChat ? "bg-teal-500" : hotelAvatarColor
            }`}
          >
            {isSupportChat ? <Headset size={16} /> : hotelTitle.charAt(0)}
          </div>

          {/* Name + subtitle */}
          <div className="min-w-0 flex-1">
            {chat ? (
              <>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {hotelTitle}
                </p>
                <div className="flex items-center gap-1.5">
                  {statusSubtitle ? (
                    <p className="truncate text-xs text-slate-400">
                      {statusSubtitle}
                    </p>
                  ) : null}
                  <span
                    title={socketConnected ? copy.liveConnection : copy.pollingFallback}
                  >
                    {socketConnected ? (
                      <Wifi size={9} className="text-emerald-400" />
                    ) : (
                      <WifiOff size={9} className="text-slate-300" />
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-slate-100" />
              </div>
            )}
          </div>

          {/* Expand to full page */}
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
          <Link
            href={`/chats/${chatId}`}
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            title="Open full page"
            aria-label="Open full page"
          >
            <Maximize2 size={14} />
          </Link>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex-none border-b border-rose-100 bg-rose-50 px-5 py-2 text-xs font-medium text-rose-700">
            {getErrorMessage(error)}
          </div>
        )}

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {/* Loading skeletons */}
          {loading && !chat && (
            <div className="flex flex-col gap-4 px-5 py-8">
              {[false, true, false, true, false].map((own, i) => (
                <div
                  key={i}
                  className={`flex ${own ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`h-10 animate-pulse rounded-2xl ${
                      own ? "w-44 bg-blue-100/60" : "w-56 bg-white shadow-sm"
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {chat && (chat.messages ?? []).length === 0 && (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                <MessageSquare size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {copy.startConversation}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isSupportChat
                  ? copy.messageDirectSupport
                  : copy.messageDirectHotel}
              </p>
            </div>
          )}

          {/* Messages */}
          {chat && (chat.messages ?? []).length > 0 && (
            <div className="space-y-0.5 px-4 py-5">
              {(chat.messages ?? []).map((message, index) => {
                const isOwn =
                  (message.senderType === "GUEST" && isGuestParticipant) ||
                  (message.senderType === "AGENT" && !isGuestParticipant);
                const incomingSenderLabel =
                  message.senderType === "GUEST"
                    ? guestName
                    : isSupportChat
                      ? copy.supportTeam
                      : copy.hotelStaff;

                const prevMessage =
                  index > 0 ? (chat.messages ?? [])[index - 1] : null;
                const nextMessage =
                  index < (chat.messages ?? []).length - 1
                    ? (chat.messages ?? [])[index + 1]
                    : null;

                const showDateSep =
                  !prevMessage ||
                  !isSameDay(prevMessage.timestamp, message.timestamp);
                const isLastInGroup =
                  !nextMessage || nextMessage.senderType !== message.senderType;
                const isFirstInGroup =
                  !prevMessage || prevMessage.senderType !== message.senderType;
                const showTime =
                  isLastInGroup || message.messageType !== "TEXT";
                const isNewMsg = index >= prevMessageCountRef.current;

                return (
                  <div
                    key={`${message.senderId}-${message.timestamp}-${index}`}
                  >
                    {/* Date separator */}
                    {showDateSep && (
                      <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200/70" />
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-0.5 text-[10px] font-semibold tracking-wide text-slate-400 shadow-sm">
                          {formatChatDateSeparator(locale, message.timestamp)}
                        </span>
                        <div className="h-px flex-1 bg-slate-200/70" />
                      </div>
                    )}

                    {/* Message row */}
                    <div
                      className={`flex items-end gap-1.5 ${isOwn ? "justify-end" : "justify-start"} ${
                        isLastInGroup ? "mb-3" : "mb-0.5"
                      }`}
                      style={
                        isNewMsg
                          ? { animation: "popupMsgIn 0.2s ease-out both" }
                          : undefined
                      }
                    >
                      {/* Received: avatar */}
                      {!isOwn && (
                        <div className="flex-shrink-0">
                          {isLastInGroup ? (
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                                isSupportChat ? "bg-teal-500" : hotelAvatarColor
                              } text-[9px] font-bold uppercase text-white`}
                            >
                              {isSupportChat ? (
                                <Headset size={9} />
                              ) : (
                                hotelTitle.charAt(0)
                              )}
                            </div>
                          ) : (
                            <div className="h-7 w-7" />
                          )}
                        </div>
                      )}

                      {/* Sent: time shown LEFT of bubble */}
                      {isOwn && showTime && (
                        <div className="flex flex-shrink-0 flex-col items-end gap-0.5 pb-0.5">
                          <span className="text-[10px] leading-none text-slate-400">
                            {formatChatTime(locale, message.timestamp)}
                          </span>
                          {message.read ? (
                            <CheckCheck size={10} className="text-blue-400" />
                          ) : (
                            <Check size={10} className="text-slate-300" />
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className="flex max-w-[75%] flex-col gap-0.5">
                        {!isOwn && isFirstInGroup && (
                          <p className="ml-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            {incomingSenderLabel}
                          </p>
                        )}
                        <MessageBubble
                          message={message}
                          isOwn={isOwn}
                          isLastInGroup={isLastInGroup}
                          copy={copy}
                        />
                      </div>

                      {/* Received: time shown RIGHT of bubble */}
                      {!isOwn && showTime && (
                        <span className="flex-shrink-0 pb-0.5 text-[10px] leading-none text-slate-400">
                          {formatChatTime(locale, message.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUserId && (
                <div
                  style={{ animation: "popupTypingFade 0.2s ease-out both" }}
                >
                  <TypingIndicator
                    firstLetter={hotelTitle.charAt(0)}
                    isSupport={isSupportChat}
                  />
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input area ── */}
        <div className="flex-none border-t border-slate-100 bg-white px-4 py-3 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
          {!canSend ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <p className="text-sm text-slate-500">
                {canClaim ? copy.claimRequiredNotice : copy.closedNotice}
              </p>
            </div>
          ) : (
            <>
              {/* Image preview strip */}
              {pendingImage && (
                <div className="mb-2.5 flex items-end gap-3">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingImage.previewUrl}
                      alt="Preview"
                      className="h-20 w-20 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={clearPendingImage}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white shadow transition hover:bg-slate-900"
                      aria-label={copy.removeImage}
                    >
                      <X size={10} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void sendPendingImage();
                    }}
                    disabled={uploadingImage || !chat}
                    className={`mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                      uploadingImage
                        ? "animate-pulse bg-sky-300 text-white"
                        : "bg-sky-500 text-white shadow-sm hover:bg-sky-600 active:scale-95"
                    }`}
                    aria-label={copy.sendImage}
                  >
                    <Send size={15} />
                  </button>
                </div>
              )}

              {/* Text input */}
              <form
                onSubmit={(e) => {
                  void onSendMessage(e);
                }}
              >
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-slate-300 focus-within:shadow-md">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={onSelectImage}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || sending}
                    className={`mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                      pendingImage
                        ? "text-sky-500"
                        : "text-slate-300 hover:text-slate-500"
                    }`}
                    aria-label={copy.uploadImage}
                  >
                    <ImagePlus size={16} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    onBlur={() => {
                      stopTypingSignal();
                    }}
                    rows={1}
                    placeholder={copy.sendMessagePlaceholder}
                    disabled={sending}
                    className="flex-1 resize-none bg-transparent py-1 text-sm text-slate-900 placeholder-slate-400 outline-none"
                    style={{ minHeight: "32px", maxHeight: "120px" }}
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className={`mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                      messageInput.trim()
                        ? "bg-sky-500 text-white shadow-sm hover:bg-sky-600 active:scale-95"
                        : "text-slate-300"
                    }`}
                    aria-label={copy.sendMessage}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
