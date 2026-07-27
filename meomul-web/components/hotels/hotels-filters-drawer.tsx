import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HotelsFiltersPanel } from "@/components/hotels/hotels-filters-panel";
import { GET_HOTELS_COUNT_QUERY } from "@/graphql/hotel.gql";
import {
  AMENITY_OPTIONS,
  HOTEL_LOCATIONS,
  HOTEL_TYPES,
  ROOM_TYPES,
  STAR_RATINGS,
  STAY_PURPOSE_OPTIONS,
} from "@/lib/hotels/hotels-filter-config";
import type { HotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import { formatStayCountLabelLocalized } from "@/lib/hotels/hotels-i18n";
import { useI18n } from "@/lib/i18n/provider";
import type {
  GetHotelsCountQueryData,
  GetHotelsCountQueryVars,
  HotelAmenityKey,
  HotelLocation,
  HotelSearchInput,
  HotelType,
  RoomType,
  StayPurpose,
} from "@/types/hotel";

interface HotelsFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  state: HotelsPageQueryState;
  appliedTotal: number;
}

type FilterQueryKey =
  | "q"
  | "location"
  | "purpose"
  | "dong"
  | "subway"
  | "lines"
  | "walk"
  | "min"
  | "max"
  | "guests"
  | "minRating"
  | "checkIn"
  | "checkOut"
  | "verified"
  | "pets"
  | "wheelchair"
  | "types"
  | "roomTypes"
  | "stars"
  | "amenities";

type DraftQuery = Partial<Record<FilterQueryKey, string>>;

const FILTER_QUERY_KEYS: FilterQueryKey[] = [
  "q",
  "location",
  "purpose",
  "dong",
  "subway",
  "lines",
  "walk",
  "min",
  "max",
  "guests",
  "minRating",
  "checkIn",
  "checkOut",
  "verified",
  "pets",
  "wheelchair",
  "types",
  "roomTypes",
  "stars",
  "amenities",
];

const AMENITY_KEYS = AMENITY_OPTIONS.map((option) => option.key);

const isIsoDateInput = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseCsv = (value?: string): string[] =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const parseEnumCsv = <T extends string>(value: string | undefined, allowed: readonly T[]): T[] =>
  parseCsv(value).filter((item): item is T => allowed.includes(item as T));

const parseIntCsv = (value?: string): number[] => {
  const unique = new Set<number>();
  parseCsv(value).forEach((item) => {
    const parsed = Number(item);
    if (Number.isInteger(parsed) && parsed > 0) {
      unique.add(parsed);
    }
  });
  return Array.from(unique);
};

const parseInteger = (value: string, minimum = 0): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum) {
    return undefined;
  }
  return parsed;
};

const toCsv = (values: readonly (string | number)[]): string | undefined => (values.length > 0 ? values.join(",") : undefined);

const toFlag = (value: boolean): string | undefined => (value ? "1" : undefined);

const buildApplyPatch = (draft: DraftQuery): Record<string, string | undefined> => {
  const patch: Record<string, string | undefined> = {};
  FILTER_QUERY_KEYS.forEach((key) => {
    patch[key] = draft[key];
  });
  return patch;
};

