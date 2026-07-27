import Link from "next/link";
import { memo, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/utils/format";
import type { RoomListItem } from "@/types/hotel";

interface HotelBookingAsideProps {
  hotelId: string;
  rooms: RoomListItem[];
  fromPrice: number;
  cancellationPolicyText: string;
}

export const HotelBookingAside = memo(function HotelBookingAside({
  hotelId,
  rooms,
  fromPrice,
  cancellationPolicyText,
}: HotelBookingAsideProps) {
  const { t } = useI18n();

  const firstBookableRoom = useMemo(
    () => rooms.find((room) => room.roomStatus === "AVAILABLE" && room.availableRooms > 0) ?? null,
    [rooms],
  );
  const displayPrice = firstBookableRoom?.lastMinuteDeal?.isActive
    ? firstBookableRoom.lastMinuteDeal.dealPrice
    : fromPrice;
  const originalPrice = firstBookableRoom?.lastMinuteDeal?.isActive
    ? firstBookableRoom.lastMinuteDeal.originalPrice
    : 0;
  const guestCount = useMemo(
    () =>
      rooms.reduce((max, room) => Math.max(max, room.maxOccupancy ?? 0), 0) || 2,
    [rooms],
  );
  const bookingHref = firstBookableRoom
    ? `/bookings/new?hotelId=${hotelId}&roomId=${firstBookableRoom._id}`
    : "#rooms";

  return (
    <aside className="xl:sticky xl:top-24">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.32)]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-end gap-2">
            {originalPrice > displayPrice ? (
              <p className="text-[1.2rem] font-medium text-stone-500 line-through">
                ₩{formatNumber(originalPrice)}
              </p>
            ) : null}
            <p className="text-[1.15rem] font-semibold text-stone-950">
              ₩{displayPrice > 0 ? formatNumber(displayPrice) : "—"} total
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-900">
          <div className="grid grid-cols-2">
            <div className="border-b border-r border-stone-300 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {t("hotels_field_checkin")}
              </p>
              <p className="mt-1 text-base font-semibold text-stone-950">{t("hotels_summary_add_dates")}</p>
            </div>
            <div className="border-b border-stone-300 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {t("hotels_field_checkout")}
              </p>
              <p className="mt-1 text-base font-semibold text-stone-950">{t("hotels_summary_add_dates")}</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {t("hotels_field_guests")}
              </p>
              <p className="mt-1 text-base font-semibold text-stone-950">
                {t("hotels_summary_guests", { count: guestCount, suffix: guestCount === 1 ? "" : "s" })}
              </p>
            </div>
            <ChevronDown className="h-5 w-5 text-stone-700" />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-stone-100 px-4 py-3 text-center text-sm font-medium text-stone-700">
          {cancellationPolicyText}
        </div>

        <Link
          href={bookingHref}
          className="mt-6 inline-flex min-h-[3.75rem] w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,#ff385c_0%,#e61e4d_48%,#d70466_100%)] px-5 text-lg font-semibold text-white transition hover:opacity-95"
        >
          {firstBookableRoom ? t("hotel_detail_reserve") : t("hotel_detail_see_rooms")}
        </Link>

        <p className="mt-5 text-center text-sm text-stone-600">{t("hotel_detail_no_charge_yet")}</p>
      </div>
    </aside>
  );
});
