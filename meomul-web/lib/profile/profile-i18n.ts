import type { SupportedLocale } from "@/lib/i18n/config";

export interface ProfileCopy {
  profile: string;
  overview: string;
  reviews: string;
  savedHotels: string;
  bookings: string;
  subscription: string;
  about: string;
  noBio: string;
  location: string;
  phone: string;
  joined: string;
  memberSince: string;
  editProfile: string;
  points: string;
  followers: string;
  following: string;
  profilePhoto: string;
  changePhoto: string;
  uploading: string;
  displayName: string;
  fullName: string;
  bio: string;
  cityDistrict: string;
  tellAboutYourself: string;
  cancel: string;
  saving: string;
  saveChanges: string;
  imageTypeError: string;
  imageSizeError: string;
  imageUploadFailed: string;
  displayNameError: string;
  profileUpdated: string;
  curatedStay: string;
  likes: string;
  saved: string;
  today: string;
  yesterday: string;
  daysAgo: string;
  removeFromSaved: string;
  removeSavedConfirmTitle: string;
  removeSavedConfirmText: string;
  removeSavedConfirmButton: string;
  removeSavedSuccess: string;
  noSavedHotels: string;
  saveHotelHint: string;
  browseHotels: string;
  noReviewsYet: string;
  reviewsAppearHint: string;
  reviewTooShort: string;
  reviewUpdated: string;
  close: string;
  editReview: string;
  overallRating: string;
  title: string;
  optional: string;
  summarizeStay: string;
  review: string;
  deleting: string;
  delete: string;
  edit: string;
  deleteReviewTitle: string;
  deleteReviewText: string;
  deleteReviewConfirm: string;
  reviewDeleted: string;
  hotelResponse: string;
  reviewPending: string;
  reviewRejected: string;
  loadMore: string;
  loading: string;
  cleanliness: string;
  service: string;
  value: string;
  amenities: string;
}

const en: ProfileCopy = {
  profile: "Profile",
  overview: "Overview",
  reviews: "Reviews",
  savedHotels: "Saved Hotels",
  bookings: "Bookings",
  subscription: "Subscription",
  about: "About",
  noBio: "No bio yet — edit your profile to share a bit about yourself.",
  location: "Location",
  phone: "Phone",
  joined: "Joined",
  memberSince: "Member since",
  editProfile: "Edit profile",
  points: "Points",
  followers: "Followers",
  following: "Following",
  profilePhoto: "Profile photo",
  changePhoto: "Change photo",
  uploading: "Uploading…",
  displayName: "Display name",
  fullName: "Full name",
  bio: "Bio",
  cityDistrict: "City, District…",
  tellAboutYourself: "Tell us a bit about yourself…",
  cancel: "Cancel",
  saving: "Saving…",
  saveChanges: "Save changes",
  imageTypeError: "Please select a JPEG, PNG, WebP, or GIF image.",
  imageSizeError: "Image must be smaller than {{size}} MB.",
  imageUploadFailed: "Image upload failed. Please try again.",
  displayNameError: "Display name must be at least 3 characters.",
  profileUpdated: "Profile updated.",
  curatedStay: "Curated stay",
  likes: "likes",
  saved: "Saved",
  today: "today",
  yesterday: "yesterday",
  daysAgo: "{{count}} days ago",
  removeFromSaved: "Remove from saved",
  removeSavedConfirmTitle: "Remove saved hotel?",
  removeSavedConfirmText: "This hotel will be removed from your saved list.",
  removeSavedConfirmButton: "Remove",
  removeSavedSuccess: "Hotel removed from saved.",
  noSavedHotels: "No saved hotels",
  saveHotelHint: "Tap the heart icon on any hotel to save it here.",
  browseHotels: "Browse hotels",
  noReviewsYet: "No reviews yet",
  reviewsAppearHint: "Reviews you write after a stay will appear here.",
  reviewTooShort: "Review must be at least 10 characters.",
  reviewUpdated: "Review updated.",
  close: "Close",
  editReview: "Edit review",
  overallRating: "Overall rating",
  title: "Title",
  optional: "optional",
  summarizeStay: "Summarize your stay...",
  review: "Review",
  deleting: "Deleting…",
  delete: "Delete",
  edit: "Edit",
  deleteReviewTitle: "Delete review?",
  deleteReviewText: "This action cannot be undone.",
  deleteReviewConfirm: "Yes, delete",
  reviewDeleted: "Review deleted.",
  hotelResponse: "Hotel response",
  reviewPending: "Pending",
  reviewRejected: "Rejected",
  loadMore: "Load more",
  loading: "Loading...",
  cleanliness: "Cleanliness",
  service: "Service",
  value: "Value",
  amenities: "Amenities",
};

