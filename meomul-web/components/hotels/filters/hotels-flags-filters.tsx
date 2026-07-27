import type { HotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import { useI18n } from "@/lib/i18n/provider";

interface HotelsFlagsFiltersProps {
  state: HotelsPageQueryState;
}

export function HotelsFlagsFilters({ state }: HotelsFlagsFiltersProps) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
        <input
          type="checkbox"
          checked={state.verifiedOnly}
          onChange={(event) => {
            state.patchQuery({ verified: event.target.checked ? "1" : undefined });
          }}
          className="h-4 w-4"
        />
        {t("hotels_flag_verified_only")}
      </label>
      <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
        <input
          type="checkbox"
          checked={state.petsAllowed}
          onChange={(event) => {
            state.patchQuery({ pets: event.target.checked ? "1" : undefined });
          }}
          className="h-4 w-4"
        />
        {t("hotels_flag_pets_allowed")}
      </label>
      <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
        <input
          type="checkbox"
          checked={state.wheelchairAccessible}
          onChange={(event) => {
            state.patchQuery({ wheelchair: event.target.checked ? "1" : undefined });
          }}
          className="h-4 w-4"
        />
        {t("hotels_flag_wheelchair_accessible")}
      </label>
    </div>
  );
}
