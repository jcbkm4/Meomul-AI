import { env } from "@/lib/config/env";
import type { AuthMember, SessionMember } from "@/types/auth";

interface RecommendationProfileResponse {
  data?: {
    getMyRecommendationProfile?: {
      hasProfile: boolean;
    };
  };
}

const ONBOARDING_REQUIRED_MEMBER_TYPE = "USER";
const ONBOARDING_COMPLETION_CACHE_PREFIX = "meomul.onboarding.complete.";
const ONBOARDING_COMPLETION_CACHE_TTL_MS = 5 * 60 * 1000;

const ONBOARDING_PROFILE_QUERY = `
  query GetMyRecommendationProfile {
    getMyRecommendationProfile {
      hasProfile
    }
  }
`;

const isBrowser = (): boolean => typeof window !== "undefined";

const isSafeInternalPath = (path: string): boolean => path.startsWith("/");

const normalizePath = (path: string): string => {
  if (!path) {
    return "/";
  }
  return isSafeInternalPath(path) ? path : "/";
};

const getCacheKey = (memberId: string): string => `${ONBOARDING_COMPLETION_CACHE_PREFIX}${memberId}`;

const parsePathname = (path: string): string => normalizePath(path).split("?")[0].split("#")[0];

export const buildOnboardingPath = (nextPath: string): string => {
  const safeNextPath = normalizePath(nextPath);
  return `/onboarding?next=${encodeURIComponent(safeNextPath)}`;
};

export const isOnboardingRequiredMember = (
  member: SessionMember | AuthMember | null | undefined,
): boolean => member?.memberType === ONBOARDING_REQUIRED_MEMBER_TYPE;

export const isOnboardingExemptPath = (path: string): boolean => {
  const pathname = parsePathname(path);
  return (
    pathname === "/onboarding" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/host/") ||
    pathname === "/403" ||
    pathname === "/404"
  );
};

export const clearOnboardingCompletionCache = (): void => {
  if (!isBrowser()) {
    return;
  }

  const keysToDelete: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && key.startsWith(ONBOARDING_COMPLETION_CACHE_PREFIX)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => window.localStorage.removeItem(key));
};

const getCachedOnboardingCompletion = (memberId: string): boolean | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(getCacheKey(memberId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { value: boolean; expiresAt: number };
    if (typeof parsed.value !== "boolean" || typeof parsed.expiresAt !== "number") {
      window.localStorage.removeItem(getCacheKey(memberId));
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(getCacheKey(memberId));
      return null;
    }

    return parsed.value;
  } catch {
    window.localStorage.removeItem(getCacheKey(memberId));
    return null;
  }
};

const setCachedOnboardingCompletion = (memberId: string, value: boolean): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    getCacheKey(memberId),
    JSON.stringify({
      value,
      expiresAt: Date.now() + ONBOARDING_COMPLETION_CACHE_TTL_MS,
    }),
  );
};

export const setOnboardingCompletionCachedValue = (memberId: string, value: boolean): void => {
  setCachedOnboardingCompletion(memberId, value);
};

const fetchHasRecommendationProfile = async (): Promise<boolean | null> => {
  try {
    const response = await fetch(env.graphqlHttpUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: ONBOARDING_PROFILE_QUERY,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as RecommendationProfileResponse;
    const hasProfile = payload.data?.getMyRecommendationProfile?.hasProfile;
    if (typeof hasProfile !== "boolean") {
      return null;
    }

    return hasProfile;
  } catch {
    return null;
  }
};

export const resolveHasRecommendationProfile = async (
  memberId: string,
  options?: { forceRefresh?: boolean },
): Promise<boolean | null> => {
  if (!options?.forceRefresh) {
    const cached = getCachedOnboardingCompletion(memberId);
    if (cached !== null) {
      return cached;
    }
  }

  const hasProfile = await fetchHasRecommendationProfile();
  if (hasProfile !== null) {
    setCachedOnboardingCompletion(memberId, hasProfile);
  }

  return hasProfile;
};

export const resolveOnboardingRedirect = async (
  member: SessionMember | null,
  currentPath: string,
): Promise<string | null> => {
  if (!member || !isOnboardingRequiredMember(member)) {
    return null;
  }

  if (isOnboardingExemptPath(currentPath)) {
    return null;
  }

  const hasProfile = await resolveHasRecommendationProfile(member._id);
  if (hasProfile === false) {
    return buildOnboardingPath(currentPath);
  }

  return null;
};
