import { memo } from "react";
import { CalendarX2, KeyRound, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { HotelDetailItem } from "@/types/hotel";

interface HotelThingsToKnowSectionProps {
  hotel: HotelDetailItem;
  cancellationPolicyText: string;
}

export const HotelThingsToKnowSection = memo(function HotelThingsToKnowSection({
  hotel,
  cancellationPolicyText,
}: HotelThingsToKnowSectionProps) {
  const { t } = useI18n();

  const safetyItems = [
    hotel.safetyFeatures.securityCameras ? t("hotel_things_security_cameras") : null,
    hotel.safetyFeatures.fireSafety ? t("hotel_things_fire_safety") : null,
    hotel.safetyFeatures.frontDesk24h ? t("hotel_things_frontdesk") : null,
    hotel.safetyFeatures.roomSafe ? t("hotel_things_room_safe") : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <section id="things-to-know" className="pt-2 sm:pt-4">
      <h2 className="text-[1.75rem] font-semibold tracking-tight text-stone-950 sm:text-[2rem]">
        {t("hotel_things_title")}
      </h2>

      <div className="mt-6 grid gap-8 sm:mt-8 lg:grid-cols-3">
        <article className="space-y-4">
          <CalendarX2 className="h-7 w-7 text-stone-950" />
          <div className="space-y-2">
            <h3 className="text-[1.4rem] font-semibold tracking-tight text-stone-950 sm:text-[1.75rem]">
              {t("hotel_things_cancellation")}
            </h3>
            <p className="text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{cancellationPolicyText}</p>
          </div>
        </article>

        <article className="space-y-4">
          <KeyRound className="h-7 w-7 text-stone-950" />
          <div className="space-y-2">
            <h3 className="text-[1.4rem] font-semibold tracking-tight text-stone-950 sm:text-[1.75rem]">
              {t("hotel_things_house_rules")}
            </h3>
            <p className="text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
              {t("hotel_things_checkin_line", {
                checkIn: hotel.checkInTime || "—",
                checkOut: hotel.checkOutTime || "—",
              })}
            </p>
            <p className="text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
              {hotel.petsAllowed ? t("hotel_features_pets_yes") : t("hotel_features_pets_no")} ·{" "}
              {hotel.smokingAllowed ? t("hotel_features_smoking_yes") : t("hotel_features_smoking_no")}
            </p>
          </div>
        </article>

        <article className="space-y-4">
          <Shield className="h-7 w-7 text-stone-950" />
          <div className="space-y-2">
            <h3 className="text-[1.4rem] font-semibold tracking-tight text-stone-950 sm:text-[1.75rem]">
              {t("hotel_things_safety")}
            </h3>
            {safetyItems.length > 0 ? (
              <div className="space-y-1.5 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                {safetyItems.slice(0, 3).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            ) : (
              <p className="text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{t("hotel_things_safety_standard")}</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
});
