import type { SupportedLocale } from "@/lib/i18n/config";
import type { BookingStatus } from "@/types/booking";

type PaymentStatusKey = "PENDING" | "PARTIAL" | "PAID" | "FAILED" | "REFUNDED";
type PaymentMethodKey =
  | "AT_HOTEL"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "KAKAOPAY"
  | "NAVERPAY"
  | "TOSS";

interface BookingCopy {
  reservationsEyebrow: string;
  myBookingsTitle: string;
  myBookingsDescription: string;
  browseHotels: string;
  total: string;
  upcoming: string;
  active: string;
  completed: string;
  all: string;
  noBookingsYet: string;
  noFilteredBookings: string;
  noBookingsDescription: string;
  tryAnotherFilter: string;
  showing: string;
  ofBookings: string;
  clearFilter: string;
  page: string;
  of: string;
  previous: string;
  next: string;
  close: string;
  backToBookings: string;
  missingBookingId: string;
  bookingProgress: string;
  reservationDetails: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  guests: string;
  paymentMethod: string;
  bookedOn: string;
  specialRequests: string;
  rooms: string;
  guest: string;
  perNight: string;
  cancellation: string;
  cancelledOn: string;
  flow: string;
  viewHotel: string;
  yourReview: string;
  reviewSubmittedOn: string;
  writeReview: string;
  shareExperience: string;
  reviewTitleOptional: string;
  reviewPlaceholder: string;
  submitReview: string;
  ratingRequiredTitle: string;
  ratingRequiredBody: string;
  reviewTooShortTitle: string;
  reviewTooShortBody: string;
  reviewSubmittedTitle: string;
  reviewSubmittedBody: string;
  reviewFailedTitle: string;
  invalidReasonTitle: string;
  invalidReasonBody: string;
  cancelConfirmTitle: string;
  cancelConfirmText: string;
  cancelConfirmWarning: string;
  cancelConfirmButton: string;
  cancellationSuccessTitle: string;
  cancellationSuccessBody: string;
  cancellationFailedTitle: string;
  adult: string;
  adults: string;
  child: string;
  children: string;
  room: string;
  roomsCount: string;
  night: string;
  nights: string;
  bookingCodeLabel: string;
  bookingLabel: string;
  privateReviewNote: string;
  paymentDemoNote: string;
  statusLabels: Record<BookingStatus, string>;
  paymentStatusLabels: Record<PaymentStatusKey, string>;
  paymentMethodLabels: Record<PaymentMethodKey, string>;
}

const en: BookingCopy = {
  reservationsEyebrow: "Reservations",
  myBookingsTitle: "My Bookings",
  myBookingsDescription: "Track and manage all your hotel reservations in one place.",
  browseHotels: "Browse hotels",
  total: "Total",
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  all: "All",
  noBookingsYet: "No bookings yet",
  noFilteredBookings: "No matching bookings",
  noBookingsDescription: "Your reservations will appear here once you book a hotel.",
  tryAnotherFilter: "Try a different filter or check back later.",
  showing: "Showing",
  ofBookings: "of {{count}} booking{{suffix}}",
  clearFilter: "Clear filter",
  page: "Page",
  of: "of",
  previous: "Previous",
  next: "Next",
  close: "Cancel",
  backToBookings: "Back to bookings",
  missingBookingId: "Missing booking ID.",
  bookingProgress: "Booking progress",
  reservationDetails: "Reservation details",
  checkIn: "Check-in",
  checkOut: "Check-out",
  duration: "Duration",
  guests: "Guests",
  paymentMethod: "Payment method",
  bookedOn: "Booked on",
  specialRequests: "Special requests",
  rooms: "Rooms",
  guest: "Guest",
  perNight: "/night",
  cancellation: "Cancellation",
  cancelledOn: "Cancelled on",
  flow: "flow",
  viewHotel: "View hotel",
  yourReview: "Your review",
  reviewSubmittedOn: "Submitted {{date}}",
  writeReview: "Write a review",
  shareExperience: "Share your stay experience to help future guests.",
  reviewTitleOptional: "Review title (optional)",
  reviewPlaceholder: "Tell future guests what stood out about your stay...",
  submitReview: "Submit review",
  ratingRequiredTitle: "Rating required",
  ratingRequiredBody: "Please select an overall rating before submitting.",
  reviewTooShortTitle: "Review too short",
  reviewTooShortBody: "Your review must be at least 10 characters.",
  reviewSubmittedTitle: "Review submitted",
  reviewSubmittedBody: "Thank you for sharing your experience.",
  reviewFailedTitle: "Failed to submit review",
  invalidReasonTitle: "Invalid reason",
  invalidReasonBody: "Reason must be between 5 and 500 characters.",
  cancelConfirmTitle: "Cancel booking {{code}}?",
  cancelConfirmText: "This will move the booking to CANCELLED status.",
  cancelConfirmWarning: "This cannot be undone.",
  cancelConfirmButton: "Yes, cancel booking",
  cancellationSuccessTitle: "Booking cancelled",
  cancellationSuccessBody: "Booking {{code}} has been cancelled.",
  cancellationFailedTitle: "Cancellation failed",
  adult: "adult",
  adults: "adults",
  child: "child",
  children: "children",
  room: "room",
  roomsCount: "rooms",
  night: "night",
  nights: "nights",
  bookingCodeLabel: "Booking code",
  bookingLabel: "Booking",
  privateReviewNote: "Your review is linked to a verified stay.",
  paymentDemoNote:
    "Payment methods in this portfolio are demo preferences. Payment status is recorded manually and no live charge is processed.",
  statusLabels: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CHECKED_IN: "Checked in",
    CHECKED_OUT: "Checked out",
    CANCELLED: "Cancelled",
    NO_SHOW: "No show",
  },
  paymentStatusLabels: {
    PENDING: "Pending review",
    PARTIAL: "Partial record",
    PAID: "Marked paid",
    FAILED: "Not recorded",
    REFUNDED: "Refunded",
  },
  paymentMethodLabels: {
    AT_HOTEL: "Pay at hotel",
    CREDIT_CARD: "Credit card (demo)",
    DEBIT_CARD: "Debit card (demo)",
    KAKAOPAY: "Kakao Pay (demo)",
    NAVERPAY: "Naver Pay (demo)",
    TOSS: "Toss (demo)",
  },
};

