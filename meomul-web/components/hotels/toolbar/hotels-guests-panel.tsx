import { useI18n } from "@/lib/i18n/provider";

interface HotelsGuestsPanelProps {
  guestCount: number;
  onClear: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onApply: () => void;
}

export function HotelsGuestsPanel({
  guestCount,
  onClear,
  onDecrease,
  onIncrease,
  onApply,
}: HotelsGuestsPanelProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t("hotels_guests_title")}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t("hotels_guests_desc")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        >
          {t("hotels_guests_any")}
        </button>
      </div>

      <div className="hover-lift flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t("hotels_guests_label")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t("hotels_guests_capacity_hint")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDecrease}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-700 transition hover:border-slate-400"
            aria-label={t("hotels_guests_decrease")}
          >
            -
          </button>
          <div className="min-w-12 text-center text-lg font-semibold text-slate-900">
            {guestCount}
          </div>
          <button
            type="button"
            onClick={onIncrease}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-700 transition hover:border-slate-400"
            aria-label={t("hotels_guests_increase")}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onApply}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
        >
          {t("hotels_guests_apply")}
        </button>
      </div>
    </div>
  );
}
