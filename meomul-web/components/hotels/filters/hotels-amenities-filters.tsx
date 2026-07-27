import { AMENITY_OPTIONS } from "@/lib/hotels/hotels-filter-config";
import { toggleStringCsv } from "@/lib/hotels/filter-csv";
import { getHotelAmenityLabel } from "@/lib/hotels/hotels-i18n";
import type { HotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import { useI18n } from "@/lib/i18n/provider";

interface HotelsAmenitiesFiltersProps {
  state: HotelsPageQueryState;
}

export function HotelsAmenitiesFilters({ state }: HotelsAmenitiesFiltersProps) {
  const { t } = useI18n();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">{t("hotels_panel_amenities")}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {AMENITY_OPTIONS.map((amenity) => {
          const checked = state.selectedAmenities.includes(amenity.key);

          return (
            <label key={amenity.key} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  const encoded = toggleStringCsv(state.selectedAmenities, amenity.key, event.target.checked);
                  state.patchQuery({ amenities: encoded || undefined });
                }}
                className="h-4 w-4"
              />
              <span>{getHotelAmenityLabel(amenity.key, t)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
