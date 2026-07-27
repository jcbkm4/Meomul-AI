import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/i18n/config";
import {
  messages,
  type TranslationKey,
} from "@/lib/i18n/messages";

interface TranslateParams {
  [key: string]: string | number;
}

interface I18nContextValue {
  locale: SupportedLocale;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const interpolate = (template: string, params?: TranslateParams): string => {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined ? "" : String(value);
  });
};

export const normalizeLocale = (value?: string): SupportedLocale => {
  if (value && isSupportedLocale(value)) {
    return value;
  }

  return DEFAULT_LOCALE;
};

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale?: string;
}) {
  const normalizedLocale = normalizeLocale(locale);

  const value = useMemo<I18nContextValue>(() => {
    const localeMessages = messages[normalizedLocale];
    const fallbackMessages = messages[DEFAULT_LOCALE];

    return {
      locale: normalizedLocale,
      t: (key, params) =>
        interpolate(localeMessages[key] ?? fallbackMessages[key], params),
    };
  }, [normalizedLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
};
