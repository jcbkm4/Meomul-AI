import type { SupportedLocale } from "@/lib/i18n/config";
import type { ChatDto, ChatStatus } from "@/types/chat";

interface ChatCopy {
  supportTitle: string;
  waiting: string;
  active: string;
  closed: string;
  now: string;
  yesterday: string;
  startConversation: string;
  photo: string;
  attachment: string;
  message: string;
  messages: string;
  viewAll: string;
  newConversation: string;
  newMessage: string;
  close: string;
  noUnreadConversations: string;
  unreadConversations: string;
  openChatManagement: string;
  noConversations: string;
  noConversationsDesc: string;
  contactSupport: string;
  supportTeam: string;
  hotelStaff: string;
  guest: string;
  support: string;
  hotel: string;
  platformSupport: string;
  hotelSupport: string;
  sendMessagePlaceholder: string;
  writeMessagePlaceholder: string;
  uploadImage: string;
  sendMessage: string;
  sendImage: string;
  removeImage: string;
  openFullPage: string;
  closeChat: string;
  liveConnection: string;
  pollingFallback: string;
  connectionIssue: string;
  messageDirectSupport: string;
  messageDirectHotel: string;
  searchHotelsPlaceholder: string;
  fromBookings: string;
  allHotels: string;
  results: string;
  noHotelsFound: string;
  hotelChat: string;
  supportTab: string;
  contactSupportTitle: string;
  contactSupportDesc: string;
  continueToMessage: string;
  contextFromPage: string;
  sentFromPage: string;
  repliesQuickly: string;
  privateSupport: string;
  privateHotel: string;
  bookingPrefix: string;
  claim: string;
  claiming: string;
  closeAction: string;
  closing: string;
  closedNotice: string;
  claimRequiredNotice: string;
  supportPageDesc: string;
  inbox: string;
  page: string;
  previous: string;
  next: string;
  all: string;
  of: string;
  hotels: string;
  userSupportChats: string;
  hotelStaffChats: string;
  missingChatId: string;
  backToChats: string;
}

const en: ChatCopy = {
  supportTitle: "Meomul Support",
  waiting: "Waiting",
  active: "Active",
  closed: "Closed",
  now: "now",
  yesterday: "Yesterday",
  startConversation: "Start the conversation",
  photo: "Photo",
  attachment: "Attachment",
  message: "Message",
  messages: "Messages",
  viewAll: "View all",
  newConversation: "New conversation",
  newMessage: "New message",
  close: "Close",
  noUnreadConversations: "No unread conversations",
  unreadConversations: "{{count}} unread conversation{{suffix}}",
  openChatManagement: "Open chat management",
  noConversations: "No conversations yet",
  noConversationsDesc: "Message a hotel directly or reach our support team",
  contactSupport: "Contact support",
  supportTeam: "Support Team",
  hotelStaff: "Hotel Staff",
  guest: "Guest",
  support: "Support",
  hotel: "Hotel",
  platformSupport: "Platform support",
  hotelSupport: "Hotel Support",
  sendMessagePlaceholder: "Write a message…",
  writeMessagePlaceholder: "Write your message…",
  uploadImage: "Upload image",
  sendMessage: "Send message",
  sendImage: "Send image",
  removeImage: "Remove image",
  openFullPage: "Open full page",
  closeChat: "Close chat",
  liveConnection: "Live connection",
  pollingFallback: "Polling fallback",
  connectionIssue: "Connection issue. Messages still refresh automatically.",
  messageDirectSupport: "Your message goes directly to Meomul support",
  messageDirectHotel: "Your message goes directly to the hotel team",
  searchHotelsPlaceholder: "Search hotels by name or city…",
  fromBookings: "From your bookings",
  allHotels: "All hotels",
  results: "Results",
  noHotelsFound: "No hotels found",
  hotelChat: "Hotel chat",
  supportTab: "Support",
  contactSupportTitle: "Contact Meomul Support",
  contactSupportDesc: "Account, payment, booking, and technical issues",
  continueToMessage: "Continue to message",
  contextFromPage: "Context from page",
  sentFromPage: "Sent from page",
  repliesQuickly: "Our team usually replies quickly during active hours",
  privateSupport: "Messages are private between you and Meomul support.",
  privateHotel: "Messages are private between you and the hotel team.",
  bookingPrefix: "Booking",
  claim: "Claim",
  claiming: "Claiming…",
  closeAction: "Close",
  closing: "Closing…",
  closedNotice: "This chat is closed. You can still read the conversation, but you cannot send new messages.",
  claimRequiredNotice: "Claim this chat before replying or closing it.",
  supportPageDesc: "Start a support conversation or message any hotel",
  inbox: "Inbox",
  page: "Page",
  previous: "Prev",
  next: "Next",
  all: "All",
  of: "of",
  hotels: "Hotels",
  userSupportChats: "User support chats",
  hotelStaffChats: "Hotel staff chats",
  missingChatId: "Missing chat ID.",
  backToChats: "Back to chats",
};

