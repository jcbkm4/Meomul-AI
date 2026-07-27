import type { SupportedLocale } from "@/lib/i18n/config";

type SupportCategoryId =
  | "bookings"
  | "payments"
  | "cancellations"
  | "account"
  | "hotel"
  | "technical";

export interface SupportCategoryCopy {
  id: SupportCategoryId;
  label: string;
  topic: string;
}

export interface SupportFaqCopy {
  q: string;
  a: string;
  category: SupportCategoryId;
}

export interface SupportPageCopy {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: string;
  searchPlaceholder: string;
  popularQuestions: string;
  helpArticles: string;
  viewAll: string;
  noResultsFound: string;
  tryDifferentSearch: string;
  contactOurTeam: string;
  signInForHelp: string;
  stillNeedHelp: string;
  sendUsMessage: string;
  signInDirectly: string;
  signInPrompt: string;
  signIn: string;
  messageSent: string;
  supportRespond: string;
  viewConversation: string;
  newRequest: string;
  topicLabel: string;
  bookingReference: string;
  optional: string;
  bookingReferencePlaceholder: string;
  helpPrompt: string;
  messagePlaceholder: string;
  minCharacters: string;
  characters: string;
  sending: string;
  sendMessage: string;
  yourRequests: string;
  noSupportRequests: string;
  status: string;
  topicHeader: string;
  lastUpdate: string;
  open: string;
  general: string;
}

interface SupportLocaleBundle extends SupportPageCopy {
  categories: SupportCategoryCopy[];
  faq: SupportFaqCopy[];
  formTopics: string[];
}

const en: SupportLocaleBundle = {
  metaTitle: "Help Center — Meomul",
  metaDescription:
    "Get help with your Meomul bookings, payments, cancellations, and more.",
  heroTitle: "How can we help?",
  heroDescription: "Search for answers or browse by topic below",
  searchPlaceholder:
    "Describe your issue, e.g. cancel booking, refund status…",
  popularQuestions: "Popular Questions",
  helpArticles: "Help Articles",
  viewAll: "View all",
  noResultsFound: "No results found",
  tryDifferentSearch: "Try a different search term or",
  contactOurTeam: "contact our team",
  signInForHelp: "sign in for help",
  stillNeedHelp: "Still need help?",
  sendUsMessage: "Send us a message and our team will get back to you.",
  signInDirectly: "Sign in to contact our support team directly.",
  signInPrompt:
    "Please sign in so we can access your bookings and help you faster.",
  signIn: "Sign in",
  messageSent: "Message sent",
  supportRespond:
    "A support agent will respond shortly. You can track this conversation in your chat inbox.",
  viewConversation: "View conversation",
  newRequest: "New request",
  topicLabel: "Topic",
  bookingReference: "Booking Reference",
  optional: "optional",
  bookingReferencePlaceholder: "e.g. BK-2025-XXXX",
  helpPrompt: "How can we help?",
  messagePlaceholder: "Describe your issue in detail…",
  minCharacters: "Please provide at least 10 characters.",
  characters: "character",
  sending: "Sending…",
  sendMessage: "Send message",
  yourRequests: "Your Requests",
  noSupportRequests: "No support requests yet",
  status: "Status",
  topicHeader: "Topic",
  lastUpdate: "Last Update",
  open: "Open",
  general: "General",
  categories: [
    { id: "bookings", label: "Bookings & Reservations", topic: "Booking Issue" },
    { id: "payments", label: "Payment & Billing", topic: "Payment & Billing" },
    {
      id: "cancellations",
      label: "Cancellation & Refunds",
      topic: "Cancellation & Refund",
    },
    { id: "account", label: "Account & Settings", topic: "Account & Profile" },
    { id: "hotel", label: "Hotel Information", topic: "Hotel Information" },
    { id: "technical", label: "Technical Support", topic: "Technical Problem" },
  ],
  formTopics: [
    "Booking Issue",
    "Payment & Billing",
    "Cancellation & Refund",
    "Account & Profile",
    "Hotel Information",
    "Technical Problem",
    "Other",
  ],
  faq: [
    {
      q: "How do I cancel a booking?",
      a: "Go to My Bookings, open the reservation you want to cancel, and choose Cancel Booking. Free-cancellation bookings are refunded automatically. Outside that window, the hotel's cancellation policy applies.",
      category: "cancellations",
    },
    {
      q: "Can I change my check-in or check-out date?",
      a: "Date changes depend on hotel policy and room availability. Open the booking detail page and choose Modify Dates. If a change is possible, updated pricing appears immediately.",
      category: "bookings",
    },
    {
      q: "How does Price Lock work?",
      a: "Price Lock holds the current room price for up to 30 minutes while you finish booking. Premium plans can receive longer lock windows during busy periods.",
      category: "bookings",
    },
    {
      q: "When will I be charged for my stay?",
      a: "This portfolio build does not process real payments. Your selected payment method is stored with the booking, and payment status can be updated manually by staff for demo purposes.",
      category: "payments",
    },
    {
      q: "How do I request a refund?",
      a: "Refunds within the free-cancellation window are processed automatically. For other refund cases, open a support request with your booking reference.",
      category: "cancellations",
    },
    {
      q: "How do I contact the hotel directly?",
      a: "Open your booking and use Chat with Hotel. You can also find hotel contact information on the hotel detail page.",
      category: "hotel",
    },
    {
      q: "What is Meomul Premium?",
      a: "Meomul Premium unlocks extra perks such as longer Price Lock windows, early access to deals, priority support, and more personalized recommendations.",
      category: "account",
    },
    {
      q: "How do I report a problem with my stay?",
      a: "Open the related booking and start a support request. Attach screenshots or photos when needed so the team can review the issue faster.",
      category: "bookings",
    },
    {
      q: "How do I change my password?",
      a: "Go to your account security settings and select Change Password. If you forgot it, use the Forgot Password flow on the sign-in page.",
      category: "account",
    },
    {
      q: "Why was my payment declined?",
      a: "Demo payment methods do not charge a real card. If a booking shows a failed payment status, it means staff marked the demo payment as failed or not recorded yet.",
      category: "payments",
    },
    {
      q: "The app is not loading properly. What should I do?",
      a: "Clear your browser cache, refresh the page, and make sure your browser is updated. If the issue continues, send us your device and browser details.",
      category: "technical",
    },
    {
      q: "How can I view my booking confirmation?",
      a: "Open My Bookings and select the reservation. Your confirmation number, stay dates, address, and payment summary are shown there.",
      category: "bookings",
    },
  ],
};

