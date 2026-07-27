import { memo } from "react";
import { DetailIcon } from "@/components/rooms/detail/detail-icon";
import type { RoomAmenityCard } from "@/components/rooms/detail/room-overview-section";
import { useI18n } from "@/lib/i18n/provider";

interface RoomAmenitiesSectionProps {
  amenityCards: RoomAmenityCard[];
}

export const RoomAmenitiesSection = memo(function RoomAmenitiesSection({
  amenityCards,
}: RoomAmenitiesSectionProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-6 sm:space-y-7">
      <div>
        <h2 className="text-[1.7rem] font-semibold tracking-tight text-stone-950 sm:text-[2rem]">
          {t("room_detail_amenities_title")}
        </h2>
        <p className="mt-1 text-sm text-stone-600 sm:text-base">{t("room_detail_amenities_desc")}</p>
      </div>

      {amenityCards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {amenityCards.map((item) => (
            <article key={item.amenity} className="flex items-start gap-4 rounded-[1.35rem] border border-stone-200 bg-white px-4 py-4">
              <DetailIcon name={item.icon} className="mt-1 h-5 w-5 shrink-0 text-stone-950 sm:h-6 sm:w-6" />
              <div>
                <p className="text-base font-semibold text-stone-950">{item.label}</p>
                <p className="mt-1 text-sm text-stone-600">{t("room_detail_ready_to_use")}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone-600">{t("room_detail_no_amenities")}</p>
      )}
    </section>
  );
});
