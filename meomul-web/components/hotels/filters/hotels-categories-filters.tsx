import { HOTEL_TYPES, ROOM_TYPES, STAR_RATINGS } from "@/lib/hotels/hotels-filter-config";
import { toggleNumberCsv, toggleStringCsv } from "@/lib/hotels/filter-csv";
import { getHotelTypeLabel, getRoomTypeLabel } from "@/lib/hotels/hotels-i18n";
import type { HotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import { useI18n } from "@/lib/i18n/provider";

interface HotelsCategoriesFiltersProps {
  state: HotelsPageQueryState;
}

export function HotelsCategoriesFilters({ state }: HotelsCategoriesFiltersProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">{t("hotels_category_hotel_types")}</legend>
        <div className="flex flex-wrap gap-2">
          {HOTEL_TYPES.map((type) => {
            const checked = state.selectedTypes.includes(type);

            return (
              <label key={type} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const encoded = toggleStringCsv(state.selectedTypes, type, event.target.checked);
                    state.patchQuery({ types: encoded || undefined });
                  }}
                  className="h-4 w-4"
                />
                <span>{getHotelTypeLabel(type, t)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">{t("hotels_category_room_types")}</legend>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((type) => {
            const checked = state.selectedRoomTypes.includes(type);

            return (
              <label key={type} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const encoded = toggleStringCsv(state.selectedRoomTypes, type, event.target.checked);
                    state.patchQuery({ roomTypes: encoded || undefined });
                  }}
                  className="h-4 w-4"
                />
                <span>{getRoomTypeLabel(type, t)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">{t("hotels_category_star_ratings")}</legend>
        <div className="flex flex-wrap gap-2">
          {STAR_RATINGS.map((star) => {
            const checked = state.selectedStarRatings.includes(star);

            return (
              <label key={star} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const encoded = toggleNumberCsv(state.selectedStarRatings, star, event.target.checked);
                    state.patchQuery({ stars: encoded || undefined });
                  }}
                  className="h-4 w-4"
                />
                <span>{t("hotels_category_star_suffix", { count: star })}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
