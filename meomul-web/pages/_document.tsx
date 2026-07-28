import { Html, Head, Main, NextScript } from "next/document";
import type { DocumentProps } from "next/document";

/**
 * `lang` comes from the request's locale rather than being hardcoded.
 *
 * It used to be a literal "en", patched on the client in _app.tsx after hydration. That
 * left every server-rendered page — including the ones crawlers and translation tools
 * actually read — claiming to be English while serving Korean, Russian, or Uzbek.
 */
export default function Document({ locale }: DocumentProps) {
  return (
    <Html lang={locale ?? "en"}>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="Meomul — Discover and book curated premium hotels across South Korea. Personalized recommendations, real-time availability, and exclusive last-minute deals."
        />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" type="image/svg+xml" href="/brand/meomul-mark-pin.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="64x64" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
