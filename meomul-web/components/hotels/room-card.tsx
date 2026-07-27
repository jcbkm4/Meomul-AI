import { memo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useI18n } from "@/lib/i18n/provider";
import { formatAmenityLabel, formatEnumLabel } from "@/lib/rooms/booking";
import { formatNumber } from "@/lib/utils/format";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type { RoomListItem } from "@/types/hotel";

interface RoomCardProps {
  room: RoomListItem;
  hotelId?: string;
}

type Translate = ReturnType<typeof useI18n>["t"];

const getAvailabilityBadge = (
  availableRooms: number,
  t: Translate,
): { label: string; className: string } => {
  if (availableRooms <= 0) {
    return {
      label: t("room_card_sold_out"),
      className: "border border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (availableRooms <= 2) {
    return {
      label: t("room_card_left_high_demand", { count: availableRooms }),
      className: "border border-rose-200 bg-rose-100 text-rose-700",
    };
  }

  if (availableRooms <= 5) {
    return {
      label: t("room_card_left", { count: availableRooms }),
      className: "border border-amber-200 bg-amber-100 text-amber-800",
    };
  }

  return {
    label: t("room_card_left", { count: availableRooms }),
    className: "border border-emerald-200 bg-emerald-100 text-emerald-800",
  };
};

export const RoomCard = memo(function RoomCard({ room, hotelId }: RoomCardProps) {
  const { t } = useI18n();
  const router = useRouter();
  const hasPrefetchedRoomRef = useRef(false);
  const hasPrefetchedBookingRef = useRef(false);
  const coverImage = resolveMediaUrl(room.roomImages[0]);
  const roomHref = `/rooms/${room._id}`;
  const bookingHref = hotelId ? `/bookings/new?hotelId=${hotelId}&roomId=${room._id}` : "";
  const amenityTags = (room.roomAmenities ?? []).slice(0, 4).map((amenity) => formatAmenityLabel(amenity));
  const extraAmenities = Math.max(0, (room.roomAmenities?.length ?? 0) - amenityTags.length);
  const roomTypeLabel = formatEnumLabel(room.roomType);
  const viewTypeLabel =
    room.viewType === "NONE"
      ? t("room_card_no_specific_view")
      : t("room_detail_view_suffix", { view: formatEnumLabel(room.viewType) });
  const availabilityBadge = getAvailabilityBadge(room.availableRooms, t);
  const isBookable = room.roomStatus === "AVAILABLE" && room.availableRooms > 0;
  const deal = room.lastMinuteDeal?.isActive ? room.lastMinuteDeal : null;
  const nightlyPrice = deal?.dealPrice ?? room.basePrice;
  const originalPrice = deal?.originalPrice ?? room.basePrice;
  const hasDiscount = Boolean(deal && originalPrice > nightlyPrice);
  const bedLine =
    typeof room.bedCount === "number" && room.bedType
      ? `${room.bedCount} x ${formatEnumLabel(room.bedType)}`
      : t("room_card_not_specified");
  const capacityLine =
    typeof room.maxOccupancy === "number"
      ? t("room_fact_guests_value", { count: room.maxOccupancy })
      : t("room_card_not_specified");
  const sizeLine =
    typeof room.roomSize === "number" && room.roomSize > 0
      ? `${room.roomSize} m2`
      : t("room_card_not_specified");
  const statusLine = formatEnumLabel(room.roomStatus);

  const handlePrefetchRoomIntent = useCallback(() => {
    if (hasPrefetchedRoomRef.current) {
      return;
    }
    hasPrefetchedRoomRef.current = true;
    void router.prefetch(roomHref);
  }, [roomHref, router]);

  const handlePrefetchBookingIntent = useCallback(() => {
    if (!bookingHref || hasPrefetchedBookingRef.current) {
      return;
    }
    hasPrefetchedBookingRef.current = true;
    void router.prefetch(bookingHref);
  }, [bookingHref, router]);

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover-lift">
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="relative h-56 bg-slate-200 sm:h-64 lg:h-full">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={room.roomName}
              fill
              sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
              {t("room_card_no_image")}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/40 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              {roomTypeLabel}
            </span>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${availabilityBadge.className}`}>
              {availabilityBadge.label}
            </span>
          </div>

          {deal ? (
            <span className="absolute right-4 top-4 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
              {deal.discountPercent}% off
            </span>
          ) : null}

          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">{t("room_card_nightly_rate")}</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">KRW {formatNumber(nightlyPrice)}</p>
              {hasDiscount ? (
                <p className="text-xs font-medium text-slate-200 line-through">KRW {formatNumber(originalPrice)}</p>
              ) : null}
            </div>

            {typeof room.currentViewers === "number" && room.currentViewers > 0 ? (
              <p className="rounded-full border border-white/35 bg-black/30 px-3 py-1 text-xs font-semibold text-white">
                {t("room_card_viewing_now", { count: room.currentViewers })}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-6">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">{room.roomName}</h3>
            <p className="mt-2 text-sm font-medium text-slate-600">{viewTypeLabel}</p>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t("room_card_guests")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{capacityLine}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t("room_card_bed_setup")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{bedLine}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t("room_card_room_size")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{sizeLine}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t("room_card_status")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{statusLine}</p>
            </div>
          </div>

          {amenityTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {amenityTags.map((amenity) => (
                <span
                  key={`${room._id}-${amenity}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {amenity}
                </span>
              ))}
              {extraAmenities > 0 ? (
                <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {t("room_card_more", { count: extraAmenities })}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
            <Link
              href={roomHref}
              prefetch={false}
              onMouseEnter={handlePrefetchRoomIntent}
              onFocus={handlePrefetchRoomIntent}
              className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
            >
              {t("room_card_room_details")}
            </Link>

            {hotelId && isBookable ? (
              <Link
                href={bookingHref}
                prefetch={false}
                onMouseEnter={handlePrefetchBookingIntent}
                onFocus={handlePrefetchBookingIntent}
                className="inline-flex rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {t("room_card_book_now")}
              </Link>
            ) : (
              <span className="inline-flex rounded-xl border border-slate-200 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-500">
                {t("room_card_unavailable_now")}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});