const ko: ProfileCopy = {
  profile: "프로필",
  overview: "개요",
  reviews: "후기",
  savedHotels: "저장한 호텔",
  bookings: "예약",
  subscription: "구독",
  about: "소개",
  noBio: "아직 소개가 없습니다. 프로필을 수정해 자신을 소개해 보세요.",
  location: "위치",
  phone: "전화번호",
  joined: "가입일",
  memberSince: "가입",
  editProfile: "프로필 수정",
  points: "포인트",
  followers: "팔로워",
  following: "팔로잉",
  profilePhoto: "프로필 사진",
  changePhoto: "사진 변경",
  uploading: "업로드 중…",
  displayName: "표시 이름",
  fullName: "이름",
  bio: "소개",
  cityDistrict: "도시, 구/군…",
  tellAboutYourself: "자신을 간단히 소개해 주세요…",
  cancel: "취소",
  saving: "저장 중…",
  saveChanges: "변경 사항 저장",
  imageTypeError: "JPEG, PNG, WebP 또는 GIF 이미지를 선택해 주세요.",
  imageSizeError: "이미지는 {{size}}MB보다 작아야 합니다.",
  imageUploadFailed: "이미지 업로드에 실패했습니다. 다시 시도해 주세요.",
  displayNameError: "표시 이름은 최소 3자 이상이어야 합니다.",
  profileUpdated: "프로필이 수정되었습니다.",
  curatedStay: "엄선된 숙소",
  likes: "좋아요",
  saved: "저장",
  today: "오늘",
  yesterday: "어제",
  daysAgo: "{{count}}일 전",
  removeFromSaved: "저장에서 제거",
  removeSavedConfirmTitle: "저장한 호텔에서 제거할까요?",
  removeSavedConfirmText: "이 호텔이 저장 목록에서 제거됩니다.",
  removeSavedConfirmButton: "제거",
  removeSavedSuccess: "저장한 호텔에서 제거되었습니다.",
  noSavedHotels: "저장한 호텔이 없습니다",
  saveHotelHint: "호텔의 하트 아이콘을 눌러 이곳에 저장하세요.",
  browseHotels: "호텔 둘러보기",
  noReviewsYet: "아직 후기가 없습니다",
  reviewsAppearHint: "투숙 후 작성한 후기가 이곳에 표시됩니다.",
  reviewTooShort: "후기는 최소 10자 이상이어야 합니다.",
  reviewUpdated: "후기가 수정되었습니다.",
  close: "닫기",
  editReview: "후기 수정",
  overallRating: "종합 평점",
  title: "제목",
  optional: "선택",
  summarizeStay: "숙박 경험을 한 줄로 요약해 보세요...",
  review: "후기",
  deleting: "삭제 중…",
  delete: "삭제",
  edit: "수정",
  deleteReviewTitle: "후기를 삭제할까요?",
  deleteReviewText: "이 작업은 되돌릴 수 없습니다.",
  deleteReviewConfirm: "삭제",
  reviewDeleted: "후기가 삭제되었습니다.",
  hotelResponse: "호텔 답변",
  reviewPending: "검토 중",
  reviewRejected: "반려됨",
  loadMore: "더 보기",
  loading: "불러오는 중...",
  cleanliness: "청결",
  service: "서비스",
  value: "가성비",
  amenities: "편의시설",
};