const ko: SupportLocaleBundle = {
  ...en,
  metaTitle: "고객센터 — Meomul",
  metaDescription: "예약, 결제, 취소 등 Meomul 이용에 필요한 도움을 받아보세요.",
  heroTitle: "무엇을 도와드릴까요?",
  heroDescription: "답변을 검색하거나 아래 주제별 도움말을 확인해 보세요",
  searchPlaceholder: "예: 예약 취소, 환불 상태 등을 입력해 보세요…",
  popularQuestions: "자주 묻는 질문",
  helpArticles: "도움말 문서",
  viewAll: "전체 보기",
  noResultsFound: "검색 결과가 없습니다",
  tryDifferentSearch: "다른 검색어를 사용하거나",
  contactOurTeam: "지원팀에 문의해 보세요",
  signInForHelp: "로그인 후 문의하기",
  stillNeedHelp: "아직 도움이 필요하신가요?",
  sendUsMessage: "메시지를 남겨주시면 지원팀이 곧 답변드립니다.",
  signInDirectly: "지원팀에 문의하려면 로그인해 주세요.",
  signInPrompt: "예약 정보를 확인해야 더 빠르게 도와드릴 수 있습니다. 로그인해 주세요.",
  signIn: "로그인",
  messageSent: "문의가 전송되었습니다",
  supportRespond: "지원 담당자가 곧 답변드립니다. 채팅 받은 편지함에서 진행 상황을 확인할 수 있습니다.",
  viewConversation: "대화 보기",
  newRequest: "새 문의",
  topicLabel: "문의 주제",
  bookingReference: "예약 번호",
  optional: "선택",
  bookingReferencePlaceholder: "예: BK-2025-XXXX",
  helpPrompt: "어떤 도움이 필요하신가요?",
  messagePlaceholder: "문제를 자세히 설명해 주세요…",
  minCharacters: "최소 10자 이상 입력해 주세요.",
  characters: "자",
  sending: "전송 중…",
  sendMessage: "메시지 보내기",
  yourRequests: "내 문의 내역",
  noSupportRequests: "아직 문의 내역이 없습니다",
  status: "상태",
  topicHeader: "주제",
  lastUpdate: "최근 업데이트",
  open: "열기",
  general: "일반",
  categories: [
    { id: "bookings", label: "예약 및 예약 관리", topic: "예약 문의" },
    { id: "payments", label: "결제 및 청구", topic: "결제 문의" },
    { id: "cancellations", label: "취소 및 환불", topic: "취소 및 환불" },
    { id: "account", label: "계정 및 설정", topic: "계정 및 프로필" },
    { id: "hotel", label: "호텔 정보", topic: "호텔 정보" },
    { id: "technical", label: "기술 지원", topic: "기술 문제" },
  ],
  formTopics: ["예약 문의", "결제 문의", "취소 및 환불", "계정 및 프로필", "호텔 정보", "기술 문제", "기타"],
  faq: [
    { q: "예약을 취소하려면 어떻게 하나요?", a: "내 예약에서 취소할 예약을 연 뒤 예약 취소를 선택하세요. 무료 취소 기간 내 예약은 자동 환불되며, 이후에는 호텔 취소 정책이 적용됩니다.", category: "cancellations" },
    { q: "체크인이나 체크아웃 날짜를 변경할 수 있나요?", a: "날짜 변경 가능 여부는 호텔 정책과 객실 상황에 따라 달라집니다. 예약 상세에서 날짜 변경을 선택하면 가능할 경우 즉시 새 요금이 표시됩니다.", category: "bookings" },
    { q: "Price Lock은 어떻게 작동하나요?", a: "Price Lock은 예약을 마칠 동안 현재 객실 요금을 최대 30분간 유지해 줍니다. 프리미엄 플랜은 혼잡 시간대에 더 긴 잠금 시간을 받을 수 있습니다.", category: "bookings" },
    { q: "숙박 요금은 언제 청구되나요?", a: "이 포트폴리오 빌드에서는 실제 결제가 처리되지 않습니다. 선택한 결제 수단은 예약 정보에 저장되며, 결제 상태는 데모용으로 직원이 수동 반영할 수 있습니다.", category: "payments" },
    { q: "환불은 어떻게 요청하나요?", a: "무료 취소 기간 내 취소 건은 자동 환불됩니다. 그 외 환불이 필요한 경우 예약 번호와 함께 지원 요청을 보내 주세요.", category: "cancellations" },
    { q: "호텔에 직접 연락하려면 어떻게 하나요?", a: "예약을 열고 호텔 채팅 기능을 이용하세요. 호텔 상세 페이지에서도 연락 정보를 확인할 수 있습니다.", category: "hotel" },
    { q: "Meomul Premium은 무엇인가요?", a: "Meomul Premium은 더 긴 Price Lock, 딜 조기 접근, 우선 지원, 더 정교한 추천 같은 추가 혜택을 제공하는 구독 플랜입니다.", category: "account" },
    { q: "투숙 중 문제가 생기면 어떻게 신고하나요?", a: "관련 예약을 열고 지원 문의를 시작하세요. 스크린샷이나 사진을 함께 보내면 더 빠르게 검토할 수 있습니다.", category: "bookings" },
    { q: "비밀번호는 어떻게 변경하나요?", a: "계정 보안 설정에서 비밀번호 변경을 선택하세요. 잊어버린 경우 로그인 화면의 비밀번호 찾기를 이용하면 됩니다.", category: "account" },
    { q: "결제가 거절된 이유는 무엇인가요?", a: "데모 결제 수단은 실제 카드를 청구하지 않습니다. 예약에 결제 실패가 보인다면 직원이 데모 결제를 실패 또는 미반영 상태로 표시한 것입니다.", category: "payments" },
    { q: "앱이 제대로 로드되지 않으면 어떻게 하나요?", a: "브라우저 캐시를 지우고 새로고침한 뒤 브라우저가 최신 버전인지 확인해 주세요. 문제가 계속되면 기기와 브라우저 정보를 알려 주세요.", category: "technical" },
    { q: "예약 확인서는 어디에서 볼 수 있나요?", a: "내 예약에서 해당 예약을 선택하면 확인 번호, 숙박 일정, 주소, 결제 요약을 확인할 수 있습니다.", category: "bookings" },
  ],
};

