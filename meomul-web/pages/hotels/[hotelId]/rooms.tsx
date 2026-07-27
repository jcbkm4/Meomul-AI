import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { ImageCollectionField } from "@/components/uploads/image-collection-field";
import {
  GET_HOTEL_QUERY,
  GET_AGENT_ROOMS_QUERY,
  CREATE_ROOM_MUTATION,
  UPDATE_ROOM_MUTATION,
} from "@/graphql/hotel.gql";
import { getSessionMember } from "@/lib/auth/session";
import { useI18n } from "@/lib/i18n/provider";
import {
  getBedTypeLabel,
  getRoomStatusLabel,
  getRoomTypeLabel,
  getViewTypeLabel,
} from "@/lib/hotels/hotels-i18n";
import { getErrorMessage } from "@/lib/utils/error";
import { confirmAction, successAlert, errorAlert } from "@/lib/ui/alerts";
import { formatCurrencyKrw } from "@/lib/utils/format";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type {
  AgentRoomListItem,
  AgentRoomCreateInput,
  AgentRoomUpdateInput,
  BedType,
  RoomStatus,
  RoomType,
  ViewType,
  GetAgentRoomsQueryData,
  GetAgentRoomsQueryVars,
  GetHotelQueryData,
  GetHotelQueryVars,
  CreateRoomMutationData,
  CreateRoomMutationVars,
  UpdateRoomMutationData,
  UpdateRoomMutationVars,
  PaginationInput,
} from "@/types/hotel";
import type { NextPageWithAuth } from "@/types/page";
import {
  ArrowLeft,
  BedDouble,
  ChevronDown,
  DoorOpen,
  Plus,
  Star,
  X,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOM_PAGINATION: PaginationInput = {
  page: 1,
  limit: 100,
  sort: "createdAt",
  direction: -1,
};

const ROOM_STATUS_CONFIG: Record<
  RoomStatus,
  { label: string; className: string; dotClass: string }
> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  BOOKED: {
    label: "Booked",
    className: "bg-sky-50 text-sky-700 border border-sky-200",
    dotClass: "bg-sky-500",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    dotClass: "bg-amber-500",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-slate-100 text-slate-500 border border-slate-200",
    dotClass: "bg-slate-400",
  },
};

const ROOM_AMENITY_OPTIONS = [
  { key: "AC", label: "Air Conditioning" },
  { key: "TV", label: "TV" },
  { key: "minibar", label: "Minibar" },
  { key: "coffeemaker", label: "Coffee Maker" },
  { key: "hairdryer", label: "Hair Dryer" },
  { key: "safe", label: "In-room Safe" },
  { key: "bathtub", label: "Bathtub" },
  { key: "balcony", label: "Balcony" },
  { key: "workspace", label: "Work Desk" },
  { key: "sofa", label: "Sofa" },
  { key: "kitchenette", label: "Kitchenette" },
  { key: "washer", label: "Washer" },
];

