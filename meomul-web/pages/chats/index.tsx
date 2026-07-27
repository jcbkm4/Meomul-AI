import { useMutation, useQuery } from "@apollo/client/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  GET_MY_CHATS_QUERY,
  START_CHAT_MUTATION,
  START_SUPPORT_CHAT_MUTATION,
} from "@/graphql/chat.gql";
import { GET_AGENT_HOTELS_QUERY, GET_HOTELS_QUERY } from "@/graphql/hotel.gql";
import { GET_MY_BOOKINGS_QUERY } from "@/graphql/booking.gql";
import { usePaginationQueryState } from "@/lib/hooks/use-pagination-query-state";
import { getSessionMember } from "@/lib/auth/session";
import { formatBookingDate, getBookingStatusLabel } from "@/lib/bookings/booking-i18n";
import {
  formatChatTimeAgo,
  getChatCopy,
  getChatStatusLabel,
  getLastPreviewLabel,
} from "@/lib/chat/chat-i18n";
import {
  avatarBg,
} from "@/lib/chat/chat-helpers";
import { useI18n } from "@/lib/i18n/provider";
import { errorAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import type {
  ChatDto,
  ChatStatus,
  GetMyChatsQueryData,
  GetMyChatsQueryVars,
  PaginationInput,
  StartChatMutationData,
  StartChatMutationVars,
  StartSupportChatMutationData,
  StartSupportChatMutationVars,
} from "@/types/chat";
import type {
  GetAgentHotelsQueryData,
  GetAgentHotelsQueryVars,
  GetHotelsQueryData,
  GetHotelsQueryVars,
  HotelListItem,
} from "@/types/hotel";
import type {
  BookingListItem,
  GetMyBookingsQueryData,
  GetMyBookingsQueryVars,
} from "@/types/booking";
import type { NextPageWithAuth } from "@/types/page";
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  Send,
  SquarePen,
  X,
} from "lucide-react";

const ChatThreadPopup = dynamic(
  () =>
    import("@/components/chat/chat-thread-popup").then(
      (mod) => mod.ChatThreadPopup,
    ),
  { ssr: false },
);
const StaffChatsView = dynamic(
  () =>
    import("@/components/chat/staff-chats-view").then(
      (mod) => mod.StaffChatsView,
    ),
  { ssr: false },
);

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 20;
const HOTEL_LIST_LIMIT = 100;
const CHAT_STATUSES: ChatStatus[] = ["WAITING", "ACTIVE", "CLOSED"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getChatTitle(
  chat: ChatDto,
  hotelsMap: Map<string, HotelListItem>,
  supportTitle: string,
): string {
  if (chat.chatScope === "SUPPORT") return supportTitle;
  if (!chat.hotelId) return supportTitle;
  return hotelsMap.get(chat.hotelId)?.hotelTitle ?? supportTitle;
}

function getChatAvatarSeed(chat: ChatDto): string {
  return chat.hotelId ?? chat._id;
}

// ─── Hotel Avatar ─────────────────────────────────────────────────────────────

function HotelAvatar({
  name,
  id,
  status,
  size = "md",
}: {
  name: string;
  id: string;
  status?: ChatStatus;
  size?: "sm" | "md" | "lg";
}) {
  const color = avatarBg(id);
  const cls =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : size === "lg"
        ? "h-14 w-14 text-lg"
        : "h-11 w-11 text-sm";
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`flex ${cls} items-center justify-center rounded-full ${color} font-bold uppercase text-white`}
      >
        {name.charAt(0)}
      </div>
      {status === "ACTIVE" && (
        <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
      )}
      {status === "WAITING" && (
        <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
      )}
    </div>
  );
}

// ─── New Chat Overlay ─────────────────────────────────────────────────────────

