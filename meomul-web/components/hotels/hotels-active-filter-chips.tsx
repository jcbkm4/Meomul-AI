import {
  formatHotelDateSummaryLocalized,
  getHotelLocationLabelLocalized,
  getHotelTypeLabel,
  getRoomTypeLabel,
  getStayPurposeLabel,
} from "@/lib/hotels/hotels-i18n";
import type { HotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import { useI18n } from "@/lib/i18n/provider";

interface HotelsActiveFilterChipsProps {
  state: HotelsPageQueryState;
}

interface ActiveChip {
  id: string;
  label: string;
  clearPatch: Record<string, string | undefined>;
}

const summarizeItems = (items: string[]): string =>
  `${items.slice(0, 2).join(", ")}${items.length > 2 ? ` +${items.length - 2}` : ""}`;

export function HotelsActiveFilterChips({ state }: HotelsActiveFilterChipsProps) {
  const { locale, t } = useI18n();
  const chips: ActiveChip[] = [];

  if (state.textInput.trim()) {
    chips.push({
      id: "q",
      label: `${t("hotels_chip_search")}: "${state.textInput.trim()}"`,
      clearPatch: { q: undefined },
    });
  }

  if (state.selectedLocation) {
    chips.push({
      id: "location",
      label: `${t("hotels_chip_location")}: ${getHotelLocationLabelLocalized(
        state.selectedLocation,
        t,
      )}`,
      clearPatch: { location: undefined },
    });
  }

  if (state.selectedPurpose) {
    chips.push({
      id: "purpose",
      label: `${t("hotels_chip_purpose")}: ${getStayPurposeLabel(
        state.selectedPurpose,
        t,
      )}`,
      clearPatch: { purpose: undefined },
    });
  }

  if (state.checkInInput || state.checkOutInput) {
    chips.push({
      id: "stay",
      label: `${t("hotels_chip_stay")}: ${formatHotelDateSummaryLocalized(
        state.checkInInput,
        state.checkOutInput,
        locale,
        t,
      )}`,
      clearPatch: { checkIn: undefined, checkOut: undefined },
    });
  }

  if (state.guestCountInput) {
    chips.push({
      id: "guests",
      label: `${t("hotels_chip_guests")}: ${state.guestCountInput}`,
      clearPatch: { guests: undefined },
    });
  }

  if (state.minInput || state.maxInput) {
    chips.push({
      id: "price",
      label: `${t("hotels_chip_price")}: ₩${state.minInput || "0"} - ₩${
        state.maxInput || t("hotels_chip_any")
      }`,
      clearPatch: { min: undefined, max: undefined },
    });
  }

  if (state.minRatingInput) {
    chips.push({
      id: "minRating",
      label: `${t("hotels_chip_rating")}: ${state.minRatingInput}+`,
      clearPatch: { minRating: undefined },
    });
  }

  if (state.verifiedOnly) {
    chips.push({
      id: "verified",
      label: t("hotels_flag_verified_only"),
      clearPatch: { verified: undefined },
    });
  }
  if (state.petsAllowed) {
    chips.push({
      id: "pets",
      label: t("hotels_flag_pets_allowed"),
      clearPatch: { pets: undefined },
    });
  }
  if (state.wheelchairAccessible) {
    chips.push({
      id: "wheelchair",
      label: t("hotels_flag_wheelchair_accessible"),
      clearPatch: { wheelchair: undefined },
    });
  }

  if (state.selectedTypes.length > 0) {
    chips.push({
      id: "hotelTypes",
      label: `${t("hotels_chip_hotel_type")}: ${summarizeItems(
        state.selectedTypes.map((type) => getHotelTypeLabel(type, t)),
      )}`,
      clearPatch: { types: undefined },
    });
  }

  if (state.selectedRoomTypes.length > 0) {
    chips.push({
      id: "roomTypes",
      label: `${t("hotels_chip_room_type")}: ${summarizeItems(
        state.selectedRoomTypes.map((type) => getRoomTypeLabel(type, t)),
      )}`,
      clearPatch: { roomTypes: undefined },
    });
  }

  if (state.selectedStarRatings.length > 0) {
    chips.push({
      id: "stars",
      label: `${t("hotels_chip_star")}: ${summarizeItems(
        state.selectedStarRatings.map(String),
      )}`,
      clearPatch: { stars: undefined },
    });
  }

  if (state.selectedAmenities.length > 0) {
    chips.push({
      id: "amenities",
      label: t("hotels_chip_amenities", {
        count: state.selectedAmenities.length,
      }),
      clearPatch: { amenities: undefined },
    });
  }

  if (
    state.dongInput ||
    state.nearestSubwayInput ||
    state.subwayLinesInput ||
    state.maxWalkingDistanceInput
  ) {
    chips.push({
      id: "transit",
      label: t("hotels_chip_transit"),
      clearPatch: {
        dong: undefined,
        subway: undefined,
        lines: undefined,
        walk: undefined,
      },
    });
  }

  if (chips.length === 0) {
    return null;
  }

  const mobileVisibleChips = chips.slice(0, 3);
  const hiddenChipCount = Math.max(0, chips.length - mobileVisibleChips.length);

  const renderChip = (chip: ActiveChip) => (
    <button
      key={chip.id}
      type="button"
      onClick={() => {
        state.patchQuery(chip.clearPatch);
      }}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
    >
      <span>{chip.label}</span>
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-50 text-[10px] text-slate-500">
        x
      </span>
    </button>
  );

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        {mobileVisibleChips.map((chip) => renderChip(chip))}
        {hiddenChipCount > 0 ? (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
            {t("hotels_chip_more", { count: hiddenChipCount })}
          </span>
        ) : null}
      </div>
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {chips.map((chip) => renderChip(chip))}
      </div>
    </section>
  );
}
