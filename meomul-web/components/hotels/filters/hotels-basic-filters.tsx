import {
  HOTEL_LOCATIONS,
  MIN_RATING_OPTIONS,
  STAY_PURPOSE_OPTIONS,
} from "@/lib/hotels/hotels-filter-config";
import { getHotelLocationLabelLocalized, getStayPurposeLabel } from "@/lib/hotels/hotels-i18n";
import type { HotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import { useI18n } from "@/lib/i18n/provider";

interface HotelsBasicFiltersProps {
  state: HotelsPageQueryState;
}

const INPUT_CLASS_NAME =
  "w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-slate-900 transition focus:ring-2";

export function HotelsBasicFilters({ state }: HotelsBasicFiltersProps) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <label className="block md:col-span-2 lg:col-span-3">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_search")}</span>
        <input
          value={state.textInput}
          onChange={(event) => {
            state.patchQuery({ q: event.target.value.trim() || undefined });
          }}
          placeholder={t("hotels_search_placeholder")}
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_location")}</span>
        <select
          value={state.selectedLocation}
          onChange={(event) => {
            state.patchQuery({ location: event.target.value || undefined });
          }}
          className={INPUT_CLASS_NAME}
        >
          <option value="">{t("hotels_field_all_locations")}</option>
          {HOTEL_LOCATIONS.map((location) => (
            <option key={location} value={location}>
              {getHotelLocationLabelLocalized(location, t)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_purpose")}</span>
        <select
          value={state.selectedPurpose}
          onChange={(event) => {
            state.patchQuery({ purpose: event.target.value || undefined });
          }}
          className={INPUT_CLASS_NAME}
        >
          <option value="">{t("hotels_field_any_purpose")}</option>
          {STAY_PURPOSE_OPTIONS.map((purpose) => (
            <option key={purpose.value} value={purpose.value}>
              {getStayPurposeLabel(purpose.value, t)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_guests")}</span>
        <input
          value={state.guestCountInput}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            state.patchQuery({ guests: digits || undefined });
          }}
          inputMode="numeric"
          placeholder="2"
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_checkin")}</span>
        <input
          type="date"
          value={state.checkInInput}
          onChange={(event) => {
            state.patchQuery({ checkIn: event.target.value || undefined });
          }}
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_checkout")}</span>
        <input
          type="date"
          value={state.checkOutInput}
          onChange={(event) => {
            state.patchQuery({ checkOut: event.target.value || undefined });
          }}
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_min_price")}</span>
        <input
          value={state.minInput}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            state.patchQuery({ min: digits || undefined });
          }}
          inputMode="numeric"
          placeholder="0"
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_max_price")}</span>
        <input
          value={state.maxInput}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            state.patchQuery({ max: digits || undefined });
          }}
          inputMode="numeric"
          placeholder="500000"
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_min_rating")}</span>
        <select
          value={state.minRatingInput}
          onChange={(event) => {
            state.patchQuery({ minRating: event.target.value || undefined });
          }}
          className={INPUT_CLASS_NAME}
        >
          <option value="">{t("hotels_field_any_rating")}</option>
          {MIN_RATING_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value.toFixed(1)}+
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_dong")}</span>
        <input
          value={state.dongInput}
          onChange={(event) => {
            state.patchQuery({ dong: event.target.value.trim() || undefined });
          }}
          placeholder={t("hotels_field_dong_placeholder")}
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_subway")}</span>
        <input
          value={state.nearestSubwayInput}
          onChange={(event) => {
            state.patchQuery({ subway: event.target.value.trim() || undefined });
          }}
          placeholder={t("hotels_field_subway_placeholder")}
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_subway_lines")}</span>
        <input
          value={state.subwayLinesInput}
          onChange={(event) => {
            const normalized = event.target.value.replace(/[^\d,\s]/g, "");
            state.patchQuery({ lines: normalized.trim() || undefined });
          }}
          placeholder={t("hotels_field_subway_lines_placeholder")}
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{t("hotels_field_max_walk")}</span>
        <input
          value={state.maxWalkingDistanceInput}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            state.patchQuery({ walk: digits || undefined });
          }}
          inputMode="numeric"
          placeholder="15"
          className={INPUT_CLASS_NAME}
        />
      </label>
    </div>
  );
}
