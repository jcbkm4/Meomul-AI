import { useMutation, useQuery } from "@apollo/client/react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CANCEL_PRICE_LOCK_MUTATION, GET_MY_PRICE_LOCK_QUERY, GET_MY_PRICE_LOCKS_QUERY } from "@/graphql/hotel.gql";
import { useI18n } from "@/lib/i18n/provider";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { lockBodyScroll } from "@/lib/ui/body-scroll-lock";
import { confirmDanger, errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import type {
  CancelPriceLockMutationData,
  CancelPriceLockMutationVars,
  GetMyPriceLocksQueryData,
  PriceLockDto,
} from "@/types/hotel";

const canUsePriceLock = (memberType: string | undefined, isAuthenticated: boolean): boolean =>
  isAuthenticated &&
  (memberType === "USER" ||
    memberType === "AGENT" ||
    memberType === "ADMIN" ||
    memberType === "ADMIN_OPERATOR");

const getRemainingSeconds = (expiresAt: string, nowMs: number): number => Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowMs) / 1000));
const ACTIVE_LOCK_POLL_INTERVAL_MS = 60000;

const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

interface PriceLockFabProps {
  isAuthenticated: boolean;
  memberType?: string;
  onAuthRequired?: () => void;
}

export function PriceLockFab({
  isAuthenticated,
  memberType,
  onAuthRequired,
}: PriceLockFabProps) {
  const { t } = useI18n();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [nowMs, setNowMs] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isGuestInfoOpen, setIsGuestInfoOpen] = useState(false);
  const isPageVisible = usePageVisible();
  const canUse = useMemo(
    () => canUsePriceLock(memberType, isAuthenticated),
    [memberType, isAuthenticated],
  );

  const { data, loading, startPolling, stopPolling, refetch } = useQuery<GetMyPriceLocksQueryData>(GET_MY_PRICE_LOCKS_QUERY, {
    skip: !isHydrated || !canUse || !isPageVisible,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });
  const [cancelPriceLockMutation] = useMutation<CancelPriceLockMutationData, CancelPriceLockMutationVars>(CANCEL_PRICE_LOCK_MUTATION);

  useEffect(() => {
    setIsHydrated(true);
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    if (!isGuestInfoOpen) {
      return;
    }

    const releaseScrollLock = lockBodyScroll();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsGuestInfoOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      releaseScrollLock();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGuestInfoOpen]);

  useEffect(() => {
    if (!isHydrated || !canUse || !isPageVisible) {
      return;
    }

    void refetch();
  }, [canUse, isHydrated, isPageVisible, refetch]);

  const hasUnexpiredLocks = useMemo(() => {
    const locks = data?.getMyPriceLocks ?? [];
    const currentNowMs = Date.now();
    return locks.some((lock) => getRemainingSeconds(lock.expiresAt, currentNowMs) > 0);
  }, [data?.getMyPriceLocks]);

  useEffect(() => {
    if (!isHydrated || !canUse || !isPageVisible) {
      stopPolling();
      return;
    }

    if (!hasUnexpiredLocks) {
      stopPolling();
      return;
    }

    startPolling(ACTIVE_LOCK_POLL_INTERVAL_MS);
    return () => stopPolling();
  }, [canUse, hasUnexpiredLocks, isHydrated, isPageVisible, startPolling, stopPolling]);

  useEffect(() => {
    if (!isHydrated || !canUse || !isPageVisible) {
      return;
    }
    if (!hasUnexpiredLocks) {
      setNowMs(Date.now());
      return;
    }

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [canUse, hasUnexpiredLocks, isHydrated, isPageVisible]);

  const activeLocks = useMemo(() => {
    const locks = data?.getMyPriceLocks ?? [];
    return locks
      .filter((lock) => getRemainingSeconds(lock.expiresAt, nowMs) > 0)
      .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
  }, [data?.getMyPriceLocks, nowMs]);

  const nearestLock = activeLocks[0];
  const nearestRemaining = nearestLock ? getRemainingSeconds(nearestLock.expiresAt, nowMs) : 0;
  const isAlert = nearestRemaining > 0 && nearestRemaining <= 600;
  const panelBottomClass = "bottom-[calc(env(safe-area-inset-bottom)+9.5rem)] sm:bottom-40";
  const buttonBottomClass = "bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] sm:bottom-24";

  const handleCancel = async (lock: PriceLockDto): Promise<void> => {
    const confirmed = await confirmDanger({
      title: "Cancel this price lock?",
      text: `Room ${lock.roomId} · ₩ ${formatNumber(lock.lockedPrice)}`,
      warningText: "The locked rate will be released immediately.",
      confirmText: "Cancel lock",
    });
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setCancellingId(lock._id);
    try {
      await cancelPriceLockMutation({
        variables: { priceLockId: lock._id },
        refetchQueries: [
          { query: GET_MY_PRICE_LOCKS_QUERY },
          { query: GET_MY_PRICE_LOCK_QUERY, variables: { roomId: lock.roomId } },
        ],
        awaitRefetchQueries: true,
      });
      await successAlert("Lock cancelled", "Your price lock has been cancelled.", {
        variant: "lock",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setActionError(message);
      await errorAlert("Cancel failed", message, {
        variant: "lock",
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (!isHydrated) {
    return null;
  }

  if (!canUse) {
    if (!isAuthenticated) {
      if (!onAuthRequired) {
        return null;
      }

      return (
        <>
          <button
            type="button"
            onClick={() => setIsGuestInfoOpen(true)}
            className={`fixed right-3 z-50 inline-flex h-14 w-14 touch-manipulation flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition hover:scale-[1.02] hover:bg-slate-700 sm:right-5 ${buttonBottomClass}`}
            aria-label="Sign in to use price lock"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 118 0v3" />
            </svg>
            <span className="mt-0.5 text-[10px] font-semibold">Login</span>
          </button>

          {isGuestInfoOpen
            ? createPortal(
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/32 px-4">
                  <button
                    type="button"
                    aria-label={t("price_lock_guest_title")}
                    className="absolute inset-0"
                    onClick={() => setIsGuestInfoOpen(false)}
                  />
                  <section className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.42)]">
                    <div className="border-b border-stone-200 px-5 py-4 sm:px-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Price lock</p>
                          <h3 className="mt-1 text-[1.75rem] font-semibold leading-9 tracking-tight text-stone-950">
                            {t("price_lock_guest_title")}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsGuestInfoOpen(false)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition hover:bg-stone-50"
                          aria-label={t("live_interest_close")}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="px-5 py-5 sm:px-6 sm:py-6">
                      <p className="text-sm leading-6 text-stone-600">
                        {t("price_lock_guest_body")}
                      </p>

                      <div className="mt-5 divide-y divide-stone-200 rounded-[1.5rem] border border-stone-200 bg-stone-50/50">
                        {[t("price_lock_guest_benefit_hold"), t("price_lock_guest_benefit_timer"), t("price_lock_guest_benefit_booking")].map((item, index) => (
                          <div key={item} className="flex items-start gap-3 px-4 py-3.5">
                            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-stone-950">
                              {index === 0 ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                  <rect x="5" y="11" width="14" height="9" rx="2" />
                                  <path d="M8 11V8a4 4 0 118 0v3" />
                                </svg>
                              ) : index === 1 ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                  <circle cx="12" cy="12" r="8" />
                                  <path d="M12 8v4l2.5 1.5" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                  <path d="M6 7h12" />
                                  <path d="M6 12h12" />
                                  <path d="M6 17h8" />
                                </svg>
                              )}
                            </span>
                            <p className="text-sm font-medium leading-6 text-stone-900">{item}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => {
                            setIsGuestInfoOpen(false);
                            onAuthRequired();
                          }}
                          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                        >
                          {t("action_log_in")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsGuestInfoOpen(false)}
                          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
                        >
                          {t("live_interest_close")}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>,
                document.body,
              )
            : null}
        </>
      );
    }

    return (
      <button
        type="button"
        className={`fixed right-3 z-50 inline-flex h-14 w-14 touch-manipulation flex-col items-center justify-center rounded-full bg-slate-500 text-white shadow-2xl ${buttonBottomClass}`}
        aria-label="Price lock unavailable"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="6" x2="12" y2="14" />
          <circle cx="12" cy="17" r="1" />
        </svg>
        <span className="mt-0.5 text-[9px] font-semibold">Locked</span>
      </button>
    );
  }

  return (
    <>
      {isOpen ? (
        <section
          className={`fixed left-3 right-3 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:left-auto sm:right-5 sm:w-80 ${panelBottomClass}`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Active Price Locks</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
            >
              Close
            </button>
          </div>
          {nearestLock ? (
            <p className={`mt-2 text-sm font-semibold ${isAlert ? "text-rose-600" : "text-slate-900"}`}>
              Nearest expires in {formatCountdown(nearestRemaining)}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">{loading ? "Checking active locks..." : "No active locks right now."}</p>
          )}
          {actionError ? <p className="mt-2 text-xs font-medium text-rose-600">{actionError}</p> : null}
          <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
            {activeLocks.map((lock) => {
              const remaining = getRemainingSeconds(lock.expiresAt, nowMs);
              return (
                <article key={lock._id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">₩ {formatNumber(lock.lockedPrice)}</p>
                      <p className="text-xs text-slate-600">Room {lock.roomId}</p>
                      <p className={`text-xs font-semibold ${remaining <= 600 ? "text-rose-600" : "text-slate-700"}`}>{formatCountdown(remaining)}</p>
                    </div>
                    <div className="grid gap-1.5">
                      <Link
                        href={`/rooms/${lock.roomId}`}
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleCancel(lock)}
                        disabled={cancellingId === lock._id}
                        className="inline-flex items-center justify-center rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancellingId === lock._id ? "..." : "Cancel"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={`fixed right-3 z-50 inline-flex h-14 w-14 touch-manipulation flex-col items-center justify-center rounded-full text-white shadow-2xl transition hover:scale-[1.02] sm:right-5 ${buttonBottomClass} ${
          isAlert ? "bg-rose-600 hover:bg-rose-500" : activeLocks.length > 0 ? "bg-slate-900 hover:bg-slate-700" : "bg-sky-700 hover:bg-sky-600"
        }`}
        aria-label="Open price lock status"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 118 0v3" />
        </svg>
        <span className="mt-0.5 text-[10px] font-semibold">{nearestLock ? formatCountdown(nearestRemaining) : "Idle"}</span>
      </button>
    </>
  );
}
