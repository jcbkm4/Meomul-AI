import type { ReactNode } from "react";

type ErrorNoticeTone = "error" | "warn" | "info";

interface ErrorNoticeProps {
  message: ReactNode;
  tone?: ErrorNoticeTone;
  title?: string;
  className?: string;
}

const toneClasses: Record<ErrorNoticeTone, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

export function ErrorNotice({ message, tone = "error", title, className }: ErrorNoticeProps) {
  const classes = ["rounded-xl border px-4 py-3 text-sm", toneClasses[tone], className].filter(Boolean).join(" ");

  return (
    <section className={classes} role={tone === "error" ? "alert" : "status"} aria-live="polite">
      {title ? <p className="font-semibold">{title}</p> : null}
      <p>{message}</p>
    </section>
  );
}
