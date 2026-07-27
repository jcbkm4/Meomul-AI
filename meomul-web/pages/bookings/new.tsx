import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CREATE_BOOKING_MUTATION,
  SEARCH_MEMBERS_FOR_BOOKING_QUERY,
} from "@/graphql/booking.gql";
import {
  GET_HOTEL_CONTEXT_QUERY,
  GET_MY_PRICE_LOCK_QUERY,
  GET_ROOM_QUERY,
} from "@/graphql/hotel.gql";
import {
  diffNights,
  type EffectiveRateSource,
  formatTodayDate,
  isDateKey,
  parseNonNegativeInt,
  parsePositiveInt,
  resolveEffectiveNightPrice,
  toDateTime,
} from "@/lib/booking/booking-rules";
import { getSessionMember } from "@/lib/auth/session";
import { hasApprovedAgentAccess } from "@/lib/auth/host-access";
import {
  formatNightsLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/lib/bookings/booking-i18n";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { useI18n } from "@/lib/i18n/provider";
import { ErrorNotice } from "@/components/ui/error-notice";
import { confirmAction } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type {
  CreateBookingMutationData,
  CreateBookingMutationVars,
  PaymentMethod,
  SearchMembersForBookingQueryData,
  SearchMembersForBookingQueryVars,
} from "@/types/booking";
import type {
  GetHotelContextQueryData,
  GetHotelContextQueryVars,
  GetMyPriceLockQueryData,
  GetMyPriceLockQueryVars,
  GetRoomQueryData,
  GetRoomQueryVars,
  HotelContextItem,
  RoomDetailItem,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import { ArrowLeft, Check, ChevronDown, Minus, Plus } from "lucide-react";

// ─── Payment methods ──────────────────────────────────────────────────────────

const PAYMENT_METHODS_CONFIG: Array<{
  value: PaymentMethod;
  label: string;
  emoji: string;
}> = [
  { value: "AT_HOTEL", label: "Pay at Hotel", emoji: "🏨" },
  { value: "CREDIT_CARD", label: "Credit Card", emoji: "💳" },
  { value: "DEBIT_CARD", label: "Debit Card", emoji: "🪙" },
  { value: "KAKAOPAY", label: "KakaoPay", emoji: "💛" },
  { value: "NAVERPAY", label: "NaverPay", emoji: "💚" },
  { value: "TOSS", label: "Toss", emoji: "💙" },
];

function getNewBookingCopy(locale: string) {
  if (locale === "ko") {
    return {
      stepLabels: ["날짜 및 인원", "투숙객 정보", "결제 방식"],
      priceLock: "⚡ 가격 잠금",
      lastMinute: "🔥 막바지 딜",
      nightsSuffix: "박",
      roomsSuffix: "객실",
      earlyCheckIn: "얼리 체크인",
      lateCheckOut: "레이트 체크아웃",
      taxes: "예상 세금 (~10%)",
      estimatedTotal: "예상 총액",
      selectDates: "날짜를 선택하면 요금 내역이 표시됩니다",
      finalAmountNote: "최종 금액에는 세금, 추가 요금 및 적용 가능한 할인이 포함되며 예약 시 확정됩니다.",
      missingContextTitle: "예약 정보가 없습니다",
      missingContextBody: "특정 호텔 객실 페이지에서 예약을 시작해 주세요.",
      browseHotels: "호텔 둘러보기",
      bookingConfirmed: "예약 완료",
      allSet: "예약이 완료되었습니다!",
      reservationCreated: "예약이 성공적으로 생성되었습니다.",
      reservationPaymentNote: "이 포트폴리오 빌드에서는 실제 결제가 처리되지 않습니다. 결제 상태는 데모 흐름에 따라 직원이 나중에 반영합니다.",
      paymentDemoBadge: "데모 결제",
      bookingCode: "예약 코드",
      total: "총액",
      paymentStatus: "결제 상태",
      viewMyBookings: "내 예약 보기",
      backToHotel: "호텔로 돌아가기",
      backToMyHotels: "내 호텔로 돌아가기",
      agentOwnership: "자신이 소유한 호텔에 대해서만 예약을 생성할 수 있습니다. 이 호텔은 다른 에이전트 소유입니다.",
      staffBooking: "직원 예약",
      newBooking: "새 예약",
      reserveYourStay: "예약하기",
      estimatedTotalShort: "예상 총액",
      selectDatesTitle: "날짜 선택",
      checkIn: "체크인",
      checkOut: "체크아웃",
      checkoutAfter: "체크아웃은 체크인 이후여야 합니다",
      guestsRooms: "투숙객 및 객실",
      maxGuestsPerRoom: "객실당 최대 {{guests}}명 · 이용 가능 {{rooms}}개 객실",
      adults: "성인",
      age18: "만 18세 이상",
      children: "어린이",
      under18: "만 18세 미만",
      rooms: "객실",
      staffGuestBanner: "직원 예약입니다. 예약할 고객을 검색해 선택하세요",
      findGuest: "고객 찾기",
      searchGuest: "닉네임, 이름 또는 전화번호로 검색…",
      searching: "검색 중…",
      noMembersFound: "회원이 없습니다. 회원 ID를 직접 입력하세요:",
      memberId: "회원 ID",
      guestSelected: "고객이 선택되었습니다",
      reservationDetails: "예약 세부 정보",
      reservationName: "예약자 이름",
      optional: "선택",
      fullNameOnBooking: "예약에 표시될 이름",
      specialRequests: "특별 요청",
      specialRequestsPlaceholder: "늦은 도착, 접근성 요청, 객실 선호 사항…",
      paymentMethod: "결제 수단",
      paymentDemoNoticeTitle: "포트폴리오 데모 결제",
      paymentDemoNoticeBody: "실제 카드나 지갑 결제는 발생하지 않습니다. 선택한 방식은 예약 선호도로 저장되며, 결제 상태는 직원이 수동으로 업데이트합니다.",
      checkOptions: "체크인 / 체크아웃 옵션",
      beforeTime: "{{time}} 이전 · 객실당 +₩30,000",
      afterTime: "{{time}} 이후 · 객실당 +₩30,000",
      confirming: "확인 중…",
      confirmBooking: "예약 확정",
      back: "뒤로",
      next: "다음",
      noBookingContext: "예약 정보가 없습니다.",
      bookingContextIncomplete: "예약 정보가 완전하지 않습니다. 새로고침 후 다시 시도해 주세요.",
      loadingContext: "예약 정보를 불러오는 중...",
      staffGuestRequired: "직원 예약에는 대상 고객 ID가 필요합니다.",
      guestRoomPositive: "투숙객 수와 객실 수는 1 이상이어야 합니다.",
      childNegative: "어린이 수는 음수일 수 없습니다.",
      roomUnavailable: "현재 이 객실은 예약할 수 없습니다.",
      onlyRoomsAvailable: "현재 이용 가능한 객실은 {{count}}개뿐입니다.",
      exceedsCapacity: "총 투숙객 수가 객실 수용 인원을 초과했습니다.",
      selectDatesValidation: "체크인과 체크아웃 날짜를 선택해 주세요.",
      checkInPast: "체크인 날짜는 과거일 수 없습니다.",
    };
  }
  if (locale === "ru") {
    return {
      stepLabels: ["Даты и гости", "Информация о госте", "Способ оплаты"],
      priceLock: "⚡ Фиксация цены",
      lastMinute: "🔥 Горящее предложение",
      nightsSuffix: "ноч.",
      roomsSuffix: "комн.",
      earlyCheckIn: "Ранний заезд",
      lateCheckOut: "Поздний выезд",
      taxes: "Оценка налогов (~10%)",
      estimatedTotal: "Примерная сумма",
      selectDates: "Выберите даты, чтобы увидеть разбивку цены",
      finalAmountNote: "Финальная сумма включает налоги, сборы и применимые скидки и подтверждается при бронировании.",
      missingContextTitle: "Нет данных для бронирования",
      missingContextBody: "Откройте бронирование со страницы конкретного номера.",
      browseHotels: "Смотреть отели",
      bookingConfirmed: "Бронирование подтверждено",
      allSet: "Все готово!",
      reservationCreated: "Ваше бронирование успешно создано.",
      reservationPaymentNote: "В этой портфолио-версии реальные платежи не проводятся. Статус оплаты обновляется позже как часть демо-потока.",
      paymentDemoBadge: "Демо-оплата",
      bookingCode: "Код бронирования",
      total: "Итого",
      paymentStatus: "Статус оплаты",
      viewMyBookings: "Мои бронирования",
      backToHotel: "Назад к отелю",
      backToMyHotels: "Назад к моим отелям",
      agentOwnership: "Вы можете создавать бронирования только для своих отелей. Этот отель принадлежит другому агенту.",
      staffBooking: "Служебное бронирование",
      newBooking: "Новое бронирование",
      reserveYourStay: "Забронировать проживание",
      estimatedTotalShort: "Примерная сумма",
      selectDatesTitle: "Выберите даты",
      checkIn: "Заезд",
      checkOut: "Выезд",
      checkoutAfter: "Дата выезда должна быть позже даты заезда",
      guestsRooms: "Гости и номера",
      maxGuestsPerRoom: "Макс. {{guests}} гост. на номер · доступно {{rooms}} ном.",
      adults: "Взрослые",
      age18: "18+",
      children: "Дети",
      under18: "До 18 лет",
      rooms: "Номера",
      staffGuestBanner: "Служебное бронирование — найдите и выберите гостя",
      findGuest: "Найти гостя",
      searchGuest: "Поиск по нику, имени или телефону…",
      searching: "Поиск…",
      noMembersFound: "Пользователи не найдены. Введите ID вручную:",
      memberId: "ID участника",
      guestSelected: "Гость выбран",
      reservationDetails: "Детали бронирования",
      reservationName: "Имя в бронировании",
      optional: "необязательно",
      fullNameOnBooking: "Полное имя для бронирования",
      specialRequests: "Особые пожелания",
      specialRequestsPlaceholder: "Поздний заезд, доступность, пожелания по номеру…",
      paymentMethod: "Способ оплаты",
      paymentDemoNoticeTitle: "Демо-оплата для портфолио",
      paymentDemoNoticeBody: "Реальное списание карты или кошелька не выполняется. Выбранный способ сохраняется как предпочтение бронирования, а статус оплаты обновляется вручную.",
      checkOptions: "Опции заезда / выезда",
      beforeTime: "До {{time}} · +₩30,000 за номер",
      afterTime: "После {{time}} · +₩30,000 за номер",
      confirming: "Подтверждение…",
      confirmBooking: "Подтвердить бронирование",
      back: "Назад",
      next: "Далее",
      noBookingContext: "Отсутствуют данные для бронирования.",
      bookingContextIncomplete: "Данные бронирования неполные. Обновите страницу и попробуйте снова.",
      loadingContext: "Загрузка данных бронирования...",
      staffGuestRequired: "Для служебного бронирования требуется guestId.",
      guestRoomPositive: "Количество гостей и номеров должно быть положительным.",
      childNegative: "Количество детей не может быть отрицательным.",
      roomUnavailable: "Этот номер сейчас недоступен для бронирования.",
      onlyRoomsAvailable: "Сейчас доступно только {{count}} номер(ов).",
      exceedsCapacity: "Общее количество гостей превышает вместимость номера.",
      selectDatesValidation: "Выберите даты заезда и выезда.",
      checkInPast: "Дата заезда не может быть в прошлом.",
    };
  }
  if (locale === "uz") {
    return {
      stepLabels: ["Sanalar va mehmonlar", "Mehmon ma'lumoti", "To'lov usuli"],
      priceLock: "⚡ Narxni qulflash",
      lastMinute: "🔥 So'nggi daqiqadagi taklif",
      nightsSuffix: "kecha",
      roomsSuffix: "xona",
      earlyCheckIn: "Erta check-in",
      lateCheckOut: "Kech check-out",
      taxes: "Taxminiy soliqlar (~10%)",
      estimatedTotal: "Taxminiy jami",
      selectDates: "Narx tafsilotini ko'rish uchun sanalarni tanlang",
      finalAmountNote: "Yakuniy summa soliqlar, ustamalar va tegishli chegirmalarni o'z ichiga oladi va bron paytida tasdiqlanadi.",
      missingContextTitle: "Bron ma'lumoti yo'q",
      missingContextBody: "Bronni aniq mehmonxona xonasi sahifasidan boshlang.",
      browseHotels: "Mehmonxonalarni ko'rish",
      bookingConfirmed: "Bron tasdiqlandi",
      allSet: "Hammasi tayyor!",
      reservationCreated: "Bron muvaffaqiyatli yaratildi.",
      reservationPaymentNote: "Bu portfolio versiyasida haqiqiy to'lov ishlamaydi. To'lov holati demo oqimiga ko'ra keyinroq xodimlar tomonidan yangilanadi.",
      paymentDemoBadge: "Demo to'lov",
      bookingCode: "Bron kodi",
      total: "Jami",
      paymentStatus: "To'lov holati",
      viewMyBookings: "Bronlarimni ko'rish",
      backToHotel: "Mehmonxonaga qaytish",
      backToMyHotels: "Mening mehmonxonalarimga qaytish",
      agentOwnership: "Siz faqat o'zingizga tegishli mehmonxonalar uchun bron yarata olasiz. Bu mehmonxona boshqa agentga tegishli.",
      staffBooking: "Xodim broni",
      newBooking: "Yangi bron",
      reserveYourStay: "Turar joyni bron qiling",
      estimatedTotalShort: "Taxminiy jami",
      selectDatesTitle: "Sanalarni tanlang",
      checkIn: "Check-in",
      checkOut: "Check-out",
      checkoutAfter: "Check-out check-indan keyin bo'lishi kerak",
      guestsRooms: "Mehmonlar va xonalar",
      maxGuestsPerRoom: "Har xonaga max {{guests}} mehmon · {{rooms}} xona mavjud",
      adults: "Kattalar",
      age18: "18 yoshdan katta",
      children: "Bolalar",
      under18: "18 yoshdan kichik",
      rooms: "Xonalar",
      staffGuestBanner: "Xodim broni — bron qilinadigan mehmonni tanlang",
      findGuest: "Mehmonni topish",
      searchGuest: "Nick, ism yoki telefon bo'yicha qidirish…",
      searching: "Qidirilmoqda…",
      noMembersFound: "A'zolar topilmadi. ID ni qo'lda kiriting:",
      memberId: "A'zo ID",
      guestSelected: "Mehmon tanlandi",
      reservationDetails: "Bron tafsilotlari",
      reservationName: "Bron uchun ism",
      optional: "ixtiyoriy",
      fullNameOnBooking: "Bronda ko'rinadigan to'liq ism",
      specialRequests: "Maxsus so'rovlar",
      specialRequestsPlaceholder: "Kech kelish, qulaylik ehtiyoji, xona afzalligi…",
      paymentMethod: "To'lov usuli",
      paymentDemoNoticeTitle: "Portfolio uchun demo to'lov",
      paymentDemoNoticeBody: "Haqiqiy karta yoki hamyon yechimi bo'lmaydi. Tanlangan usul bron afzalligi sifatida saqlanadi, to'lov holati esa qo'lda yangilanadi.",
      checkOptions: "Check-in / Check-out variantlari",
      beforeTime: "{{time}} dan oldin · har xona uchun +₩30,000",
      afterTime: "{{time}} dan keyin · har xona uchun +₩30,000",
      confirming: "Tasdiqlanmoqda…",
      confirmBooking: "Bronni tasdiqlash",
      back: "Orqaga",
      next: "Keyingi",
      noBookingContext: "Bron konteksti yo'q.",
      bookingContextIncomplete: "Bron ma'lumoti to'liq emas. Sahifani yangilab qayta urinib ko'ring.",
      loadingContext: "Bron ma'lumoti yuklanmoqda...",
      staffGuestRequired: "Xodim broni uchun guestId kerak.",
      guestRoomPositive: "Mehmon soni va xona soni musbat bo'lishi kerak.",
      childNegative: "Bolalar soni manfiy bo'lishi mumkin emas.",
      roomUnavailable: "Bu xona hozir bron qilib bo'lmaydi.",
      onlyRoomsAvailable: "Hozir faqat {{count}} xona mavjud.",
      exceedsCapacity: "Jami mehmonlar soni xona sig'imidan oshib ketdi.",
      selectDatesValidation: "Check-in va check-out sanalarini tanlang.",
      checkInPast: "Check-in sanasi o'tgan kunda bo'lishi mumkin emas.",
    };
  }
  return {
    stepLabels: ["Dates & Guests", "Guest Info", "Payment Method"],
    priceLock: "⚡ Price Lock",
    lastMinute: "🔥 Last-minute Deal",
    nightsSuffix: "night",
    roomsSuffix: "rooms",
    earlyCheckIn: "Early check-in",
    lateCheckOut: "Late check-out",
    taxes: "Est. taxes (~10%)",
    estimatedTotal: "Est. Total",
    selectDates: "Select dates to see price breakdown",
    finalAmountNote: "Final amount includes taxes, surcharges and any applicable discounts — confirmed on booking.",
    missingContextTitle: "No booking context",
    missingContextBody: "Open booking from a specific hotel room page.",
    browseHotels: "Browse Hotels",
    bookingConfirmed: "Booking Confirmed",
    allSet: "You're all set!",
    reservationCreated: "Your reservation has been created successfully.",
    reservationPaymentNote: "This portfolio build does not process real payments. Payment status is updated later as part of the demo workflow.",
    paymentDemoBadge: "Demo payment",
    bookingCode: "Booking Code",
    total: "Total",
    paymentStatus: "Payment status",
    viewMyBookings: "View my bookings",
    backToHotel: "Back to hotel",
    backToMyHotels: "Back to my hotels",
    agentOwnership: "You can only create bookings for hotels you own. This hotel belongs to another agent.",
    staffBooking: "Staff Booking",
    newBooking: "New Booking",
    reserveYourStay: "Reserve Your Stay",
    estimatedTotalShort: "Estimated total",
    selectDatesTitle: "Select your dates",
    checkIn: "Check-in",
    checkOut: "Check-out",
    checkoutAfter: "Check-out must be after check-in",
    guestsRooms: "Guests & Rooms",
    maxGuestsPerRoom: "Max {{guests}} guest per room · {{rooms}} rooms available",
    adults: "Adults",
    age18: "Age 18+",
    children: "Children",
    under18: "Under 18",
    rooms: "Rooms",
    staffGuestBanner: "Staff booking — search and select the guest you are booking for",
    findGuest: "Find Guest",
    searchGuest: "Search by nick, name, or phone…",
    searching: "Searching…",
    noMembersFound: "No members found. Enter member ID directly:",
    memberId: "Member ID",
    guestSelected: "Guest selected",
    reservationDetails: "Reservation Details",
    reservationName: "Name for reservation",
    optional: "optional",
    fullNameOnBooking: "Full name shown on booking",
    specialRequests: "Special requests",
    specialRequestsPlaceholder: "Late arrival, accessibility needs, room preference…",
    paymentMethod: "Payment Method",
    paymentDemoNoticeTitle: "Portfolio demo payment",
    paymentDemoNoticeBody: "No real card or wallet charge happens here. Your selection is saved as a booking preference, and staff can update payment status manually later.",
    checkOptions: "Check-in / Check-out Options",
    beforeTime: "Before {{time}} · +₩30,000 per room",
    afterTime: "After {{time}} · +₩30,000 per room",
    confirming: "Confirming…",
    confirmBooking: "Confirm Booking",
    back: "Back",
    next: "Next",
    noBookingContext: "No booking context.",
    bookingContextIncomplete: "Booking context is incomplete. Please refresh and try again.",
    loadingContext: "Loading booking context...",
    staffGuestRequired: "For staff booking, target guestId is required.",
    guestRoomPositive: "Guest count and room quantity must be positive integers.",
    childNegative: "Child count cannot be negative.",
    roomUnavailable: "Room is not currently available for booking.",
    onlyRoomsAvailable: "Only {{count}} room(s) currently available.",
    exceedsCapacity: "Total guests exceed room capacity.",
    selectDatesValidation: "Please select check-in and check-out dates.",
    checkInPast: "Check-in date cannot be in the past.",
  };
}

function getValidationMessage(params: {
  locale: string;
  hotelId: string;
  roomId: string;
  canCreateBooking: boolean;
  isStaffCreator: boolean;
  targetGuestId: string;
  hasHotel: boolean;
  hasRoom: boolean;
  guestCount: number | null;
  childCount?: number | null;
  quantity: number | null;
  roomStatus?: string;
  roomMaxOccupancy?: number;
  roomAvailableRooms?: number;
  checkInDate: string;
  checkOutDate: string;
  todayDate: string;
  nights: number;
}) {
  const copy = getNewBookingCopy(params.locale);
  if (!params.hotelId || !params.roomId) return copy.noBookingContext;
  if (!params.canCreateBooking) return null;
  if (!params.hasHotel || !params.hasRoom) return copy.loadingContext;
  if (params.isStaffCreator && !params.targetGuestId.trim()) return copy.staffGuestRequired;
  if (!params.guestCount || !params.quantity) return copy.guestRoomPositive;
  if (params.childCount != null && params.childCount < 0) return copy.childNegative;
  if (params.roomStatus !== "AVAILABLE") return copy.roomUnavailable;
  if (
    typeof params.roomAvailableRooms === "number" &&
    params.quantity > params.roomAvailableRooms
  ) {
    return copy.onlyRoomsAvailable.replace("{{count}}", String(params.roomAvailableRooms));
  }
  const totalGuests = params.guestCount + (params.childCount ?? 0);
  if (
    typeof params.roomMaxOccupancy === "number" &&
    totalGuests > params.roomMaxOccupancy * params.quantity
  ) {
    return copy.exceedsCapacity;
  }
  if (!params.checkInDate || !params.checkOutDate) return copy.selectDatesValidation;
  if (params.checkInDate < params.todayDate) return copy.checkInPast;
  if (params.nights < 1) return copy.checkoutAfter;
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  ariaDecrease,
  ariaIncrease,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  ariaDecrease: string;
  ariaIncrease: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={ariaDecrease}
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-base font-semibold text-slate-900">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={ariaIncrease}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function StepProgress({
  current,
  labels,
}: {
  current: number;
  labels: string[];
}) {
  return (
    <div className="mb-8 flex items-start">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const done = current > stepNum;
        const active = current === stepNum;
        return (
          <div key={stepNum} className="flex flex-1 items-start">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={`mt-2 text-center text-xs leading-tight ${
                  active
                    ? "font-semibold text-slate-900"
                    : done
                      ? "text-emerald-600"
                      : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`mt-4 h-px flex-1 transition-colors duration-300 ${
                  done ? "bg-emerald-300" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PriceSummaryPanel({
  hotel,
  room,
  nights,
  quantity,
  effectivePrice,
  priceSource,
  earlyCheckIn,
  lateCheckOut,
  copy,
  locale,
}: {
  hotel: HotelContextItem;
  room: RoomDetailItem;
  nights: number;
  quantity: number;
  effectivePrice: number;
  priceSource: EffectiveRateSource;
  earlyCheckIn: boolean;
  lateCheckOut: boolean;
  copy: ReturnType<typeof getNewBookingCopy>;
  locale: string;
}) {
  const validNights = Math.max(0, nights);
  const subtotal = effectivePrice * quantity * validNights;
  const timeFees = (earlyCheckIn ? 30_000 : 0) + (lateCheckOut ? 30_000 : 0);
  const estTaxes = Math.round(subtotal * 0.1);
  const estTotal = subtotal + timeFees + estTaxes;
  const thumbnail = room.roomImages[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {thumbnail && (
        <div className="h-36 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveMediaUrl(thumbnail)}
            alt={room.roomName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {hotel.hotelTitle}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">
          {room.roomName}
        </p>
        <p className="text-xs text-slate-500">{room.roomType}</p>

        {priceSource !== "BASE_RATE" && (
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              priceSource === "PRICE_LOCK"
                ? "bg-violet-50 text-violet-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {priceSource === "PRICE_LOCK" ? copy.priceLock : copy.lastMinute}
          </span>
        )}

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          {validNights > 0 ? (
            <>
              <div className="flex justify-between text-slate-600">
                <span>
                  ₩{formatNumber(effectivePrice)} ×{" "}
                  {quantity > 1 ? `${quantity} rooms × ` : ""}
                  {formatNightsLabel(locale as never, validNights)}
                </span>
                <span className="font-medium text-slate-900">
                  ₩{formatNumber(subtotal)}
                </span>
              </div>
              {earlyCheckIn && (
                <div className="flex justify-between text-slate-600">
                  <span>{copy.earlyCheckIn}</span>
                  <span>+₩30,000</span>
                </div>
              )}
              {lateCheckOut && (
                <div className="flex justify-between text-slate-600">
                  <span>{copy.lateCheckOut}</span>
                  <span>+₩30,000</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>{copy.taxes}</span>
                <span>₩{formatNumber(estTaxes)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-sm font-semibold text-slate-900">
                  {copy.estimatedTotal}
                </span>
                <span className="text-base font-bold text-slate-900">
                  ₩{formatNumber(estTotal)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">
              {copy.selectDates}
            </p>
          )}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
          {copy.finalAmountNote}
        </p>
      </div>
    </div>
  );
}

function PaymentCard({
  label,
  emoji,
  selected,
  onSelect,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
        selected
          ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200 text-sky-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const NewBookingPage: NextPageWithAuth = () => {
  const router = useRouter();
  const { locale } = useI18n();
  const copy = getNewBookingCopy(locale);
  const member = useMemo(() => getSessionMember(), []);
  const isPageVisible = usePageVisible();
  const hasVisibilityMountedRef = useRef(false);
  const wasVisibleRef = useRef(false);

  // URL params
  const hotelId = useMemo(
    () =>
      typeof router.query.hotelId === "string" ? router.query.hotelId : "",
    [router.query.hotelId],
  );
  const roomId = useMemo(
    () => (typeof router.query.roomId === "string" ? router.query.roomId : ""),
    [router.query.roomId],
  );
  const initialGuestIdFromQuery = useMemo(
    () =>
      typeof router.query.guestId === "string" ? router.query.guestId : "",
    [router.query.guestId],
  );
  const initialCheckInFromQuery = useMemo(
    () =>
      typeof router.query.checkInDate === "string" &&
      isDateKey(router.query.checkInDate)
        ? router.query.checkInDate
        : "",
    [router.query.checkInDate],
  );
  const initialCheckOutFromQuery = useMemo(
    () =>
      typeof router.query.checkOutDate === "string" &&
      isDateKey(router.query.checkOutDate)
        ? router.query.checkOutDate
        : "",
    [router.query.checkOutDate],
  );
  const initialAdults = useMemo(
    () =>
      typeof router.query.adultCount === "string"
        ? (parsePositiveInt(router.query.adultCount) ?? 1)
        : 1,
    [router.query.adultCount],
  );
  const initialChildren = useMemo(
    () =>
      typeof router.query.childCount === "string"
        ? (parseNonNegativeInt(router.query.childCount) ?? 0)
        : 0,
    [router.query.childCount],
  );
  const initialQty = useMemo(
    () =>
      typeof router.query.quantity === "string"
        ? (parsePositiveInt(router.query.quantity) ?? 1)
        : 1,
    [router.query.quantity],
  );

  // Auth
  const memberType = member?.memberType;
  const hostAccessStatus = member?.hostAccessStatus;
  const isApprovedAgent = memberType === "AGENT" && hasApprovedAgentAccess(hostAccessStatus);
  const canCreateBooking =
    memberType === "USER" ||
    memberType === "AGENT" ||
    memberType === "ADMIN" ||
    memberType === "ADMIN_OPERATOR";
  const isStaffCreator =
    isApprovedAgent ||
    memberType === "ADMIN" ||
    memberType === "ADMIN_OPERATOR";

  // Step
  const [step, setStep] = useState(1);

  // Step 1 — Dates & Guests
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adultCount, setAdultCount] = useState(initialAdults);
  const [childCount, setChildCount] = useState(initialChildren);
  const [quantity, setQuantity] = useState(initialQty);

  // Step 2 — Guest Info
  const [guestName, setGuestName] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [targetGuestId, setTargetGuestId] = useState("");
  const [guestKeyword, setGuestKeyword] = useState("");
  const [debouncedGuestKeyword, setDebouncedGuestKeyword] = useState("");

  // Step 3 — Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("AT_HOTEL");
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);

  // UI
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<{
    code: string;
    total: number;
    paymentStatus: string;
    paymentMethod: PaymentMethod;
  } | null>(null);

  // Queries
  const {
    data: hotelData,
    error: hotelError,
    refetch: refetchHotel,
  } = useQuery<GetHotelContextQueryData, GetHotelContextQueryVars>(
    GET_HOTEL_CONTEXT_QUERY,
    {
      skip: !hotelId,
      variables: { hotelId },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const {
    data: roomData,
    error: roomError,
    refetch: refetchRoom,
  } = useQuery<GetRoomQueryData, GetRoomQueryVars>(GET_ROOM_QUERY, {
    skip: !roomId,
    variables: { roomId },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const {
    data: priceLockData,
    refetch: refetchPriceLock,
  } = useQuery<GetMyPriceLockQueryData, GetMyPriceLockQueryVars>(
    GET_MY_PRICE_LOCK_QUERY,
    {
      skip: !roomId || isStaffCreator,
      variables: { roomId },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const { data: guestCandidatesData, loading: guestCandidatesLoading } =
    useQuery<
      SearchMembersForBookingQueryData,
      SearchMembersForBookingQueryVars
    >(SEARCH_MEMBERS_FOR_BOOKING_QUERY, {
      skip: !isStaffCreator || debouncedGuestKeyword.length < 2,
      variables: { keyword: debouncedGuestKeyword, limit: 8 },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    });

  const [createBooking, { loading: creating }] = useMutation<
    CreateBookingMutationData,
    CreateBookingMutationVars
  >(CREATE_BOOKING_MUTATION, {
    refetchQueries: ["getMyBookings"],
  });

  // Effects — init from URL params
  useEffect(() => {
    if (initialGuestIdFromQuery && !targetGuestId)
      setTargetGuestId(initialGuestIdFromQuery);
  }, [initialGuestIdFromQuery, targetGuestId]);

  useEffect(() => {
    if (initialCheckInFromQuery && !checkInDate)
      setCheckInDate(initialCheckInFromQuery);
  }, [checkInDate, initialCheckInFromQuery]);

  useEffect(() => {
    if (initialCheckOutFromQuery && !checkOutDate)
      setCheckOutDate(initialCheckOutFromQuery);
  }, [checkOutDate, initialCheckOutFromQuery]);

  // Fix: router.query is empty on SSR first render — sync counts once router is ready
  useEffect(() => {
    if (!router.isReady) return;
    setAdultCount(initialAdults);
    setChildCount(initialChildren);
    setQuantity(initialQty);
    // Intentionally run only when router becomes ready (values already derived from query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Debounced guest keyword
  useEffect(() => {
    if (!isStaffCreator) return;
    const t = setTimeout(
      () => setDebouncedGuestKeyword(guestKeyword.trim()),
      250,
    );
    return () => clearTimeout(t);
  }, [guestKeyword, isStaffCreator]);

  // Page visibility refetch
  useEffect(() => {
    if (!isPageVisible) {
      wasVisibleRef.current = false;
      return;
    }
    const becameVisible = !wasVisibleRef.current;
    wasVisibleRef.current = true;
    if (!hasVisibilityMountedRef.current) {
      hasVisibilityMountedRef.current = true;
      return;
    }
    if (!becameVisible) return;
    const tasks: Array<Promise<unknown>> = [];
    if (hotelId) tasks.push(refetchHotel());
    if (roomId) {
      tasks.push(refetchRoom());
      if (!isStaffCreator) tasks.push(refetchPriceLock());
    }
    if (tasks.length > 0) void Promise.allSettled(tasks);
  }, [
    hotelId,
    isPageVisible,
    isStaffCreator,
    refetchHotel,
    refetchPriceLock,
    refetchRoom,
    roomId,
  ]);

  // Auto-cap quantity, adults, children when room data changes
  useEffect(() => {
    if (!roomData?.getRoom) return;
    const maxQty = roomData.getRoom.availableRooms;
    if (maxQty > 0 && quantity > maxQty) setQuantity(maxQty);
  }, [quantity, roomData]);

  useEffect(() => {
    if (!roomData?.getRoom) return;
    const max = roomData.getRoom.maxOccupancy * quantity;
    if (adultCount > max) setAdultCount(Math.max(1, max));
  }, [adultCount, quantity, roomData]);

  useEffect(() => {
    if (!roomData?.getRoom) return;
    const maxC = Math.max(
      0,
      roomData.getRoom.maxOccupancy * quantity - adultCount,
    );
    if (childCount > maxC) setChildCount(maxC);
  }, [adultCount, childCount, quantity, roomData]);

  // Derived values
  const hotel = hotelData?.getHotel;
  const room = roomData?.getRoom;
  const guestCandidates = guestCandidatesData?.searchMembersForBooking ?? [];
  const todayDate = useMemo(() => formatTodayDate(), []);

  const activePriceLock = isStaffCreator
    ? null
    : (priceLockData?.getMyPriceLock ?? null);

  const effectiveRate = useMemo(
    () =>
      resolveEffectiveNightPrice({
        basePrice: room?.basePrice ?? 0,
        allowPriceLock: !isStaffCreator,
        lockedPrice: activePriceLock?.lockedPrice,
        lastMinuteDeal: room?.lastMinuteDeal,
      }),
    [
      activePriceLock?.lockedPrice,
      isStaffCreator,
      room?.basePrice,
      room?.lastMinuteDeal,
    ],
  );

  const effectivePrice = effectiveRate.price;
  const priceSource: EffectiveRateSource = effectiveRate.source;
  const nights = diffNights(checkInDate, checkOutDate);
  const roomCapacity = room?.maxOccupancy ?? 1;
  const maxAdults = roomCapacity * quantity;
  const maxChildren = Math.max(0, maxAdults - adultCount);
  const maxQuantity =
    room?.availableRooms && room.availableRooms > 0 ? room.availableRooms : 1;

  // Full validation (pre-submit)
  const bookingValidationMessage = useMemo(
    () =>
      getValidationMessage({
        locale,
        hotelId,
        roomId,
        canCreateBooking,
        isStaffCreator,
        targetGuestId,
        hasHotel: Boolean(hotel),
        hasRoom: Boolean(room),
        guestCount: adultCount,
        childCount,
        quantity,
        roomStatus: room?.roomStatus,
        roomMaxOccupancy: room?.maxOccupancy,
        roomAvailableRooms: room?.availableRooms,
        checkInDate,
        checkOutDate,
        todayDate,
        nights,
      }),
    [
      adultCount,
      locale,
      canCreateBooking,
      checkInDate,
      checkOutDate,
      childCount,
      hotel,
      hotelId,
      isStaffCreator,
      nights,
      quantity,
      room,
      roomId,
      targetGuestId,
      todayDate,
    ],
  );

  // Per-step validation
  const step1Valid = useMemo(() => {
    if (!checkInDate || !checkOutDate) return false;
    if (checkInDate < todayDate) return false;
    if (checkOutDate <= checkInDate) return false;
    return nights >= 1;
  }, [checkInDate, checkOutDate, nights, todayDate]);

  const step2Valid = isStaffCreator ? targetGuestId.trim().length > 0 : true;

  // Price totals for mobile pill
  const validNights = Math.max(0, nights);
  const subtotal = effectivePrice * quantity * validNights;
  const timeFees = (earlyCheckIn ? 30_000 : 0) + (lateCheckOut ? 30_000 : 0);
  const estTaxes = Math.round(subtotal * 0.1);
  const estTotal = subtotal + timeFees + estTaxes;

  // Submit
  const handleConfirm = async () => {
    setSubmitError(null);
    if (bookingValidationMessage) {
      setSubmitError(bookingValidationMessage);
      return;
    }
    if (!hotel || !room) {
      setSubmitError(copy.bookingContextIncomplete);
      return;
    }
    const confirmed = await confirmAction({
      title: "Review booking details",
      text: `${hotel.hotelTitle}\n${room.roomType} · ${checkInDate} to ${checkOutDate}\n${quantity} room · Estimated total ₩${formatNumber(estTotal)}`,
      confirmText: copy.confirmBooking,
      cancelText: copy.back,
      variant: "booking",
    });
    if (!confirmed) return;
    try {
      const response = await createBooking({
        variables: {
          input: {
            ...(isStaffCreator ? { guestId: targetGuestId.trim() } : {}),
            hotelId,
            checkInDate: toDateTime(checkInDate),
            checkOutDate: toDateTime(checkOutDate),
            adultCount,
            childCount,
            paymentMethod,
            specialRequests: specialRequests.trim() || undefined,
            earlyCheckIn,
            lateCheckOut,
            rooms: [
              {
                roomId,
                roomType: room.roomType,
                quantity,
                pricePerNight: effectivePrice,
                guestName: guestName.trim() || undefined,
              },
            ],
          },
        },
      });
      const booking = response.data?.createBooking;
      if (booking) {
        setCreatedBooking({
          code: booking.bookingCode,
          total: booking.totalPrice,
          paymentStatus: booking.paymentStatus,
          paymentMethod,
        });
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  // ── Missing context ──────────────────────────────────────────────────────────
  if (!hotelId || !roomId) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div>
          <p className="text-3xl">🏨</p>
          <p className="mt-3 font-semibold text-slate-800">
            {copy.missingContextTitle}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {copy.missingContextBody}
          </p>
          <Link
            href="/hotels"
            className="mt-5 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {copy.browseHotels}
          </Link>
        </div>
      </main>
    );
  }

  // ── Confirmed screen ─────────────────────────────────────────────────────────
  if (createdBooking) {
    return (
      <>
        <style>{`
          @keyframes bookingConfirm {
            0%   { transform: scale(0.7); opacity: 0; }
            60%  { transform: scale(1.08); }
            100% { transform: scale(1); opacity: 1; }
          }
          .anim-confirm { animation: bookingConfirm 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
          @keyframes confirmFade {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .anim-cfade { animation: confirmFade 0.4s ease-out 0.3s both; }
        `}</style>
        <main className="w-full space-y-6 py-8 text-center">
          <div className="anim-confirm mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <Check size={36} strokeWidth={2.5} />
          </div>

          <div className="anim-cfade space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              {copy.bookingConfirmed}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {copy.allSet}
            </h1>
            <p className="text-sm text-slate-500">
              {copy.reservationCreated}
            </p>
            <p className="text-xs text-slate-400">
              {copy.reservationPaymentNote}
            </p>
          </div>

          <div className="anim-cfade rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {copy.bookingCode}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-slate-900">
              {createdBooking.code}
            </p>
            <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
              {copy.paymentDemoBadge}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>{copy.total}</span>
                <span className="font-semibold text-slate-900">
                  ₩{formatNumber(createdBooking.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{copy.paymentMethod}</span>
                <span className="font-semibold text-slate-900">
                  {getPaymentMethodLabel(locale as never, createdBooking.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{copy.paymentStatus}</span>
                <span className="font-semibold text-slate-900">
                  {getPaymentStatusLabel(locale as never, createdBooking.paymentStatus)}
                </span>
              </div>
            </div>
          </div>

          <div className="anim-cfade flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/bookings"
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {copy.viewMyBookings}
            </Link>
            <Link
              href={`/hotels/${hotelId}`}
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              {copy.backToHotel}
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (!hotel || !room) {
    return (
      <main className="space-y-6">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="h-7 w-56 animate-pulse rounded-full bg-slate-200" />
        <div className="flex gap-6">
          <div className="flex-1 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
          <div className="hidden w-80 flex-shrink-0 rounded-2xl border border-slate-200 bg-white lg:block">
            <div className="h-36 animate-pulse bg-slate-100" />
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded-full bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // AGENT ownership guard — must own the hotel to create bookings here
  if (isApprovedAgent && hotel.memberId !== member?._id) {
    return (
      <main className="space-y-6">
        <Link
          href="/hotels/manage"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={14} />
          {copy.backToMyHotels}
        </Link>
        <ErrorNotice
          tone="warn"
          message={copy.agentOwnership}
        />
      </main>
    );
  }

  const loadError = hotelError ?? roomError;

  // ── Wizard ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes stepSlideIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .anim-step { animation: stepSlideIn 0.22s ease-out both; }
      `}</style>

      <main className="space-y-6">
        {/* Back link */}
        <Link
          href={`/hotels/${hotelId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={14} />
          {copy.backToHotel}
        </Link>

        {/* Header */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {isStaffCreator ? copy.staffBooking : copy.newBooking}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {hotel?.hotelTitle ?? copy.reserveYourStay}
          </h1>
        </header>

        {loadError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {getErrorMessage(loadError)}
          </div>
        )}

        {hotel && room && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* ── Left: wizard ── */}
            <div className="min-w-0 flex-1 space-y-5">
              {/* Mobile summary pill */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileSummaryOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="text-left">
                    <p className="text-[11px] text-slate-400">
                      {copy.estimatedTotalShort}
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      ₩{formatNumber(estTotal)}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${
                      mobileSummaryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileSummaryOpen && (
                  <div className="mt-2">
                    <PriceSummaryPanel
                      hotel={hotel}
                      room={room}
                      nights={nights}
                      quantity={quantity}
                      effectivePrice={effectivePrice}
                      priceSource={priceSource}
                      earlyCheckIn={earlyCheckIn}
                      lateCheckOut={lateCheckOut}
                      copy={copy}
                      locale={locale}
                    />
                  </div>
                )}
              </div>

              {/* Step progress */}
              <StepProgress current={step} labels={copy.stepLabels} />

              {/* Step content */}
              <div key={step} className="anim-step">
                {/* ── Step 1: Dates & Guests ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {copy.selectDatesTitle}
                      </h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {copy.checkIn}
                          </span>
                          <input
                            type="date"
                            min={todayDate}
                            value={checkInDate}
                            onChange={(e) => {
                              setCheckInDate(e.target.value);
                              if (
                                checkOutDate &&
                                e.target.value >= checkOutDate
                              )
                                setCheckOutDate("");
                            }}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {copy.checkOut}
                          </span>
                          <input
                            type="date"
                            min={checkInDate || todayDate}
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          />
                        </label>
                      </div>
                      {nights >= 1 && (
                        <p className="mt-3 text-center text-sm font-semibold text-sky-600">
                          {formatNightsLabel(locale as never, nights)}
                        </p>
                      )}
                      {checkInDate &&
                        checkOutDate &&
                        checkOutDate <= checkInDate && (
                          <p className="mt-2 text-center text-xs text-rose-500">
                            {copy.checkoutAfter}
                          </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {copy.guestsRooms}
                      </h2>
                      <p className="mb-4 text-xs text-slate-400">
                        {copy.maxGuestsPerRoom
                          .replace("{{guests}}", String(roomCapacity))
                          .replace("{{rooms}}", String(room.availableRooms))}
                      </p>
                      <div className="space-y-3">
                        <Stepper
                          label={copy.adults}
                          hint={copy.age18}
                          value={adultCount}
                          min={1}
                          max={maxAdults}
                          onChange={setAdultCount}
                          ariaDecrease={`${copy.back} ${copy.adults}`}
                          ariaIncrease={`${copy.next} ${copy.adults}`}
                        />
                        <Stepper
                          label={copy.children}
                          hint={copy.under18}
                          value={childCount}
                          min={0}
                          max={maxChildren}
                          onChange={setChildCount}
                          ariaDecrease={`${copy.back} ${copy.children}`}
                          ariaIncrease={`${copy.next} ${copy.children}`}
                        />
                        <Stepper
                          label={copy.rooms}
                          value={quantity}
                          min={1}
                          max={maxQuantity}
                          onChange={setQuantity}
                          ariaDecrease={`${copy.back} ${copy.rooms}`}
                          ariaIncrease={`${copy.next} ${copy.rooms}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Guest Info ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    {isStaffCreator && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                        {copy.staffGuestBanner}
                      </div>
                    )}

                    {isStaffCreator && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                          {copy.findGuest}
                        </h2>
                        <input
                          value={guestKeyword}
                          onChange={(e) => {
                            setGuestKeyword(e.target.value);
                            if (!e.target.value) setTargetGuestId("");
                          }}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          placeholder={copy.searchGuest}
                        />
                        {guestCandidatesLoading && (
                          <p className="mt-2 text-xs text-slate-400">
                            {copy.searching}
                          </p>
                        )}
                        {guestCandidates.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {guestCandidates.map((c) => (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => {
                                  setTargetGuestId(c._id);
                                  setGuestKeyword(
                                    `${c.memberNick} · ${c.memberPhone}`,
                                  );
                                }}
                                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                                  targetGuestId === c._id
                                    ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <p className="font-semibold text-slate-900">
                                  {c.memberNick}
                                </p>
                                <p className="text-slate-500">
                                  {c.memberFullName ?? "—"} · {c.memberPhone}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                        {debouncedGuestKeyword.length >= 2 &&
                          !guestCandidatesLoading &&
                          guestCandidates.length === 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs text-slate-500">
                                {copy.noMembersFound}
                              </p>
                              <input
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                placeholder={copy.memberId}
                                value={targetGuestId}
                                onChange={(e) =>
                                  setTargetGuestId(e.target.value.trim())
                                }
                              />
                            </div>
                          )}
                        {targetGuestId && (
                          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <Check size={12} strokeWidth={3} /> {copy.guestSelected}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {copy.reservationDetails}
                      </h2>
                      <div className="space-y-4">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {copy.reservationName}{" "}
                            <span className="font-normal normal-case text-slate-400">
                              ({copy.optional})
                            </span>
                          </span>
                          <input
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            placeholder={copy.fullNameOnBooking}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {copy.specialRequests}{" "}
                            <span className="font-normal normal-case text-slate-400">
                              ({copy.optional})
                            </span>
                          </span>
                          <textarea
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            placeholder={copy.specialRequestsPlaceholder}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Payment & Extras ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {copy.paymentMethod}
                      </h2>
                      <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                          {copy.paymentDemoNoticeTitle}
                        </p>
                        <p className="mt-1 text-sm text-sky-800">
                          {copy.paymentDemoNoticeBody}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {PAYMENT_METHODS_CONFIG.map((m) => (
                          <PaymentCard
                            key={m.value}
                            label={getPaymentMethodLabel(locale as never, m.value)}
                            emoji={m.emoji}
                            selected={paymentMethod === m.value}
                            onSelect={() => setPaymentMethod(m.value)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {copy.checkOptions}
                      </h2>
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setEarlyCheckIn((v) => !v)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                            earlyCheckIn
                              ? "border-sky-300 bg-sky-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {copy.earlyCheckIn}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {copy.beforeTime.replace("{{time}}", hotel.checkInTime)}
                            </p>
                          </div>
                          <div
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                              earlyCheckIn
                                ? "border-sky-500 bg-sky-500"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {earlyCheckIn && (
                              <Check
                                size={12}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLateCheckOut((v) => !v)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                            lateCheckOut
                              ? "border-sky-300 bg-sky-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {copy.lateCheckOut}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {copy.afterTime.replace("{{time}}", hotel.checkOutTime)}
                            </p>
                          </div>
                          <div
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                              lateCheckOut
                                ? "border-sky-500 bg-sky-500"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {lateCheckOut && (
                              <Check
                                size={12}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {submitError && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        {submitError}
                      </div>
                    )}

                    {bookingValidationMessage && !submitError && (
                      <p className="text-center text-sm text-rose-500">
                        {bookingValidationMessage}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleConfirm()}
                      disabled={creating || Boolean(bookingValidationMessage)}
                      className="w-full rounded-full bg-sky-500 py-4 text-sm font-bold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creating ? copy.confirming : copy.confirmBooking}
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={14} />
                    {copy.back}
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 && (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 && !step1Valid) || (step === 2 && !step2Valid)
                    }
                    className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copy.next} →
                  </button>
                )}
              </div>
            </div>

            {/* ── Right: sticky summary (desktop only) ── */}
            <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
              <div className="sticky top-24">
                <PriceSummaryPanel
                  hotel={hotel}
                  room={room}
                  nights={nights}
                  quantity={quantity}
                  effectivePrice={effectivePrice}
                  priceSource={priceSource}
                  earlyCheckIn={earlyCheckIn}
                  lateCheckOut={lateCheckOut}
                  copy={copy}
                  locale={locale}
                />
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
};

NewBookingPage.auth = {
  roles: ["USER", "AGENT", "ADMIN", "ADMIN_OPERATOR"],
};

export default NewBookingPage;
