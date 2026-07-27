import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ImageCollectionField } from "@/components/uploads/image-collection-field";
import { VideoCollectionField } from "@/components/uploads/video-collection-field";
import { GET_HOTEL_QUERY, UPDATE_HOTEL_MUTATION } from "@/graphql/hotel.gql";
import { useI18n } from "@/lib/i18n/provider";
import {
  getHotelAmenityLabel,
  getStayPurposeLabel,
} from "@/lib/hotels/hotels-i18n";
import { getErrorMessage } from "@/lib/utils/error";
import { confirmAction, successAlert, errorAlert } from "@/lib/ui/alerts";
import type {
  AmenitiesInput,
  AgentHotelUpdateInput,
  CancellationPolicy,
  GetHotelQueryData,
  GetHotelQueryVars,
  SafetyFeaturesInput,
  UpdateHotelMutationData,
  UpdateHotelMutationVars,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import { ArrowLeft, Check, Save } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

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

const SUITABLE_FOR_OPTIONS = [
  "BUSINESS",
  "ROMANTIC",
  "FAMILY",
  "SOLO",
  "STAYCATION",
  "EVENT",
  "MEDICAL",
  "LONG_TERM",
] as const;

type Tab = "info" | "amenities" | "policies";

// ─── Page ─────────────────────────────────────────────────────────────────────

const EditHotelPage: NextPageWithAuth = () => {
  const router = useRouter();
  const { locale, t } = useI18n();
  const hotelId =
    typeof router.query.hotelId === "string" ? router.query.hotelId : "";
  const copy =
    locale === "ko"
      ? {
          myHotels: "내 호텔",
          hotelSettings: "호텔 설정",
          editHotel: "호텔 수정",
          saveChanges: "변경 사항 저장",
          saving: "저장 중…",
          info: "정보",
          amenities: "편의시설",
          policies: "정책",
          hotelName: "호텔 이름",
          description: "설명",
          descriptionPlaceholder: "숙소 특징과 주변 명소를 설명해 주세요…",
          starRating: "성급",
          starLabel: "성",
          checkInTime: "체크인 시간",
          checkOutTime: "체크아웃 시간",
          imageUrls: "호텔 이미지",
          onePerLine: "대표 이미지와 갤러리를 업로드하세요",
          hotelVideos: "호텔 영상",
          hotelVideosHelp: "분위기와 객실 동선을 보여줄 영상을 업로드하거나 YouTube 링크를 추가하세요",
          suitableFor: "적합한 여행 목적",
          facilities: "시설",
          safetyFeatures: "안전 기능",
          cancellationPolicy: "취소 정책",
          petsAllowed: "반려동물 허용",
          maxPetWeight: "최대 반려동물 무게(kg)",
          optional: "선택",
          smokingAllowed: "흡연 허용",
          flexibleTimingOptions: "유연 시간 옵션",
          flexibleCheckIn: "유연 체크인",
          flexibleCheckOut: "유연 체크아웃",
          allowEarlyCheckIn: "얼리 체크인 요청 허용",
          allowLateCheckOut: "레이트 체크아웃 요청 허용",
          surcharge: "추가 요금 (₩)",
          manageRooms: "객실 관리",
          reviews: "리뷰",
          hotelUpdated: "호텔 정보가 업데이트되었습니다.",
        }
      : locale === "ru"
        ? {
            myHotels: "Мои отели",
            hotelSettings: "Настройки отеля",
            editHotel: "Редактировать отель",
            saveChanges: "Сохранить",
            saving: "Сохранение…",
            info: "Инфо",
            amenities: "Удобства",
            policies: "Политики",
            hotelName: "Название отеля",
            description: "Описание",
            descriptionPlaceholder:
              "Опишите особенности объекта и места рядом…",
            starRating: "Звездность",
            starLabel: "звезды",
            checkInTime: "Время заезда",
            checkOutTime: "Время выезда",
            imageUrls: "Изображения отеля",
            onePerLine: "Загрузите обложку и галерею отеля",
            hotelVideos: "Видео отеля",
            hotelVideosHelp: "Загрузите видео, показывающие атмосферу и планировку, или добавьте ссылку YouTube",
            suitableFor: "Подходит для",
            facilities: "Удобства",
            safetyFeatures: "Безопасность",
            cancellationPolicy: "Политика отмены",
            petsAllowed: "Можно с животными",
            maxPetWeight: "Макс. вес питомца (кг)",
            optional: "необязательно",
            smokingAllowed: "Разрешено курение",
            flexibleTimingOptions: "Гибкие временные опции",
            flexibleCheckIn: "Гибкий заезд",
            flexibleCheckOut: "Гибкий выезд",
            allowEarlyCheckIn: "Разрешить ранний заезд",
            allowLateCheckOut: "Разрешить поздний выезд",
            surcharge: "Доплата (₩)",
            manageRooms: "Управление номерами",
            reviews: "Отзывы",
            hotelUpdated: "Отель успешно обновлен.",
          }
        : locale === "uz"
          ? {
              myHotels: "Mening mehmonxonalarim",
              hotelSettings: "Mehmonxona sozlamalari",
              editHotel: "Mehmonxonani tahrirlash",
              saveChanges: "O'zgarishlarni saqlash",
              saving: "Saqlanmoqda…",
              info: "Ma'lumot",
              amenities: "Qulayliklar",
              policies: "Qoidalar",
              hotelName: "Mehmonxona nomi",
              description: "Tavsif",
              descriptionPlaceholder:
                "Obyektning xususiyatlari va yaqin joylar haqida yozing…",
              starRating: "Yulduz darajasi",
              starLabel: "yulduz",
              checkInTime: "Check-in vaqti",
              checkOutTime: "Check-out vaqti",
              imageUrls: "Mehmonxona rasmlari",
              onePerLine: "Muqova va galereya rasmlarini yuklang",
              hotelVideos: "Mehmonxona videolari",
              hotelVideosHelp: "Muhit va joylashuvni ko'rsatadigan videolarni yuklang yoki YouTube havolasini qo'shing",
              suitableFor: "Mos keladi",
              facilities: "Qulayliklar",
              safetyFeatures: "Xavfsizlik",
              cancellationPolicy: "Bekor qilish siyosati",
              petsAllowed: "Uy hayvonlari mumkin",
              maxPetWeight: "Hayvon vazni limiti (kg)",
              optional: "ixtiyoriy",
              smokingAllowed: "Chekish mumkin",
              flexibleTimingOptions: "Moslashuvchan vaqt variantlari",
              flexibleCheckIn: "Moslashuvchan check-in",
              flexibleCheckOut: "Moslashuvchan check-out",
              allowEarlyCheckIn: "Erta check-in so'roviga ruxsat berish",
              allowLateCheckOut: "Kech check-out so'roviga ruxsat berish",
              surcharge: "Qo'shimcha to'lov (₩)",
              manageRooms: "Xonalarni boshqarish",
              reviews: "Sharhlar",
              hotelUpdated: "Mehmonxona yangilandi.",
            }
          : {
              myHotels: "My Hotels",
              hotelSettings: "Hotel Settings",
              editHotel: "Edit Hotel",
              saveChanges: "Save Changes",
              saving: "Saving…",
              info: "Info",
              amenities: "Amenities",
              policies: "Policies",
              hotelName: "Hotel Name",
              description: "Description",
              descriptionPlaceholder:
                "Describe your property, unique features, nearby attractions…",
              starRating: "Star Rating",
              starLabel: "Star",
              checkInTime: "Check-in Time",
              checkOutTime: "Check-out Time",
              imageUrls: "Hotel Images",
              onePerLine: "Upload your cover image and gallery",
              hotelVideos: "Hotel Videos",
              hotelVideosHelp: "Upload videos that show the atmosphere and layout, or add a YouTube link",
              suitableFor: "Suitable For",
              facilities: "Facilities",
              safetyFeatures: "Safety Features",
              cancellationPolicy: "Cancellation Policy",
              petsAllowed: "Pets Allowed",
              maxPetWeight: "Max Pet Weight (kg)",
              optional: "optional",
              smokingAllowed: "Smoking Allowed",
              flexibleTimingOptions: "Flexible Timing Options",
              flexibleCheckIn: "Flexible Check-In",
              flexibleCheckOut: "Flexible Check-Out",
              allowEarlyCheckIn: "Allow guests to request early check-in",
              allowLateCheckOut: "Allow guests to request late check-out",
              surcharge: "Surcharge (₩)",
              manageRooms: "Manage Rooms",
              reviews: "Reviews",
              hotelUpdated: "Hotel updated successfully.",
            };

  const cancellationOptions = getCancellationOptions(locale);

  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [saving, setSaving] = useState(false);

  // Info tab
  const [hotelTitle, setHotelTitle] = useState("");
  const [hotelDesc, setHotelDesc] = useState("");
  const [starRating, setStarRating] = useState(3);
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [hotelImages, setHotelImages] = useState<string[]>([]);
  const [hotelVideos, setHotelVideos] = useState<string[]>([]);
  const [suitableFor, setSuitableFor] = useState<string[]>([]);

  // Amenities tab
  const [amenities, setAmenities] = useState<AmenitiesInput>({});
  const [safetyFeatures, setSafetyFeatures] = useState<SafetyFeaturesInput>({});

  // Policies tab
  const [cancellationPolicy, setCancellationPolicy] =
    useState<CancellationPolicy>("MODERATE");
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [maxPetWeight, setMaxPetWeight] = useState("");
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [flexCheckInEnabled, setFlexCheckInEnabled] = useState(false);
  const [flexCheckInFee, setFlexCheckInFee] = useState("");
  const [flexCheckOutEnabled, setFlexCheckOutEnabled] = useState(false);
  const [flexCheckOutFee, setFlexCheckOutFee] = useState("");

  // Load hotel
  const { data, loading: loadingHotel } = useQuery<
    GetHotelQueryData,
    GetHotelQueryVars
  >(GET_HOTEL_QUERY, {
    skip: !hotelId,
    variables: { hotelId },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const hotel = data?.getHotel;

  // Pre-fill form when data loads
  useEffect(() => {
    if (!hotel) return;
    setHotelTitle(hotel.hotelTitle);
    setHotelDesc(hotel.hotelDesc ?? "");
    setStarRating(hotel.starRating ?? 3);
    setCheckInTime(hotel.checkInTime ?? "15:00");
    setCheckOutTime(hotel.checkOutTime ?? "11:00");
    setHotelImages(hotel.hotelImages ?? []);
    setHotelVideos(hotel.hotelVideos ?? []);
    setSuitableFor(hotel.suitableFor ?? []);
    if (hotel.amenities) {
      setAmenities({
        wifi: hotel.amenities.wifi,
        parking: hotel.amenities.parking,
        breakfast: hotel.amenities.breakfast,
        breakfastIncluded: hotel.amenities.breakfastIncluded,
        roomService: hotel.amenities.roomService,
        gym: hotel.amenities.gym,
        pool: hotel.amenities.pool,
        workspace: hotel.amenities.workspace,
        familyRoom: hotel.amenities.familyRoom,
        kidsFriendly: hotel.amenities.kidsFriendly,
        wheelchairAccessible: hotel.amenities.wheelchairAccessible,
        elevator: hotel.amenities.elevator,
        accessibleBathroom: hotel.amenities.accessibleBathroom,
        visualAlarms: hotel.amenities.visualAlarms,
        serviceAnimalsAllowed: hotel.amenities.serviceAnimalsAllowed,
        airportShuttle: hotel.amenities.airportShuttle,
        evCharging: hotel.amenities.evCharging,
        playground: hotel.amenities.playground,
        meetingRoom: hotel.amenities.meetingRoom,
        privateBath: hotel.amenities.privateBath,
        restaurant: hotel.amenities.restaurant,
        spa: hotel.amenities.spa,
        coupleRoom: hotel.amenities.coupleRoom,
        romanticView: hotel.amenities.romanticView,
      });
    }
    if (hotel.safetyFeatures) {
      setSafetyFeatures({
        fireSafety: hotel.safetyFeatures.fireSafety,
        securityCameras: hotel.safetyFeatures.securityCameras,
        frontDesk24h: hotel.safetyFeatures.frontDesk24h,
        roomSafe: hotel.safetyFeatures.roomSafe,
        femaleOnlyFloors: hotel.safetyFeatures.femaleOnlyFloors,
        wellLitParking: hotel.safetyFeatures.wellLitParking,
      });
    }
    setCancellationPolicy(hotel.cancellationPolicy ?? "MODERATE");
    setPetsAllowed(hotel.petsAllowed ?? false);
    setMaxPetWeight(
      hotel.maxPetWeight != null ? String(hotel.maxPetWeight) : "",
    );
    setSmokingAllowed(hotel.smokingAllowed ?? false);
    setFlexCheckInEnabled(hotel.flexibleCheckIn?.enabled ?? false);
    setFlexCheckInFee(
      hotel.flexibleCheckIn?.fee != null
        ? String(hotel.flexibleCheckIn.fee)
        : "",
    );
    setFlexCheckOutEnabled(hotel.flexibleCheckOut?.enabled ?? false);
    setFlexCheckOutFee(
      hotel.flexibleCheckOut?.fee != null
        ? String(hotel.flexibleCheckOut.fee)
        : "",
    );
  }, [hotel]);

  const [updateHotel] = useMutation<
    UpdateHotelMutationData,
    UpdateHotelMutationVars
  >(UPDATE_HOTEL_MUTATION, {
    refetchQueries: ["getHotel", "getHotels"],
  });

  const handleSave = async () => {
    if (!hotelId) return;
    setSaving(true);
    try {
      const imageUrls = hotelImages.filter(Boolean);
      const videoUrls = hotelVideos.filter(Boolean);
      const input: AgentHotelUpdateInput = {
        _id: hotelId,
        hotelTitle: hotelTitle.trim() || undefined,
        hotelDesc: hotelDesc.trim() || undefined,
        starRating,
        checkInTime,
        checkOutTime,
        cancellationPolicy,
        petsAllowed,
        maxPetWeight:
          petsAllowed && maxPetWeight ? Number(maxPetWeight) : undefined,
        smokingAllowed,
        amenities,
        safetyFeatures,
        suitableFor,
        hotelImages: imageUrls,
        hotelVideos: videoUrls,
        flexibleCheckIn: {
          enabled: flexCheckInEnabled,
          fee: flexCheckInFee ? Number(flexCheckInFee) : 0,
        },
        flexibleCheckOut: {
          enabled: flexCheckOutEnabled,
          fee: flexCheckOutFee ? Number(flexCheckOutFee) : 0,
        },
      };
      const confirmed = await confirmAction({
        title: "Save hotel updates",
        text: "This will update your hotel details, policies, and media across the listing.",
        confirmText: "Save changes",
        variant: "hotel",
      });
      if (!confirmed) return;
      await updateHotel({ variables: { input } });
      await successAlert("Hotel details saved", copy.hotelUpdated, {
        variant: "hotel",
      });
    } catch (err) {
      await errorAlert("We couldn’t save these hotel changes", getErrorMessage(err), {
        variant: "hotel",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (key: keyof AmenitiesInput) =>
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSafety = (key: keyof SafetyFeaturesInput) =>
    setSafetyFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSuitableFor = (val: string) =>
    setSuitableFor((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );

  // ── Loading ──
  if (loadingHotel && !hotel) {
    return (
      <main className="w-full space-y-4">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="h-7 w-48 animate-pulse rounded-full bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  const TAB_CLASSES = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-full transition ${
      activeTab === t
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100"
    }`;
  const hasHotelId = Boolean(hotelId);

  return (
    <main className="w-full space-y-6">
      {/* Back + header */}
      <Link
        href="/hotels/manage"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        {copy.myHotels}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {copy.hotelSettings}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {hotel?.hotelTitle ?? copy.editHotel}
          </h1>
        </header>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex flex-shrink-0 items-center gap-2 rounded-full bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? copy.saving : copy.saveChanges}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {(["info", "amenities", "policies"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={TAB_CLASSES(t)}
          >
            {t === "info"
              ? copy.info
              : t === "amenities"
                ? copy.amenities
                : copy.policies}
          </button>
        ))}
      </div>

      {/* ── Info Tab ── */}
      {activeTab === "info" && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {copy.hotelName}
            </span>
            <input
              value={hotelTitle}
              onChange={(e) => setHotelTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {copy.description}
            </span>
            <textarea
              value={hotelDesc}
              onChange={(e) => setHotelDesc(e.target.value)}
              rows={4}
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
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
            description={copy.onePerLine}
          />
          <VideoCollectionField
            value={hotelVideos}
            onChange={setHotelVideos}
            maxFiles={4}
            title={copy.hotelVideos}
            description={copy.hotelVideosHelp}
          />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {copy.suitableFor}
            </p>
            <div className="flex flex-wrap gap-2">
              {SUITABLE_FOR_OPTIONS.map((val) => {
                const active = suitableFor.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleSuitableFor(val)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-sky-400 bg-sky-50 text-sky-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {getStayPurposeLabel(val, t)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Amenities Tab ── */}
      {activeTab === "amenities" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {copy.facilities}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITY_OPTIONS.map((opt) => {
                const active = Boolean(amenities[opt.key]);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleAmenity(opt.key)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                      active
                        ? "border-sky-400 bg-sky-50 font-medium text-sky-800"
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
                    {getHotelAmenityLabel(opt.key, t)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {copy.safetyFeatures}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SAFETY_OPTIONS.map((opt) => {
                const active = Boolean(safetyFeatures[opt.key]);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleSafety(opt.key)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                      active
                        ? "border-emerald-400 bg-emerald-50 font-medium text-emerald-800"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                        active
                          ? "border-emerald-500 bg-emerald-500"
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
                    {getSafetyFeatureLabel(opt.key, locale)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Policies Tab ── */}
      {activeTab === "policies" && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                {copy.petsAllowed}
              </span>
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                  petsAllowed ? "border-sky-500 bg-sky-500" : "border-slate-300"
                }`}
              >
                {petsAllowed && (
                  <Check size={11} className="text-white" strokeWidth={3} />
                )}
              </div>
            </button>
            {petsAllowed && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {copy.maxPetWeight}{" "}
                  <span className="font-normal normal-case text-slate-400">
                    ({copy.optional})
                  </span>
                </span>
                <input
                  type="number"
                  value={maxPetWeight}
                  onChange={(e) => setMaxPetWeight(e.target.value)}
                  className="w-32 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                  placeholder="e.g. 10"
                />
              </label>
            )}

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
                {copy.smokingAllowed}
              </span>
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                  smokingAllowed
                    ? "border-sky-500 bg-sky-500"
                    : "border-slate-300"
                }`}
              >
                {smokingAllowed && (
                  <Check size={11} className="text-white" strokeWidth={3} />
                )}
              </div>
            </button>
          </div>

          {/* Flexible timing */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {copy.flexibleTimingOptions}
            </p>
            <div className="space-y-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {copy.flexibleCheckIn}
                    </p>
                    <p className="text-xs text-slate-400">
                      {copy.allowEarlyCheckIn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFlexCheckInEnabled((v) => !v)}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                      flexCheckInEnabled
                        ? "border-sky-500 bg-sky-500"
                        : "border-slate-300"
                    }`}
                  >
                    {flexCheckInEnabled && (
                      <Check size={11} className="text-white" strokeWidth={3} />
                    )}
                  </button>
                </div>
                {flexCheckInEnabled && (
                  <label className="mt-3 block">
                    <span className="mb-1 block text-xs text-slate-500">
                      {copy.surcharge}
                    </span>
                    <input
                      type="number"
                      value={flexCheckInFee}
                      onChange={(e) => setFlexCheckInFee(e.target.value)}
                      className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                      placeholder="30000"
                    />
                  </label>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {copy.flexibleCheckOut}
                    </p>
                    <p className="text-xs text-slate-400">
                      {copy.allowLateCheckOut}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFlexCheckOutEnabled((v) => !v)}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                      flexCheckOutEnabled
                        ? "border-sky-500 bg-sky-500"
                        : "border-slate-300"
                    }`}
                  >
                    {flexCheckOutEnabled && (
                      <Check size={11} className="text-white" strokeWidth={3} />
                    )}
                  </button>
                </div>
                {flexCheckOutEnabled && (
                  <label className="mt-3 block">
                    <span className="mb-1 block text-xs text-slate-500">
                      {copy.surcharge}
                    </span>
                    <input
                      type="number"
                      value={flexCheckOutFee}
                      onChange={(e) => setFlexCheckOutFee(e.target.value)}
                      className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                      placeholder="30000"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom save (mobile convenience) */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          {hasHotelId ? (
            <>
              <Link
                href={`/hotels/${hotelId}/rooms`}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {copy.manageRooms} →
              </Link>
              <Link
                href={`/hotels/${hotelId}/reviews`}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {copy.reviews} →
              </Link>
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-600 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? copy.saving : copy.saveChanges}
        </button>
      </div>
    </main>
  );
};

EditHotelPage.auth = {
  roles: ["AGENT", "ADMIN", "ADMIN_OPERATOR"],
  requireApprovedHostAccess: true,
};

export default EditHotelPage;

function getCancellationOptions(locale: string): typeof CANCELLATION_OPTIONS {
  if (locale === "ko") {
    return [
      {
        value: "FLEXIBLE",
        label: "유연함",
        desc: "체크인 24시간 전까지 무료 취소",
      },
      {
        value: "MODERATE",
        label: "보통",
        desc: "체크인 5일 전까지 무료 취소",
      },
      {
        value: "STRICT",
        label: "엄격",
        desc: "체크인 7일 전까지 50% 환불",
      },
    ];
  }

  if (locale === "ru") {
    return [
      {
        value: "FLEXIBLE",
        label: "Гибкая",
        desc: "Бесплатная отмена за 24 часа до заезда",
      },
      {
        value: "MODERATE",
        label: "Умеренная",
        desc: "Бесплатная отмена за 5 дней до заезда",
      },
      {
        value: "STRICT",
        label: "Строгая",
        desc: "50% возврат за 7 дней до заезда",
      },
    ];
  }

  if (locale === "uz") {
    return [
      {
        value: "FLEXIBLE",
        label: "Moslashuvchan",
        desc: "Check-indan 24 soat oldin bepul bekor qilish",
      },
      {
        value: "MODERATE",
        label: "O'rtacha",
        desc: "Check-indan 5 kun oldin bepul bekor qilish",
      },
      {
        value: "STRICT",
        label: "Qattiq",
        desc: "Check-indan 7 kun oldin 50% qaytariladi",
      },
    ];
  }

  return CANCELLATION_OPTIONS;
}

function getSafetyFeatureLabel(
  key: keyof SafetyFeaturesInput,
  locale: string,
): string {
  const labels = {
    fireSafety: {
      en: "Fire Safety Equipment",
      ko: "화재 안전 장비",
      ru: "Противопожарное оборудование",
      uz: "Yong'in xavfsizligi jihozlari",
    },
    securityCameras: {
      en: "Security Cameras",
      ko: "보안 카메라",
      ru: "Камеры безопасности",
      uz: "Xavfsizlik kameralari",
    },
    frontDesk24h: {
      en: "24h Front Desk",
      ko: "24시간 프런트",
      ru: "Стойка регистрации 24/7",
      uz: "24 soat resepshn",
    },
    roomSafe: {
      en: "In-Room Safe",
      ko: "객실 금고",
      ru: "Сейф в номере",
      uz: "Xonadagi сейф",
    },
    femaleOnlyFloors: {
      en: "Female-Only Floors",
      ko: "여성 전용 층",
      ru: "Этажи только для женщин",
      uz: "Faqat ayollar uchun qavatlar",
    },
    wellLitParking: {
      en: "Well-Lit Parking",
      ko: "조명 좋은 주차장",
      ru: "Хорошо освещенная парковка",
      uz: "Yaxshi yoritilgan avtoturargoh",
    },
  } satisfies Record<
    keyof SafetyFeaturesInput,
    Record<"en" | "ko" | "ru" | "uz", string>
  >;

  const localeKey =
    locale === "ko" || locale === "ru" || locale === "uz" ? locale : "en";
  return labels[key][localeKey];
}