const ru: ProfileCopy = {
  ...en,
  profile: "Профиль",
  overview: "Обзор",
  reviews: "Отзывы",
  savedHotels: "Сохраненные отели",
  bookings: "Бронирования",
  subscription: "Подписка",
  about: "О себе",
  noBio: "Пока нет описания — отредактируйте профиль и расскажите о себе.",
  location: "Местоположение",
  phone: "Телефон",
  joined: "Дата регистрации",
  memberSince: "С нами с",
  editProfile: "Редактировать профиль",
  points: "Баллы",
  followers: "Подписчики",
  following: "Подписки",
  profilePhoto: "Фото профиля",
  changePhoto: "Изменить фото",
  uploading: "Загрузка…",
  displayName: "Отображаемое имя",
  fullName: "Полное имя",
  bio: "Описание",
  cityDistrict: "Город, район…",
  tellAboutYourself: "Расскажите немного о себе…",
  cancel: "Отмена",
  saving: "Сохранение…",
  saveChanges: "Сохранить изменения",
  imageTypeError: "Выберите изображение JPEG, PNG, WebP или GIF.",
  imageSizeError: "Изображение должно быть меньше {{size}} МБ.",
  imageUploadFailed: "Не удалось загрузить изображение. Попробуйте еще раз.",
  displayNameError: "Отображаемое имя должно содержать не менее 3 символов.",
  profileUpdated: "Профиль обновлен.",
  likes: "лайков",
  saved: "Сохранено",
  today: "сегодня",
  yesterday: "вчера",
  daysAgo: "{{count}} дн. назад",
  removeFromSaved: "Убрать из сохраненного",
  removeSavedConfirmTitle: "Убрать отель из сохраненного?",
  removeSavedConfirmText: "Этот отель будет удален из вашего списка сохраненного.",
  removeSavedConfirmButton: "Убрать",
  removeSavedSuccess: "Отель удален из сохраненного.",
  noSavedHotels: "Нет сохраненных отелей",
  saveHotelHint: "Нажмите на значок сердца у любого отеля, чтобы сохранить его здесь.",
  browseHotels: "Смотреть отели",
  noReviewsYet: "Пока нет отзывов",
  reviewsAppearHint: "Отзывы после проживания будут показаны здесь.",
  reviewTooShort: "Отзыв должен содержать минимум 10 символов.",
  reviewUpdated: "Отзыв обновлен.",
  close: "Закрыть",
  editReview: "Редактировать отзыв",
  overallRating: "Общая оценка",
  title: "Заголовок",
  optional: "необязательно",
  summarizeStay: "Кратко опишите проживание...",
  review: "Отзыв",
  deleting: "Удаление…",
  delete: "Удалить",
  edit: "Изменить",
  deleteReviewTitle: "Удалить отзыв?",
  deleteReviewText: "Это действие нельзя отменить.",
  deleteReviewConfirm: "Да, удалить",
  reviewDeleted: "Отзыв удален.",
  hotelResponse: "Ответ отеля",
  reviewPending: "На рассмотрении",
  reviewRejected: "Отклонено",
  loadMore: "Показать еще",
  loading: "Загрузка...",
  cleanliness: "Чистота",
  service: "Сервис",
  value: "Цена/качество",
  amenities: "Удобства",
};

