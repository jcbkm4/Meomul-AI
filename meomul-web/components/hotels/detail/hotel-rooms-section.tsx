import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BedDouble, Users, View } from "lucide-react";
import { ErrorNotice } from "@/components/ui/error-notice";
import { useI18n } from "@/lib/i18n/provider";
import { formatEnumLabel } from "@/lib/rooms/booking";
import { formatNumber } from "@/lib/utils/format";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type { RoomListItem } from "@/types/hotel";

interface HotelRoomsSectionProps {
  rooms: RoomListItem[];
  roomsLoading: boolean;
  roomsErrorMessage: string | null;
  hotelId: string;
}

export const HotelRoomsSection = memo(function HotelRoomsSection({
  rooms,
  roomsLoading,
  roomsErrorMessage,
  hotelId,
}: HotelRoomsSectionProps) {
  const { t } = useI18n();

  return (
    <section id="rooms" className="space-y-6 pt-2 sm:pt-4">
      <header className="space-y-2">
        <h2 className="text-[1.75rem] font-semibold tracking-tight text-stone-950 sm:text-[2rem]">
          {t("hotel_rooms_title")}
        </h2>
        <p className="text-base text-stone-600 sm:text-lg">{t("hotel_rooms_desc")}</p>
      </header>

      {roomsErrorMessage ? <ErrorNotice message={roomsErrorMessage} /> : null}

      {roomsLoading && rooms.length === 0 ? (
        <div className="text-lg text-stone-600">{t("hotel_rooms_loading")}</div>
      ) : null}

      {!roomsLoading && rooms.length === 0 ? (
        <div className="text-lg text-stone-600">{t("hotel_rooms_empty")}</div>
      ) : null}

      <div className="space-y-5">
        {rooms.map((room) => {
          const coverImage = resolveMediaUrl(room.roomImages[0]);
          const roomHref = `/rooms/${room._id}`;
          const bookingHref = `/bookings/new?hotelId=${hotelId}&roomId=${room._id}`;

          return (
            <article
              key={room._id}
              className="overflow-hidden rounded-[1.8rem] border border-stone-200 bg-white"
            >
              <div className="grid gap-0 md:grid-cols-[18rem_minmax(0,1fr)_auto]">
                <div className="relative min-h-[10rem] bg-stone-100 sm:min-h-[14rem]">
                  {coverImage ? (
                    <Image
                      src={coverImage}
                      alt={room.roomName}
                      fill
                      sizes="(min-width: 768px) 18rem, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="space-y-3 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6">
                  <div className="space-y-2">
                    <h3 className="text-[1.4rem] font-semibold tracking-tight text-stone-950 sm:text-[1.65rem]">
                      {room.roomName}
                    </h3>
                    <p className="text-base text-stone-600 sm:text-lg">
                      {formatEnumLabel(room.roomType)} ·{" "}
                      {room.viewType === "NONE"
                        ? t("room_card_no_specific_view")
                        : t("room_detail_view_suffix", { view: formatEnumLabel(room.viewType) })}
                    </p>
                    {room.roomNumber ? (
                      <p className="text-sm font-medium text-stone-500">
                        {t("room_detail_room_number", { number: room.roomNumber })}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-3 text-sm text-stone-700 sm:gap-5 sm:text-base">
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {room.maxOccupancy ? t("room_fact_guests_value", { count: room.maxOccupancy }) : t("room_card_not_specified")}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <BedDouble className="h-5 w-5" />
                      {room.bedType ? formatEnumLabel(room.bedType) : t("room_card_not_specified")}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <View className="h-5 w-5" />
                      {room.viewType === "NONE" ? t("room_card_no_specific_view") : formatEnumLabel(room.viewType)}
                    </span>
                  </div>

                  {room.roomDesc ? (
                    <p className="max-w-2xl text-sm leading-7 text-stone-700 sm:text-[1.02rem] sm:leading-8">
                      {room.roomDesc}
                    </p>
                  ) : null}

                  {room.roomAmenities?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {room.roomAmenities.slice(0, 4).map((amenity) => (
                        <span
                          key={`${room._id}-${amenity}`}
                          className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col justify-between border-t border-stone-200 px-4 py-4 sm:px-6 sm:py-6 md:border-l md:border-t-0">
                  <div className="text-left md:text-right">
                    <p className="text-[1.5rem] font-semibold tracking-tight text-stone-950 sm:text-[1.75rem]">
                      ₩{formatNumber(room.basePrice)}
                    </p>
                    <p className="text-sm text-stone-600 sm:text-base">/ night</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:mt-6">
                    <Link
                      href={bookingHref}
                      className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-stone-950 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 sm:min-h-[3.25rem] sm:text-base"
                    >
                      {t("hotel_detail_reserve")}
                    </Link>
                    <Link
                      href={roomHref}
                      className="inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-stone-300 px-5 text-sm font-semibold text-stone-950 sm:min-h-[3.25rem] sm:text-base"
                    >
                      {t("room_card_room_details")}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
});