export function HotelsFiltersDrawer({ isOpen, onClose, state, appliedTotal }: HotelsFiltersDrawerProps) {
  const { t } = useI18n();
  const sourceDraft = useMemo(
    () => ({
      q: state.textInput.trim() || undefined,
      location: state.selectedLocation || undefined,
      purpose: state.selectedPurpose || undefined,
      dong: state.dongInput.trim() || undefined,
      subway: state.nearestSubwayInput.trim() || undefined,
      lines: state.subwayLinesInput.trim() || undefined,
      walk: state.maxWalkingDistanceInput || undefined,
      min: state.minInput || undefined,
      max: state.maxInput || undefined,
      guests: state.guestCountInput || undefined,
      minRating: state.minRatingInput || undefined,
      checkIn: state.checkInInput || undefined,
      checkOut: state.checkOutInput || undefined,
      verified: toFlag(state.verifiedOnly),
      pets: toFlag(state.petsAllowed),
      wheelchair: toFlag(state.wheelchairAccessible),
      types: toCsv(state.selectedTypes),
      roomTypes: toCsv(state.selectedRoomTypes),
      stars: toCsv(state.selectedStarRatings),
      amenities: toCsv(state.selectedAmenities),
    }),
    [
      state.checkInInput,
      state.checkOutInput,
      state.dongInput,
      state.guestCountInput,
      state.maxInput,
      state.maxWalkingDistanceInput,
      state.minInput,
      state.minRatingInput,
      state.nearestSubwayInput,
      state.petsAllowed,
      state.selectedAmenities,
      state.selectedLocation,
      state.selectedPurpose,
      state.selectedRoomTypes,
      state.selectedStarRatings,
      state.selectedTypes,
      state.subwayLinesInput,
      state.textInput,
      state.verifiedOnly,
      state.wheelchairAccessible,
    ],
  );
  const [draft, setDraft] = useState<DraftQuery>(sourceDraft);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setDraft(sourceDraft);
  }, [isOpen, sourceDraft]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const patchDraftQuery = useCallback((next: Record<string, string | undefined>) => {
    setDraft((previous) => {
      const merged: DraftQuery = { ...previous };
      Object.entries(next).forEach(([rawKey, value]) => {
        const key = rawKey as FilterQueryKey;
        if (FILTER_QUERY_KEYS.includes(key)) {
          if (value) {
            merged[key] = value;
          } else {
            delete merged[key];
          }
        }
      });
      return merged;
    });
  }, []);

  const clearDraftQuery = useCallback(() => {
    setDraft({});
  }, []);

  const textInput = draft.q ?? "";
  const selectedLocation = HOTEL_LOCATIONS.includes((draft.location ?? "") as HotelLocation) ? ((draft.location ?? "") as HotelLocation) : "";
  const selectedPurpose = STAY_PURPOSE_OPTIONS.some((option) => option.value === draft.purpose)
    ? (draft.purpose as StayPurpose)
    : "";
  const dongInput = draft.dong ?? "";
  const nearestSubwayInput = draft.subway ?? "";
  const subwayLinesInput = draft.lines ?? "";
  const maxWalkingDistanceInput = draft.walk ?? "";
  const selectedTypes = parseEnumCsv(draft.types, HOTEL_TYPES);
  const selectedRoomTypes = parseEnumCsv(draft.roomTypes, ROOM_TYPES);
  const selectedStarRatings = parseIntCsv(draft.stars).filter((star) => STAR_RATINGS.includes(star as (typeof STAR_RATINGS)[number]));
  const selectedAmenities = parseEnumCsv(draft.amenities, AMENITY_KEYS) as HotelAmenityKey[];
  const minInput = draft.min ?? "";
  const maxInput = draft.max ?? "";
  const guestCountInput = draft.guests ?? "";
  const minRatingInput = draft.minRating ?? "";
  const checkInInput = draft.checkIn ?? "";
  const checkOutInput = draft.checkOut ?? "";
  const verifiedOnly = draft.verified === "1";
  const petsAllowed = draft.pets === "1";
  const wheelchairAccessible = draft.wheelchair === "1";

  const minPrice = parseInteger(minInput);
  const maxPrice = parseInteger(maxInput);
  const minRating = minRatingInput ? Number(minRatingInput) : undefined;
  const maxWalkingDistance = parseInteger(maxWalkingDistanceInput, 1);
  const subwayLines = parseIntCsv(subwayLinesInput);
  const hasPriceRangeError = minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice;
  const hasDateRangeError =
    isIsoDateInput(checkInInput) &&
    isIsoDateInput(checkOutInput) &&
    new Date(`${checkInInput}T00:00:00.000Z`).getTime() >= new Date(`${checkOutInput}T00:00:00.000Z`).getTime();

  const previewSearch = useMemo<HotelSearchInput | undefined>(() => {
    const next: HotelSearchInput = {};
    const text = textInput.trim();
    const dong = dongInput.trim();
    const nearestSubway = nearestSubwayInput.trim();

    if (text) {
      next.text = text;
    }
    if (selectedLocation) {
      next.location = selectedLocation;
    }
    if (selectedPurpose) {
      next.purpose = selectedPurpose;
    }
    if (dong) {
      next.dong = dong;
    }
    if (nearestSubway) {
      next.nearestSubway = nearestSubway;
    }
    if (subwayLines.length > 0) {
      next.subwayLines = subwayLines;
    }
    if (maxWalkingDistance !== undefined) {
      next.maxWalkingDistance = maxWalkingDistance;
    }
    if (selectedTypes.length > 0) {
      next.hotelTypes = selectedTypes;
    }
    if (selectedRoomTypes.length > 0) {
      next.roomTypes = selectedRoomTypes;
    }
    if (selectedStarRatings.length > 0) {
      next.starRatings = selectedStarRatings;
    }
    if (minRating !== undefined && Number.isFinite(minRating) && minRating > 0) {
      next.minRating = minRating;
    }
    if (selectedAmenities.length > 0) {
      next.amenities = selectedAmenities;
    }
    if (verifiedOnly) {
      next.verifiedOnly = true;
    }
    if (petsAllowed) {
      next.petsAllowed = true;
    }
    if (wheelchairAccessible) {
      next.wheelchairAccessible = true;
    }
    const guestCount = parseInteger(guestCountInput, 1);
    if (guestCount !== undefined) {
      next.guestCount = guestCount;
    }
    if (!hasDateRangeError) {
      if (isIsoDateInput(checkInInput)) {
        next.checkInDate = `${checkInInput}T00:00:00.000Z`;
      }
      if (isIsoDateInput(checkOutInput)) {
        next.checkOutDate = `${checkOutInput}T00:00:00.000Z`;
      }
    }
    if (!hasPriceRangeError && (minPrice !== undefined || maxPrice !== undefined)) {
      next.priceRange = {
        ...(minPrice !== undefined ? { start: minPrice } : {}),
        ...(maxPrice !== undefined ? { end: maxPrice } : {}),
      };
    }

    return Object.keys(next).length > 0 ? next : undefined;
  }, [
    checkInInput,
    checkOutInput,
    dongInput,
    guestCountInput,
    hasDateRangeError,
    hasPriceRangeError,
    maxPrice,
    maxWalkingDistance,
    minPrice,
    minRating,
    nearestSubwayInput,
    petsAllowed,
    selectedAmenities,
    selectedLocation,
    selectedPurpose,
    selectedRoomTypes,
    selectedStarRatings,
    selectedTypes,
    subwayLines,
    textInput,
    verifiedOnly,
    wheelchairAccessible,
  ]);

  const { data: previewData, loading: previewLoading } = useQuery<
    GetHotelsCountQueryData,
    GetHotelsCountQueryVars
  >(
    GET_HOTELS_COUNT_QUERY,
    {
      skip: !isOpen || hasDateRangeError || hasPriceRangeError,
      variables: {
        search: previewSearch,
      },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    },
  );

  const previewTotal = previewData?.getHotelsCount.total ?? appliedTotal;

  const draftPanelState: HotelsPageQueryState = useMemo(
    () => ({
      ...state,
      textInput,
      selectedLocation,
      dongInput,
      nearestSubwayInput,
      subwayLinesInput,
      maxWalkingDistanceInput,
      selectedTypes: selectedTypes as HotelType[],
      selectedRoomTypes: selectedRoomTypes as RoomType[],
      selectedStarRatings,
      selectedAmenities,
      selectedPurpose,
      minInput,
      maxInput,
      guestCountInput,
      minRatingInput,
      checkInInput,
      checkOutInput,
      verifiedOnly,
      petsAllowed,
      wheelchairAccessible,
      hasPriceRangeError,
      hasDateRangeError,
      patchQuery: patchDraftQuery,
      clearQuery: clearDraftQuery,
    }),
    [
      checkInInput,
      checkOutInput,
      clearDraftQuery,
      dongInput,
      guestCountInput,
      hasDateRangeError,
      hasPriceRangeError,
      maxInput,
      maxWalkingDistanceInput,
      minInput,
      minRatingInput,
      nearestSubwayInput,
      patchDraftQuery,
      petsAllowed,
      selectedAmenities,
      selectedLocation,
      selectedPurpose,
      selectedRoomTypes,
      selectedStarRatings,
      selectedTypes,
      state,
      subwayLinesInput,
      textInput,
      verifiedOnly,
      wheelchairAccessible,
    ],
  );

  const applyDraftFilters = useCallback(() => {
    state.patchQuery(buildApplyPatch(draft));
    onClose();
  }, [draft, onClose, state]);

  const hasDraftValidationError = hasPriceRangeError || hasDateRangeError;
  const showMatchesSummary = !hasDraftValidationError;
  const primaryButtonLabel = hasDraftValidationError
    ? t("hotels_drawer_fix_filters")
    : previewLoading
      ? t("hotels_drawer_updating")
      : t("hotels_drawer_show", {
          count: formatStayCountLabelLocalized(previewTotal, "stay", t),
        });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label={t("hotels_drawer_close_filters")}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/36 transition duration-300"
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 md:items-center md:p-6">
        <aside
          className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-slate-200 bg-[#fcfcfb] shadow-[0_32px_120px_-40px_rgba(15,23,42,0.38)] transition duration-300 md:h-auto md:max-h-[88vh] md:max-w-4xl md:rounded-[2rem] translate-y-0 opacity-100"
          aria-hidden={false}
        >
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-[#fcfcfb] px-4 py-4 sm:px-6">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 md:hidden" />
            <div className="mt-3 flex items-start justify-between gap-3 md:mt-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t("hotels_drawer_filters")}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t("hotels_drawer_title")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("hotels_drawer_desc")}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearDraftQuery}
                  className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {t("hotels_drawer_clear")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                  aria-label={t("hotels_drawer_close")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <HotelsFiltersPanel state={draftPanelState} />
          </div>

          <div className="sticky bottom-0 border-t border-slate-200 bg-[#fcfcfb] px-4 py-4 sm:px-6 sm:py-5">
            <p className="mb-3 text-sm text-slate-600">
              {showMatchesSummary
                ? `${previewLoading ? t("hotels_drawer_checking") : t("hotels_drawer_matches", {
                    count: formatStayCountLabelLocalized(previewTotal, "stay", t),
                  })}${
                    previewTotal !== appliedTotal
                      ? ` • ${t("hotels_drawer_currently_showing", {
                          count: formatStayCountLabelLocalized(appliedTotal, "stay", t),
                        })}`
                      : ""
                  }`
                : t("hotels_drawer_fix_highlighted")}
            </p>
            <button
              type="button"
              onClick={applyDraftFilters}
              disabled={hasDraftValidationError}
              className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryButtonLabel}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