const ko: BookingCopy = {
  ...en,
  reservationsEyebrow: "예약",
  myBookingsTitle: "내 예약",
  myBookingsDescription: "한 곳에서 모든 호텔 예약을 확인하고 관리하세요.",
  browseHotels: "호텔 둘러보기",
  total: "전체",
  upcoming: "예정",
  active: "진행 중",
  completed: "완료",
  all: "전체",
  noBookingsYet: "아직 예약이 없습니다",
  noFilteredBookings: "일치하는 예약이 없습니다",
  noBookingsDescription: "호텔을 예약하면 이곳에 표시됩니다.",
  tryAnotherFilter: "다른 필터를 사용하거나 나중에 다시 확인하세요.",
  showing: "표시 중",
  clearFilter: "필터 초기화",
  page: "페이지",
  of: "/",
  previous: "이전",
  next: "다음",
  close: "취소",
  backToBookings: "예약 목록으로",
  missingBookingId: "예약 ID가 없습니다.",
  bookingProgress: "예약 진행 상태",
  reservationDetails: "예약 상세",
  checkIn: "체크인",
  checkOut: "체크아웃",
  duration: "숙박 기간",
  guests: "투숙객",
  paymentMethod: "결제 수단",
  bookedOn: "예약일",
  specialRequests: "요청 사항",
  rooms: "객실",
  guest: "투숙객",
  perNight: "/박",
  cancellation: "취소",
  cancelledOn: "취소일",
  flow: "처리",
  viewHotel: "호텔 보기",
  yourReview: "내 후기",
  reviewSubmittedOn: "{{date}} 작성",
  writeReview: "후기 작성",
  shareExperience: "다음 투숙객을 위해 숙박 경험을 공유해 주세요.",
  reviewTitleOptional: "후기 제목 (선택)",
  reviewPlaceholder: "숙박 중 좋았던 점을 알려 주세요...",
  submitReview: "후기 등록",
  ratingRequiredTitle: "평점이 필요합니다",
  ratingRequiredBody: "등록 전에 전체 평점을 선택해 주세요.",
  reviewTooShortTitle: "후기가 너무 짧습니다",
  reviewTooShortBody: "후기는 최소 10자 이상이어야 합니다.",
  reviewSubmittedTitle: "후기가 등록되었습니다",
  reviewSubmittedBody: "소중한 의견을 남겨주셔서 감사합니다.",
  reviewFailedTitle: "후기 등록 실패",
  invalidReasonTitle: "사유가 올바르지 않습니다",
  invalidReasonBody: "사유는 5자 이상 500자 이하여야 합니다.",
  cancelConfirmTitle: "예약 {{code}}을 취소할까요?",
  cancelConfirmText: "예약 상태가 CANCELLED로 변경됩니다.",
  cancelConfirmWarning: "이 작업은 되돌릴 수 없습니다.",
  cancelConfirmButton: "예약 취소",
  cancellationSuccessTitle: "예약이 취소되었습니다",
  cancellationSuccessBody: "예약 {{code}}이 취소되었습니다.",
  cancellationFailedTitle: "취소 실패",
  adult: "성인",
  adults: "성인",
  child: "아동",
  children: "아동",
  room: "객실",
  roomsCount: "객실",
  night: "박",
  nights: "박",
  bookingCodeLabel: "예약 코드",
  bookingLabel: "예약",
  privateReviewNote: "후기는 인증된 투숙 기록과 연결됩니다.",
  paymentDemoNote:
    "이 포트폴리오에서는 결제 수단이 데모 선택값으로 저장됩니다. 실제 결제는 처리되지 않으며 결제 상태만 수동 반영됩니다.",
  statusLabels: {
    PENDING: "대기 중",
    CONFIRMED: "확정",
    CHECKED_IN: "체크인 완료",
    CHECKED_OUT: "체크아웃 완료",
    CANCELLED: "취소됨",
    NO_SHOW: "노쇼",
  },
  paymentStatusLabels: {
    PENDING: "확인 대기",
    PARTIAL: "부분 반영",
    PAID: "결제 반영",
    FAILED: "미반영",
    REFUNDED: "환불됨",
  },
  paymentMethodLabels: {
    AT_HOTEL: "현장 결제",
    CREDIT_CARD: "신용카드(데모)",
    DEBIT_CARD: "체크카드(데모)",
    KAKAOPAY: "카카오페이(데모)",
    NAVERPAY: "네이버페이(데모)",
    TOSS: "토스(데모)",
  },
};