function NewChatOverlay({
  availableHotels,
  myBookings,
  hotelsMap,
  allowHotelChats,
  allowSupportChats,
  initialIntent = "hotel",
  preselectedHotelId = "",
  supportSourcePath = "",
  onClose,
  onSuccess,
}: {
  availableHotels: HotelListItem[];
  myBookings: BookingListItem[];
  hotelsMap: Map<string, HotelListItem>;
  allowHotelChats: boolean;
  allowSupportChats: boolean;
  initialIntent?: "hotel" | "support";
  preselectedHotelId?: string;
  supportSourcePath?: string;
  onClose: () => void;
  onSuccess: (chatId: string) => void;
}) {
  const { locale } = useI18n();
  const copy = getChatCopy(locale);
  const [step, setStep] = useState<"select" | "compose">("select");
  const [intent, setIntent] = useState<"hotel" | "support">(initialIntent);
  const [selectedHotel, setSelectedHotel] = useState<HotelListItem | null>(
    null,
  );
  const [selectedBooking, setSelectedBooking] =
    useState<BookingListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [startChat, { loading }] = useMutation<
    StartChatMutationData,
    StartChatMutationVars
  >(START_CHAT_MUTATION);
  const [startSupportChat, { loading: supportLoading }] = useMutation<
    StartSupportChatMutationData,
    StartSupportChatMutationVars
  >(START_SUPPORT_CHAT_MUTATION);

  useEffect(() => {
    setIntent(initialIntent);
  }, [initialIntent]);

  useEffect(() => {
    if (!allowHotelChats && intent === "hotel") {
      setIntent("support");
    }
  }, [allowHotelChats, intent]);

  // Auto-select hotel from query param once hotels are loaded
  useEffect(() => {
    if (!allowHotelChats || intent !== "hotel") return;
    if (!preselectedHotelId || selectedHotel || availableHotels.length === 0)
      return;
    const hotel = availableHotels.find((h) => h._id === preselectedHotelId);
    if (hotel) {
      setSelectedHotel(hotel);
      setStep("compose");
    }
  }, [
    allowHotelChats,
    availableHotels,
    intent,
    preselectedHotelId,
    selectedHotel,
  ]);

  useEffect(() => {
    if (step === "select" && intent === "hotel") {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
    if (step === "compose") setTimeout(() => textareaRef.current?.focus(), 80);
  }, [intent, step]);

  // Unique booked hotels (most-recent booking per hotel)
  const bookedHotels = useMemo(() => {
    if (!allowHotelChats) return [];
    const seen = new Set<string>();
    const result: Array<{ booking: BookingListItem; hotel: HotelListItem }> =
      [];
    for (const booking of myBookings) {
      const hotel = hotelsMap.get(booking.hotelId);
      if (!seen.has(booking.hotelId) && hotel) {
        seen.add(booking.hotelId);
        result.push({ booking, hotel });
      }
    }
    return result;
  }, [allowHotelChats, myBookings, hotelsMap]);

  const filteredHotels = useMemo(() => {
    if (!allowHotelChats) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableHotels.slice(0, 40);
    return availableHotels.filter(
      (h) =>
        h.hotelTitle.toLowerCase().includes(q) ||
        h.hotelLocation.toLowerCase().includes(q),
    );
  }, [allowHotelChats, availableHotels, searchQuery]);

  const handleSelectHotel = (
    hotel: HotelListItem,
    booking?: BookingListItem,
  ) => {
    setSelectedHotel(hotel);
    setSelectedBooking(booking ?? null);
    setStep("compose");
  };

  const handleSend = async () => {
    const content = message.trim();
    if (!content) return;
    try {
      let chatId: string | undefined;
      if (intent === "support") {
        const res = await startSupportChat({
          variables: {
            input: {
              initialMessage: content,
              sourcePath: supportSourcePath || undefined,
            },
          },
        });
        chatId = res.data?.startSupportChat._id;
      } else {
        if (!selectedHotel) return;
        const input: StartChatMutationVars["input"] = {
          hotelId: selectedHotel._id,
          initialMessage: content,
        };
        if (selectedBooking?._id) input.bookingId = selectedBooking._id;
        const res = await startChat({ variables: { input } });
        chatId = res.data?.startChat._id;
      }

      if (!chatId) {
        await errorAlert("Error", "Chat was created but ID is missing.");
        return;
      }
      onSuccess(chatId);
    } catch (err) {
      await errorAlert("Could not start conversation", getErrorMessage(err));
    }
  };

  return (
    <>
      <style>{`
        @keyframes overlaySlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes stepSlideLeft {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[120] bg-black/30 backdrop-blur-[2px]"
        style={{ animation: "overlayFadeIn 0.2s ease-out both" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed inset-x-0 bottom-0 z-[130] flex max-h-[92svh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[80vh] sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        style={{
          animation: "overlaySlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex flex-none justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex flex-none items-center gap-3 px-5 py-4">
          <button
            type="button"
            onClick={step === "compose" ? () => setStep("select") : onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="flex-1 min-w-0">
            {step === "select" ? (
              <p className="font-semibold text-slate-900">New conversation</p>
            ) : intent === "support" ? (
              <>
                <p className="truncate font-semibold text-slate-900">
                    {copy.supportTitle}
                </p>
                <p className="text-xs text-slate-400">{copy.platformSupport}</p>
              </>
            ) : (
              <>
                <p className="truncate font-semibold text-slate-900">
                  {selectedHotel?.hotelTitle}
                </p>
                <p className="text-xs text-slate-400">
                  {selectedHotel?.hotelLocation}
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* ── Step 1: Select hotel ── */}
        {step === "select" && (
          <div
            className="flex flex-1 flex-col overflow-hidden"
            style={{ animation: "stepSlideLeft 0.2s ease-out both" }}
          >
            {allowSupportChats && allowHotelChats && (
              <div className="px-5 pb-3 pt-4">
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIntent("hotel");
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      intent === "hotel"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {copy.hotelChat}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIntent("support");
                      setSelectedHotel(null);
                      setSelectedBooking(null);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      intent === "support"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {copy.supportTab}
                  </button>
                </div>
              </div>
            )}

            {intent === "support" ? (
              <div className="flex flex-1 flex-col justify-center px-5 pb-6">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
                      <MessageSquare size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {copy.contactSupportTitle}
                      </p>
                      <p className="text-xs text-slate-500">
                        {copy.contactSupportDesc}
                      </p>
                    </div>
                  </div>
                  {supportSourcePath && (
                    <p className="mt-3 rounded-lg bg-white px-3 py-2 text-[11px] text-slate-500">
                      {copy.contextFromPage}:{" "}
                      <span className="font-medium text-slate-700">
                        {supportSourcePath}
                      </span>
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep("compose")}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    {copy.continueToMessage}
                    <ArrowLeft size={14} className="rotate-180" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="px-5 pb-3 pt-4">
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-slate-300 focus-within:bg-white">
                    <Search
                      size={14}
                      className="flex-shrink-0 text-slate-400"
                    />
                    <input
                      ref={searchRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={copy.searchHotelsPlaceholder}
                      className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="flex-shrink-0 text-slate-400 transition hover:text-slate-600"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-4">
                  {/* From bookings */}
                  {!searchQuery && bookedHotels.length > 0 && (
                    <div className="mb-2">
                      <p className="px-5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {copy.fromBookings}
                      </p>
                      {bookedHotels.map(({ booking, hotel }) => (
                        <button
                          key={booking._id}
                          type="button"
                          onClick={() => handleSelectHotel(hotel, booking)}
                          className="flex w-full items-center gap-3.5 px-5 py-3 text-left transition hover:bg-slate-50"
                        >
                          <HotelAvatar
                            name={hotel.hotelTitle}
                            id={hotel._id}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {hotel.hotelTitle}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1">
                              <CalendarCheck
                                size={10}
                                className="flex-shrink-0 text-slate-400"
                              />
                              <p className="truncate text-xs text-slate-400">
                                #{booking.bookingCode} ·{" "}
                                {formatBookingDate(locale, booking.checkInDate)} –{" "}
                                {formatBookingDate(locale, booking.checkOutDate)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              booking.bookingStatus === "CONFIRMED" ||
                              booking.bookingStatus === "CHECKED_IN"
                                ? "bg-emerald-50 text-emerald-700"
                                : booking.bookingStatus === "CANCELLED"
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {getBookingStatusLabel(locale, booking.bookingStatus)}
                          </span>
                        </button>
                      ))}
                      <div className="mx-5 my-2 h-px bg-slate-100" />
                    </div>
                  )}

                  {/* All hotels */}
                  <div>
                    <p className="px-5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {searchQuery
                        ? `${copy.results} (${filteredHotels.length})`
                        : copy.allHotels}
                    </p>
                    {filteredHotels.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Building2 size={24} className="mb-2 text-slate-200" />
                        <p className="text-sm text-slate-400">
                          {copy.noHotelsFound}
                        </p>
                      </div>
                    ) : (
                      filteredHotels.map((hotel) => (
                        <button
                          key={hotel._id}
                          type="button"
                          onClick={() => handleSelectHotel(hotel)}
                          className="flex w-full items-center gap-3.5 px-5 py-3 text-left transition hover:bg-slate-50"
                        >
                          <HotelAvatar
                            name={hotel.hotelTitle}
                            id={hotel._id}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {hotel.hotelTitle}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {hotel.hotelLocation} · {hotel.hotelType}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Compose ── */}
        {step === "compose" && (intent === "support" || selectedHotel) && (
          <div
            className="flex flex-1 flex-col overflow-hidden"
            style={{ animation: "stepSlideLeft 0.2s ease-out both" }}
          >
            {/* Hotel info */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
              {intent === "support" ? (
                <>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white">
                    <MessageSquare size={24} />
                  </span>
                  <p className="mt-4 text-base font-bold text-slate-900">
                    {copy.supportTitle}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {copy.repliesQuickly}
                  </p>
                  {supportSourcePath && (
                    <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
                      {copy.sentFromPage}:{" "}
                      <span className="font-medium text-slate-700">
                        {supportSourcePath}
                      </span>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <HotelAvatar
                    name={selectedHotel?.hotelTitle ?? "Hotel"}
                    id={selectedHotel?._id ?? "hotel"}
                    size="lg"
                  />
                  <p className="mt-4 text-base font-bold text-slate-900">
                    {selectedHotel?.hotelTitle}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {selectedHotel?.hotelLocation}
                  </p>
                  {selectedBooking && (
                    <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-sky-50 px-3.5 py-2 text-xs text-sky-700">
                      <CalendarCheck size={12} />
                      <span>
                        {copy.bookingPrefix}{" "}
                        <span className="font-semibold">
                          #{selectedBooking.bookingCode}
                        </span>
                        {" · "}
                        {formatBookingDate(locale, selectedBooking.checkInDate)} –{" "}
                        {formatBookingDate(locale, selectedBooking.checkOutDate)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(null)}
                        className="ml-0.5 text-sky-400 transition hover:text-sky-600"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}
                </>
              )}
              <p className="mt-5 max-w-[260px] text-xs text-slate-400">
                {intent === "support"
                  ? copy.privateSupport
                  : copy.privateHotel}
              </p>
            </div>

            {/* Input */}
            <div className="flex-none border-t border-slate-100 bg-white px-4 pb-5 pt-3">
              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-slate-300 focus-within:shadow-md">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={copy.writeMessagePlaceholder}
                  rows={1}
                  className="flex-1 resize-none bg-transparent py-1 text-sm text-slate-900 placeholder-slate-400 outline-none"
                  style={{ minHeight: "36px", maxHeight: "140px" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    void handleSend();
                  }}
                  disabled={!message.trim() || loading || supportLoading}
                  className={`mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                    message.trim()
                      ? "bg-sky-500 text-white shadow-sm hover:bg-sky-600 active:scale-95"
                      : "text-slate-300"
                  }`}
                >
                  <Send size={15} />
                </button>
              </div>
              {message.trim() && (
                <p className="mt-1 text-right text-[10px] text-slate-400">
                  Enter to send, Shift+Enter for a new line
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ChatsPage: NextPageWithAuth = () => {
  const { locale } = useI18n();
  const copy = getChatCopy(locale);
  const router = useRouter();
  const member = useMemo(() => getSessionMember(), []);
  const memberType = member?.memberType;
  const isUser = memberType === "USER";
  const isAgent = memberType === "AGENT";
  const isStaff =
    isAgent || memberType === "ADMIN" || memberType === "ADMIN_OPERATOR";
  const canStartNewConversation = isUser || isAgent;

  type ChatTypeFilter = "ALL" | "HOTELS" | "SUPPORT";
  const [chatTypeFilter, setChatTypeFilter] = useState<ChatTypeFilter>("ALL");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [preselectedHotelId, setPreselectedHotelId] = useState("");
  const [preselectedIntent, setPreselectedIntent] = useState<
    "hotel" | "support"
  >("hotel");
  const [supportSourcePath, setSupportSourcePath] = useState("");

  // Query param support: ?openNew=1&openHotelId=XXX&openSupport=1&sourcePath=/hotels/123
  const openNewFromQuery = router.query.openNew === "1";
  const openSupportFromQuery = router.query.openSupport === "1";
  const openHotelIdFromQuery =
    typeof router.query.openHotelId === "string"
      ? router.query.openHotelId
      : "";
  const sourcePathFromQuery =
    typeof router.query.sourcePath === "string" ? router.query.sourcePath : "";

  const { page, pushQuery } = usePaginationQueryState<ChatStatus>({
    pathname: "/chats",
    statusValues: CHAT_STATUSES,
  });

  const listInput = useMemo<PaginationInput>(
    () => ({ page, limit: PAGE_LIMIT, sort: "lastMessageAt", direction: -1 }),
    [page],
  );
  const hotelsInput = useMemo(
    () => ({
      page: 1,
      limit: HOTEL_LIST_LIMIT,
      sort: "createdAt",
      direction: -1 as const,
    }),
    [],
  );
  const bookingsInput = useMemo(
    () => ({ page: 1, limit: 20, sort: "createdAt", direction: -1 as const }),
    [],
  );

  /** QUERIES **/

  const { data: agentHotelsData, loading: agentHotelsLoading } = useQuery<
    GetAgentHotelsQueryData,
    GetAgentHotelsQueryVars
  >(GET_AGENT_HOTELS_QUERY, {
    skip: !isAgent,
    variables: { input: hotelsInput },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const { data: publicHotelsData, loading: publicHotelsLoading } = useQuery<
    GetHotelsQueryData,
    GetHotelsQueryVars
  >(GET_HOTELS_QUERY, {
    variables: { input: hotelsInput },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const hotelsMap = useMemo<Map<string, HotelListItem>>(() => {
    const map = new Map<string, HotelListItem>();
    for (const h of publicHotelsData?.getHotels.list ?? []) map.set(h._id, h);
    return map;
  }, [publicHotelsData]);

  const availableHotels = useMemo<HotelListItem[]>(
    () =>
      isAgent
        ? (agentHotelsData?.getAgentHotels.list ?? [])
        : (publicHotelsData?.getHotels.list ?? []),
    [agentHotelsData, isAgent, publicHotelsData],
  );

  const { data: bookingsData } = useQuery<
    GetMyBookingsQueryData,
    GetMyBookingsQueryVars
  >(GET_MY_BOOKINGS_QUERY, {
    skip: !isUser,
    variables: { input: bookingsInput },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });
  const myBookings = useMemo(
    () => bookingsData?.getMyBookings.list ?? [],
    [bookingsData],
  );

  const {
    data: myChatsData,
    loading: myChatsLoading,
    error: myChatsError,
  } = useQuery<GetMyChatsQueryData, GetMyChatsQueryVars>(GET_MY_CHATS_QUERY, {
    skip: !isUser,
    variables: { input: listInput },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  /** EFFECTS **/

  // Auto-open overlay from query param (e.g. from hotel detail page)
  useEffect(() => {
    if (!openNewFromQuery || !canStartNewConversation) return;

    if (openSupportFromQuery || !isUser) {
      setPreselectedIntent("support");
      setSupportSourcePath(sourcePathFromQuery);
    } else {
      setPreselectedIntent("hotel");
      setSupportSourcePath("");
    }

    if (isUser && openHotelIdFromQuery) {
      setPreselectedHotelId(openHotelIdFromQuery);
    }
    setShowNewChat(true);
    void router.replace("/chats", undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canStartNewConversation,
    isUser,
    openHotelIdFromQuery,
    openNewFromQuery,
    openSupportFromQuery,
    sourcePathFromQuery,
  ]);

  /** COMPUTED **/

  const chats = useMemo(() => myChatsData?.getMyChats.list ?? [], [myChatsData?.getMyChats.list]);
  const total = myChatsData?.getMyChats.metaCounter.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const filteredChats = useMemo(() => {
    if (chatTypeFilter === "ALL") return chats;
    return chats.filter((c) =>
      chatTypeFilter === "SUPPORT"
        ? c.chatScope === "SUPPORT"
        : c.chatScope === "HOTEL",
    );
  }, [chats, chatTypeFilter]);
  const loading = myChatsLoading;
  const error = myChatsError;
  const hotelsLoading = isAgent ? agentHotelsLoading : publicHotelsLoading;

  const unreadForMe = (chat: ChatDto) => chat.unreadGuestMessages;

  return (
    <>
      <style>{`
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* New chat overlay */}
      {showNewChat && canStartNewConversation && (
        <NewChatOverlay
          availableHotels={publicHotelsData?.getHotels.list ?? []}
          myBookings={myBookings}
          hotelsMap={hotelsMap}
          allowHotelChats={isUser}
          allowSupportChats={canStartNewConversation}
          initialIntent={preselectedIntent}
          preselectedHotelId={preselectedHotelId}
          supportSourcePath={supportSourcePath}
          onClose={() => {
            setShowNewChat(false);
            setPreselectedHotelId("");
            setPreselectedIntent(isUser ? "hotel" : "support");
            setSupportSourcePath("");
          }}
          onSuccess={(chatId) => {
            setShowNewChat(false);
            setPreselectedHotelId("");
            setPreselectedIntent(isUser ? "hotel" : "support");
            setSupportSourcePath("");
            setSelectedChatId(chatId);
          }}
        />
      )}

      {/* Chat thread popup */}
      {selectedChatId && (
        <ChatThreadPopup
          chatId={selectedChatId}
          onClose={() => {
            setSelectedChatId(null);
          }}
        />
      )}

      {/* ── Staff dashboard ── */}
      {isStaff && (
        <main
          className="-mx-3 -my-8 flex flex-col overflow-hidden sm:-mx-6 sm:-my-10"
          style={{ height: "calc(100svh - 57px)" }}
        >
          <StaffChatsView
            availableHotels={availableHotels}
            hotelsLoading={hotelsLoading}
            memberType={memberType as "AGENT" | "ADMIN" | "ADMIN_OPERATOR"}
            onSelectChat={setSelectedChatId}
            onNewChat={() => setShowNewChat(true)}
          />
        </main>
      )}

      {/* ── User chat list ── */}
      {isUser && (
        <main className="w-full space-y-4">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {copy.inbox}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                {copy.messages}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setShowNewChat(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow"
              aria-label={copy.newConversation}
            >
              <SquarePen size={15} className="text-slate-500" />
              {copy.newMessage}
            </button>
          </div>

          {/* Error */}
          {error ? <ErrorNotice message={getErrorMessage(error)} /> : null}

          {/* Loading skeletons */}
          {loading && chats.length === 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 border-b border-slate-50 px-5 py-4 last:border-b-0"
                >
                  <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-1/3 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-3 w-8 animate-pulse rounded-full bg-slate-100" />
                    </div>
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && chats.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                <MessageSquare size={22} className="text-slate-400" />
              </div>
              <p className="font-semibold text-slate-800">
                {copy.noConversations}
              </p>
              <p className="mt-1.5 max-w-[220px] text-sm text-slate-400">
                {copy.supportPageDesc}
              </p>
              <button
                type="button"
                onClick={() => setShowNewChat(true)}
                className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-95"
              >
                <SquarePen size={14} />
                {copy.newConversation}
              </button>
            </div>
          )}

          {/* Chat type filter tabs */}
          {chats.length > 0 && (
            <div className="flex gap-2">
              {(["ALL", "HOTELS", "SUPPORT"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setChatTypeFilter(tab);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    chatTypeFilter === tab
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab === "ALL"
                    ? copy.all
                    : tab === "HOTELS"
                      ? copy.hotels
                      : copy.support}
                </button>
              ))}
            </div>
          )}

          {/* Chat list */}
          {filteredChats.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {filteredChats.map((chat, i) => {
                const isSupportChat = chat.chatScope === "SUPPORT";
                const hotelName = getChatTitle(chat, hotelsMap, copy.supportTitle);
                const unread = unreadForMe(chat);
                const preview = getLastPreviewLabel(locale, chat);
                const time = formatChatTimeAgo(locale, chat.lastMessageAt);
                const lastMsg = (chat.messages ?? []).at(-1);
                const isLastMsgFromMe = lastMsg?.senderType === "GUEST";
                const statusLabel = getChatStatusLabel(locale, chat.chatStatus);

                return (
                  <button
                    key={chat._id}
                    type="button"
                    onClick={() => {
                      setSelectedChatId(chat._id);
                    }}
                    className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50 ${
                      i < filteredChats.length - 1
                        ? "border-b border-slate-50"
                        : ""
                    }`}
                    style={{
                      animation: "chatFadeIn 0.25s ease-out both",
                      animationDelay: `${i * 35}ms`,
                    }}
                  >
                    <HotelAvatar
                      name={hotelName}
                      id={getChatAvatarSeed(chat)}
                      status={chat.chatStatus}
                    />

                    <div className="min-w-0 flex-1">
                      {/* Row 1: name + time */}
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            unread > 0
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-800"
                          }`}
                        >
                          {hotelName}
                        </p>
                        <span
                          className={`flex-shrink-0 text-[11px] ${
                            unread > 0
                              ? "font-semibold text-sky-500"
                              : "text-slate-400"
                          }`}
                        >
                          {time}
                        </span>
                      </div>

                      {/* Row 2: preview + unread */}
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1">
                          {isLastMsgFromMe && (
                            <Check
                              size={12}
                              className="flex-shrink-0 text-slate-400"
                            />
                          )}
                          <p
                            className={`truncate text-sm ${
                              unread > 0
                                ? "font-medium text-slate-700"
                                : "text-slate-400"
                            }`}
                          >
                            {preview}
                          </p>
                        </div>
                        {unread > 0 && (
                          <span className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-sky-500 px-1.5 text-[10px] font-bold text-white">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>

                      {/* Row 3: status */}
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            chat.chatStatus === "ACTIVE"
                              ? "animate-pulse bg-emerald-400"
                              : chat.chatStatus === "WAITING"
                                ? "bg-amber-400"
                                : "bg-slate-300"
                          }`}
                        />
                        <span
                          className={`text-[10px] ${
                            chat.chatStatus === "WAITING"
                              ? "text-amber-600"
                              : chat.chatStatus === "ACTIVE"
                                ? "text-emerald-600"
                                : "text-slate-400"
                          }`}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          · {isSupportChat ? copy.support : copy.hotel}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {total > PAGE_LIMIT && chatTypeFilter === "ALL" && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {copy.page}{" "}
                <span className="font-semibold text-slate-800">{page}</span> {copy.of}{" "}
                <span className="font-semibold text-slate-800">
                  {totalPages}
                </span>
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => pushQuery({ page: page - 1 })}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => pushQuery({ page: page + 1 })}
                  disabled={page >= totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </main>
      )}
    </>
  );
};

ChatsPage.auth = {
  roles: ["USER", "AGENT", "ADMIN", "ADMIN_OPERATOR"],
};

export default ChatsPage;
