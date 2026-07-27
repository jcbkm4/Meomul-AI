import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";

interface LiveInterestFabProps {
  viewerCount: number;
  connected: boolean;
  availableRooms: number;
  containerClassName?: string;
}

type Translate = ReturnType<typeof useI18n>["t"];

const TOUCH_MEDIA_QUERY = "(hover: none), (pointer: coarse)";

type LiveTone = {
  buttonClass: string;
  pingClass: string;
  dotClass: string;
  badgeClass: string;
  label: string;
};

const getLiveTone = (
  viewerCount: number,
  connected: boolean,
  availableRooms: number,
  t: Translate,
): LiveTone => {
  if (!connected) {
    return {
      buttonClass: "border-slate-400 bg-slate-700 text-white",
      pingClass: "bg-slate-400/50",
      dotClass: "bg-slate-300",
      badgeClass: "border-slate-300 bg-slate-50 text-slate-700",
      label: t("live_interest_reconnecting"),
    };
  }

  if (viewerCount >= 5 || (viewerCount >= 3 && availableRooms <= 2)) {
    return {
      buttonClass: "border-rose-400 bg-rose-600 text-white",
      pingClass: "bg-rose-400/40",
      dotClass: "bg-rose-500",
      badgeClass: "border-rose-300 bg-rose-50 text-rose-700",
      label: t("live_interest_high_demand"),
    };
  }

  if (viewerCount >= 2) {
    return {
      buttonClass: "border-amber-400 bg-amber-500 text-white",
      pingClass: "bg-amber-300/45",
      dotClass: "bg-amber-500",
      badgeClass: "border-amber-300 bg-amber-50 text-amber-700",
      label: t("live_interest_active_now"),
    };
  }

  return {
    buttonClass: "border-sky-400 bg-sky-600 text-white",
    pingClass: "bg-sky-300/45",
    dotClass: "bg-sky-500",
    badgeClass: "border-sky-300 bg-sky-50 text-sky-700",
    label: t("live_interest_live"),
  };
};

export const LiveInterestFab = memo(function LiveInterestFab({
  viewerCount,
  connected,
  availableRooms,
  containerClassName,
}: LiveInterestFabProps) {
  const { t } = useI18n();
  const [isTouchUi, setIsTouchUi] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const safeCount = Math.max(0, Math.trunc(viewerCount));
  const displayCount = safeCount > 99 ? "99+" : String(safeCount);
  const tone = useMemo(() => getLiveTone(safeCount, connected, availableRooms, t), [availableRooms, connected, safeCount, t]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(TOUCH_MEDIA_QUERY);
    const syncTouchMode = (): void => {
      setIsTouchUi(mediaQuery.matches);
    };

    syncTouchMode();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncTouchMode);
      return () => mediaQuery.removeEventListener("change", syncTouchMode);
    }

    mediaQuery.addListener(syncTouchMode);
    return () => mediaQuery.removeListener(syncTouchMode);
  }, []);

  useEffect(() => {
    if (!isTouchUi && isPanelOpen) {
      setIsPanelOpen(false);
    }
  }, [isPanelOpen, isTouchUi]);

  const handleTogglePanel = useCallback(() => {
    if (!isTouchUi) {
      return;
    }
    setIsPanelOpen((previous) => !previous);
  }, [isTouchUi]);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const explanation = useMemo(() => {
    if (!connected) {
      return t("live_interest_expl_reconnecting");
    }
    if (safeCount === 0) {
      return t("live_interest_expl_none");
    }
    if (safeCount === 1) {
      return t("live_interest_expl_single");
    }
    return t("live_interest_expl_many", { count: safeCount });
  }, [connected, safeCount, t]);

  const panelVisibilityClass = isTouchUi
    ? isPanelOpen
      ? "translate-x-0 opacity-100 pointer-events-auto"
      : "translate-x-2 opacity-0 pointer-events-none"
    : "pointer-events-none translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100";

  return (
    <div
      className={`group fixed right-3 z-[55] sm:right-5 ${
        containerClassName ?? "bottom-[calc(env(safe-area-inset-bottom)+8.5rem)] sm:bottom-40"
      }`}
    >
      <div className="relative inline-flex h-14 w-14 items-center justify-center">
        {connected ? (
          <span
            className={`pointer-events-none absolute inset-0 rounded-full ${tone.pingClass} ${safeCount > 0 ? "animate-ping" : "opacity-40"}`}
            aria-hidden
          />
        ) : null}
        <button
          type="button"
          onClick={handleTogglePanel}
          className={`relative inline-flex h-14 w-14 flex-col items-center justify-center rounded-full border shadow-2xl transition duration-300 group-hover:scale-105 ${tone.buttonClass}`}
          aria-label={t("live_interest_aria", { count: safeCount })}
          aria-expanded={isTouchUi ? isPanelOpen : undefined}
          aria-controls={isTouchUi ? "live-interest-panel" : undefined}
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em]">{t("live_interest_live")}</span>
          <span className="text-base font-semibold leading-none">{displayCount}</span>
          <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white ${tone.dotClass} animate-pulse`} />
        </button>
      </div>

      <div
        id="live-interest-panel"
        className={`absolute right-[4.1rem] top-1/2 w-56 -translate-y-1/2 rounded-xl border border-slate-200 bg-white/95 p-3 text-left shadow-xl transition duration-200 sm:right-[4.25rem] sm:w-64 ${panelVisibilityClass}`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">{t("live_interest_panel_title")}</p>
          {isTouchUi ? (
            <button
              type="button"
              onClick={handleClosePanel}
              className="inline-flex items-center rounded-full border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
            >
              {t("live_interest_close")}
            </button>
          ) : (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone.badgeClass}`}>{tone.label}</span>
          )}
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {t("live_interest_viewers_now", { count: safeCount })}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{explanation}</p>
      </div>
    </div>
  );
});
