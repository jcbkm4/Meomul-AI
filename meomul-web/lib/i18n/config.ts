export const SUPPORTED_LOCALES = ["en", "ko", "ru", "uz"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  ko: "한국어",
  ru: "Русский",
  uz: "O'zbekcha",
};

export const isSupportedLocale = (value: string): value is SupportedLocale =>
  SUPPORTED_LOCALES.includes(value as SupportedLocale);
