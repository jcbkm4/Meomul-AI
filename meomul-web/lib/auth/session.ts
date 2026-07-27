import { clearPersistedApolloCache } from "@/lib/apollo/cache-storage";
import { clearOnboardingCompletionCache } from "@/lib/auth/onboarding-status";
import { env } from "@/lib/config/env";
import type { AuthMember, SessionMember } from "@/types/auth";

// Access token is stored as an httpOnly cookie set by the server — never readable by JS.
// We only persist the token's `exp` claim so we can show session-expiry warnings.
const TOKEN_EXP_KEY = "meomul.token_exp";
const MEMBER_KEY = "meomul.member";

const isBrowser = (): boolean => typeof window !== "undefined";

// Module-level subscriber — site-frame registers here to get instant updates
// when the profile page saves changes without a route change.
let _onSessionChange: (() => void) | null = null;

export const registerSessionChangeListener = (cb: () => void): void => {
  _onSessionChange = cb;
};

export const unregisterSessionChangeListener = (): void => {
  _onSessionChange = null;
};

// Cannot read the httpOnly cookie from JS — always returns null.
// Retained for API compatibility; use getSessionMember() to check auth state.
export const getAccessToken = (): string | null => null;

export const getSessionMember = (): SessionMember | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(MEMBER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionMember;
  } catch {
    window.localStorage.removeItem(MEMBER_KEY);
    return null;
  }
};

export const saveAuthSession = (authMember: AuthMember): void => {
  if (!isBrowser()) {
    return;
  }

  clearPersistedApolloCache();
  clearOnboardingCompletionCache();
  const { accessToken, ...member } = authMember;
  // Store only the `exp` claim so session-expiry warnings work without the raw token.
  try {
    const parts = accessToken.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1])) as { exp?: number };
      if (typeof payload.exp === "number") {
        window.localStorage.setItem(TOKEN_EXP_KEY, String(payload.exp));
      }
    }
  } catch {
    // Ignore parse errors — expiry warnings simply won't fire
  }
  window.localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
  _onSessionChange?.();
};

export const clearAuthSession = (): void => {
  if (!isBrowser()) {
    return;
  }

  clearPersistedApolloCache();
  clearOnboardingCompletionCache();
  window.localStorage.removeItem(TOKEN_EXP_KEY);
  window.localStorage.removeItem(MEMBER_KEY);
  _onSessionChange?.();
};

export const updateSessionMember = (
  patch: Partial<
    Omit<
      SessionMember,
      "_id" | "memberType" | "memberStatus" | "memberAuthType" | "memberPhone"
    >
  >,
): void => {
  if (!isBrowser()) return;
  const current = getSessionMember();
  if (!current) return;
  window.localStorage.setItem(
    MEMBER_KEY,
    JSON.stringify({ ...current, ...patch }),
  );
  _onSessionChange?.();
};

export const isAuthenticated = (): boolean => getSessionMember() !== null;

/**
 * Decode the JWT payload (without verification) to read its `exp` claim.
 * Returns the expiry as a Unix epoch in **seconds**, or `null` if the token
 * is missing / malformed.
 */
export const getTokenExpiry = (): number | null => {
  if (!isBrowser()) return null;
  const stored = window.localStorage.getItem(TOKEN_EXP_KEY);
  if (!stored) return null;
  const exp = Number(stored);
  return isFinite(exp) ? exp : null;
};

/**
 * Returns the number of **milliseconds** until the current JWT expires,
 * or `0` if the token is already expired / missing.
 */
export const getTokenRemainingMs = (): number => {
  const exp = getTokenExpiry();
  if (exp === null) return 0;
  return Math.max(0, exp * 1000 - Date.now());
};

/**
 * Returns `true` when the token exists but will expire within the given
 * threshold (default 5 minutes).
 */
export const isTokenExpiringSoon = (thresholdMs = 5 * 60 * 1000): boolean => {
  const remaining = getTokenRemainingMs();
  return remaining > 0 && remaining <= thresholdMs;
};

export const ensureSessionForGuard = async (): Promise<SessionMember | null> => {
  const currentMember = getSessionMember();

  if (currentMember && getTokenRemainingMs() > 0) {
    return currentMember;
  }

  const refreshed = await silentRefreshAccessToken();
  if (refreshed) {
    return getSessionMember();
  }

  if (currentMember) {
    clearAuthSession();
  }

  return null;
};

// ── Refresh token (silent) ──────────────────────────────────────────────

let _refreshInProgress: Promise<boolean> | null = null;
let _lastRefreshFailureAt = 0;

/**
 * Attempt a silent token refresh via the `refreshToken` GraphQL mutation.
 * The refresh token is sent automatically as an httpOnly cookie.
 *
 * On success: saves the new access token + member data to localStorage.
 * On failure: clears the session (user must re-login).
 *
 * Returns `true` if the refresh succeeded, `false` otherwise.
 * Deduplicates concurrent calls.
 */
export const silentRefreshAccessToken = (): Promise<boolean> => {
  if (_refreshInProgress) return _refreshInProgress;
  if (Date.now() - _lastRefreshFailureAt < 3000) {
    return Promise.resolve(false);
  }

  _refreshInProgress = (async () => {
    try {
      const response = await fetch(env.graphqlHttpUrl, {
        method: "POST",
        credentials: "include", // sends httpOnly cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation RefreshToken { refreshToken { _id accessToken memberNick memberType memberStatus hostAccessStatus memberAuthType memberPhone memberFullName memberImage } }`,
        }),
      });

      if (!response.ok) return false;

      const json = (await response.json()) as {
        data?: { refreshToken?: AuthMember };
        errors?: unknown[];
      };
      const authMember = json?.data?.refreshToken;
      if (!authMember?.accessToken) return false;

      // Save the new access token + member data
      saveAuthSession(authMember);
      return true;
    } catch {
      _lastRefreshFailureAt = Date.now();
      return false;
    } finally {
      _refreshInProgress = null;
    }
  })();

  return _refreshInProgress;
};

/**
 * Logout: call the backend `logout` mutation to revoke the refresh token
 * cookie, then clear local session.
 */
export const logoutSession = async (): Promise<void> => {
  try {
    // credentials: "include" sends the httpOnly access + refresh token cookies automatically
    await fetch(env.graphqlHttpUrl, {
      method: "POST",
      keepalive: true,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation Logout { logout { success message } }`,
      }),
    });
  } catch {
    // Best-effort — always clear local session regardless
  }
  clearAuthSession();
};
