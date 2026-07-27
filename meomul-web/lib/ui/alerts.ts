import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { lockBodyScroll } from "@/lib/ui/body-scroll-lock";
import {
  AlertTriangle,
  BedDouble,
  CalendarCheck2,
  CheckCircle2,
  HeartOff,
  Hotel,
  Image as ImageIcon,
  Info,
  Lock,
  MessageSquareMore,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserRound,
  Video,
  X,
} from "lucide-react";

type AlertTone = "success" | "error" | "info" | "question" | "warning";

interface AlertOptions {
  tone: AlertTone;
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  focusCancel?: boolean;
  iconOverride?: {
    icon: typeof CheckCircle2;
    iconWrap: string;
    iconColor: string;
  };
}

interface ConfirmActionOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: NoticeVariant;
}

interface ConfirmDangerOptions extends ConfirmActionOptions {
  warningText?: string;
}

type NoticeVariant =
  | "default"
  | "trash"
  | "saved"
  | "profile"
  | "review"
  | "image"
  | "video"
  | "lock"
  | "subscription"
  | "chat"
  | "booking"
  | "hotel"
  | "room";

interface NoticeOptions {
  variant?: NoticeVariant;
}

const isBrowser = (): boolean => typeof window !== "undefined";

const TONE_STYLES: Record<
  AlertTone,
  {
    icon: typeof CheckCircle2;
    iconColor: string;
    iconShell: string;
    confirmButton: string;
    destructive: boolean;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    iconShell: "bg-emerald-50/80 ring-1 ring-emerald-100",
    confirmButton:
      "border-slate-950 bg-slate-950 text-white hover:bg-slate-800",
    destructive: false,
  },
  error: {
    icon: AlertTriangle,
    iconColor: "text-rose-600",
    iconShell: "bg-rose-50 ring-1 ring-rose-200",
    confirmButton:
      "border-slate-950 bg-slate-950 text-white hover:bg-slate-800",
    destructive: true,
  },
  info: {
    icon: Info,
    iconColor: "text-sky-600",
    iconShell: "bg-sky-50/80 ring-1 ring-sky-100",
    confirmButton:
      "border-slate-950 bg-slate-950 text-white hover:bg-slate-800",
    destructive: false,
  },
  question: {
    icon: Sparkles,
    iconColor: "text-slate-700",
    iconShell: "bg-slate-100 ring-1 ring-slate-200",
    confirmButton:
      "border-slate-900 bg-slate-900 text-white hover:bg-slate-700",
    destructive: false,
  },
  warning: {
    icon: ShieldAlert,
    iconColor: "text-rose-600",
    iconShell:
      "bg-rose-50 ring-1 ring-rose-200 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.05)]",
    confirmButton:
      "border-rose-600 bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-200",
    destructive: true,
  },
};

const BASE_BUTTON_CLASS =
  "inline-flex min-w-[7.75rem] items-center justify-center rounded-[0.9rem] border px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300";

const CANCEL_BUTTON_CLASS = `${BASE_BUTTON_CLASS} border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`;

const DEFAULT_NOTICE_VARIANT: Record<
  Extract<AlertTone, "success" | "error" | "info">,
  NoticeVariant
> = {
  success: "default",
  error: "default",
  info: "default",
};

const NOTICE_VARIANT_STYLES: Record<
  NoticeVariant,
  {
    icon: typeof CheckCircle2;
    iconWrap: string;
    iconColor: string;
  }
