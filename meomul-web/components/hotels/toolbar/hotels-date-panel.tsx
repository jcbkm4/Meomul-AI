import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/provider";

interface HotelsDatePanelProps {
  canGoToPreviousMonth: boolean;
  months: ReactNode[];
  selectedSummary: string;
  selectedHint: string;
  hasDateRangeError: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onClearDates: () => void;
  onApplyDates: () => void;
}

export function HotelsDatePanel({
  canGoToPreviousMonth,
  months,
  selectedSummary,
  selectedHint,
  hasDateRangeError,
  onPreviousMonth,
  onNextMonth,
  onClearDates,
  onApplyDates,
}: HotelsDatePanelProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t("hotels_date_choose_title")}</p>
          <p className="mt-1 text-sm text-slate-600">{t("hotels_date_choose_desc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            disabled={!canGoToPreviousMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
            aria-label={t("hotels_date_prev_months")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            aria-label={t("hotels_date_next_months")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="hover-lift mx-auto w-full rounded-[1.35rem] border border-slate-200 bg-white p-2 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]">
        <div className="grid gap-2 md:grid-cols-2">{months}</div>
      </div>

      <div className="hover-lift flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t("hotels_date_selected_stay")}</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{selectedSummary}</p>
          <p className="mt-1 text-xs text-slate-500">{selectedHint}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onClearDates}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {t("hotels_date_clear")}
          </button>
          <button
            type="button"
            onClick={onApplyDates}
            disabled={hasDateRangeError}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("hotels_date_apply")}
          </button>
        </div>
      </div>

      {hasDateRangeError ? <p className="text-xs font-medium text-rose-600">{t("hotels_date_error")}</p> : null}
    </div>
  );
}
