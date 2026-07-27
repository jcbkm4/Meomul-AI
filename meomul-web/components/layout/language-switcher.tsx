import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SupportedLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

interface LanguageSwitcherProps {
  mobile?: boolean;
}

const LOCALE_OPTIONS: Record<
  SupportedLocale,
  { flag: string; label: string }
> = {
  en: { flag: "🇺🇸", label: "English" },
  ko: { flag: "🇰🇷", label: "Korean" },
  uz: { flag: "🇺🇿", label: "O'zbek tili" },
  ru: { flag: "🇷🇺", label: "Russian" },
};

const LOCALE_ORDER: SupportedLocale[] = ["en", "ko", "uz", "ru"];

export function LanguageSwitcher({
  mobile = false,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        ref.current &&
        event.target instanceof Node &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLocale = useMemo(
    () => LOCALE_OPTIONS[locale as SupportedLocale] ?? LOCALE_OPTIONS.en,
    [locale],
  );

  return (
    <div
      ref={ref}
      className={`relative ${mobile ? "w-full" : "shrink-0"}`}
    >
      <button
        type="button"
        aria-label={t("locale_switcher_label")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 bg-transparent text-slate-900 transition hover:bg-slate-50 ${
          mobile
            ? "w-full justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-slate-300"
            : "h-11 w-11 justify-center rounded-xl"
        }`}
      >
        <span className="flex items-center gap-2">
          <span className={mobile ? "text-xl" : "text-lg leading-none"}>
            {currentLocale.flag}
          </span>
          {mobile ? (
            <span className="text-sm font-medium text-slate-700">
              {currentLocale.label}
            </span>
          ) : null}
        </span>
        {mobile ? (
          <ChevronDown
            size={18}
            className={`text-slate-500 transition ${open ? "rotate-180" : ""}`}
          />
        ) : null}
      </button>

      {open ? (
        <div
          className={`absolute z-[90] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] ${
            mobile
              ? "left-0 right-0 top-[calc(100%+10px)]"
              : "right-0 top-[calc(100%+10px)] min-w-[220px]"
          }`}
        >
          <div className="p-2">
            {LOCALE_ORDER.map((supportedLocale) => {
              const option = LOCALE_OPTIONS[supportedLocale];
              const active = supportedLocale === locale;

              return (
                <button
                  key={supportedLocale}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void router.push(router.asPath, router.asPath, {
                      locale: supportedLocale,
                    });
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[22px] leading-none">{option.flag}</span>
                  <span className="text-base font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
