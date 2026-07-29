import Head from "next/head";
import { useRouter } from "next/router";
import { env } from "@/lib/config/env";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";

const SITE_URL = env.siteUrl.replace(/\/+$/, "");

/**
 * Builds the URL for a path in a given locale, matching Next's prefix routing:
 * the default locale is unprefixed, the rest carry `/<locale>`.
 */
const localeUrl = (locale: string, path: string): string => {
  const normalized = path === "/" ? "" : path.replace(/\/+$/, "");
  return locale === DEFAULT_LOCALE
    ? `${SITE_URL}${normalized || "/"}`
    : `${SITE_URL}/${locale}${normalized || ""}`;
};

interface LocalizedSeoProps {
  /** Locale-independent path, e.g. "/hotels" — no locale prefix, no query string. */
  path: string;
  /** Omit on pages that already emit their own canonical, to avoid a duplicate tag. */
  withCanonical?: boolean;
}

/**
 * Emits hreflang alternates, and optionally the canonical, for a localized page.
 *
 * The site serves four locales through Next's prefix routing, but published no alternate
 * links at all. Without them a search engine sees /hotels, /ko/hotels, /ru/hotels and
 * /uz/hotels as four competing near-duplicates rather than one page in four languages,
 * and picks one more or less arbitrarily.
 *
 * Next merges multiple <Head> instances, so this composes with a page's existing head
 * content instead of replacing it.
 */
export function LocalizedSeo({ path, withCanonical = false }: LocalizedSeoProps) {
  const { locale } = useRouter();
  const activeLocale = locale ?? DEFAULT_LOCALE;

  return (
    <Head>
      {withCanonical && (
        <link rel="canonical" href={localeUrl(activeLocale, path)} key="canonical" />
      )}
      {SUPPORTED_LOCALES.map((supported) => (
        <link
          key={`alternate-${supported}`}
          rel="alternate"
          hrefLang={supported}
          href={localeUrl(supported, path)}
        />
      ))}
      {/* Tells crawlers which version to serve when no locale matches the user. */}
      <link rel="alternate" hrefLang="x-default" href={localeUrl(DEFAULT_LOCALE, path)} />
    </Head>
  );
}