> = {
  default: {
    icon: CheckCircle2,
    iconWrap: "bg-slate-100",
    iconColor: "text-slate-700",
  },
  trash: {
    icon: Trash2,
    iconWrap: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  saved: {
    icon: HeartOff,
    iconWrap: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  profile: {
    icon: UserRound,
    iconWrap: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  review: {
    icon: ShieldCheck,
    iconWrap: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  image: {
    icon: ImageIcon,
    iconWrap: "bg-fuchsia-50",
    iconColor: "text-fuchsia-600",
  },
  video: {
    icon: Video,
    iconWrap: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  lock: {
    icon: Lock,
    iconWrap: "bg-cyan-50",
    iconColor: "text-cyan-700",
  },
  subscription: {
    icon: Sparkles,
    iconWrap: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  chat: {
    icon: MessageSquareMore,
    iconWrap: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  booking: {
    icon: CalendarCheck2,
    iconWrap: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  hotel: {
    icon: Hotel,
    iconWrap: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  room: {
    icon: BedDouble,
    iconWrap: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
};

const NOTICE_TONE_STYLES: Record<
  Extract<AlertTone, "success" | "error" | "info">,
  {
    icon: typeof CheckCircle2;
    iconWrap: string;
    iconColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: AlertTriangle,
    iconWrap: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  info: {
    icon: Info,
    iconWrap: "bg-sky-50",
    iconColor: "text-sky-600",
  },
};

const resolveNotice = (
  tone: Extract<AlertTone, "success" | "error" | "info">,
  title: string,
  text?: string,
  options?: NoticeOptions,
): Promise<void> => {
  if (!isBrowser()) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const variant = options?.variant ?? DEFAULT_NOTICE_VARIANT[tone];
    const toneStyle = NOTICE_TONE_STYLES[tone];
    const style = NOTICE_VARIANT_STYLES[variant];
    const Icon = style.icon;
    let timeoutId = 0;

    const cleanup = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      root.unmount();
      host.remove();
      resolve();
    };

    timeoutId = window.setTimeout(cleanup, 2400);

    root.render(
      createElement(
        "div",
        {
          className:
            "pointer-events-none fixed right-4 top-16 z-[220] w-[min(90vw,19rem)]",
        },
        createElement(
          "div",
          {
            className:
              "pointer-events-auto overflow-hidden rounded-[1rem] border border-stone-200 bg-white shadow-[0_12px_30px_-22px_rgba(15,23,42,0.24)]",
            role: "status",
            "aria-live": "polite",
          },
          createElement(
            "div",
            {
              className: "flex items-start gap-3 px-3.5 py-3",
            },
            createElement(
              "div",
              {
                className: `mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.iconWrap}`,
              },
              createElement(Icon, { size: 15, className: style.iconColor }),
            ),
            createElement(
              "div",
              { className: "min-w-0 flex-1" },
              createElement(
                "p",
                { className: "text-[13px] font-semibold leading-5 text-slate-900" },
                title,
              ),
              text
                ? createElement(
                    "p",
                    { className: "mt-0.5 text-[12px] leading-5 text-slate-500" },
                    text,
                  )
                : null,
            ),
            createElement(
              "button",
              {
                type: "button",
                onClick: cleanup,
                className:
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-500",
                "aria-label": "Dismiss notice",
              },
              createElement(X, { size: 14 }),
            ),
          ),
        ),
      ),
    );
  });
};

const resolveAlert = (options: AlertOptions): Promise<boolean> => {
  if (!isBrowser()) {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const releaseScrollLock = lockBodyScroll();

    const cleanup = (result: boolean) => {
      releaseScrollLock();
      root.unmount();
      host.remove();
      resolve(result);
    };

    const handleClose = (result: boolean) => {
      window.removeEventListener("keydown", onKeyDown);
      cleanup(result);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const tone = TONE_STYLES[options.tone];
    const Icon = options.iconOverride?.icon ?? tone.icon;

    root.render(
      createElement(
        "div",
        {
          className:
            "fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/36 px-0 py-0 sm:items-center sm:px-4 sm:py-6",
          onClick: () => handleClose(false),
        },
        createElement(
          "div",
          {
            className:
              "relative w-full overflow-hidden rounded-t-[1.75rem] border border-slate-200/80 bg-white shadow-[0_20px_56px_-28px_rgba(15,23,42,0.28)] sm:max-w-[28rem] sm:rounded-[1rem]",
            onClick: (event: MouseEvent) => event.stopPropagation(),
          },
          createElement("div", {
            className:
              "mx-auto mt-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden",
          }),
          createElement(
            "div",
            {
              className:
                "flex items-center justify-between px-5 py-4 sm:px-6 sm:py-4.5",
            },
            createElement("div"),
            createElement(
              "button",
              {
                type: "button",
                onClick: () => handleClose(false),
                className:
                  "inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600",
                "aria-label": "Close alert",
              },
              createElement(X, { size: 18 }),
            ),
          ),
          createElement(
            "div",
            {
              className:
                "px-5 pb-[max(1.2rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-6",
            },
            createElement(
              "div",
              { className: "flex flex-col gap-5 sm:gap-5.5" },
              createElement(
                "div",
                { className: "space-y-3 text-center" },
                tone.destructive
                  ? createElement(
                      "div",
                      {
                        className: `mx-auto inline-flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full ${
                          options.iconOverride
                            ? options.iconOverride.iconWrap
                            : tone.iconShell
                        }`,
                      },
                      createElement(Icon, {
                        size: 30,
                        className: options.iconOverride?.iconColor ?? tone.iconColor,
                      }),
                    )
                  : createElement(
                      "div",
                      options.iconOverride
                        ? {
                            className: `mx-auto inline-flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full ${options.iconOverride.iconWrap}`,
                          }
                        : {
                            className: "inline-flex items-center gap-3",
                          },
                      options.iconOverride
                        ? createElement(Icon, {
                            size: 22,
                            className: options.iconOverride.iconColor,
                          })
                        : createElement("img", {
                            src: "/brand/meomul-mark-pin.svg",
                            alt: "Meomul",
                            className: "h-12 w-12 object-contain",
                          }),
                      options.iconOverride
                        ? null
                        : createElement(
                            "span",
                            {
                              className:
                                "text-[1.02rem] font-semibold tracking-[0.22em] text-slate-950",
                            },
                            "MEOMUL",
                          ),
                    ),
                createElement(
                  "h2",
                  {
                    className:
                      "text-[1.14rem] font-semibold leading-tight tracking-tight text-slate-950 sm:text-[1.28rem]",
                  },
                  options.title,
                ),
                options.text
                  ? createElement(
                      "p",
                      {
                        className:
                          "mx-auto max-w-[34ch] whitespace-pre-line text-[14px] leading-6 text-slate-600 sm:text-[14px]",
                      },
                      options.text,
                    )
                  : null,
              ),
              createElement(
                "div",
                {
                  className: `flex w-full border-t border-slate-200 pt-4 sm:pt-4.5 ${options.showCancel ? "flex-col-reverse gap-2.5 sm:flex-row sm:justify-center" : "justify-center"}`,
                },
                options.showCancel
                  ? createElement(
                      "button",
                      {
                        type: "button",
                        autoFocus: options.focusCancel,
                        onClick: () => handleClose(false),
                        className: `${CANCEL_BUTTON_CLASS} w-full sm:w-auto`,
                      },
                      options.cancelText ?? "Cancel",
                    )
                  : null,
                createElement(
                  "button",
                  {
                    type: "button",
                    autoFocus: !options.focusCancel,
                    onClick: () => handleClose(true),
                    className: `${BASE_BUTTON_CLASS} ${tone.confirmButton} w-full sm:w-auto`,
                  },
                  options.confirmText ?? "OK",
                ),
              ),
            ),
          ),
        ),
      ),
    );
  });
};

export const successAlert = async (
  title: string,
  text?: string,
  options?: NoticeOptions,
): Promise<void> => {
  const variant = options?.variant
    ? NOTICE_VARIANT_STYLES[options.variant]
    : null;
  await resolveAlert({
    tone: "success",
    title,
    text,
    iconOverride: variant
      ? {
          icon: variant.icon,
          iconWrap: variant.iconWrap,
          iconColor: variant.iconColor,
        }
      : undefined,
  });
};

export const errorAlert = async (
  title: string,
  text?: string,
  options?: NoticeOptions,
): Promise<void> => {
  const variant = options?.variant
    ? NOTICE_VARIANT_STYLES[options.variant]
    : null;
  await resolveAlert({
    tone: "error",
    title,
    text,
    iconOverride: variant
      ? {
          icon: variant.icon,
          iconWrap: variant.iconWrap,
          iconColor: variant.iconColor,
        }
      : undefined,
  });
};

export const infoAlert = async (
  title: string,
  text?: string,
  options?: NoticeOptions,
): Promise<void> => {
  const variant = options?.variant
    ? NOTICE_VARIANT_STYLES[options.variant]
    : null;
  await resolveAlert({
    tone: "info",
    title,
    text,
    iconOverride: variant
      ? {
          icon: variant.icon,
          iconWrap: variant.iconWrap,
          iconColor: variant.iconColor,
        }
      : undefined,
  });
};

export const confirmAction = async ({
  title,
  text,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant,
}: ConfirmActionOptions): Promise<boolean> =>
  resolveAlert({
    tone: "question",
    title,
    text,
    showCancel: true,
    confirmText,
    cancelText,
    iconOverride: variant
      ? {
          icon: NOTICE_VARIANT_STYLES[variant].icon,
          iconWrap: NOTICE_VARIANT_STYLES[variant].iconWrap,
          iconColor: NOTICE_VARIANT_STYLES[variant].iconColor,
        }
      : undefined,
  });

export const confirmDanger = async ({
  title,
  text,
  warningText,
  confirmText = "Yes, continue",
  cancelText = "Cancel",
  variant,
}: ConfirmDangerOptions): Promise<boolean> => {
  const composedText = warningText
    ? `${text ? `${text}\n\n` : ""}${warningText}`
    : text;

  return resolveAlert({
    tone: "warning",
    title,
    text: composedText,
    showCancel: true,
    focusCancel: true,
    confirmText,
    cancelText,
    iconOverride: variant
      ? {
          icon: NOTICE_VARIANT_STYLES[variant].icon,
          iconWrap: NOTICE_VARIANT_STYLES[variant].iconWrap,
          iconColor: NOTICE_VARIANT_STYLES[variant].iconColor,
        }
      : undefined,
  });
};
