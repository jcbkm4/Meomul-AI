import { memo } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/utils/format";

interface PriceLockReadyBarProps {
  basePrice: number;
  locking: boolean;
  onLockPrice: () => void;
}

export const PriceLockReadyBar = memo(function PriceLockReadyBar({ basePrice, locking, onLockPrice }: PriceLockReadyBarProps) {
  const { t } = useI18n();
  return (
    <section className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_28px_-18px_rgba(15,23,42,0.65)] backdrop-blur">
      <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t("room_price_lock_ready")}</p>
          <p className="text-sm font-semibold text-slate-900">{t("room_price_lock_for_minutes", { price: formatNumber(basePrice) })}</p>
        </div>
        <button
          type="button"
          onClick={onLockPrice}
          disabled={locking}
          className="inline-flex w-full touch-manipulation items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:shrink-0 sm:py-2"
        >
          {locking ? t("room_price_lock_locking") : t("room_price_lock_button")}
        </button>
      </div>
    </section>
  );
});