const ru: BookingCopy = {
  ...en,
  reservationsEyebrow: "Бронирования",
  myBookingsTitle: "Мои бронирования",
  myBookingsDescription: "Следите за всеми бронированиями отелей в одном месте.",
  browseHotels: "Смотреть отели",
  total: "Всего",
  upcoming: "Предстоящие",
  active: "Активные",
  completed: "Завершенные",
  all: "Все",
  noBookingsYet: "Пока нет бронирований",
  noFilteredBookings: "Подходящих бронирований нет",
  noBookingsDescription: "Ваши бронирования появятся здесь после оформления.",
  tryAnotherFilter: "Попробуйте другой фильтр или зайдите позже.",
  clearFilter: "Сбросить фильтр",
  page: "Страница",
  of: "из",
  previous: "Назад",
  next: "Далее",
  close: "Отмена",
  backToBookings: "Назад к бронированиям",
  missingBookingId: "Отсутствует ID бронирования.",
  bookingProgress: "Ход бронирования",
  reservationDetails: "Детали бронирования",
  checkIn: "Заезд",
  checkOut: "Выезд",
  duration: "Длительность",
  guests: "Гости",
  paymentMethod: "Способ оплаты",
  bookedOn: "Дата бронирования",
  specialRequests: "Особые запросы",
  rooms: "Номера",
  guest: "Гость",
  perNight: "/ночь",
  cancellation: "Отмена",
  cancelledOn: "Отменено",
  flow: "сценарий",
  viewHotel: "Открыть отель",
  yourReview: "Ваш отзыв",
  reviewSubmittedOn: "Опубликовано {{date}}",
  writeReview: "Оставить отзыв",
  shareExperience: "Поделитесь впечатлением, чтобы помочь другим гостям.",
  reviewTitleOptional: "Заголовок отзыва (необязательно)",
  reviewPlaceholder: "Расскажите, что особенно запомнилось во время проживания...",
  submitReview: "Отправить отзыв",
  ratingRequiredTitle: "Нужна оценка",
  ratingRequiredBody: "Перед отправкой выберите общую оценку.",
  reviewTooShortTitle: "Отзыв слишком короткий",
  reviewTooShortBody: "Отзыв должен содержать не менее 10 символов.",
  reviewSubmittedTitle: "Отзыв отправлен",
  reviewSubmittedBody: "Спасибо, что поделились впечатлением.",
  reviewFailedTitle: "Не удалось отправить отзыв",
  invalidReasonTitle: "Неверная причина",
  invalidReasonBody: "Причина должна содержать от 5 до 500 символов.",
  cancelConfirmTitle: "Отменить бронирование {{code}}?",
  cancelConfirmText: "Статус бронирования будет изменен на CANCELLED.",
  cancelConfirmWarning: "Это действие нельзя отменить.",
  cancelConfirmButton: "Да, отменить",
  cancellationSuccessTitle: "Бронирование отменено",
  cancellationSuccessBody: "Бронирование {{code}} отменено.",
  cancellationFailedTitle: "Не удалось отменить",
  adult: "взрослый",
  adults: "взрослых",
  child: "ребенок",
  children: "детей",
  room: "номер",
  roomsCount: "номеров",
  night: "ночь",
  nights: "ночей",
  bookingCodeLabel: "Код бронирования",
  bookingLabel: "Бронирование",
  privateReviewNote: "Отзыв связан с подтвержденным проживанием.",
  paymentDemoNote:
    "В этой портфолио-версии способ оплаты сохраняется как демо-предпочтение. Реальное списание не выполняется, статус оплаты отмечается вручную.",
  statusLabels: {
    PENDING: "Ожидает",
    CONFIRMED: "Подтверждено",
    CHECKED_IN: "Заезд выполнен",
    CHECKED_OUT: "Выезд выполнен",
    CANCELLED: "Отменено",
    NO_SHOW: "Не заехал",
  },
  paymentStatusLabels: {
    PENDING: "На проверке",
    PARTIAL: "Частично учтено",
    PAID: "Отмечено как оплачено",
    FAILED: "Не подтверждено",
    REFUNDED: "Возврат",
  },
  paymentMethodLabels: {
    AT_HOTEL: "Оплата в отеле",
    CREDIT_CARD: "Кредитная карта (демо)",
    DEBIT_CARD: "Дебетовая карта (демо)",
    KAKAOPAY: "Kakao Pay (демо)",
    NAVERPAY: "Naver Pay (демо)",
    TOSS: "Toss (демо)",
  },
};

