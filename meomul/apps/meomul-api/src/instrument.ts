/**
 * Sentry initialisation.
 *
 * This must be imported before anything else in the process — Sentry patches modules
 * (http, express, mongoose, …) as they load, and anything required earlier is invisible
 * to it. `main.ts` imports this file first for that reason; do not reorder it.
 *
 * With no SENTRY_DSN set, initialisation is skipped entirely and the SDK stays inert,
 * so local development and tests behave exactly as before.
 */
import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
	Sentry.init({
		dsn,
		environment: process.env.NODE_ENV ?? 'development',
		// Ties an event to the deployed build. Same value the frontend uses.
		release: process.env.SENTRY_RELEASE ?? process.env.NEXT_PUBLIC_BUILD_ID,
		// Performance tracing defaults off: it is billed per transaction, and errors are
		// what we are missing today. Raise deliberately once error volume is understood.
		tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
		// Never ship request bodies or headers — bookings carry guest personal data and
		// the auth cookie would otherwise be attached to every event.
		sendDefaultPii: false,
		beforeSend(event) {
			if (event.request) {
				delete event.request.cookies;
				delete event.request.headers;
				delete event.request.data;
			}
			return event;
		},
	});
}

export const isSentryEnabled = Boolean(dsn);
