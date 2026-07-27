import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const TOAST_DURATION_MS = 2800;

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClasses: Record<ToastKind, string> = {
  success:
    "border-stone-200 bg-white text-slate-900 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.24)]",
  error:
    "border-stone-200 bg-white text-slate-900 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.24)]",
  info:
    "border-stone-200 bg-white text-slate-900 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.24)]",
};

const toneIconClasses: Record<ToastKind, string> = {
  success: "bg-emerald-50 text-emerald-600",
  error: "bg-rose-50 text-rose-600",
  info: "bg-sky-50 text-sky-600",
};

const toneLabels: Record<ToastKind, string> = {
  success: "Saved",
  error: "Action needed",
  info: "Update",
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutMapRef = useRef<Record<number, number>>({});
  const idCounterRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    const timeoutId = timeoutMapRef.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutMapRef.current[id];
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (kind: ToastKind, message: string) => {
      idCounterRef.current += 1;
      const nextToast: ToastItem = {
        id: idCounterRef.current,
        kind,
        message,
      };

      setToasts((prev) => [...prev, nextToast].slice(-4));

      const timeoutId = window.setTimeout(() => {
        removeToast(nextToast.id);
      }, TOAST_DURATION_MS);
      timeoutMapRef.current[nextToast.id] = timeoutId;
    },
    [removeToast],
  );

  useEffect(() => {
    return () => {
      Object.values(timeoutMapRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutMapRef.current = {};
    };
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      success: (message: string) => pushToast("success", message),
      error: (message: string) => pushToast("error", message),
      info: (message: string) => pushToast("info", message),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-16 z-[140] flex w-[min(90vw,21rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto overflow-hidden rounded-[1rem] border ${toneClasses[toast.kind]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3 px-3.5 py-3">
              <div
                className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneIconClasses[toast.kind]}`}
              >
                {toast.kind === "success" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                    <path d="M5 12.5l4.2 4.2L19 7.5" />
                  </svg>
                ) : toast.kind === "error" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                    <path d="M12 8v4m0 4h.01" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.72 3h16.92a2 2 0 001.72-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 10v5m0-8h.01" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500">
                  {toneLabels[toast.kind]}
                </p>
                <p className="mt-0.5 pr-2 text-[13px] font-medium leading-5 text-slate-800">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                aria-label="Dismiss notice"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