const uz: BookingCopy = {
  ...en,
  reservationsEyebrow: "Bronlar",
  myBookingsTitle: "Mening bronlarim",
  myBookingsDescription: "Barcha mehmonxona bronlaringizni bir joyda boshqaring.",
  browseHotels: "Mehmonxonalarni ko'rish",
  total: "Jami",
  upcoming: "Kelayotgan",
  active: "Faol",
  completed: "Tugagan",
  all: "Barchasi",
  noBookingsYet: "Hali bronlar yo'q",
  noFilteredBookings: "Mos bron topilmadi",
  noBookingsDescription: "Mehmonxona bron qilganingizdan keyin ular shu yerda ko'rinadi.",
  tryAnotherFilter: "Boshqa filtrni sinab ko'ring yoki keyinroq qayting.",
  clearFilter: "Filtrni tozalash",
  page: "Sahifa",
  of: "/",
  previous: "Oldingi",
  next: "Keyingi",
  close: "Bekor qilish",
  backToBookings: "Bronlarga qaytish",
  missingBookingId: "Bron ID topilmadi.",
  bookingProgress: "Bron holati",
  reservationDetails: "Bron tafsilotlari",
  checkIn: "Kirish",
  checkOut: "Chiqish",
  duration: "Davomiyligi",
  guests: "Mehmonlar",
  paymentMethod: "To'lov usuli",
  bookedOn: "Bron qilingan sana",
  specialRequests: "Maxsus so'rovlar",
  rooms: "Xonalar",
  guest: "Mehmon",
  perNight: "/tun",
  cancellation: "Bekor qilish",
  cancelledOn: "Bekor qilingan sana",
  flow: "jarayon",
  viewHotel: "Mehmonxonani ko'rish",
  yourReview: "Sharhingiz",
  reviewSubmittedOn: "{{date}} yuborilgan",
  writeReview: "Sharh qoldirish",
  shareExperience: "Keyingi mehmonlarga yordam berish uchun tajribangizni ulashing.",
  reviewTitleOptional: "Sharh sarlavhasi (ixtiyoriy)",
  reviewPlaceholder: "Turar joyingizdagi eng muhim taassurotlarni yozing...",
  submitReview: "Sharh yuborish",
  ratingRequiredTitle: "Baho kerak",
  ratingRequiredBody: "Yuborishdan oldin umumiy bahoni tanlang.",
  reviewTooShortTitle: "Sharh juda qisqa",
  reviewTooShortBody: "Sharh kamida 10 ta belgidan iborat bo'lishi kerak.",
  reviewSubmittedTitle: "Sharh yuborildi",
  reviewSubmittedBody: "Tajriba ulashganingiz uchun rahmat.",
  reviewFailedTitle: "Sharhni yuborib bo'lmadi",
  invalidReasonTitle: "Noto'g'ri sabab",
  invalidReasonBody: "Sabab 5 dan 500 tagacha belgidan iborat bo'lishi kerak.",
  cancelConfirmTitle: "{{code}} bronini bekor qilasizmi?",
  cancelConfirmText: "Bron holati CANCELLED ga o'zgaradi.",
  cancelConfirmWarning: "Bu amalni ortga qaytarib bo'lmaydi.",
  cancelConfirmButton: "Ha, bekor qilish",
  cancellationSuccessTitle: "Bron bekor qilindi",
  cancellationSuccessBody: "{{code}} broni bekor qilindi.",
  cancellationFailedTitle: "Bekor qilib bo'lmadi",
  adult: "kattalar",
  adults: "kattalar",
  child: "bola",
  children: "bolalar",
  room: "xona",
  roomsCount: "xona",
  night: "tun",
  nights: "tun",
  bookingCodeLabel: "Bron kodi",
  bookingLabel: "Bron",
  privateReviewNote: "Sharh tasdiqlangan turar joy bilan bog'langan.",
  paymentDemoNote:
    "Bu portfolio loyihasida to'lov usuli demo tanlov sifatida saqlanadi. Haqiqiy yechim yo'q, to'lov holati qo'lda qayd etiladi.",
  statusLabels: {
    PENDING: "Kutilmoqda",
    CONFIRMED: "Tasdiqlangan",
    CHECKED_IN: "Joylashgan",
    CHECKED_OUT: "Chiqib ketgan",
    CANCELLED: "Bekor qilingan",
    NO_SHOW: "Kelmagan",
  },
  paymentStatusLabels: {
    PENDING: "Tasdiq kutilmoqda",
    PARTIAL: "Qisman kiritilgan",
    PAID: "To'langan deb belgilangan",
    FAILED: "Tasdiqlanmagan",
    REFUNDED: "Qaytarilgan",
  },
  paymentMethodLabels: {
    AT_HOTEL: "Mehmonxonada to'lash",
    CREDIT_CARD: "Kredit karta (demo)",
    DEBIT_CARD: "Debet karta (demo)",
    KAKAOPAY: "Kakao Pay (demo)",
    NAVERPAY: "Naver Pay (demo)",
    TOSS: "Toss (demo)",
  },
};

