import { ErrorNotice } from "@/components/ui/error-notice";
import { HotelsAmenitiesFilters } from "@/components/hotels/filters/hotels-amenities-filters";
import { HotelsBasicFilters } from "@/components/hotels/filters/hotels-basic-filters";
import { HotelsCategoriesFilters } from "@/components/hotels/filters/hotels-categories-filters";
import { HotelsFlagsFilters } from "@/components/hotels/filters/hotels-flags-filters";
import type { HotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import { useI18n } from "@/lib/i18n/provider";

interface HotelsFiltersPanelProps {
  state: HotelsPageQueryState;
}

export function HotelsFiltersPanel({ state }: HotelsFiltersPanelProps) {
  const { t } = useI18n();
  return (
    <section className="space-y-4">
      <section className="hover-lift rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)] sm:p-5">
        <header className="mb-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("hotels_panel_trip_basics")}</p>
          <p className="text-sm text-slate-600">{t("hotels_panel_trip_basics_desc")}</p>
        </header>
        <HotelsBasicFilters state={state} />
      </section>

      <section className="hover-lift rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)] sm:p-5">
        <header className="mb-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("hotels_panel_booking_options")}</p>
          <p className="text-sm text-slate-600">{t("hotels_panel_booking_options_desc")}</p>
        </header>
        <HotelsFlagsFilters state={state} />
      </section>

      <section className="hover-lift rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)] sm:p-5">
        <header className="mb-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("hotels_panel_stay_type")}</p>
          <p className="text-sm text-slate-600">{t("hotels_panel_stay_type_desc")}</p>
        </header>
        <HotelsCategoriesFilters state={state} />
      </section>

      <section className="hover-lift rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)] sm:p-5">
        <header className="mb-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("hotels_panel_amenities")}</p>
          <p className="text-sm text-slate-600">{t("hotels_panel_amenities_desc")}</p>
        </header>
        <HotelsAmenitiesFilters state={state} />
      </section>

      {state.hasPriceRangeError ? (
        <ErrorNotice className="mt-3" tone="warn" message={t("hotels_error_price_range")} />
      ) : null}
      {state.hasDateRangeError ? (
        <ErrorNotice className="mt-3" tone="warn" message={t("hotels_error_date_range")} />
      ) : null}
    </section>
  );
}
