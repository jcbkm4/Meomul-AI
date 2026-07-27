import { useI18n } from "@/lib/i18n/provider";

interface HotelsQuickFiltersRowProps {
  activePanel: "location" | "dates" | "guests" | null;
  locationSummary: string;
  dateSummary: string;
  guestSummary: string;
  hiddenFilterCount: number;
  total: number;
  loading: boolean;
  onOpenLocation: () => void;
  onOpenDates: () => void;
  onOpenGuests: () => void;
  onOpenFilters: () => void;
}

export function HotelsQuickFiltersRow({
  activePanel,
  locationSummary,
  dateSummary,
  guestSummary,
  hiddenFilterCount,
  total,
  loading,
  onOpenLocation,
  onOpenDates,
  onOpenGuests,
  onOpenFilters,
}: HotelsQuickFiltersRowProps) {
  const { t } = useI18n();
  return (
    <div className="relative z-20 mt-2.5 sm:mt-3">
      <div className="rounded-[1.2rem] border border-slate-200 bg-white p-1 sm:rounded-[1.7rem] sm:p-1.5">
        <div className="grid grid-cols-2 gap-1 md:grid-cols-[1fr_1fr_1fr_auto] md:gap-1.5">
          <button
            type="button"
            onClick={onOpenLocation}
            className={`rounded-[0.95rem] px-3 py-2 text-left transition sm:rounded-[1.35rem] sm:px-4 sm:py-3 ${
              activePanel === "location" ? "bg-slate-50" : "hover:bg-slate-50"
            }`}
          >
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">{t("hotels_quick_location")}</span>
            <span className="mt-0.5 block truncate text-[13px] font-medium text-slate-900 sm:mt-1 sm:text-sm">{locationSummary}</span>
          </button>

          <button
            type="button"
            onClick={onOpenDates}
            className={`rounded-[0.95rem] px-3 py-2 text-left transition sm:rounded-[1.35rem] sm:px-4 sm:py-3 ${
              activePanel === "dates" ? "bg-slate-50" : "hover:bg-slate-50"
            }`}
          >
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">{t("hotels_quick_when")}</span>
            <span className="mt-0.5 block truncate text-[13px] font-medium text-slate-900 sm:mt-1 sm:text-sm">{dateSummary}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuests}
            className={`rounded-[0.95rem] px-3 py-2 text-left transition sm:rounded-[1.35rem] sm:px-4 sm:py-3 ${
              activePanel === "guests" ? "bg-slate-50" : "hover:bg-slate-50"
            }`}
          >
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">{t("hotels_quick_guests")}</span>
            <span className="mt-0.5 block truncate text-[13px] font-medium text-slate-900 sm:mt-1 sm:text-sm">{guestSummary}</span>
          </button>

          <button
            type="button"
            onClick={onOpenFilters}
            className={`relative inline-flex min-h-[3.65rem] items-center justify-center rounded-[0.95rem] border bg-white text-slate-700 transition hover:text-slate-900 sm:min-h-[4.75rem] sm:rounded-[1.35rem] ${
              hiddenFilterCount > 0
                ? "border-slate-300 px-3 hover:border-slate-400 md:min-w-[6.25rem] md:gap-2"
                : "border-slate-200 hover:border-slate-300 md:w-14"
            }`}
            aria-label={t("hotels_drawer_filters")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5 shrink-0 sm:h-5 sm:w-5">
              <path d="M4 7h16" />
              <path d="M7 12h10" />
              <path d="M10 17h4" />
            </svg>
            {hiddenFilterCount > 0 ? (
              <span className="hidden md:flex md:flex-col md:items-start md:leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("hotels_quick_stays")}</span>
                <span className="mt-1 text-sm font-semibold text-slate-900">{loading ? "..." : total.toLocaleString()}</span>
              </span>
            ) : null}
            {hiddenFilterCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold text-white sm:min-h-6 sm:min-w-6 sm:text-[11px]">
                {hiddenFilterCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
}