const ru: SupportLocaleBundle = {
  ...en,
  metaTitle: "Центр поддержки — Meomul",
  metaDescription: "Получите помощь по бронированиям, оплатам, отменам и другим вопросам Meomul.",
  heroTitle: "Чем мы можем помочь?",
  heroDescription: "Найдите ответ через поиск или выберите тему ниже",
  searchPlaceholder: "Например: отмена бронирования, статус возврата…",
  popularQuestions: "Популярные вопросы",
  helpArticles: "Статьи помощи",
  viewAll: "Показать все",
  noResultsFound: "Ничего не найдено",
  tryDifferentSearch: "Попробуйте другой запрос или",
  contactOurTeam: "свяжитесь с нашей командой",
  signInForHelp: "войдите для помощи",
  stillNeedHelp: "Все еще нужна помощь?",
  sendUsMessage: "Напишите нам, и команда поддержки скоро ответит.",
  signInDirectly: "Войдите, чтобы связаться с поддержкой напрямую.",
  signInPrompt: "Войдите, чтобы мы могли увидеть ваши бронирования и помочь быстрее.",
  signIn: "Войти",
  messageSent: "Сообщение отправлено",
  supportRespond: "Агент поддержки скоро ответит. Вы можете отслеживать диалог в разделе чатов.",
  viewConversation: "Открыть диалог",
  newRequest: "Новый запрос",
  topicLabel: "Тема",
  bookingReference: "Номер бронирования",
  optional: "необязательно",
  bookingReferencePlaceholder: "например BK-2025-XXXX",
  helpPrompt: "Чем мы можем помочь?",
  messagePlaceholder: "Опишите проблему подробнее…",
  minCharacters: "Введите не менее 10 символов.",
  characters: "симв.",
  sending: "Отправка…",
  sendMessage: "Отправить сообщение",
  yourRequests: "Ваши запросы",
  noSupportRequests: "Запросов в поддержку пока нет",
  status: "Статус",
  topicHeader: "Тема",
  lastUpdate: "Последнее обновление",
  open: "Открыть",
  general: "Общее",
  categories: [
    { id: "bookings", label: "Бронирования", topic: "Проблема с бронированием" },
    { id: "payments", label: "Оплата и счета", topic: "Оплата и счета" },
    { id: "cancellations", label: "Отмена и возврат", topic: "Отмена и возврат" },
    { id: "account", label: "Аккаунт и настройки", topic: "Аккаунт и профиль" },
    { id: "hotel", label: "Информация об отеле", topic: "Информация об отеле" },
    { id: "technical", label: "Техническая поддержка", topic: "Техническая проблема" },
  ],
  formTopics: ["Проблема с бронированием", "Оплата и счета", "Отмена и возврат", "Аккаунт и профиль", "Информация об отеле", "Техническая проблема", "Другое"],
  faq: [
    { q: "Как отменить бронирование?", a: "Откройте Мои бронирования, выберите нужное бронирование и нажмите отмену. В период бесплатной отмены возврат оформляется автоматически. После этого применяется политика отеля.", category: "cancellations" },
    { q: "Можно ли изменить даты заезда или выезда?", a: "Это зависит от политики отеля и наличия номеров. На странице бронирования выберите изменение дат, и если это возможно, новая цена появится сразу.", category: "bookings" },
    { q: "Как работает Price Lock?", a: "Price Lock удерживает текущую цену номера до 30 минут, пока вы завершаете бронирование. Премиум-планы могут получать более длинное удержание.", category: "bookings" },
    { q: "Когда будет списана оплата за проживание?", a: "В этой портфолио-версии реальные платежи не проводятся. Выбранный способ оплаты сохраняется в бронировании, а статус оплаты может обновляться сотрудниками вручную для демо.", category: "payments" },
    { q: "Как запросить возврат?", a: "Возвраты в период бесплатной отмены оформляются автоматически. В остальных случаях отправьте запрос в поддержку с номером бронирования.", category: "cancellations" },
    { q: "Как связаться с отелем напрямую?", a: "Откройте бронирование и используйте чат с отелем. Контакты также доступны на странице отеля.", category: "hotel" },
    { q: "Что такое Meomul Premium?", a: "Meomul Premium дает дополнительные преимущества: более долгий Price Lock, ранний доступ к акциям, приоритетную поддержку и более точные рекомендации.", category: "account" },
    { q: "Как сообщить о проблеме во время проживания?", a: "Откройте нужное бронирование и создайте запрос в поддержку. При необходимости приложите фото или скриншоты.", category: "bookings" },
    { q: "Как изменить пароль?", a: "Перейдите в настройки безопасности аккаунта и выберите изменение пароля. Если забыли пароль, используйте восстановление на странице входа.", category: "account" },
    { q: "Почему мой платеж был отклонен?", a: "Демо-методы оплаты не списывают деньги с реальной карты. Если у бронирования статус оплаты failed, это означает, что сотрудники отметили демо-оплату как неуспешную или еще не подтвержденную.", category: "payments" },
    { q: "Приложение загружается неправильно. Что делать?", a: "Очистите кеш браузера, обновите страницу и убедитесь, что браузер обновлен. Если проблема остается, отправьте нам данные о браузере и устройстве.", category: "technical" },
    { q: "Где посмотреть подтверждение бронирования?", a: "Откройте Мои бронирования и выберите нужную запись. Там отображаются номер подтверждения, даты, адрес и платежная информация.", category: "bookings" },
  ],
};