const ko: ChatCopy = {
  ...en,
  supportTitle: "미어물 지원",
  waiting: "대기 중",
  active: "진행 중",
  closed: "종료됨",
  now: "방금",
  yesterday: "어제",
  startConversation: "대화를 시작해 보세요",
  photo: "사진",
  attachment: "첨부파일",
  message: "메시지",
  messages: "메시지",
  viewAll: "전체 보기",
  newConversation: "새 대화",
  newMessage: "새 메시지",
  close: "닫기",
  noUnreadConversations: "읽지 않은 대화가 없습니다",
  unreadConversations: "읽지 않은 대화 {{count}}개",
  openChatManagement: "채팅 관리 열기",
  noConversations: "아직 대화가 없습니다",
  noConversationsDesc: "호텔에 직접 문의하거나 지원팀에 연락해 보세요",
  contactSupport: "지원 문의",
  supportTeam: "지원팀",
  hotelStaff: "호텔 담당자",
  guest: "고객",
  support: "지원",
  hotel: "호텔",
  platformSupport: "플랫폼 지원",
  hotelSupport: "호텔 문의",
  sendMessagePlaceholder: "메시지를 입력하세요…",
  writeMessagePlaceholder: "문의 내용을 입력하세요…",
  uploadImage: "이미지 업로드",
  sendMessage: "메시지 보내기",
  sendImage: "이미지 보내기",
  removeImage: "이미지 제거",
  openFullPage: "전체 페이지로 열기",
  closeChat: "채팅 닫기",
  liveConnection: "실시간 연결",
  pollingFallback: "폴링 모드",
  connectionIssue: "연결에 문제가 있지만 메시지는 자동으로 새로고침됩니다.",
  messageDirectSupport: "메시지는 미어물 지원팀으로 바로 전달됩니다",
  messageDirectHotel: "메시지는 호텔 팀으로 바로 전달됩니다",
  searchHotelsPlaceholder: "호텔명이나 도시로 검색…",
  fromBookings: "내 예약에서",
  allHotels: "전체 호텔",
  results: "검색 결과",
  noHotelsFound: "호텔을 찾을 수 없습니다",
  hotelChat: "호텔 문의",
  supportTab: "지원",
  contactSupportTitle: "미어물 지원팀 문의",
  contactSupportDesc: "계정, 결제, 예약, 기술 문제를 도와드립니다",
  continueToMessage: "메시지 작성으로 이동",
  contextFromPage: "페이지 문맥",
  sentFromPage: "보낸 페이지",
  repliesQuickly: "운영 시간에는 빠르게 답변드리고 있습니다",
  privateSupport: "메시지는 고객님과 미어물 지원팀만 볼 수 있습니다.",
  privateHotel: "메시지는 고객님과 호텔 팀만 볼 수 있습니다.",
  bookingPrefix: "예약",
  claim: "할당",
  claiming: "할당 중…",
  closeAction: "종료",
  closing: "종료 중…",
  closedNotice: "종료된 채팅입니다. 대화는 읽을 수 있지만 새 메시지는 보낼 수 없습니다.",
  claimRequiredNotice: "답변하거나 종료하기 전에 이 채팅을 먼저 할당하세요.",
  supportPageDesc: "지원 대화를 시작하거나 원하는 호텔에 메시지를 보내세요",
  inbox: "받은 편지함",
  page: "페이지",
  previous: "이전",
  next: "다음",
  all: "전체",
  of: "/",
  hotels: "호텔",
  userSupportChats: "사용자 지원 채팅",
  hotelStaffChats: "호텔 담당자 채팅",
  missingChatId: "채팅 ID가 없습니다.",
  backToChats: "채팅 목록으로",
};