const uz: ProfileCopy = {
  ...en,
  profile: "Profil",
  overview: "Umumiy",
  reviews: "Sharhlar",
  savedHotels: "Saqlangan mehmonxonalar",
  bookings: "Bronlar",
  subscription: "Obuna",
  about: "Haqida",
  noBio: "Hali bio yo'q — profilingizni tahrirlab o'zingiz haqingizda yozing.",
  location: "Joylashuv",
  phone: "Telefon",
  joined: "Qo'shilgan sana",
  memberSince: "A'zo bo'lgan sana",
  editProfile: "Profilni tahrirlash",
  points: "Ballar",
  followers: "Obunachilar",
  following: "Obunalar",
  profilePhoto: "Profil rasmi",
  changePhoto: "Rasmni almashtirish",
  uploading: "Yuklanmoqda…",
  displayName: "Ko'rsatiladigan ism",
  fullName: "To'liq ism",
  bio: "Bio",
  cityDistrict: "Shahar, tuman…",
  tellAboutYourself: "O'zingiz haqingizda qisqacha yozing…",
  cancel: "Bekor qilish",
  saving: "Saqlanmoqda…",
  saveChanges: "O'zgarishlarni saqlash",
  imageTypeError: "JPEG, PNG, WebP yoki GIF rasm tanlang.",
  imageSizeError: "Rasm {{size}} MB dan kichik bo'lishi kerak.",
  imageUploadFailed: "Rasm yuklanmadi. Qayta urinib ko'ring.",
  displayNameError: "Ko'rsatiladigan ism kamida 3 ta belgidan iborat bo'lishi kerak.",
  profileUpdated: "Profil yangilandi.",
  likes: "ta yoqtirish",
  saved: "Saqlangan",
  today: "bugun",
  yesterday: "kecha",
  daysAgo: "{{count}} kun oldin",
  removeFromSaved: "Saqlangandan olib tashlash",
  removeSavedConfirmTitle: "Mehmonxonani saqlangandan olib tashlaysizmi?",
  removeSavedConfirmText: "Bu mehmonxona saqlanganlar ro'yxatidan olib tashlanadi.",
  removeSavedConfirmButton: "Olib tashlash",
  removeSavedSuccess: "Mehmonxona saqlangandan olib tashlandi.",
  noSavedHotels: "Saqlangan mehmonxonalar yo'q",
  saveHotelHint: "Istalgan mehmonxonadagi yurak belgisini bosib uni shu yerga saqlang.",
  browseHotels: "Mehmonxonalarni ko'rish",
  noReviewsYet: "Hali sharh yo'q",
  reviewsAppearHint: "Turar joydan keyin yozgan sharhlaringiz shu yerda ko'rinadi.",
  reviewTooShort: "Sharh kamida 10 ta belgidan iborat bo'lishi kerak.",
  reviewUpdated: "Sharh yangilandi.",
  close: "Yopish",
  editReview: "Sharhni tahrirlash",
  overallRating: "Umumiy baho",
  title: "Sarlavha",
  optional: "ixtiyoriy",
  summarizeStay: "Turar joyingizni qisqacha yozing...",
  review: "Sharh",
  deleting: "O'chirilmoqda…",
  delete: "O'chirish",
  edit: "Tahrirlash",
  deleteReviewTitle: "Sharh o'chirilsinmi?",
  deleteReviewText: "Bu amalni ortga qaytarib bo'lmaydi.",
  deleteReviewConfirm: "Ha, o'chirish",
  reviewDeleted: "Sharh o'chirildi.",
  hotelResponse: "Mehmonxona javobi",
  reviewPending: "Ko'rib chiqilmoqda",
  reviewRejected: "Rad etilgan",
  loadMore: "Yana ko'rsatish",
  loading: "Yuklanmoqda...",
  cleanliness: "Tozalik",
  service: "Xizmat",
  value: "Qiymat",
  amenities: "Qulayliklar",
};

export const getProfileCopy = (locale: SupportedLocale): ProfileCopy =>
  ({ en, ko, ru, uz })[locale];

export const formatProfileDate = (
  locale: SupportedLocale,
  value: string,
  variant: "long" | "monthYear" | "short" = "long",
): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  if (variant === "monthYear") {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      year: "numeric",
    }).format(date);
  }

  if (variant === "short") {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatProfileTimeAgo = (
  locale: SupportedLocale,
  value: string,
): string => {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  const copy = getProfileCopy(locale);

  if (days <= 0) return copy.today;
  if (days === 1) return copy.yesterday;
  if (days < 7) return copy.daysAgo.replace("{{count}}", String(days));
  return formatProfileDate(locale, value, "short");
};
