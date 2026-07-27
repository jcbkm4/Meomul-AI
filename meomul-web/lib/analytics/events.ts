import { TRACK_ANALYTICS_EVENT_MUTATION_TEXT } from "@/graphql/analytics.gql";
import { getSessionMember } from "@/lib/auth/session";
import { env } from "@/lib/config/env";

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsPayload = Record<string, AnalyticsValue>;

interface BrowserWithAnalytics extends Window {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (command: "event", eventName: string, params?: Record<string, unknown>) => void;
}

interface AnalyticsMutationInput {
  eventName: string;
  eventPath?: string;
  payload?: string;
  source?: string;
  userAgent?: string;
}

const MAX_PENDING_ANALYTICS_EVENTS = 40;
const analyticsQueue: AnalyticsMutationInput[] = [];
let isAnalyticsQueueFlushing = false;

const toSafeJson = (value: Record<string, unknown>): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({
      eventName: typeof value.eventName === "string" ? value.eventName : "unknown",
      serializationError: true,
      timestamp: new Date().toISOString(),
    });
  }
};

const getCurrentPath = (): string => {
  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return path.length <= 500 ? path : path.slice(0, 500);
};

const sendAnalyticsEvent = async (input: AnalyticsMutationInput): Promise<void> => {
  await fetch(env.graphqlHttpUrl, {
    method: "POST",
    credentials: "include", // sends httpOnly access token cookie automatically
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: TRACK_ANALYTICS_EVENT_MUTATION_TEXT,
      variables: { input },
    }),
    keepalive: true,
  });
};

const flushAnalyticsQueue = async (): Promise<void> => {
  if (isAnalyticsQueueFlushing || typeof window === "undefined" || analyticsQueue.length === 0) {
    return;
  }

  if (!getSessionMember()) {
    analyticsQueue.length = 0;
    return;
  }

  isAnalyticsQueueFlushing = true;
  try {
    while (analyticsQueue.length > 0) {
      const nextEvent = analyticsQueue.shift();
      if (!nextEvent) {
        continue;
      }

      try {
        await sendAnalyticsEvent(nextEvent);
      } catch {
        // Analytics is non-critical. Skip failed events and continue.
      }
    }
  } finally {
    isAnalyticsQueueFlushing = false;
  }
};

const enqueueAnalyticsEvent = (input: AnalyticsMutationInput): void => {
  analyticsQueue.push(input);
  if (analyticsQueue.length > MAX_PENDING_ANALYTICS_EVENTS) {
    analyticsQueue.shift();
  }
  void flushAnalyticsQueue();
};

export const trackAnalyticsEvent = (eventName: string, payload: AnalyticsPayload = {}): void => {
  if (typeof window === "undefined") {
    return;
  }

  const browser = window as BrowserWithAnalytics;
  const eventPayload = {
    event: eventName,
    eventName,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  if (Array.isArray(browser.dataLayer)) {
    browser.dataLayer.push(eventPayload);
  }

  if (typeof browser.gtag === "function") {
    browser.gtag("event", eventName, payload);
  }

  window.dispatchEvent(
    new CustomEvent("meomul:analytics", {
      detail: eventPayload,
    }),
  );

  enqueueAnalyticsEvent({
    eventName,
    eventPath: getCurrentPath(),
    payload: toSafeJson(eventPayload),
    source: "web",
    userAgent: window.navigator.userAgent,
  });
};
