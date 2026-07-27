import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";
import { ImageCollectionField } from "@/components/uploads/image-collection-field";
import { VideoCollectionField } from "@/components/uploads/video-collection-field";
import { CREATE_HOTEL_MUTATION } from "@/graphql/hotel.gql";
import { useI18n } from "@/lib/i18n/provider";
import {
  getHotelAmenityLabel,
  getHotelLocationLabelLocalized,
  getStayPurposeLabel,
  getHotelTypeLabel,
} from "@/lib/hotels/hotels-i18n";
import { getErrorMessage } from "@/lib/utils/error";
import { confirmAction, errorAlert, successAlert } from "@/lib/ui/alerts";
import type {
  AmenitiesInput,
  CancellationPolicy,
  CreateHotelMutationData,
  CreateHotelMutationVars,
  HotelLocation,
  SafetyFeaturesInput,
  StayPurpose,
  HotelType,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const HOTEL_TYPES: HotelType[] = [
  "HOTEL",
  "MOTEL",
  "RESORT",
  "GUESTHOUSE",
  "HANOK",
  "PENSION",
];

const LOCATIONS: HotelLocation[] = [
  "SEOUL",
  "BUSAN",
  "INCHEON",
  "DAEGU",
  "DAEJON",
  "GWANGJU",
  "JEJU",
  "GYEONGJU",
  "GANGNEUNG",
];

const DEFAULT_LOCATION_COORDINATES: Record<HotelLocation, { lat: number; lng: number }> = {
  SEOUL: { lat: 37.5665, lng: 126.978 },
  BUSAN: { lat: 35.1796, lng: 129.0756 },
  INCHEON: { lat: 37.4563, lng: 126.7052 },
  DAEGU: { lat: 35.8714, lng: 128.6014 },
  DAEJON: { lat: 36.3504, lng: 127.3845 },
  GWANGJU: { lat: 35.1595, lng: 126.8526 },
  JEJU: { lat: 33.4996, lng: 126.5312 },
  GYEONGJU: { lat: 35.8562, lng: 129.2247 },
  GANGNEUNG: { lat: 37.7519, lng: 128.8761 },
};

const CANCELLATION_OPTIONS: Array<{
  value: CancellationPolicy;
  label: string;
  desc: string;
}> = [
  {
    value: "FLEXIBLE",
    label: "Flexible",
    desc: "Free cancellation up to 24h before check-in",
  },
  {
    value: "MODERATE",
    label: "Moderate",
    desc: "Free cancellation up to 5 days before check-in",
  },
  {
    value: "STRICT",
    label: "Strict",
    desc: "50% refund up to 7 days before check-in",
  },
];

const AMENITY_OPTIONS: Array<{ key: keyof AmenitiesInput; label: string }> = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "parking", label: "Parking" },
  { key: "breakfast", label: "Breakfast" },
  { key: "breakfastIncluded", label: "Breakfast Included" },
  { key: "gym", label: "Gym" },
  { key: "pool", label: "Pool" },
  { key: "spa", label: "Spa" },
  { key: "restaurant", label: "Restaurant" },
  { key: "roomService", label: "Room Service" },
  { key: "workspace", label: "Business Center" },
  { key: "meetingRoom", label: "Meeting Room" },
  { key: "familyRoom", label: "Family Room" },
  { key: "kidsFriendly", label: "Kids Friendly" },
  { key: "playground", label: "Playground" },
  { key: "elevator", label: "Elevator" },
  { key: "airportShuttle", label: "Airport Shuttle" },
  { key: "evCharging", label: "EV Charging" },
  { key: "wheelchairAccessible", label: "Wheelchair Accessible" },
  { key: "coupleRoom", label: "Couple Room" },
  { key: "romanticView", label: "Romantic View" },
  { key: "privateBath", label: "Private Bathroom" },
];

const SAFETY_OPTIONS: Array<{ key: keyof SafetyFeaturesInput; label: string }> =
  [
    { key: "fireSafety", label: "Fire Safety Equipment" },
    { key: "securityCameras", label: "Security Cameras" },
    { key: "frontDesk24h", label: "24h Front Desk" },
    { key: "roomSafe", label: "In-Room Safe" },
    { key: "femaleOnlyFloors", label: "Female-Only Floors" },
    { key: "wellLitParking", label: "Well-Lit Parking" },
  ];