export const getBookingCopy = (locale: SupportedLocale): BookingCopy => {
  if (locale === "ko") return ko;
  if (locale === "ru") return ru;
  if (locale === "uz") return uz;
  return en;
};

export const formatBookingDate = (
  locale: SupportedLocale,
  dateStr: string,
  variant: "short" | "full" = "short",
): string =>
  new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    ...(variant === "full" ? { year: "numeric" } : {}),
  }).format(new Date(dateStr));

export const getBookingStatusLabel = (
  locale: SupportedLocale,
  status: BookingStatus,
): string => getBookingCopy(locale).statusLabels[status] ?? status;

export const getPaymentStatusLabel = (
  locale: SupportedLocale,
  status: string,
): string =>
  getBookingCopy(locale).paymentStatusLabels[status as PaymentStatusKey] ?? status;

export const getPaymentMethodLabel = (
  locale: SupportedLocale,
  method: string,
): string =>
  getBookingCopy(locale).paymentMethodLabels[method as PaymentMethodKey] ?? method;

export const formatNightsLabel = (
  locale: SupportedLocale,
  count: number,
): string => {
  const copy = getBookingCopy(locale);
  return `${count} ${count === 1 ? copy.night : copy.nights}`;
};

export const formatGuestsLabel = (
  locale: SupportedLocale,
  adultCount: number,
  childCount: number,
): string => {
  const copy = getBookingCopy(locale);
  const parts = [
    `${adultCount} ${adultCount === 1 ? copy.adult : copy.adults}`,
  ];
  if (childCount > 0) {
    parts.push(`${childCount} ${childCount === 1 ? copy.child : copy.children}`);
  }
  return parts.join(", ");
};

export const formatRoomsCountLabel = (
  locale: SupportedLocale,
  count: number,
): string => {
  const copy = getBookingCopy(locale);
  return `${count} ${count === 1 ? copy.room : copy.roomsCount}`;
};
