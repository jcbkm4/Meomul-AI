import { memo, useMemo, useState } from "react";
import { BadgeCheck, CarFront, MapPin, ShieldCheck, TrainFront, Wifi } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { HotelDetailItem } from "@/types/hotel";

interface HotelFeaturesSectionProps {
  hotel: HotelDetailItem;
}

export const HotelFeaturesSection = memo(function HotelFeaturesSection({
  hotel,
}: HotelFeaturesSectionProps) {
  const { t } = useI18n();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const highlightItems = useMemo(() => {
    const items: Array<{ icon: typeof Wifi; title: string; description: string }> = [];

    items.push({
      icon: MapPin,
      title: t("hotel_airbnb_highlight_area"),
      description:
        hotel.detailedLocation?.district || hotel.detailedLocation?.address || t("hotel_location_desc"),
    });

    if (hotel.detailedLocation?.nearestSubway) {
      items.push({
        icon: TrainFront,
        title: t("hotel_airbnb_highlight_transit"),
        description: hotel.detailedLocation.nearestSubway,
      });
    }

    if (hotel.amenities.parking) {
      items.push({
        icon: CarFront,
        title: t("hotel_airbnb_highlight_parking"),
        description: t("hotel_airbnb_highlight_parking_desc"),
      });
    }

    if (hotel.safeStayCertified || hotel.safetyFeatures.frontDesk24h) {
      items.push({
        icon: ShieldCheck,
        title: t("hotel_airbnb_highlight_safety"),
        description: t("hotel_airbnb_highlight_safety_desc"),
      });
    }

    return items.slice(0, 4);
  }, [hotel, t]);

  return (
    <section id="features" className="space-y-7 sm:space-y-10">
      <div className="border-b border-stone-200 pb-8">
        <h2 className="text-[1.8rem] font-semibold tracking-tight text-stone-950 sm:text-[2.2rem]">
          {t("hotel_airbnb_intro_title", {
            district: hotel.detailedLocation?.district || hotel.hotelLocation,
          })}
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-950">
            <BadgeCheck className="h-4 w-4" />
            <span>
              {hotel.verificationStatus === "VERIFIED"
                ? t("hotel_detail_badge_verified")
                : t("hotel_detail_badge_pending")}
            </span>
          </div>
          {hotel.safeStayCertified ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-950">
              <ShieldCheck className="h-4 w-4" />
              <span>{t("hotel_detail_safe_stay")}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={`border-b border-stone-200 pb-8 ${
          highlightItems.length > 2 ? "grid gap-6 sm:grid-cols-2" : "space-y-6"
        }`}
      >
        {highlightItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-4">
              <Icon className="mt-1 h-5 w-5 shrink-0 text-stone-950 sm:h-6 sm:w-6" />
              <div>
                <p className="text-lg font-semibold tracking-tight text-stone-950 sm:text-[1.15rem]">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-7 text-stone-600 sm:text-[1.02rem] sm:leading-8">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-5 pb-2">
        <div className="space-y-4">
          <p className={`text-base leading-7 text-stone-800 sm:text-[1.05rem] sm:leading-8 ${showFullDescription ? "" : "line-clamp-5"}`}>
            {hotel.hotelDesc}
          </p>
          <button
            type="button"
            onClick={() => setShowFullDescription((prev) => !prev)}
            className="text-sm font-semibold underline underline-offset-2 sm:text-[1.02rem]"
          >
            {showFullDescription ? t("hotel_airbnb_show_less") : t("hotel_airbnb_show_more")}
          </button>
        </div>
      </div>
    </section>
  );
});