const ru: ChatCopy = {
  ...en,
  supportTitle: "Поддержка Meomul",
  waiting: "Ожидает",
  active: "Активен",
  closed: "Закрыт",
  now: "сейчас",
  yesterday: "Вчера",
  startConversation: "Начните диалог",
  photo: "Фото",
  attachment: "Вложение",
  message: "Сообщение",
  messages: "Сообщения",
  viewAll: "Открыть все",
  newConversation: "Новый чат",
  newMessage: "Новое сообщение",
  close: "Закрыть",
  noUnreadConversations: "Нет непрочитанных чатов",
  unreadConversations: "Непрочитанных чатов: {{count}}",
  openChatManagement: "Открыть управление чатами",
  noConversations: "Пока нет диалогов",
  noConversationsDesc: "Напишите отелю напрямую или обратитесь в поддержку",
  contactSupport: "Связаться с поддержкой",
  supportTeam: "Команда поддержки",
  hotelStaff: "Сотрудники отеля",
  guest: "Гость",
  support: "Поддержка",
  hotel: "Отель",
  platformSupport: "Поддержка платформы",
  hotelSupport: "Поддержка отеля",
  sendMessagePlaceholder: "Напишите сообщение…",
  writeMessagePlaceholder: "Введите сообщение…",
  uploadImage: "Загрузить изображение",
  sendMessage: "Отправить сообщение",
  sendImage: "Отправить изображение",
  removeImage: "Удалить изображение",
  openFullPage: "Открыть полную страницу",
  closeChat: "Закрыть чат",
  liveConnection: "Живое соединение",
  pollingFallback: "Режим опроса",
  connectionIssue: "Есть проблема с соединением, но сообщения все равно обновляются автоматически.",
  messageDirectSupport: "Ваше сообщение сразу попадет в поддержку Meomul",
  messageDirectHotel: "Ваше сообщение сразу попадет команде отеля",
  searchHotelsPlaceholder: "Поиск отелей по названию или городу…",
  fromBookings: "Из ваших бронирований",
  allHotels: "Все отели",
  results: "Результаты",
  noHotelsFound: "Отели не найдены",
  hotelChat: "Чат с отелем",
  supportTab: "Поддержка",
  contactSupportTitle: "Связаться с поддержкой Meomul",
  contactSupportDesc: "Аккаунт, оплата, бронирование и технические вопросы",
  continueToMessage: "Перейти к сообщению",
  contextFromPage: "Контекст страницы",
  sentFromPage: "Отправлено со страницы",
  repliesQuickly: "Команда обычно отвечает быстро в рабочее время",
  privateSupport: "Сообщения видите только вы и поддержка Meomul.",
  privateHotel: "Сообщения видите только вы и команда отеля.",
  bookingPrefix: "Бронирование",
  claim: "Принять",
  claiming: "Принятие…",
  closeAction: "Закрыть",
  closing: "Закрытие…",
  closedNotice: "Чат закрыт. История доступна для чтения, но новые сообщения отправлять нельзя.",
  claimRequiredNotice: "Сначала примите этот чат, затем отвечайте или закрывайте его.",
  supportPageDesc: "Начните чат с поддержкой или напишите любому отелю",
  inbox: "Входящие",
  page: "Страница",
  previous: "Назад",
  next: "Далее",
  all: "Все",
  of: "из",
  hotels: "Отели",
  userSupportChats: "Чаты поддержки пользователей",
  hotelStaffChats: "Чаты сотрудников отелей",
  missingChatId: "Отсутствует ID чата.",
  backToChats: "Назад к чатам",
};

