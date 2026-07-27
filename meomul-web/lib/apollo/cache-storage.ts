import type { ApolloCache, NormalizedCacheObject } from "@apollo/client";
import { env } from "@/lib/config/env";

const APOLLO_CACHE_KEY = "meomul.apollo_cache";
// Combines a manual bump with the Next.js build ID so any deployment
// automatically invalidates stale cached data from a previous schema version.
const APOLLO_CACHE_VERSION = `1:${env.buildId}`;
const APOLLO_CACHE_MAX_AGE_MS = 1000 * 60 * 30;

interface PersistedApolloCache {
  version: string;
  savedAt: number;
  data: NormalizedCacheObject;
}

const isBrowser = (): boolean => typeof window !== "undefined";

const isPersistedPayload = (value: unknown): value is PersistedApolloCache => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<PersistedApolloCache>;
  return (
    payload.version === APOLLO_CACHE_VERSION &&
    typeof payload.savedAt === "number" &&
    typeof payload.data === "object" &&
    payload.data !== null
  );
};

export const restorePersistedApolloCache = (cache: PersistableCache): void => {
  if (!isBrowser()) {
    return;
  }

  const raw = window.localStorage.getItem(APOLLO_CACHE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isPersistedPayload(parsed)) {
      window.localStorage.removeItem(APOLLO_CACHE_KEY);
      return;
    }

    if (Date.now() - parsed.savedAt > APOLLO_CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(APOLLO_CACHE_KEY);
      return;
    }

    cache.restore(parsed.data);
  } catch {
    window.localStorage.removeItem(APOLLO_CACHE_KEY);
  }
};

export const persistApolloCache = (cache: PersistableCache): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    const payload: PersistedApolloCache = {
      version: APOLLO_CACHE_VERSION,
      savedAt: Date.now(),
      data: cache.extract() as NormalizedCacheObject,
    };
    window.localStorage.setItem(APOLLO_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors (quota/private mode).
  }
};

export const clearPersistedApolloCache = (): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(APOLLO_CACHE_KEY);
};
type PersistableCache = Pick<ApolloCache, "extract" | "restore">;