const uz: SupportLocaleBundle = {
  ...en,
  metaTitle: "Yordam markazi — Meomul",
  metaDescription: "Meomul bronlari, to'lovlar, bekor qilish va boshqa savollar bo'yicha yordam oling.",
  heroTitle: "Qanday yordam bera olamiz?",
  heroDescription: "Javoblarni qidiring yoki quyidagi mavzular bo'yicha ko'rib chiqing",
  searchPlaceholder: "Masalan: bronni bekor qilish, qaytarim holati…",
  popularQuestions: "Ko'p so'raladigan savollar",
  helpArticles: "Yordam maqolalari",
  viewAll: "Barchasini ko'rish",
  noResultsFound: "Natija topilmadi",
  tryDifferentSearch: "Boshqa so'zni qidiring yoki",
  contactOurTeam: "jamoamiz bilan bog'laning",
  signInForHelp: "yordam uchun kiring",
  stillNeedHelp: "Hali ham yordam kerakmi?",
  sendUsMessage: "Bizga yozing, jamoamiz tez orada javob beradi.",
  signInDirectly: "Yordam jamoasi bilan bog'lanish uchun tizimga kiring.",
  signInPrompt: "Bronlaringizni ko'rib tezroq yordam berishimiz uchun tizimga kiring.",
  signIn: "Kirish",
  messageSent: "Xabar yuborildi",
  supportRespond: "Yordam agenti tez orada javob beradi. Suhbatni chat bo'limida kuzatishingiz mumkin.",
  viewConversation: "Suhbatni ochish",
  newRequest: "Yangi so'rov",
  topicLabel: "Mavzu",
  bookingReference: "Bron raqami",
  optional: "ixtiyoriy",
  bookingReferencePlaceholder: "masalan BK-2025-XXXX",
  helpPrompt: "Nima bo'yicha yordam kerak?",
  messagePlaceholder: "Muammoni batafsil yozing…",
  minCharacters: "Kamida 10 ta belgi kiriting.",
  characters: "belgi",
  sending: "Yuborilmoqda…",
  sendMessage: "Xabar yuborish",
  yourRequests: "So'rovlaringiz",
  noSupportRequests: "Hali yordam so'rovlari yo'q",
  status: "Holat",
  topicHeader: "Mavzu",
  lastUpdate: "Oxirgi yangilanish",
  open: "Ochish",
  general: "Umumiy",
  categories: [
    { id: "bookings", label: "Bronlar va rezervatsiyalar", topic: "Bron muammosi" },
    { id: "payments", label: "To'lov va hisob-kitob", topic: "To'lov va hisob-kitob" },
    { id: "cancellations", label: "Bekor qilish va qaytarim", topic: "Bekor qilish va qaytarim" },
    { id: "account", label: "Hisob va sozlamalar", topic: "Hisob va profil" },
    { id: "hotel", label: "Mehmonxona ma'lumoti", topic: "Mehmonxona ma'lumoti" },
    { id: "technical", label: "Texnik yordam", topic: "Texnik muammo" },
  ],
  formTopics: ["Bron muammosi", "To'lov va hisob-kitob", "Bekor qilish va qaytarim", "Hisob va profil", "Mehmonxona ma'lumoti", "Texnik muammo", "Boshqa"],
  faq: [
    { q: "Bronni qanday bekor qilaman?", a: "Mening bronlarim bo'limiga o'ting, kerakli bronni oching va bekor qilishni tanlang. Bepul bekor qilish muddatida qaytarim avtomatik amalga oshiriladi.", category: "cancellations" },
    { q: "Check-in yoki check-out sanasini o'zgartira olamanmi?", a: "Bu mehmonxona siyosati va mavjud xonalarga bog'liq. Bron sahifasida sanani o'zgartirishni tanlang, agar mumkin bo'lsa yangi narx darhol ko'rinadi.", category: "bookings" },
    { q: "Price Lock qanday ishlaydi?", a: "Price Lock bronni yakunlayotganingizda joriy xona narxini 30 daqiqagacha ushlab turadi. Premium tariflar yanada uzoqroq muddat olishi mumkin.", category: "bookings" },
    { q: "Turar joy uchun to'lov qachon olinadi?", a: "Bu portfolio versiyasida haqiqiy to'lov olinmaydi. Tanlangan to'lov usuli bron bilan saqlanadi va to'lov holati demo uchun xodimlar tomonidan qo'lda yangilanishi mumkin.", category: "payments" },
    { q: "Qaytarimni qanday so'rayman?", a: "Bepul bekor qilish muddatidagi bronlar uchun qaytarim avtomatik ishlanadi. Boshqa holatlarda bron raqami bilan yordam so'rovi yuboring.", category: "cancellations" },
    { q: "Mehmonxona bilan qanday bevosita bog'lanaman?", a: "Bronni ochib mehmonxona chati orqali yozing. Aloqa ma'lumotlari mehmonxona sahifasida ham mavjud.", category: "hotel" },
    { q: "Meomul Premium nima?", a: "Meomul Premium uzoqroq Price Lock, chegirmalarga erta kirish, ustuvor yordam va kuchliroq tavsiyalar kabi qo'shimcha afzalliklarni beradi.", category: "account" },
    { q: "Turar joyda muammo bo'lsa qanday xabar beraman?", a: "Tegishli bronni ochib yordam so'rovini boshlang. Kerak bo'lsa suratlar yoki skrinshotlarni qo'shing.", category: "bookings" },
    { q: "Parolni qanday o'zgartiraman?", a: "Hisob xavfsizligi sozlamalariga o'tib parolni o'zgartirishni tanlang. Agar unutgan bo'lsangiz, kirish sahifasidagi tiklash oqimidan foydalaning.", category: "account" },
    { q: "Nega to'lovim rad etildi?", a: "Demo to'lov usullari haqiqiy kartadan pul yechmaydi. Agar bron failed holatini ko'rsatsa, bu demo to'lov xodimlar tomonidan muvaffaqiyatsiz yoki hali tasdiqlanmagan deb belgilanganini anglatadi.", category: "payments" },
    { q: "Ilova to'g'ri yuklanmayapti. Nima qilaman?", a: "Brauzer keshini tozalang, sahifani yangilang va brauzer yangilanganini tekshiring. Muammo davom etsa, qurilma va brauzer ma'lumotini yuboring.", category: "technical" },
    { q: "Bron tasdig'ini qayerdan ko'raman?", a: "Mening bronlarim bo'limida kerakli bronni tanlang. Tasdiq raqami, sanalar, manzil va to'lov ma'lumoti shu yerda ko'rsatiladi.", category: "bookings" },
  ],
};

export const getSupportCopy = (locale: SupportedLocale): SupportLocaleBundle => {
  if (locale === "ko") return ko;
  if (locale === "ru") return ru;
  if (locale === "uz") return uz;
  return en;
};
