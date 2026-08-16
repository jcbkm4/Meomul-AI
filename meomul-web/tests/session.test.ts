import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAuthSession,
  getSessionMember,
  getTokenExpiry,
  getTokenRemainingMs,
  isAuthenticated,
  isTokenExpiringSoon,
  registerSessionChangeListener,
  saveAuthSession,
  unregisterSessionChangeListener,
  updateSessionMember,
} from "@/lib/auth/session";
import type { AuthMember } from "@/types/auth";

/**
 * Client-side session state. The access token itself is an httpOnly cookie the browser
 * manages, so what lives here is the member profile the UI renders and the token's `exp`
 * claim used to warn before a session lapses.
 *
 * The important property is what is *not* stored: the raw access token must never be
 * written to localStorage, where any script on the origin could read it.
 */
describe("auth session", () => {
  const MEMBER_KEY = "meomul.member";
  const TOKEN_EXP_KEY = "meomul.token_exp";

  /** Builds a syntactically valid JWT whose payload carries the given expiry. */
  const jwtExpiringAt = (epochSeconds: number): string => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: "member", exp: epochSeconds }));
    return `${header}.${payload}.not-a-real-signature`;
  };

  const authMember = (accessToken: string): AuthMember =>
    ({
      _id: "699b0a1cc85a99084dbf56b1",
      accessToken,
      memberNick: "kamil",
      memberType: "USER",
      memberStatus: "ACTIVE",
      hostAccessStatus: "NONE",
      memberAuthType: "EMAIL",
      memberPhone: "01011112222",
      memberFullName: "Kamil",
      memberImage: null,
    }) as AuthMember;

  beforeEach(() => {
    window.localStorage.clear();
    unregisterSessionChangeListener();
  });

  describe("saveAuthSession", () => {
    it("never writes the access token to storage", () => {
      const token = jwtExpiringAt(Math.floor(Date.now() / 1000) + 900);

      saveAuthSession(authMember(token));

      // The whole point of the httpOnly cookie design: a script on this origin must not
      // be able to read a usable credential.
      const everything = JSON.stringify(window.localStorage);
      expect(everything).not.toContain(token);
      expect(window.localStorage.getItem(MEMBER_KEY)).not.toContain("accessToken");
    });

    it("stores the member profile and exposes it via getSessionMember", () => {
      saveAuthSession(authMember(jwtExpiringAt(Math.floor(Date.now() / 1000) + 900)));

      const member = getSessionMember();
      expect(member?.memberNick).toBe("kamil");
      expect(member?.memberType).toBe("USER");
      expect(isAuthenticated()).toBe(true);
    });

    it("extracts the exp claim so expiry warnings can fire", () => {
      const exp = Math.floor(Date.now() / 1000) + 900;

      saveAuthSession(authMember(jwtExpiringAt(exp)));

      expect(getTokenExpiry()).toBe(exp);
      expect(window.localStorage.getItem(TOKEN_EXP_KEY)).toBe(String(exp));
    });

    it("still stores the member when the token cannot be parsed", () => {
      // A malformed token should cost you expiry warnings, not the whole session.
      saveAuthSession(authMember("not-a-jwt"));

      expect(getSessionMember()?.memberNick).toBe("kamil");
      expect(getTokenExpiry()).toBeNull();
    });

    it("notifies a registered listener", () => {
      const onChange = vi.fn();
      registerSessionChangeListener(onChange);

      saveAuthSession(authMember(jwtExpiringAt(Math.floor(Date.now() / 1000) + 900)));

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("clearAuthSession", () => {
    it("removes both the member and the expiry", () => {
      saveAuthSession(authMember(jwtExpiringAt(Math.floor(Date.now() / 1000) + 900)));

      clearAuthSession();

      expect(getSessionMember()).toBeNull();
      expect(getTokenExpiry()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("getSessionMember", () => {
    it("returns null rather than throwing on corrupt stored JSON", () => {
      // localStorage is writable by anything on the origin; a parse error must not take
      // down every page that asks who is signed in.
      window.localStorage.setItem(MEMBER_KEY, "{not json");

      expect(() => getSessionMember()).not.toThrow();
      expect(getSessionMember()).toBeNull();
    });
  });

  describe("updateSessionMember", () => {
    it("merges a patch into the stored member", () => {
      saveAuthSession(authMember(jwtExpiringAt(Math.floor(Date.now() / 1000) + 900)));

      updateSessionMember({ memberFullName: "Kamil Updated" });

      expect(getSessionMember()?.memberFullName).toBe("Kamil Updated");
      expect(getSessionMember()?.memberNick).toBe("kamil");
    });

    it("does nothing when no session exists", () => {
      updateSessionMember({ memberFullName: "Ghost" });

      expect(getSessionMember()).toBeNull();
    });
  });

  describe("token expiry helpers", () => {
    it("reports remaining time for a live token", () => {
      saveAuthSession(authMember(jwtExpiringAt(Math.floor(Date.now() / 1000) + 600)));

      const remaining = getTokenRemainingMs();
      expect(remaining).toBeGreaterThan(9 * 60 * 1000);
      expect(remaining).toBeLessThanOrEqual(10 * 60 * 1000);
    });

    it("clamps an expired token to zero rather than going negative", () => {
      saveAuthSession(authMember(jwtExpiringAt(Math.floor(Date.now() / 1000) - 60)));

      expect(getTokenRemainingMs()).toBe(0);
      // Already expired is not "expiring soon" — there is nothing left to warn about.
      expect(isTokenExpiringSoon()).toBe(false);
    });

    it("flags a token inside the warning threshold", () => {
      saveAuthSession(authMember(jwtExpiringAt(Math.floor(Date.now() / 1000) + 120)));

      expect(isTokenExpiringSoon()).toBe(true);
    });

    it("does not flag a token outside the threshold", () => {
      saveAuthSession(authMember(jwtExpiringAt(Math.floor(Date.now() / 1000) + 3600)));

      expect(isTokenExpiringSoon()).toBe(false);
    });

    it("reports zero when there is no token at all", () => {
      expect(getTokenRemainingMs()).toBe(0);
      expect(isTokenExpiringSoon()).toBe(false);
    });
  });
});
