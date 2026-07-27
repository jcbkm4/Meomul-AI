import type { RoomHeroHighlight } from "@/components/rooms/detail/room-hero-section";
import type { RoomAmenityCard, RoomFactCard } from "@/components/rooms/detail/room-overview-section";
import { getBedTypeLabel, getRoomStatusLabel, getRoomTypeLabel, getViewTypeLabel } from "@/lib/hotels/hotels-i18n";
import type { TranslationKey } from "@/lib/i18n/messages";
import { formatAmenityLabel, formatIsoDate } from "@/lib/rooms/booking";
import { formatNumber } from "@/lib/utils/format";
import type { RoomDetailItem } from "@/types/hotel";

type DetailIconName = RoomFactCard["icon"] | RoomAmenityCard["icon"];
type AmenityTone = "sky" | "emerald" | "amber" | "violet" | "rose" | "slate";

const resolveAmenityIcon = (amenity: string): DetailIconName => {
  const value = amenity.toLowerCase();
  if (value.includes("wifi") || value.includes("internet")) return "wifi";
  if (value.includes("restaurant") || value.includes("breakfast") || value.includes("kitchen") || value.includes("coffee")) return "food";
  if (value.includes("service") || value.includes("clean") || value.includes("laundry") || value.includes("room")) return "service";
  if (value.includes("access") || value.includes("wheelchair") || value.includes("elevator") || value.includes("bathroom")) return "access";
  if (value.includes("parking") || value.includes("shuttle") || value.includes("charging")) return "parking";
  if (value.includes("tv") || value.includes("stream") || value.includes("spa") || value.includes("pool")) return "entertainment";
  return "default";
};

const resolveAmenityTone = (icon: DetailIconName): AmenityTone => {
  if (icon === "wifi" || icon === "access") return "sky";
  if (icon === "service" || icon === "default") return "emerald";
  if (icon === "food" || icon === "surcharge") return "amber";
  if (icon === "entertainment" || icon === "view") return "violet";
  if (icon === "clock" || icon === "eyes") return "rose";
  return "slate";
};

const amenityToneStyles: Record<AmenityTone, { card: string; icon: string; badge: string }> = {
  sky: {
    card: "border-sky-200/80 bg-gradient-to-br from-sky-50 to-cyan-50",
    icon: "border-sky-200 bg-white text-sky-700",
    badge: "border-sky-300 bg-white text-sky-700",
  },
  emerald: {
    card: "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-lime-50",
    icon: "border-emerald-200 bg-white text-emerald-700",
    badge: "border-emerald-300 bg-white text-emerald-700",
  },
  amber: {
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50",
    icon: "border-amber-200 bg-white text-amber-700",
    badge: "border-amber-300 bg-white text-amber-700",
  },
  violet: {
    card: "border-violet-200/80 bg-gradient-to-br from-violet-50 to-fuchsia-50",
    icon: "border-violet-200 bg-white text-violet-700",
    badge: "border-violet-300 bg-white text-violet-700",
  },
  rose: {
    card: "border-rose-200/80 bg-gradient-to-br from-rose-50 to-pink-50",
    icon: "border-rose-200 bg-white text-rose-700",
    badge: "border-rose-300 bg-white text-rose-700",
  },
  slate: {
    card: "border-slate-200/80 bg-gradient-to-br from-slate-50 to-white",
    icon: "border-slate-200 bg-white text-slate-700",
    badge: "border-slate-300 bg-white text-slate-700",
  },
};

export interface RoomPresentationData {
  roomTypeLabel: string;
  viewTypeLabel: string;
  roomTypeLine: string;
  roomFactCards: RoomFactCard[];
  roomHeroHighlights: RoomHeroHighlight[];
  roomAmenityCards: RoomAmenityCard[];
}

type Translator = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

export const getRoomPresentation = (
  room: RoomDetailItem | undefined,
  t: Translator,
): RoomPresentationData => {
  if (!room) {
    return {
      roomTypeLabel: "",
      viewTypeLabel: "",
      roomTypeLine: "",
      roomFactCards: [],
      roomHeroHighlights: [],
      roomAmenityCards: [],
    };
  }

  const roomTypeLabel = getRoomTypeLabel(room.roomType, t);
  const viewTypeLabel = getViewTypeLabel(room.viewType, t);
  const roomTypeLine = `${roomTypeLabel}${room.roomNumber ? ` · #${room.roomNumber}` : ""}`;

  const roomFactCards: RoomFactCard[] = [
    { label: t("room_fact_capacity"), value: t("room_fact_guests_value", { count: room.maxOccupancy }), icon: "capacity" },
    { label: t("room_fact_bed_setup"), value: t("room_fact_bed_value", { count: room.bedCount, bedType: getBedTypeLabel(room.bedType, t) }), icon: "bed" },
    { label: t("room_fact_view"), value: t("room_detail_view_suffix", { view: viewTypeLabel }), icon: "view" },
    { label: t("room_fact_size"), value: `${room.roomSize} m²`, icon: "size" },
    { label: t("room_fact_status"), value: getRoomStatusLabel(room.roomStatus, t), icon: "status" },
    { label: t("room_fact_inventory"), value: t("room_fact_inventory_value", { count: room.totalRooms, mode: t("room_fact_inventory_date_based") }), icon: "inventory" },
    { label: t("room_fact_weekend_addon"), value: `₩ ${formatNumber(room.weekendSurcharge)}`, icon: "surcharge" },
    { label: t("room_fact_updated"), value: formatIsoDate(room.updatedAt), icon: "clock" },
  ];

  const roomHeroHighlights: RoomHeroHighlight[] = [
    { label: t("room_highlight_guests"), value: `${room.maxOccupancy}`, icon: "capacity" },
    { label: t("room_highlight_size"), value: `${room.roomSize}m²`, icon: "size" },
    { label: t("room_highlight_beds"), value: `${room.bedCount}`, icon: "bed" },
    { label: t("room_highlight_units"), value: `${room.totalRooms}`, icon: "inventory" },
  ];

  const roomAmenityCards: RoomAmenityCard[] = (room.roomAmenities ?? []).map((amenity) => {
    const icon = resolveAmenityIcon(amenity);
    const tone = resolveAmenityTone(icon);
    return {
      amenity,
      label: formatAmenityLabel(amenity),
      icon,
      styles: amenityToneStyles[tone],
    };
  });

  return {
    roomTypeLabel,
    viewTypeLabel,
    roomTypeLine,
    roomFactCards,
    roomHeroHighlights,
    roomAmenityCards,
  };
};
