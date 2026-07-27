import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import type { AuthMember } from "@/types/auth";

const buildAuthMember = (memberType: AuthMember["memberType"]): AuthMember => ({
  _id: "699b0a1cc85a99084dbf56b1",
  accessToken: "test-access-token",
  memberNick: "kamil",
  memberType,
  memberStatus: "ACTIVE",
  hostAccessStatus: memberType === "AGENT" ? "APPROVED" : "NONE",
  memberAuthType: "EMAIL",
  memberPhone: "010-1111-2222",
  memberFullName: "Kamil",
  memberImage: null,
});

const createFetchResponse = (hasProfile: boolean): Response =>
  ({
    ok: true,
    json: async () => ({
      data: {
        getMyRecommendationProfile: {
          hasProfile,
        },
      },
    }),
  }) as Response;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("resolvePostAuthRedirect", () => {
  it("returns target directly for non-user accounts", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const redirect = await resolvePostAuthRedirect(buildAuthMember("AGENT"), "/dashboard");

    expect(redirect).toBe("/dashboard");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("redirects user to onboarding when profile is incomplete", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(createFetchResponse(false));
    vi.stubGlobal("fetch", fetchSpy);

    const redirect = await resolvePostAuthRedirect(buildAuthMember("USER"), "/bookings/new");

    expect(redirect).toBe("/onboarding?next=%2Fbookings%2Fnew");
  });

  it("keeps original target when user profile is complete", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(createFetchResponse(true));
    vi.stubGlobal("fetch", fetchSpy);

    const redirect = await resolvePostAuthRedirect(buildAuthMember("USER"), "/bookings/new");

    expect(redirect).toBe("/bookings/new");
  });

  it("sends a guest away from host-only targets instead of to the host page", async () => {
    // /dashboard and the hotel-management routes are host surfaces. A USER who lands on
    // one after login goes home rather than to a page they cannot use — and the profile
    // check is skipped entirely, since the target is discarded either way.
    const fetchSpy = vi.fn().mockResolvedValue(createFetchResponse(true));
    vi.stubGlobal("fetch", fetchSpy);

    const redirect = await resolvePostAuthRedirect(buildAuthMember("USER"), "/dashboard");

    expect(redirect).toBe("/");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
