import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Accessibility,
  Baby,
  Bath,
  BedDouble,
  BellRing,
  BatteryCharging,
  CarFront,
  Coffee,
  Dumbbell,
  HandPlatter,
  Heart,
  ArrowUpDown,
  PawPrint,
  Plane,
  Presentation,
  ShowerHead,
  Trees,
  UtensilsCrossed,
  Wifi,
  Waves,
  X,
} from "lucide-react";
import { getHotelAmenityLabel } from "@/lib/hotels/hotels-i18n";
import { useI18n } from "@/lib/i18n/provider";
import type { HotelAmenityKey, HotelDetailItem } from "@/types/hotel";

interface HotelAmenitiesSectionProps {
  hotel: HotelDetailItem;
}

const amenityIcons: Partial<Record<HotelAmenityKey, typeof Wifi>> = {
  wifi: Wifi,
  parking: CarFront,
  breakfast: UtensilsCrossed,
  breakfastIncluded: Coffee,
  workspace: Presentation,
  privateBath: ShowerHead,
  restaurant: UtensilsCrossed,
  gym: Dumbbell,
  meetingRoom: Presentation,
  coupleRoom: Heart,
  romanticView: Waves,
  familyRoom: BedDouble,
  kidsFriendly: Baby,
  playground: Trees,
  pool: Waves,
  spa: Bath,
  roomService: HandPlatter,
  airportShuttle: Plane,
  evCharging: BatteryCharging,
  wheelchairAccessible: Accessibility,
  elevator: ArrowUpDown,
  accessibleBathroom: Bath,
  visualAlarms: BellRing,
  serviceAnimalsAllowed: PawPrint,
};

const amenityOrder: HotelAmenityKey[] = [
  "wifi",
  "workspace",
  "meetingRoom",
  "breakfast",
  "breakfastIncluded",
  "restaurant",
  "roomService",
  "parking",
  "evCharging",
  "airportShuttle",
  "gym",
  "pool",
  "spa",
  "privateBath",
  "accessibleBathroom",
  "wheelchairAccessible",
  "elevator",
  "visualAlarms",
  "serviceAnimalsAllowed",
  "familyRoom",
  "kidsFriendly",
  "playground",
  "coupleRoom",
  "romanticView",
];

export const HotelAmenitiesSection = memo(function HotelAmenitiesSection({
  hotel,
}: HotelAmenitiesSectionProps) {
  const { t } = useI18n();
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!showAmenitiesModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAmenitiesModal]);

  const amenityEntries = useMemo(() => {
    return amenityOrder
      .filter((key) => hotel.amenities[key] === true)
      .map((amenityKey) => {
        const Icon = amenityIcons[amenityKey] ?? Wifi;
        return {
          key: amenityKey,
          icon: Icon,
          label: getHotelAmenityLabel(amenityKey, t),
        };
      });
  }, [hotel.amenities, t]);

  const visibleAmenities = amenityEntries.slice(0, 10);

  return (
    <section id="amenities" className="space-y-8">
      <h3 className="text-[1.8rem] font-semibold tracking-tight text-stone-950 sm:text-[2.1rem]">
        {t("hotel_airbnb_amenities")}
      </h3>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:gap-x-16 sm:gap-y-6">
        {visibleAmenities.map((amenity) => {
          const Icon = amenity.icon;
          return (
            <div key={amenity.key} className="flex items-center gap-4">
              <Icon className="h-6 w-6 shrink-0 text-stone-950 sm:h-7 sm:w-7" strokeWidth={1.9} />
              <p className="text-base text-stone-900 sm:text-[1.05rem]">{amenity.label}</p>
            </div>
          );
        })}
      </div>

      {amenityEntries.length > 0 ? (
        <button
          type="button"
          onClick={() => setShowAmenitiesModal(true)}
          className="inline-flex rounded-2xl border border-stone-950 px-5 py-3 text-base font-semibold text-stone-950 transition hover:bg-stone-50 sm:px-6 sm:py-4 sm:text-[1.05rem]"
        >
          {t("hotel_airbnb_show_all_amenities", { count: amenityEntries.length })}
        </button>
      ) : null}

      {showAmenitiesModal && portalReady
        ? createPortal(
            <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/18 px-3 py-5 sm:px-4 sm:py-12">
              <button
                type="button"
                aria-label="Close amenities"
                className="absolute inset-0"
                onClick={() => setShowAmenitiesModal(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="hotel-amenities-modal-title"
                className="relative z-10 flex max-h-[86vh] w-full max-w-[58rem] flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_24px_70px_-30px_rgba(0,0,0,0.3)] sm:rounded-[2rem]"
              >
                <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-8 sm:pb-4 sm:pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAmenitiesModal(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="w-10" />
                </div>

                <div className="overflow-y-auto px-4 pb-5 sm:px-8 sm:pb-8">
                  <h4
                    id="hotel-amenities-modal-title"
                    className="text-[1.8rem] font-semibold tracking-tight text-stone-950 sm:text-[2.1rem]"
                  >
                    {t("hotel_airbnb_amenities")}
                  </h4>

                  <div className="mt-8 space-y-3">
                    {amenityEntries.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                    <div
                      key={`modal-${amenity.key}`}
                      className="flex items-center gap-4 rounded-2xl border border-stone-200 px-5 py-4"
                    >
                      <Icon className="h-7 w-7 shrink-0 text-stone-950" strokeWidth={1.9} />
                      <div className="min-w-0">
                        <p className="text-[1.05rem] text-stone-900">{amenity.label}</p>
                      </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
});