const uz: ChatCopy = {
  ...en,
  supportTitle: "Meomul yordami",
  waiting: "Kutilmoqda",
  active: "Faol",
  closed: "Yopilgan",
  now: "hozir",
  yesterday: "Kecha",
  startConversation: "Suhbatni boshlang",
  photo: "Rasm",
  attachment: "Biriktirma",
  message: "Xabar",
  messages: "Xabarlar",
  viewAll: "Barchasini ko'rish",
  newConversation: "Yangi suhbat",
  newMessage: "Yangi xabar",
  close: "Yopish",
  noUnreadConversations: "O'qilmagan suhbatlar yo'q",
  unreadConversations: "{{count}} ta o'qilmagan suhbat",
  openChatManagement: "Chat boshqaruvini ochish",
  noConversations: "Hali suhbatlar yo'q",
  noConversationsDesc: "Mehmonxonaga yozing yoki yordam jamoasiga murojaat qiling",
  contactSupport: "Yordam bilan bog'lanish",
  supportTeam: "Yordam jamoasi",
  hotelStaff: "Mehmonxona xodimlari",
  guest: "Mehmon",
  support: "Yordam",
  hotel: "Mehmonxona",
  platformSupport: "Platforma yordami",
  hotelSupport: "Mehmonxona yordami",
  sendMessagePlaceholder: "Xabar yozing…",
  writeMessagePlaceholder: "Xabaringizni yozing…",
  uploadImage: "Rasm yuklash",
  sendMessage: "Xabar yuborish",
  sendImage: "Rasm yuborish",
  removeImage: "Rasmni olib tashlash",
  openFullPage: "To'liq sahifani ochish",
  closeChat: "Chatni yopish",
  liveConnection: "Jonli aloqa",
  pollingFallback: "So'rov rejimi",
  connectionIssue: "Aloqa muammosi bor, lekin xabarlar baribir avtomatik yangilanadi.",
  messageDirectSupport: "Xabaringiz Meomul yordam jamoasiga to'g'ridan-to'g'ri yuboriladi",
  messageDirectHotel: "Xabaringiz mehmonxona jamoasiga to'g'ridan-to'g'ri yuboriladi",
  searchHotelsPlaceholder: "Nomi yoki shahar bo'yicha mehmonxona qidiring…",
  fromBookings: "Bronlaringizdan",
  allHotels: "Barcha mehmonxonalar",
  results: "Natijalar",
  noHotelsFound: "Mehmonxona topilmadi",
  hotelChat: "Mehmonxona chati",
  supportTab: "Yordam",
  contactSupportTitle: "Meomul yordami bilan bog'lanish",
  contactSupportDesc: "Hisob, to'lov, bron va texnik muammolar",
  continueToMessage: "Xabarga o'tish",
  contextFromPage: "Sahifa konteksti",
  sentFromPage: "Yuborilgan sahifa",
  repliesQuickly: "Jamoamiz faol vaqtlarda tez javob beradi",
  privateSupport: "Xabarlar faqat siz va Meomul yordam jamoasi o'rtasida qoladi.",
  privateHotel: "Xabarlar faqat siz va mehmonxona jamoasi o'rtasida qoladi.",
  bookingPrefix: "Bron",
  claim: "Biriktirish",
  claiming: "Biriktirilmoqda…",
  closeAction: "Yopish",
  closing: "Yopilmoqda…",
  closedNotice: "Bu chat yopilgan. Suhbatni o'qish mumkin, lekin yangi xabar yuborib bo'lmaydi.",
  claimRequiredNotice: "Javob berish yoki yopishdan oldin bu chatni biriktiring.",
  supportPageDesc: "Yordam suhbati boshlang yoki istalgan mehmonxonaga yozing",
  inbox: "Kiruvchi xabarlar",
  page: "Sahifa",
  previous: "Oldingi",
  next: "Keyingi",
  all: "Barchasi",
  of: "/",
  hotels: "Mehmonxonalar",
  userSupportChats: "Foydalanuvchi yordam chatlari",
  hotelStaffChats: "Mehmonxona xodimlari chatlari",
  missingChatId: "Chat ID topilmadi.",
  backToChats: "Chatlarga qaytish",
};

export const getChatCopy = (locale: SupportedLocale): ChatCopy => {
  if (locale === "ko") return ko;
  if (locale === "ru") return ru;
  if (locale === "uz") return uz;
  return en;
};

export const getChatStatusLabel = (
  locale: SupportedLocale,
  status: ChatStatus,
): string => {
  const copy = getChatCopy(locale);
  if (status === "WAITING") return copy.waiting;
  if (status === "ACTIVE") return copy.active;
  return copy.closed;
};

export const formatChatTime = (
  locale: SupportedLocale,
  dateStr: string,
): string =>
  new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).format(new Date(dateStr));

export const formatChatDateSeparator = (
  locale: SupportedLocale,
  dateStr: string,
): string => {
  const copy = getChatCopy(locale);
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return copy.now === "now" ? "Today" : copy.now;
  if (date.toDateString() === yesterday.toDateString()) return copy.yesterday;
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const formatChatTimeAgo = (
  locale: SupportedLocale,
  dateStr: string,
): string => {
  const copy = getChatCopy(locale);
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return copy.now;
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d === 1) return copy.yesterday;
  if (d < 7) {
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(dateStr),
    );
  }
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
};

export const getLastPreviewLabel = (
  locale: SupportedLocale,
  chat: ChatDto,
): string => {
  const copy = getChatCopy(locale);
  const msg = chat.lastMessage ?? (chat.messages ?? []).at(-1);
  if (!msg) return copy.startConversation;
  if (msg.messageType === "IMAGE") return `📷 ${copy.photo}`;
  if (msg.messageType === "FILE") return `📎 ${copy.attachment}`;
  return msg.content?.trim() || copy.message;
};
