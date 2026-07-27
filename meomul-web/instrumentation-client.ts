/**
 * Sentry in the browser. Next.js loads this before app code.
 *
 * Only NEXT_PUBLIC_SENTRY_DSN is usable here — it is inlined into the bundle at build
 * time, so it must be passed as a Docker build arg, not just a runtime env var. A DSN is
 * not a secret; it is write-only by design.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_BUILD_ID,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0),
    // Session Replay is off: it records guest booking and chat screens.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
