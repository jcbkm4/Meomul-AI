/**
 * Sentry for the Next.js server runtime (SSR, getServerSideProps, API routes).
 *
 * Inert when SENTRY_DSN is unset, so local development and CI behave exactly as before.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_BUILD_ID,
    // Tracing is billed per transaction and errors are what we lack today.
    // Raise deliberately once error volume is understood.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
    // Auth cookies and guest details must never leave the server.
    sendDefaultPii: false,
  });
}
