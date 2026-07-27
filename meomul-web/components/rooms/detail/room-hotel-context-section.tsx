import { memo, useMemo } from "react";
import {
  BellRing,
  CarFront,
  Clock3,
  ConciergeBell,
  Flame,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sparkles,
  TrainFront,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { getStayPurposeLabel } from "@/lib/hotels/hotels-i18n";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/utils/format";
import type { HotelContextItem } from "@/types/hotel";

interface RoomHotelContextSectionProps {
  hotel?: HotelContextItem;
}

type FactCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

interface ContextGroupProps {
  title: string;
  children: React.ReactNode;
  bordered?: boolean;
}

function ContextGroup({ title, children, bordered = true }: ContextGroupProps) {
  return (
    <div className={`space-y-4 ${bordered ? "border-t border-stone-200 pt-6 sm:pt-7" : ""}`}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">{title}</h3>
      {children}
    </div>
  );
}

type SafetyItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

export const RoomHotelContextSection = memo(function RoomHotelContextSection({
  hotel,
}: RoomHotelContextSectionProps) {
  const { t } = useI18n();

  const locationCards = useMemo<FactCard[]>(() => {
    if (!hotel) {
      return [];
    }

    const districtParts = [hotel.detailedLocation.district, hotel.detailedLocation.dong, hotel.detailedLocation.city]
      .filter(Boolean)
      .join(" · ");

    const transitParts = [
      hotel.detailedLocation.nearestSubway,
      hotel.detailedLocation.subwayExit ? t("room_hotel_context_exit", { value: hotel.detailedLocation.subwayExit }) : "",
      hotel.detailedLocation.subwayLines?.length ? hotel.detailedLocation.subwayLines.join(", ") : "",
      typeof hotel.detailedLocation.walkingDistance === "number"
        ? t("hotel_location_walk_minutes", { count: hotel.detailedLocation.walkingDistance })
        : "",
    ].filter(Boolean);

    const cards: FactCard[] = [];

    if (districtParts) {
      cards.push({
        title: t("room_hotel_context_neighborhood"),
        body: districtParts,
        icon: MapPin,
      });
    }

    if (transitParts.length) {
      cards.push({
        title: t("room_hotel_context_transit"),
        body: transitParts.join(" · "),
        icon: TrainFront,
      });
    }

    if (hotel.detailedLocation.address) {
      cards.push({
        title: t("hotel_features_address"),
        body: hotel.detailedLocation.address,
        icon: MapPin,
      });
    }

    return cards;
  }, [hotel, t]);

  const policyCards = useMemo<FactCard[]>(() => {
    if (!hotel) {
      return [];
    }

    const flexCheckInNote = hotel.flexibleCheckIn.enabled
      ? [
          hotel.flexibleCheckIn.times?.length ? hotel.flexibleCheckIn.times.join(", ") : "",
          hotel.flexibleCheckIn.fee > 0 ? `₩ ${formatNumber(hotel.flexibleCheckIn.fee)}` : t("room_hotel_context_no_extra_fee"),
        ]
          .filter(Boolean)
          .join(" · ")
      : t("room_hotel_context_standard_only");

    const flexCheckOutNote = hotel.flexibleCheckOut.enabled
      ? [
          hotel.flexibleCheckOut.times?.length ? hotel.flexibleCheckOut.times.join(", ") : "",
          hotel.flexibleCheckOut.fee > 0 ? `₩ ${formatNumber(hotel.flexibleCheckOut.fee)}` : t("room_hotel_context_no_extra_fee"),
        ]
          .filter(Boolean)
          .join(" · ")
      : t("room_hotel_context_standard_only");

    return [
      {
        title: t("room_hotel_context_checkin_support"),
        body: `${hotel.checkInTime} · ${flexCheckInNote}`,
        icon: Clock3,
      },
      {
        title: t("room_hotel_context_checkout_support"),
        body: `${hotel.checkOutTime} · ${flexCheckOutNote}`,
        icon: Clock3,
      },
      {
        title: t("room_detail_cancellation"),
        body: hotel.cancellationPolicy,
        icon: ShieldCheck,
      },
      {
        title: t("room_hotel_context_pet_policy"),
        body: hotel.petsAllowed
          ? hotel.maxPetWeight
            ? `${t("room_hotel_context_pets_allowed")} · ${t("room_hotel_context_pet_limit", { value: hotel.maxPetWeight })}`
            : t("room_hotel_context_pets_allowed")
          : t("room_hotel_context_pets_not_allowed"),
        icon: PawPrint,
      },
      {
        title: t("room_hotel_context_smoking_policy"),
        body: hotel.smokingAllowed ? t("room_hotel_context_smoking_allowed") : t("room_hotel_context_smoking_not_allowed"),
        icon: Flame,
      },
      {
        title: t("room_hotel_context_minimum_age"),
        body: t("room_hotel_context_age_value", { value: hotel.ageRestriction }),
        icon: UserRoundCheck,
      },
    ];
  }, [hotel, t]);

  const safetyItems = useMemo<SafetyItem[]>(() => {
    if (!hotel) {
      return [];
    }

    return [
      hotel.safeStayCertified
        ? { key: "safeStayCertified", label: t("hotel_detail_safe_stay"), icon: ShieldCheck }
        : null,
      hotel.safetyFeatures.securityCameras
        ? { key: "securityCameras", label: t("hotel_things_security_cameras"), icon: BellRing }
        : null,
      hotel.safetyFeatures.fireSafety
        ? { key: "fireSafety", label: t("hotel_things_fire_safety"), icon: Flame }
        : null,
      hotel.safetyFeatures.frontDesk24h
        ? { key: "frontDesk24h", label: t("hotel_things_frontdesk"), icon: ConciergeBell }
        : null,
      hotel.safetyFeatures.roomSafe
        ? { key: "roomSafe", label: t("hotel_things_room_safe"), icon: ShieldCheck }
        : null,
      hotel.safetyFeatures.femaleOnlyFloors
        ? { key: "femaleOnlyFloors", label: t("room_hotel_context_female_only"), icon: UserRoundCheck }
        : null,
      hotel.safetyFeatures.wellLitParking
        ? { key: "wellLitParking", label: t("room_hotel_context_lit_parking"), icon: CarFront }
        : null,
    ].filter((value): value is SafetyItem => Boolean(value));
  }, [hotel, t]);

  const suitableForLabels = useMemo(
    () => (hotel?.suitableFor ?? []).map((value) => getStayPurposeLabel(value, t)),
    [hotel?.suitableFor, t],
  );

  if (!hotel) {
    return null;
  }

  return (
    <section className="space-y-6 sm:space-y-7">
      <div>
        <h2 className="text-[1.7rem] font-semibold tracking-tight text-stone-950 sm:text-[2rem]">
          {t("room_hotel_context_title")}
        </h2>
        <p className="mt-1 text-sm text-stone-600 sm:text-base">{t("room_hotel_context_desc")}</p>
      </div>

      {safetyItems.length > 0 ? (
        <ContextGroup title={t("room_hotel_context_safety_title")} bordered={false}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {safetyItems.map((item) => (
              <article key={item.key} className="flex items-start gap-4 py-1">
                <item.icon className="mt-1 h-6 w-6 shrink-0 text-stone-950" />
                <p className="text-base font-semibold leading-6 text-stone-950">{item.label}</p>
              </article>
            ))}
          </div>
        </ContextGroup>
      ) : null}

      {locationCards.length > 0 ? (
        <ContextGroup title={t("room_hotel_context_location_title")}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {locationCards.map((item) => (
              <article key={item.title} className="flex items-start gap-4 py-1">
                <item.icon className="mt-1 h-5 w-5 shrink-0 text-stone-950 sm:h-6 sm:w-6" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{item.title}</p>
                  <p className="mt-1 text-base font-semibold leading-6 text-stone-950">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </ContextGroup>
      ) : null}

      <ContextGroup title={t("room_hotel_context_policy_title")}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {policyCards.map((item) => (
            <article key={item.title} className="flex items-start gap-4 py-1">
              <item.icon className="mt-1 h-5 w-5 shrink-0 text-stone-950 sm:h-6 sm:w-6" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{item.title}</p>
                <p className="mt-1 text-base font-semibold leading-6 text-stone-950">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </ContextGroup>

      {suitableForLabels.length > 0 ? (
        <ContextGroup title={t("room_hotel_context_best_for")}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {suitableForLabels.map((label) => (
              <article key={label} className="flex items-start gap-4 py-1">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-stone-950 sm:h-6 sm:w-6" />
                <p className="text-base font-semibold text-stone-950">{label}</p>
              </article>
            ))}
          </div>
        </ContextGroup>
      ) : null}
    </section>
  );
});