const SUITABLE_FOR_OPTIONS: StayPurpose[] = [
  "BUSINESS",
  "ROMANTIC",
  "FAMILY",
  "SOLO",
  "STAYCATION",
  "EVENT",
  "MEDICAL",
  "LONG_TERM",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const CreateHotelPage: NextPageWithAuth = () => {
  const { locale, t } = useI18n();
  const copy =
    locale === "ko"
      ? {
          myHotels: "내 호텔",
          propertyRegistration: "숙소 등록",
          registerHotelTitle: "호텔 등록",
          hotelNameRequired: "호텔 이름은 필수입니다.",
          addressRequired: "주소는 필수입니다.",
          gpsRequired: "올바른 GPS 좌표(위도/경도)가 필요합니다.",
          registeredSuccess: "호텔이 등록되었습니다. 관리자 검토 후 공개됩니다.",
          hotelRegistered: "호텔 등록 완료",
          underReview:
            "현재 호텔은 관리자 검토 중입니다. 승인되면 공개되며, 그 전까지는 객실을 추가할 수 있습니다.",
          addRooms: "객실 추가",
          basicInformation: "기본 정보",
          policies: "정책",
          amenities: "편의시설",
          locationDetails: "세부 위치",
          suitableFor: "적합한 여행 목적",
          safetyFeatures: "안전 기능",
          hotelName: "호텔 이름",
          type: "유형",
          city: "도시",
          address: "주소",
          district: "구/군",
          dong: "동/읍/면",
          nearestSubway: "가까운 지하철역",
          subwayExit: "지하철 출구",
          subwayLines: "지하철 노선",
          walkingDistance: "도보 거리(분)",
          latitude: "위도",
          longitude: "경도",
          coordinatesHelp:
            "좌표는 maps.google.com에서 위치를 우클릭해 확인할 수 있습니다.",
          description: "설명",
          optional: "선택",
          descriptionPlaceholder:
            "숙소 특징, 주변 명소, 차별점 등을 설명해 주세요…",
          starRating: "성급",
          checkInTime: "체크인 시간",
          checkOutTime: "체크아웃 시간",
          imageUrls: "호텔 이미지",
          onePerLineOptional: "대표 이미지와 갤러리를 업로드해 주세요",
          hotelVideos: "호텔 영상",
          hotelVideosHelp: "대표 영상을 업로드하거나 YouTube 링크를 추가해 분위기와 공간감을 보여주세요",
          nextPolicies: "다음: 정책 →",
          cancellationPolicy: "취소 정책",
          guestPolicies: "투숙 정책",
          ageRestriction: "최소 체크인 연령",
          petsAllowed: "반려동물 허용",
          maxPetWeight: "최대 반려동물 무게(kg)",
          smokingAllowed: "흡연 허용",
          wifiSpeed: "와이파이 속도(Mbps)",
          parkingFee: "주차 요금 (₩)",
          flexibleTimingOptions: "유연 시간 옵션",
          flexibleCheckIn: "유연 체크인",
          flexibleCheckOut: "유연 체크아웃",
          allowEarlyCheckIn: "얼리 체크인 요청 허용",
          allowLateCheckOut: "레이트 체크아웃 요청 허용",
          surcharge: "추가 요금 (₩)",
          back: "← 뒤로",
          nextAmenities: "다음: 편의시설 →",
          registering: "등록 중…",
          registerHotel: "호텔 등록",
          fullStreetAddress: "전체 주소",
          hotelNamePlaceholder: "예: 그랜드 서울 호텔",
          findCoordinatesAt: "maps.google.com에서 좌표 찾기",
          rightClickLocation: "위치를 우클릭해 확인",
          starLabel: "성",
          noSmoking: "금연",
          allowSmoking: "흡연 허용",
          noPets: "반려동물 불가",
          allowPets: "반려동물 허용",
        }
      : locale === "ru"
        ? {
            myHotels: "Мои отели",
            propertyRegistration: "Регистрация объекта",
            registerHotelTitle: "Добавить отель",
            hotelNameRequired: "Название отеля обязательно.",
            addressRequired: "Адрес обязателен.",
            gpsRequired:
              "Нужны корректные GPS-координаты (широта и долгота).",
            registeredSuccess:
              "Отель зарегистрирован. После проверки администратором он станет публичным.",
            hotelRegistered: "Отель зарегистрирован",
            underReview:
              "Сейчас отель находится на проверке администратора. После одобрения он станет доступен, а пока вы можете добавить номера.",
            addRooms: "Добавить номера",
            basicInformation: "Основная информация",
            policies: "Политики",
            amenities: "Удобства",
            locationDetails: "Локация",
            suitableFor: "Подходит для",
            safetyFeatures: "Безопасность",
            hotelName: "Название отеля",
            type: "Тип",
            city: "Город",
            address: "Адрес",
            district: "Район",
            dong: "Квартал / район",
            nearestSubway: "Ближайшее метро",
            subwayExit: "Выход метро",
            subwayLines: "Линии метро",
            walkingDistance: "Пешком (мин)",
            latitude: "Широта",
            longitude: "Долгота",
            coordinatesHelp:
              "Координаты можно найти на maps.google.com, нажав правой кнопкой по месту.",
            description: "Описание",
            optional: "необязательно",
            descriptionPlaceholder:
              "Опишите объект, его особенности и достопримечательности рядом…",
            starRating: "Звездность",
            checkInTime: "Время заезда",
            checkOutTime: "Время выезда",
            imageUrls: "Изображения отеля",
            onePerLineOptional: "Загрузите обложку и галерею отеля",
            hotelVideos: "Видео отеля",
            hotelVideosHelp: "Загрузите ключевые видео или добавьте ссылку YouTube, чтобы показать атмосферу и пространство",
            nextPolicies: "Далее: политики →",
            cancellationPolicy: "Политика отмены",
            guestPolicies: "Правила проживания",
            ageRestriction: "Мин. возраст для заезда",
            petsAllowed: "Можно с животными",
            maxPetWeight: "Макс. вес питомца (кг)",
            smokingAllowed: "Разрешено курение",
            wifiSpeed: "Скорость Wi‑Fi (Mbps)",
            parkingFee: "Плата за парковку (₩)",
            flexibleTimingOptions: "Гибкие временные опции",
            flexibleCheckIn: "Гибкий заезд",
            flexibleCheckOut: "Гибкий выезд",
            allowEarlyCheckIn: "Разрешить ранний заезд",
            allowLateCheckOut: "Разрешить поздний выезд",
            surcharge: "Доплата (₩)",
            back: "← Назад",
            nextAmenities: "Далее: удобства →",
            registering: "Регистрация…",
            registerHotel: "Зарегистрировать отель",
            fullStreetAddress: "Полный адрес",
            hotelNamePlaceholder: "напр. Grand Seoul Hotel",
            findCoordinatesAt: "Найти координаты на maps.google.com",
            rightClickLocation: "нажмите правой кнопкой по месту",
            starLabel: "звезды",
            noSmoking: "Не курить",
            allowSmoking: "Курение разрешено",
            noPets: "Без животных",
            allowPets: "Можно с животными",
          }
        : locale === "uz"
          ? {
              myHotels: "Mening mehmonxonalarim",
              propertyRegistration: "Obyekt ro'yxatdan o'tkazish",
              registerHotelTitle: "Mehmonxona qo'shish",
              hotelNameRequired: "Mehmonxona nomi majburiy.",
              addressRequired: "Manzil majburiy.",
              gpsRequired: "To'g'ri GPS koordinatalari (lat/lng) kerak.",
              registeredSuccess:
                "Mehmonxona ro'yxatdan o'tdi. Admin tekshiruvdan so'ng ommaga chiqadi.",
              hotelRegistered: "Mehmonxona ro'yxatdan o'tdi",
              underReview:
                "Mehmonxona admin tekshiruvida. Tasdiqlanguncha xonalarni qo'shishingiz mumkin.",
              addRooms: "Xonalar qo'shish",
              basicInformation: "Asosiy ma'lumotlar",
              policies: "Qoidalar",
              amenities: "Qulayliklar",
              locationDetails: "Joylashuv tafsilotlari",
              suitableFor: "Mos keladi",
              safetyFeatures: "Xavfsizlik",
              hotelName: "Mehmonxona nomi",
              type: "Turi",
              city: "Shahar",
              address: "Manzil",
              district: "Tuman",
              dong: "Mahalla / dong",
              nearestSubway: "Eng yaqin metro",
              subwayExit: "Metro chiqishi",
              subwayLines: "Metro yo'nalishlari",
              walkingDistance: "Piyoda masofa (daq)",
              latitude: "Kenglik",
              longitude: "Uzunlik",
              coordinatesHelp:
                "Koordinatalarni maps.google.com saytida joyni o'ng bosib topish mumkin.",
              description: "Tavsif",
              optional: "ixtiyoriy",
              descriptionPlaceholder:
                "Obyekt, o'ziga xos tomonlari va yaqin joylar haqida yozing…",
              starRating: "Yulduz darajasi",
              checkInTime: "Check-in vaqti",
              checkOutTime: "Check-out vaqti",
              imageUrls: "Mehmonxona rasmlari",
              onePerLineOptional: "Muqova va galereya rasmlarini yuklang",
              hotelVideos: "Mehmonxona videolari",
              hotelVideosHelp: "Muhit va maydonni ko'rsatish uchun asosiy videolarni yuklang yoki YouTube havolasini qo'shing",
              nextPolicies: "Keyingi: qoidalar →",
              cancellationPolicy: "Bekor qilish siyosati",
              guestPolicies: "Turar joy qoidalari",
              ageRestriction: "Minimal check-in yoshi",
              petsAllowed: "Uy hayvonlari mumkin",
              maxPetWeight: "Hayvon vazni limiti (kg)",
              smokingAllowed: "Chekish mumkin",
              wifiSpeed: "Wi‑Fi tezligi (Mbps)",
              parkingFee: "Avtoturargoh narxi (₩)",
              flexibleTimingOptions: "Moslashuvchan vaqt variantlari",
              flexibleCheckIn: "Moslashuvchan check-in",
              flexibleCheckOut: "Moslashuvchan check-out",
              allowEarlyCheckIn: "Erta check-in so'roviga ruxsat",
              allowLateCheckOut: "Kech check-out so'roviga ruxsat",
              surcharge: "Qo'shimcha to'lov (₩)",
              back: "← Orqaga",
              nextAmenities: "Keyingi: qulayliklar →",
              registering: "Ro'yxatdan o'tkazilmoqda…",
              registerHotel: "Mehmonxonani qo'shish",
              fullStreetAddress: "To'liq manzil",
              hotelNamePlaceholder: "masalan, Grand Seoul Hotel",
              findCoordinatesAt: "Koordinatalarni maps.google.com da toping",
              rightClickLocation: "joyni o'ng tugma bilan bosing",
              starLabel: "yulduz",
              noSmoking: "Chekish yo'q",
              allowSmoking: "Chekish mumkin",
              noPets: "Uy hayvonlari yo'q",
              allowPets: "Uy hayvonlari mumkin",
            }
          : {
              myHotels: "My Hotels",
              propertyRegistration: "Property Registration",
              registerHotelTitle: "Register a Hotel",
              hotelNameRequired: "Hotel name is required.",
              addressRequired: "Address is required.",
              gpsRequired: "Valid GPS coordinates (Lat and Lng) are required.",
              registeredSuccess:
                "Hotel registered! It will be reviewed by an admin before going live.",
              hotelRegistered: "Hotel Registered",
              underReview:
                "Your hotel is currently under admin review. It will go live once approved. In the meantime, you can add rooms.",
              addRooms: "Add Rooms",
              basicInformation: "Basic Information",
              policies: "Policies",
              amenities: "Amenities",
              locationDetails: "Location Details",
              suitableFor: "Suitable For",
              safetyFeatures: "Safety Features",
              hotelName: "Hotel Name",
              type: "Type",
              city: "City",
              address: "Address",
              district: "District",
              dong: "Dong / Neighborhood",
              nearestSubway: "Nearest Subway",
              subwayExit: "Subway Exit",
              subwayLines: "Subway Lines",
              walkingDistance: "Walking Distance (min)",
              latitude: "Latitude",
              longitude: "Longitude",
              coordinatesHelp:
                "Find coordinates at maps.google.com and right-click your location.",
              description: "Description",
              optional: "optional",
              descriptionPlaceholder:
                "Describe your property, unique features, nearby attractions…",
              starRating: "Star Rating",
              checkInTime: "Check-in Time",
              checkOutTime: "Check-out Time",
              imageUrls: "Hotel Images",
              onePerLineOptional: "Upload your cover image and gallery",
              hotelVideos: "Hotel Videos",
              hotelVideosHelp: "Upload key videos or add a YouTube link to show the atmosphere and space",
              nextPolicies: "Next: Policies →",
              cancellationPolicy: "Cancellation Policy",
              guestPolicies: "Guest Policies",
              ageRestriction: "Minimum Check-In Age",
              petsAllowed: "Pets Allowed",
              maxPetWeight: "Max Pet Weight (kg)",
              smokingAllowed: "Smoking Allowed",
              wifiSpeed: "Wi-Fi Speed (Mbps)",
              parkingFee: "Parking Fee (₩)",
              flexibleTimingOptions: "Flexible Timing Options",
              flexibleCheckIn: "Flexible Check-In",
              flexibleCheckOut: "Flexible Check-Out",
              allowEarlyCheckIn: "Allow guests to request early check-in",
              allowLateCheckOut: "Allow guests to request late check-out",
              surcharge: "Surcharge (₩)",
              back: "← Back",
              nextAmenities: "Next: Amenities →",
              registering: "Registering…",
              registerHotel: "Register Hotel",
              fullStreetAddress: "Full street address",
              hotelNamePlaceholder: "e.g. Grand Seoul Hotel",
              findCoordinatesAt: "Find coordinates at maps.google.com",
              rightClickLocation: "right-click your location",
              starLabel: "Star",
              noSmoking: "No smoking",
              allowSmoking: "Smoking allowed",
              noPets: "No pets",
              allowPets: "Pets allowed",
            };

  const cancellationOptions =
    locale === "ko"
      ? [
          {
            value: "FLEXIBLE" as const,
            label: "유연함",
            desc: "체크인 24시간 전까지 무료 취소",
          },
          {
            value: "MODERATE" as const,
            label: "보통",
            desc: "체크인 5일 전까지 무료 취소",
          },
          {
            value: "STRICT" as const,
            label: "엄격",
            desc: "체크인 7일 전까지 50% 환불",
          },
        ]
      : locale === "ru"
        ? [
            {
              value: "FLEXIBLE" as const,
              label: "Гибкая",
              desc: "Бесплатная отмена за 24 часа до заезда",
            },
            {
              value: "MODERATE" as const,
              label: "Умеренная",
              desc: "Бесплатная отмена за 5 дней до заезда",
            },
            {
              value: "STRICT" as const,
              label: "Строгая",
              desc: "50% возврат за 7 дней до заезда",
            },
          ]
        : locale === "uz"
          ? [
              {
                value: "FLEXIBLE" as const,
                label: "Moslashuvchan",
                desc: "Check-indan 24 soat oldin bepul bekor qilish",
              },
              {
                value: "MODERATE" as const,
                label: "O'rtacha",
                desc: "Check-indan 5 kun oldin bepul bekor qilish",
              },
              {
                value: "STRICT" as const,
                label: "Qattiq",
                desc: "Check-indan 7 kun oldin 50% qaytariladi",
              },
            ]
          : CANCELLATION_OPTIONS;

  // Basic info
  const [hotelTitle, setHotelTitle] = useState("");
  const [hotelType, setHotelType] = useState<HotelType>("HOTEL");
  const [hotelLocation, setHotelLocation] = useState<HotelLocation>("SEOUL");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [dong, setDong] = useState("");
  const [nearestSubway, setNearestSubway] = useState("");
  const [subwayExit, setSubwayExit] = useState("");
  const [subwayLines, setSubwayLines] = useState("");
  const [walkingDistance, setWalkingDistance] = useState("");
  const [hotelDesc, setHotelDesc] = useState("");
  const [starRating, setStarRating] = useState(3);
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [hotelImages, setHotelImages] = useState<string[]>([]);
  const [hotelVideos, setHotelVideos] = useState<string[]>([]);
  const [suitableFor, setSuitableFor] = useState<StayPurpose[]>([]);

  // Policies
  const [cancellationPolicy, setCancellationPolicy] =
    useState<CancellationPolicy>("MODERATE");
  const [ageRestriction, setAgeRestriction] = useState("19");
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [maxPetWeight, setMaxPetWeight] = useState("");
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [flexCheckInEnabled, setFlexCheckInEnabled] = useState(false);
  const [flexCheckInTimes, setFlexCheckInTimes] = useState("");
  const [flexCheckInFee, setFlexCheckInFee] = useState("");
  const [flexCheckOutEnabled, setFlexCheckOutEnabled] = useState(false);
  const [flexCheckOutTimes, setFlexCheckOutTimes] = useState("");
  const [flexCheckOutFee, setFlexCheckOutFee] = useState("");

  // Amenities
  const [amenities, setAmenities] = useState<AmenitiesInput>({});
  const [safetyFeatures, setSafetyFeatures] = useState<SafetyFeaturesInput>({});

  // UI
  const [openSection, setOpenSection] = useState<1 | 2 | 3>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; title: string } | null>(
    null,
  );

  const [createHotel, { loading }] = useMutation<
    CreateHotelMutationData,
    CreateHotelMutationVars
  >(CREATE_HOTEL_MUTATION, {
    refetchQueries: ["getHotels"],
  });

  const toggleAmenity = (key: keyof AmenitiesInput) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSuitableFor = (value: StayPurpose) => {
    setSuitableFor((prev) =>
      prev.includes(value)
        ? prev.filter((entry) => entry !== value)
        : [...prev, value],
    );
  };

  const toggleSafetyFeature = (key: keyof SafetyFeaturesInput) => {
    setSafetyFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!hotelTitle.trim()) {
      setFormError(copy.hotelNameRequired);
      return;
    }
    if (!address.trim()) {
      setFormError(copy.addressRequired);
      return;
    }
    const coordinates = DEFAULT_LOCATION_COORDINATES[hotelLocation];

    const imageUrls = hotelImages.filter(Boolean);
    const videoUrls = hotelVideos.filter(Boolean);
    const parsedWalkingDistance = walkingDistance
      ? Number(walkingDistance)
      : undefined;
    const parsedAgeRestriction = Number(ageRestriction);
    const parsedMaxPetWeight = maxPetWeight ? Number(maxPetWeight) : undefined;
    const parsedWifiSpeed = amenities.wifi && amenities.wifiSpeed
      ? Number(amenities.wifiSpeed)
      : undefined;
    const parsedParkingFee = amenities.parking && amenities.parkingFee != null
      ? Number(amenities.parkingFee)
      : undefined;
    const parsedSubwayLines = subwayLines
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));
    const buildFlexibleTiming = (
      enabled: boolean,
      timesValue: string,
      feeValue: string,
    ) =>
      enabled
        ? {
            enabled: true,
            times: timesValue
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            fee: feeValue ? Number(feeValue) : 0,
          }
        : undefined;
    const normalizedAmenities: AmenitiesInput | undefined =
      Object.keys(amenities).length > 0
        ? {
            ...amenities,
            wifiSpeed: parsedWifiSpeed,
            parkingFee: parsedParkingFee ?? 0,
          }
        : undefined;
    const normalizedSafetyFeatures =
      Object.keys(safetyFeatures).length > 0 ? safetyFeatures : undefined;

    try {
      const result = await createHotel({
        variables: {
          input: {
            hotelType,
            hotelTitle: hotelTitle.trim(),
            hotelLocation,
            detailedLocation: {
              city: hotelLocation,
              address: address.trim(),
              coordinates,
              district: district.trim() || undefined,
              dong: dong.trim() || undefined,
              nearestSubway: nearestSubway.trim() || undefined,
              subwayExit: subwayExit.trim() || undefined,
              subwayLines:
                parsedSubwayLines.length > 0 ? parsedSubwayLines : undefined,
              walkingDistance:
                parsedWalkingDistance && Number.isFinite(parsedWalkingDistance)
                  ? parsedWalkingDistance
                  : undefined,
            },
            hotelDesc: hotelDesc.trim() || undefined,
            starRating,
            checkInTime,
            checkOutTime,
            flexibleCheckIn: buildFlexibleTiming(
              flexCheckInEnabled,
              flexCheckInTimes,
              flexCheckInFee,
            ),
            flexibleCheckOut: buildFlexibleTiming(
              flexCheckOutEnabled,
              flexCheckOutTimes,
              flexCheckOutFee,
            ),
            cancellationPolicy,
            ageRestriction: Number.isFinite(parsedAgeRestriction)
              ? parsedAgeRestriction
              : undefined,
            petsAllowed,
            maxPetWeight:
              petsAllowed && parsedMaxPetWeight && Number.isFinite(parsedMaxPetWeight)
                ? parsedMaxPetWeight
                : undefined,
            smokingAllowed,
            amenities: normalizedAmenities,
            safetyFeatures: normalizedSafetyFeatures,
            suitableFor,
            hotelImages: imageUrls.length > 0 ? imageUrls : undefined,
            hotelVideos: videoUrls.length > 0 ? videoUrls : undefined,
          },
        },
      });

      const hotel = result.data?.createHotel;
      if (hotel) {
        setCreated({ id: hotel._id, title: hotel.hotelTitle });
        await successAlert("Hotel submitted for review", copy.registeredSuccess, {
          variant: "hotel",
        });
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      await errorAlert("We couldn’t submit this hotel", message, {
        variant: "hotel",
      });
    }
  };

  // ── Success screen ──
  if (created) {
    return (
      <>
        <style>{`
          @keyframes hotelConfirm {
            0%   { transform: scale(0.8); opacity: 0; }
            60%  { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
          }
          .anim-confirm { animation: hotelConfirm 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
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
          <div className="anim-cfade space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              {copy.hotelRegistered}
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {created.title}
            </h1>
          </div>
          <div className="anim-cfade rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            {copy.underReview}
          </div>
          <div className="anim-cfade flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/hotels/${created.id}/rooms`}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {copy.addRooms} →
            </Link>
            <Link
              href="/hotels/manage"
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              {copy.myHotels}
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ── Section header ──
  const SectionHeader = ({
    num,
    label,
    isOpen,
  }: {
    num: 1 | 2 | 3;
    label: string;
    isOpen: boolean;
  }) => (
    <button
      type="button"
      onClick={() => setOpenSection(num)}
      className="flex w-full items-center justify-between px-5 py-4 text-left"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isOpen ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {num}
        </div>
        <span
          className={`font-semibold ${isOpen ? "text-slate-900" : "text-slate-500"}`}
        >
          {label}
        </span>
      </div>
      <ChevronDown
        size={16}
        className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );

  return (
    <>
      <style>{`
        @keyframes sectionOpen {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-body { animation: sectionOpen 0.18s ease-out; }
      `}</style>

      <main className="space-y-6">
        {/* Back + header */}
        <Link
          href="/hotels/manage"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={14} />
          {copy.myHotels}
        </Link>

        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {copy.propertyRegistration}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {copy.registerHotelTitle}
          </h1>
        </header>

        {formError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {formError}
          </div>
        )}

        <div className="w-full space-y-3">
          {/* ── Section 1: Basic Info ── */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              num={1}
              label={copy.basicInformation}
              isOpen={openSection === 1}
            />
            {openSection === 1 && (
              <div className="section-body space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.hotelName} <span className="text-rose-500">*</span>
                  </span>
                  <input
                    value={hotelTitle}
                    onChange={(e) => setHotelTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder={copy.hotelNamePlaceholder}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {copy.type}
                    </span>
                    <select
                      value={hotelType}
                      onChange={(e) =>
                        setHotelType(e.target.value as HotelType)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      {HOTEL_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {getHotelTypeLabel(type, t)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {copy.city}
                    </span>
                    <select
                      value={hotelLocation}
                      onChange={(e) =>
                        setHotelLocation(e.target.value as HotelLocation)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      {LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {getHotelLocationLabelLocalized(location, t)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.address} <span className="text-rose-500">*</span>
                  </span>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder={copy.fullStreetAddress}
                  />
                </label>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.locationDetails}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {copy.district}
                      </span>
                      <input
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {copy.dong}
                      </span>
                      <input
                        value={dong}
                        onChange={(e) => setDong(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {copy.nearestSubway}
                      </span>
                      <input
                        value={nearestSubway}
                        onChange={(e) => setNearestSubway(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {copy.subwayExit}
                      </span>
                      <input
                        value={subwayExit}
                        onChange={(e) => setSubwayExit(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {copy.subwayLines}
                      </span>
                      <input
                        value={subwayLines}
                        onChange={(e) => setSubwayLines(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="2, 9"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {copy.walkingDistance}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={walkingDistance}
                        onChange={(e) => setWalkingDistance(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.description}{" "}
                    <span className="font-normal normal-case text-slate-400">
                      ({copy.optional})
                    </span>
                  </span>
                  <textarea
                    value={hotelDesc}
                    onChange={(e) => setHotelDesc(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder={copy.descriptionPlaceholder}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {copy.starRating}
                    </span>
                    <select
                      value={starRating}
                      onChange={(e) => setStarRating(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {"★".repeat(n)} {n} {copy.starLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {copy.checkInTime}
                    </span>
                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {copy.checkOutTime}
                    </span>
                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                </div>

                <ImageCollectionField
                  target="hotel"
                  value={hotelImages}
                  onChange={setHotelImages}
                  maxFiles={12}
                  layout="compact"
                  title={copy.imageUrls}
                  description={copy.onePerLineOptional}
                />
                <VideoCollectionField
                  value={hotelVideos}
                  onChange={setHotelVideos}
                  maxFiles={4}
                  title={copy.hotelVideos}
                  description={copy.hotelVideosHelp}
                />

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.suitableFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {SUITABLE_FOR_OPTIONS.map((value) => {
                      const active = suitableFor.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleSuitableFor(value)}
                          className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                            active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {getStayPurposeLabel(value, t)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpenSection(2)}
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    {copy.nextPolicies}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 2: Policies ── */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              num={2}
              label={copy.policies}
              isOpen={openSection === 2}
            />
            {openSection === 2 && (
              <div className="section-body space-y-5 border-t border-slate-100 px-5 pb-5 pt-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.cancellationPolicy}
                  </p>
                  <div className="space-y-2">
                    {cancellationOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCancellationPolicy(opt.value)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          cancellationPolicy === opt.value
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                            cancellationPolicy === opt.value
                              ? "border-slate-900 bg-slate-900"
                              : "border-slate-300"
                          }`}
                        >
                          {cancellationPolicy === opt.value && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {opt.label}
                          </p>
                          <p className="text-xs text-slate-500">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.guestPolicies}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {copy.ageRestriction}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={ageRestriction}
                        onChange={(e) => setAgeRestriction(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {copy.maxPetWeight}{" "}
                        <span className="font-normal normal-case text-slate-400">
                          ({copy.optional})
                        </span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={maxPetWeight}
                        onChange={(e) => setMaxPetWeight(e.target.value)}
                        disabled={!petsAllowed}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPetsAllowed((v) => !v)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
                      petsAllowed
                        ? "border-sky-300 bg-sky-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-800">
                      {petsAllowed ? copy.allowPets : copy.noPets}
                    </span>
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                        petsAllowed
                          ? "border-sky-500 bg-sky-500"
                          : "border-slate-300"
                      }`}
                    >
                      {petsAllowed && (
                        <Check
                          size={11}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSmokingAllowed((v) => !v)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
                      smokingAllowed
                        ? "border-sky-300 bg-sky-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-800">
                      {smokingAllowed ? copy.allowSmoking : copy.noSmoking}
                    </span>
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                        smokingAllowed
                          ? "border-sky-500 bg-sky-500"
                          : "border-slate-300"
                      }`}
                    >
                      {smokingAllowed && (
                        <Check
                          size={11}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </button>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.flexibleTimingOptions}
                  </p>

                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                    <button
                      type="button"
                      onClick={() => setFlexCheckInEnabled((v) => !v)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {copy.flexibleCheckIn}
                        </p>
                        <p className="text-xs text-slate-500">
                          {copy.allowEarlyCheckIn}
                        </p>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          flexCheckInEnabled
                            ? "border-sky-500 bg-sky-500"
                            : "border-slate-300"
                        }`}
                      >
                        {flexCheckInEnabled ? (
                          <Check size={11} className="text-white" strokeWidth={3} />
                        ) : null}
                      </div>
                    </button>
                    {flexCheckInEnabled ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {copy.checkInTime}
                          </span>
                          <input
                            value={flexCheckInTimes}
                            onChange={(e) => setFlexCheckInTimes(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            placeholder="13:00, 14:00"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {copy.surcharge}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={flexCheckInFee}
                            onChange={(e) => setFlexCheckInFee(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                    <button
                      type="button"
                      onClick={() => setFlexCheckOutEnabled((v) => !v)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {copy.flexibleCheckOut}
                        </p>
                        <p className="text-xs text-slate-500">
                          {copy.allowLateCheckOut}
                        </p>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          flexCheckOutEnabled
                            ? "border-sky-500 bg-sky-500"
                            : "border-slate-300"
                        }`}
                      >
                        {flexCheckOutEnabled ? (
                          <Check size={11} className="text-white" strokeWidth={3} />
                        ) : null}
                      </div>
                    </button>
                    {flexCheckOutEnabled ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {copy.checkOutTime}
                          </span>
                          <input
                            value={flexCheckOutTimes}
                            onChange={(e) => setFlexCheckOutTimes(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            placeholder="12:00, 13:00"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {copy.surcharge}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={flexCheckOutFee}
                            onChange={(e) => setFlexCheckOutFee(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setOpenSection(1)}
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    {copy.back}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenSection(3)}
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    {copy.nextAmenities}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 3: Amenities ── */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              num={3}
              label={copy.amenities}
              isOpen={openSection === 3}
            />
            {openSection === 3 && (
              <div className="section-body space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AMENITY_OPTIONS.map((opt) => {
                    const active = Boolean(amenities[opt.key]);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleAmenity(opt.key)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                          active
                            ? "border-sky-400 bg-sky-50 text-sky-800"
                            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                            active
                              ? "border-sky-500 bg-sky-500"
                              : "border-slate-300"
                          }`}
                        >
                          {active && (
                            <Check
                              size={10}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <span className="text-xs font-medium leading-tight">
                          {getHotelAmenityLabel(opt.key, t)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {amenities.wifi ? (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {copy.wifiSpeed}{" "}
                      <span className="font-normal normal-case text-slate-400">
                        ({copy.optional})
                      </span>
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={amenities.wifiSpeed ?? ""}
                      onChange={(e) =>
                        setAmenities((prev) => ({
                          ...prev,
                          wifiSpeed: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                ) : null}

                {amenities.parking ? (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {copy.parkingFee}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={amenities.parkingFee ?? 0}
                      onChange={(e) =>
                        setAmenities((prev) => ({
                          ...prev,
                          parkingFee: e.target.value ? Number(e.target.value) : 0,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                ) : null}

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {copy.safetyFeatures}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {SAFETY_OPTIONS.map((opt) => {
                      const active = Boolean(safetyFeatures[opt.key]);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => toggleSafetyFeature(opt.key)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                            active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                              active
                                ? "border-white/40 bg-white/20"
                                : "border-slate-300"
                            }`}
                          >
                            {active ? (
                              <Check size={10} className="text-white" strokeWidth={3} />
                            ) : null}
                          </div>
                          <span className="text-xs font-medium leading-tight">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenSection(2)}
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    {copy.back}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={loading}
                    className="rounded-full bg-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? copy.registering : copy.registerHotel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

CreateHotelPage.auth = {
  roles: ["AGENT", "ADMIN"],
  requireApprovedHostAccess: true,
};

export default CreateHotelPage;