const EDITABLE_STATUSES: RoomStatus[] = [
  "AVAILABLE",
  "MAINTENANCE",
  "INACTIVE",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type PanelMode = "closed" | "create" | "edit";

interface RoomFormState {
  roomName: string;
  roomType: RoomType;
  roomNumber: string;
  roomDesc: string;
  maxOccupancy: number;
  bedType: BedType;
  bedCount: number;
  basePrice: number;
  weekendSurcharge: number;
  roomSize: number;
  viewType: ViewType;
  totalRooms: number;
  roomAmenities: string[];
  roomImages: string[];
}

const DEFAULT_FORM: RoomFormState = {
  roomName: "",
  roomType: "STANDARD",
  roomNumber: "",
  roomDesc: "",
  maxOccupancy: 2,
  bedType: "DOUBLE",
  bedCount: 1,
  basePrice: 0,
  weekendSurcharge: 0,
  roomSize: 0,
  viewType: "NONE",
  totalRooms: 1,
  roomAmenities: [],
  roomImages: [],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const HotelRoomsPage: NextPageWithAuth = () => {
  const router = useRouter();
  const { locale, t } = useI18n();
  const hotelId =
    typeof router.query.hotelId === "string" ? router.query.hotelId : "";
  const hasHotelId = hotelId.length > 0;
  const copy =
    locale === "ko"
      ? {
          editHotel: "호텔 수정",
          reviews: "리뷰",
          roomManagement: "객실 관리",
          roomLabel: "객실",
          addRoom: "객실 추가",
          noRoomsYet: "아직 등록된 객실이 없습니다",
          addFirstRoom: "예약을 받으려면 첫 객실 유형을 추가하세요.",
          room: "객실",
          type: "유형",
          pricePerNight: "1박 요금",
          status: "상태",
          maxGuests: "최대",
          guests: "명",
          weekend: "주말",
          registered: "등록됨",
          addNewRoom: "새 객실 추가",
          editRoom: "객실 수정",
          basicInfo: "기본 정보",
          roomName: "객실 이름",
          roomNameRequired: "객실 이름은 필수입니다.",
          roomNamePlaceholder: "예: 디럭스 오션 뷰",
          roomType: "객실 유형",
          roomNumber: "객실 번호",
          roomNumberPlaceholder: "예: 301 (선택)",
          description: "설명",
          roomDescriptionPlaceholder: "객실의 강점을 설명해 주세요…",
          capacityAndBed: "수용 인원 및 침대",
          maxOccupancy: "최대 투숙 인원",
          totalRooms: "총 객실 수",
          bedType: "침대 유형",
          bedCount: "침대 수",
          pricing: "요금",
          basePrice: "기본 요금 (₩)",
          basePriceRequired: "기본 요금은 0보다 커야 합니다.",
          weekendSurcharge: "주말 추가요금 (₩)",
          roomDetails: "객실 상세",
          roomSize: "객실 크기 (m²)",
          roomSizePlaceholder: "예: 28",
          viewType: "전망 유형",
          roomAmenities: "객실 편의시설",
          roomImages: "객실 이미지",
          imageUrlsPerLine: "객실 사진을 업로드해 주세요",
          cancel: "취소",
          saving: "저장 중...",
          saveChanges: "변경 사항 저장",
          roomAdded: "객실이 추가되었습니다.",
          roomUpdated: "객실이 업데이트되었습니다.",
          maxOccupancyRequired: "최대 인원은 1명 이상이어야 합니다.",
        }
      : locale === "ru"
        ? {
            editHotel: "Редактировать отель",
            reviews: "Отзывы",
            roomManagement: "Управление номерами",
            roomLabel: "номер",
            addRoom: "Добавить номер",
            noRoomsYet: "Номеров пока нет",
            addFirstRoom: "Добавьте первый тип номера, чтобы начать бронирования.",
            room: "Номер",
            type: "Тип",
            pricePerNight: "Цена / ночь",
            status: "Статус",
            maxGuests: "до",
            guests: "гостей",
            weekend: "выходные",
            registered: "зарегистрировано",
            addNewRoom: "Добавить новый номер",
            editRoom: "Редактировать номер",
            basicInfo: "Основная информация",
            roomName: "Название номера",
            roomNameRequired: "Название номера обязательно.",
            roomNamePlaceholder: "напр. Deluxe Ocean View",
            roomType: "Тип номера",
            roomNumber: "Номер комнаты",
            roomNumberPlaceholder: "напр. 301 (необязательно)",
            description: "Описание",
            roomDescriptionPlaceholder: "Опишите преимущества номера…",
            capacityAndBed: "Вместимость и кровать",
            maxOccupancy: "Макс. вместимость",
            totalRooms: "Всего номеров",
            bedType: "Тип кровати",
            bedCount: "Количество кроватей",
            pricing: "Цена",
            basePrice: "Базовая цена (₩)",
            basePriceRequired: "Базовая цена должна быть больше 0.",
            weekendSurcharge: "Доплата за выходные (₩)",
            roomDetails: "Детали номера",
            roomSize: "Размер номера (m²)",
            roomSizePlaceholder: "напр. 28",
            viewType: "Тип вида",
            roomAmenities: "Удобства номера",
            roomImages: "Изображения номера",
            imageUrlsPerLine: "Загрузите фотографии номера",
            cancel: "Отмена",
            saving: "Сохранение...",
            saveChanges: "Сохранить",
            roomAdded: "Номер добавлен.",
            roomUpdated: "Номер обновлен.",
            maxOccupancyRequired: "Вместимость должна быть не меньше 1.",
          }
        : locale === "uz"
          ? {
              editHotel: "Mehmonxonani tahrirlash",
              reviews: "Sharhlar",
              roomManagement: "Xonalarni boshqarish",
              roomLabel: "xona",
              addRoom: "Xona qo'shish",
              noRoomsYet: "Hali xonalar yo'q",
              addFirstRoom:
                "Bronlarni boshlash uchun birinchi xona turini qo'shing.",
              room: "Xona",
              type: "Turi",
              pricePerNight: "1 kecha narxi",
              status: "Holat",
              maxGuests: "maks.",
              guests: "mehmon",
              weekend: "dam olish kuni",
              registered: "ro'yxatdan o'tgan",
              addNewRoom: "Yangi xona qo'shish",
              editRoom: "Xonani tahrirlash",
              basicInfo: "Asosiy ma'lumot",
              roomName: "Xona nomi",
              roomNameRequired: "Xona nomi majburiy.",
              roomNamePlaceholder: "masalan, Deluxe Ocean View",
              roomType: "Xona turi",
              roomNumber: "Xona raqami",
              roomNumberPlaceholder: "masalan, 301 (ixtiyoriy)",
              description: "Tavsif",
              roomDescriptionPlaceholder: "Xonaning afzalliklarini yozing…",
              capacityAndBed: "Sig'im va karavot",
              maxOccupancy: "Maks. sig'im",
              totalRooms: "Jami xonalar",
              bedType: "Karavot turi",
              bedCount: "Karavot soni",
              pricing: "Narx",
              basePrice: "Asosiy narx (₩)",
              basePriceRequired: "Asosiy narx 0 dan katta bo'lishi kerak.",
              weekendSurcharge: "Dam olish kuni qo'shimchasi (₩)",
              roomDetails: "Xona tafsilotlari",
              roomSize: "Xona hajmi (m²)",
              roomSizePlaceholder: "masalan, 28",
              viewType: "Ko'rinish turi",
              roomAmenities: "Xona qulayliklari",
              roomImages: "Xona rasmlari",
              imageUrlsPerLine: "Xona rasmlarini yuklang",
              cancel: "Bekor qilish",
              saving: "Saqlanmoqda...",
              saveChanges: "Saqlash",
              roomAdded: "Xona qo'shildi.",
              roomUpdated: "Xona yangilandi.",
              maxOccupancyRequired: "Sig'im kamida 1 bo'lishi kerak.",
            }
          : {
              editHotel: "Edit Hotel",
              reviews: "Reviews",
              roomManagement: "Room Management",
              roomLabel: "room",
              addRoom: "Add Room",
              noRoomsYet: "No rooms yet",
              addFirstRoom: "Add your first room type to start accepting bookings.",
              room: "Room",
              type: "Type",
              pricePerNight: "Price / night",
              status: "Status",
              maxGuests: "max",
              guests: "guests",
              weekend: "wknd",
              registered: "registered",
              addNewRoom: "Add New Room",
              editRoom: "Edit Room",
              basicInfo: "Basic Info",
              roomName: "Room Name",
              roomNameRequired: "Room name is required.",
              roomNamePlaceholder: "e.g. Deluxe Ocean View",
              roomType: "Room Type",
              roomNumber: "Room Number",
              roomNumberPlaceholder: "e.g. 301 (optional)",
              description: "Description",
              roomDescriptionPlaceholder: "Describe the room's highlights...",
              capacityAndBed: "Capacity & Bed",
              maxOccupancy: "Max Occupancy",
              totalRooms: "Total Rooms",
              bedType: "Bed Type",
              bedCount: "Bed Count",
              pricing: "Pricing",
              basePrice: "Base Price (₩)",
              basePriceRequired: "Base price must be greater than 0.",
              weekendSurcharge: "Weekend Surcharge (₩)",
              roomDetails: "Room Details",
              roomSize: "Room Size (m²)",
              roomSizePlaceholder: "e.g. 28",
              viewType: "View Type",
              roomAmenities: "Room Amenities",
              roomImages: "Room Images",
              imageUrlsPerLine: "Upload room photos",
              cancel: "Cancel",
              saving: "Saving...",
              saveChanges: "Save Changes",
              roomAdded: "Room added successfully.",
              roomUpdated: "Room updated successfully.",
              maxOccupancyRequired: "Max occupancy must be at least 1.",
            };

  const [panelMode, setPanelMode] = useState<PanelMode>("closed");
  const [editingRoom, setEditingRoom] = useState<AgentRoomListItem | null>(
    null,
  );
  const [form, setForm] = useState<RoomFormState>(DEFAULT_FORM);
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: hotelData } = useQuery<GetHotelQueryData, GetHotelQueryVars>(
    GET_HOTEL_QUERY,
    { variables: { hotelId }, skip: !hotelId },
  );

  const {
    data: roomsData,
    loading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms,
  } = useQuery<GetAgentRoomsQueryData, GetAgentRoomsQueryVars>(
    GET_AGENT_ROOMS_QUERY,
    {
      variables: { hotelId, input: ROOM_PAGINATION },
      skip: !hotelId,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  // ── Mutations ─────────────────────────────────────────────────────────────

  const [createRoom, { loading: creating }] = useMutation<
    CreateRoomMutationData,
    CreateRoomMutationVars
  >(CREATE_ROOM_MUTATION);

  const [updateRoom, { loading: updating }] = useMutation<
    UpdateRoomMutationData,
    UpdateRoomMutationVars
  >(UPDATE_ROOM_MUTATION);

  // ── Derived ──────────────────────────────────────────────────────────────

  const hotel = hotelData?.getHotel;
  const rooms = roomsData?.getAgentRooms.list ?? [];

  // Ownership guard — redirect non-owners back to manage page
  const sessionMember = getSessionMember();
  const isOwner =
    !hotel ||
    hotel.memberId === sessionMember?._id ||
    sessionMember?.memberType === "ADMIN" ||
    sessionMember?.memberType === "ADMIN_OPERATOR";

  useEffect(() => {
    if (hotel && !isOwner) {
      void router.replace("/hotels/manage");
    }
  }, [hotel, isOwner, router]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(DEFAULT_FORM);
    setEditingRoom(null);
    setPanelMode("create");
  };

  const openEdit = (room: AgentRoomListItem) => {
    setEditingRoom(room);
    setForm({
      roomName: room.roomName,
      roomType: room.roomType,
      roomNumber: room.roomNumber ?? "",
      roomDesc: room.roomDesc,
      maxOccupancy: room.maxOccupancy,
      bedType: room.bedType,
      bedCount: room.bedCount,
      basePrice: room.basePrice,
      weekendSurcharge: room.weekendSurcharge,
      roomSize: room.roomSize,
      viewType: room.viewType,
      totalRooms: room.totalRooms,
      roomAmenities: [...room.roomAmenities],
      roomImages: [...room.roomImages],
    });
    setPanelMode("edit");
  };

  const closePanel = () => {
    setPanelMode("closed");
    setEditingRoom(null);
  };

  const toggleAmenity = (key: string) => {
    setForm((prev) => ({
      ...prev,
      roomAmenities: prev.roomAmenities.includes(key)
        ? prev.roomAmenities.filter((a) => a !== key)
        : [...prev.roomAmenities, key],
    }));
  };

  const handleSubmit = async () => {
    if (!form.roomName.trim()) {
      await errorAlert(copy.roomNameRequired);
      return;
    }
    if (form.basePrice <= 0) {
      await errorAlert(copy.basePriceRequired);
      return;
    }
    if (form.maxOccupancy < 1) {
      await errorAlert(copy.maxOccupancyRequired);
      return;
    }

    const imagesList = form.roomImages.filter(Boolean);

    try {
      if (panelMode === "create") {
        const input: AgentRoomCreateInput = {
          hotelId,
          roomName: form.roomName.trim(),
          roomType: form.roomType,
          maxOccupancy: form.maxOccupancy,
          bedType: form.bedType,
          bedCount: form.bedCount,
          basePrice: form.basePrice,
          totalRooms: form.totalRooms,
          ...(form.roomNumber.trim() && { roomNumber: form.roomNumber.trim() }),
          ...(form.roomDesc.trim() && { roomDesc: form.roomDesc.trim() }),
          ...(form.weekendSurcharge > 0 && {
            weekendSurcharge: form.weekendSurcharge,
          }),
          ...(form.roomSize > 0 && { roomSize: form.roomSize }),
          viewType: form.viewType,
          roomAmenities: form.roomAmenities,
          ...(imagesList.length > 0 && { roomImages: imagesList }),
        };
        const confirmed = await confirmAction({
          title: "Add this room",
          text: "This room will be added to the hotel and become available in room management.",
          confirmText: "Add room",
          variant: "room",
        });
        if (!confirmed) return;
        await createRoom({ variables: { input } });
        await successAlert("Room added to hotel", copy.roomAdded, {
          variant: "room",
        });
      } else if (panelMode === "edit" && editingRoom) {
        const confirmed = await confirmAction({
          title: "Save room updates",
          text: "This will update the room configuration used for future bookings.",
          confirmText: "Save room",
          variant: "room",
        });
        if (!confirmed) return;
        const input: AgentRoomUpdateInput = {
          _id: editingRoom._id,
          roomName: form.roomName.trim(),
          roomDesc: form.roomDesc.trim(),
          basePrice: form.basePrice,
          weekendSurcharge: form.weekendSurcharge,
          roomSize: form.roomSize,
          viewType: form.viewType,
          roomAmenities: form.roomAmenities,
          totalRooms: form.totalRooms,
          roomImages: imagesList,
        };
        await updateRoom({ variables: { input } });
        await successAlert("Room details saved", copy.roomUpdated, {
          variant: "room",
        });
      }
      closePanel();
      void refetchRooms();
    } catch (err) {
      await errorAlert("We couldn’t save this room", getErrorMessage(err), {
        variant: "room",
      });
    }
  };

  useEffect(() => {
    if (panelMode === "closed") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [panelMode]);

  const renderStatusControl = (
    room: AgentRoomListItem,
    className = "",
  ) => {
    const statusCfg = ROOM_STATUS_CONFIG[room.roomStatus];

    return (
      <div className={`relative ${className}`}>
        <button
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:opacity-80 ${statusCfg.className}`}
          onClick={(e) => {
            e.stopPropagation();
            setStatusDropdownId(statusDropdownId === room._id ? null : room._id);
          }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
          {getRoomStatusLabel(room.roomStatus, t)}
          <ChevronDown size={10} />
        </button>

        {statusDropdownId === room._id && (
          <div
            className="absolute right-0 top-full z-10 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {EDITABLE_STATUSES.map((s) => {
              const cfg = ROOM_STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 ${
                    room.roomStatus === s ? "bg-slate-50" : ""
                  }`}
                  onClick={() => void handleStatusChange(room, s)}
                  disabled={updating}
                >
                  <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
                  {getRoomStatusLabel(s, t)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleStatusChange = async (
    room: AgentRoomListItem,
    newStatus: RoomStatus,
  ) => {
    setStatusDropdownId(null);
    try {
      await updateRoom({
        variables: { input: { _id: room._id, roomStatus: newStatus } },
      });
      void refetchRooms();
    } catch (err) {
      await errorAlert("We couldn’t update the room status", getErrorMessage(err), {
        variant: "room",
      });
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!statusDropdownId) return;
    const handler = () => setStatusDropdownId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [statusDropdownId]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes panelSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        .room-panel { animation: panelSlideIn 0.22s ease-out; }

        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .room-row { animation: rowFadeIn 0.18s ease-out both; }
      `}</style>

      <main className="space-y-6">
        {/* Header */}
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                {hasHotelId ? (
                  <Link
                    href={`/hotels/${hotelId}/edit`}
                    className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-slate-900"
                  >
                    <ArrowLeft size={15} />
                    {copy.editHotel}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-300">
                    <ArrowLeft size={15} />
                    {copy.editHotel}
                  </span>
                )}
                {hasHotelId ? (
                  <Link
                    href={`/hotels/${hotelId}/reviews`}
                    className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-slate-900"
                  >
                    <Star size={15} />
                    {copy.reviews}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-300">
                    <Star size={15} />
                    {copy.reviews}
                  </span>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {copy.roomManagement}
                </p>
                <h1 className="mt-1 text-[1.65rem] font-semibold leading-tight text-slate-900 sm:text-2xl">
                  {hotel?.hotelTitle ?? "Hotel"}
                </h1>
                {rooms.length > 0 ? (
                  <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    {rooms.length} {copy.roomLabel}
                    {rooms.length !== 1 ? "s" : ""}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              onClick={openCreate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 sm:w-auto sm:rounded-full sm:px-4 sm:py-2.5"
            >
              <Plus size={15} />
              {copy.addRoom}
            </button>
          </div>
        </div>

        {/* Error */}
        {roomsError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {roomsError.message}
          </div>
        )}

        {/* Loading skeleton */}
        {roomsLoading && rooms.length === 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-0"
              >
                <div className="h-16 w-24 animate-pulse rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-1/4 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!roomsLoading && rooms.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
            <DoorOpen size={40} className="text-slate-300" />
            <p className="mt-4 font-semibold text-slate-700">
              {copy.noRoomsYet}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {copy.addFirstRoom}
            </p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus size={14} />
              {copy.addRoom}
            </button>
          </div>
        )}

        {/* Mobile room cards */}
        {rooms.length > 0 && (
          <div className="space-y-3 sm:hidden">
            {rooms.map((room, idx) => {
              const thumbnail = room.roomImages?.[0];

              return (
                <article
                  key={room._id}
                  className="room-row rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveMediaUrl(thumbnail)}
                          alt={room.roomName}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BedDouble size={20} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-slate-900">
                            {room.roomName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {getRoomTypeLabel(room.roomType, t)} ·{" "}
                            {getBedTypeLabel(room.bedType, t)} × {room.bedCount}
                          </p>
                          {room.roomNumber ? (
                            <p className="mt-1 text-xs text-slate-400">
                              #{room.roomNumber}
                            </p>
                          ) : null}
                        </div>
                        {renderStatusControl(room, "shrink-0")}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {copy.pricePerNight}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatCurrencyKrw(room.basePrice)}
                          </p>
                          {room.weekendSurcharge > 0 ? (
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              +{formatCurrencyKrw(room.weekendSurcharge)} {copy.weekend}
                            </p>
                          ) : null}
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {copy.maxGuests}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {room.maxOccupancy} {copy.guests}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {room.totalRooms} total
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openEdit(room)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    {copy.editRoom}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* Room table */}
        {rooms.length > 0 && (
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>{copy.room}</span>
              <span>{copy.type}</span>
              <span>{copy.pricePerNight}</span>
              <span>{copy.status}</span>
              <span />
            </div>

            {/* Rows */}
            {rooms.map((room, idx) => {
              const thumbnail = room.roomImages?.[0];

              return (
                <div
                  key={room._id}
                  className="room-row grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50 transition"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  {/* Room name + thumbnail */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveMediaUrl(thumbnail)}
                          alt={room.roomName}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BedDouble size={20} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {room.roomName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {getBedTypeLabel(room.bedType, t)} × {room.bedCount} ·{" "}
                        {copy.maxGuests} {room.maxOccupancy} {copy.guests}
                      </p>
                      {room.roomNumber && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          #{room.roomNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Type */}
                  <span className="text-sm text-slate-600">
                    {getRoomTypeLabel(room.roomType, t)}
                  </span>

                  {/* Price */}
                  <span className="text-sm font-semibold text-slate-800">
                    {formatCurrencyKrw(room.basePrice)}
                    {room.weekendSurcharge > 0 && (
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        (+{formatCurrencyKrw(room.weekendSurcharge)} {copy.weekend})
                      </span>
                    )}
                  </span>

                  {/* Status badge + dropdown */}
                  {renderStatusControl(room)}

                  {/* Edit button */}
                  <button
                    onClick={() => openEdit(room)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    {copy.editRoom}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {rooms.length > 0 && (
          <p className="text-center text-xs text-slate-400">
            {rooms.length} {copy.roomLabel} {copy.registered}
          </p>
        )}
      </main>

      {/* Slide-in Panel */}
      {panelMode !== "closed" && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="room-panel fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                {panelMode === "create" ? copy.addNewRoom : copy.editRoom}
              </h2>
              <button
                onClick={closePanel}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-6 [touch-action:pan-y]">
              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {copy.basicInfo}
                </h3>

                {/* Room name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    {copy.roomName} *
                  </label>
                  <input
                    type="text"
                    value={form.roomName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, roomName: e.target.value }))
                    }
                    placeholder={copy.roomNamePlaceholder}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>

                {/* Room type + Room number */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.roomType}
                    </label>
                    <select
                      value={form.roomType}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          roomType: e.target.value as RoomType,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    >
                      {(
                        ["STANDARD", "DELUXE", "PREMIUM", "SUITE", "FAMILY", "PENTHOUSE"] as RoomType[]
                      ).map(
                        (roomType) => (
                          <option key={roomType} value={roomType}>
                            {getRoomTypeLabel(roomType, t)}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.roomNumber}
                    </label>
                    <input
                      type="text"
                      value={form.roomNumber}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, roomNumber: e.target.value }))
                      }
                      placeholder={copy.roomNumberPlaceholder}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    {copy.description}
                  </label>
                  <textarea
                    rows={3}
                    value={form.roomDesc}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, roomDesc: e.target.value }))
                    }
                    placeholder={copy.roomDescriptionPlaceholder}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>
              </section>

              {/* Capacity & Bed */}
              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {copy.capacityAndBed}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Max occupancy */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.maxOccupancy} *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            maxOccupancy: Math.max(1, p.maxOccupancy - 1),
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {form.maxOccupancy}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            maxOccupancy: p.maxOccupancy + 1,
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total rooms */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.totalRooms} *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            totalRooms: Math.max(1, p.totalRooms - 1),
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {form.totalRooms}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            totalRooms: p.totalRooms + 1,
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Bed type */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.bedType}
                    </label>
                    <select
                      value={form.bedType}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          bedType: e.target.value as BedType,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    >
                      {(["SINGLE", "DOUBLE", "QUEEN", "KING", "TWIN"] as BedType[]).map((bedType) => (
                        <option key={bedType} value={bedType}>
                          {getBedTypeLabel(bedType, t)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bed count */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.bedCount}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            bedCount: Math.max(1, p.bedCount - 1),
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {form.bedCount}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, bedCount: p.bedCount + 1 }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {copy.pricing}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.basePrice} *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.basePrice || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          basePrice: Number(e.target.value),
                        }))
                      }
                      placeholder="100000"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.weekendSurcharge}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.weekendSurcharge || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          weekendSurcharge: Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Room details */}
              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {copy.roomDetails}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.roomSize}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.roomSize || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          roomSize: Number(e.target.value),
                        }))
                      }
                      placeholder={copy.roomSizePlaceholder}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {copy.viewType}
                    </label>
                    <select
                      value={form.viewType}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          viewType: e.target.value as ViewType,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    >
                      {(["NONE", "CITY", "OCEAN", "MOUNTAIN", "GARDEN"] as ViewType[]).map(
                        (viewType) => (
                          <option key={viewType} value={viewType}>
                            {getViewTypeLabel(viewType, t)}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>
              </section>

              {/* Room amenities */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {copy.roomAmenities}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {ROOM_AMENITY_OPTIONS.map(({ key, label }) => {
                    const active = form.roomAmenities.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAmenity(key)}
                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                          active
                            ? "border-slate-700 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {getRoomAmenityLabel(key, locale) ?? label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Room images */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {copy.roomImages}
                </h3>
                <ImageCollectionField
                  target="room"
                  value={form.roomImages}
                  onChange={(next) =>
                    setForm((previous) => ({ ...previous, roomImages: next }))
                  }
                  maxFiles={8}
                  description={copy.imageUrlsPerLine}
                />
              </section>
            </div>

            {/* Panel footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={closePanel}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {copy.cancel}
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={creating || updating}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {creating || updating
                  ? copy.saving
                  : panelMode === "create"
                    ? copy.addRoom
                    : copy.saveChanges}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

HotelRoomsPage.auth = {
  roles: ["AGENT", "ADMIN", "ADMIN_OPERATOR"],
  requireApprovedHostAccess: true,
};

export default HotelRoomsPage;

function getRoomAmenityLabel(key: string, locale: string): string | null {
  const labels = {
    AC: {
      en: "Air Conditioning",
      ko: "에어컨",
      ru: "Кондиционер",
      uz: "Konditsioner",
    },
    TV: {
      en: "TV",
      ko: "TV",
      ru: "ТВ",
      uz: "TV",
    },
    minibar: {
      en: "Minibar",
      ko: "미니바",
      ru: "Мини-бар",
      uz: "Minibar",
    },
    coffeemaker: {
      en: "Coffee Maker",
      ko: "커피메이커",
      ru: "Кофемашина",
      uz: "Qahva mashinasi",
    },
    hairdryer: {
      en: "Hair Dryer",
      ko: "헤어드라이어",
      ru: "Фен",
      uz: "Soch quritgich",
    },
    safe: {
      en: "In-room Safe",
      ko: "객실 금고",
      ru: "Сейф в номере",
      uz: "Xonadagi сейф",
    },
    bathtub: {
      en: "Bathtub",
      ko: "욕조",
      ru: "Ванна",
      uz: "Vanna",
    },
    balcony: {
      en: "Balcony",
      ko: "발코니",
      ru: "Балкон",
      uz: "Balkon",
    },
    workspace: {
      en: "Work Desk",
      ko: "업무용 책상",
      ru: "Рабочий стол",
      uz: "Ish stoli",
    },
    sofa: {
      en: "Sofa",
      ko: "소파",
      ru: "Диван",
      uz: "Divan",
    },
    kitchenette: {
      en: "Kitchenette",
      ko: "간이 주방",
      ru: "Мини-кухня",
      uz: "Kichik oshxona",
    },
    washer: {
      en: "Washer",
      ko: "세탁기",
      ru: "Стиральная машина",
      uz: "Kir yuvish mashinasi",
    },
  } as const;

  if (!(key in labels)) {
    return null;
  }

  const localeKey =
    locale === "ko" || locale === "ru" || locale === "uz" ? locale : "en";
  return labels[key as keyof typeof labels][localeKey];
}
