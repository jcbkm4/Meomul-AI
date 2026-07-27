import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionMember } from "@/types/auth";

// The guard no longer reads a token — the access token is an httpOnly cookie the client
// cannot see, so it asks the server who the member is via ensureSessionForGuard().
const mockEnsureSessionForGuard = vi.fn();
const mockClearAuthSession = vi.fn();
const mockResolveOnboardingRedirect = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  ensureSessionForGuard: () => mockEnsureSessionForGuard(),
  clearAuthSession: () => mockClearAuthSession(),
  getSessionMember: () => null,
}));

vi.mock("@/lib/auth/onboarding-status", () => ({
  resolveOnboardingRedirect: (...args: unknown[]) => mockResolveOnboardingRedirect(...args),
}));

import { resolveGuardRedirect } from "@/lib/auth/route-guard";

const baseMember: SessionMember = {
  _id: "699b0a1cc85a99084dbf56b1",
  memberNick: "kamil",
  memberType: "USER",
  memberStatus: "ACTIVE",
  hostAccessStatus: "NONE",
  memberAuthType: "EMAIL",
  memberPhone: "010-1111-2222",
  memberFullName: "Kamil",
  memberImage: null,
};

describe("resolveGuardRedirect", () => {
  beforeEach(() => {
    mockEnsureSessionForGuard.mockReset();
    mockClearAuthSession.mockReset();
    mockResolveOnboardingRedirect.mockReset();
    // Default: the server confirms an active session.
    mockEnsureSessionForGuard.mockResolvedValue(baseMember);
    mockResolveOnboardingRedirect.mockResolvedValue(null);
  });

  it("redirects unauthenticated members to login for protected routes", async () => {
    mockEnsureSessionForGuard.mockResolvedValue(null);

    const redirect = await resolveGuardRedirect({ roles: ["USER"] }, null, "/bookings/new");

    expect(redirect).toBe("/auth/login?next=%2Fbookings%2Fnew");
  });

  it("clears the local session when the server no longer recognises the member", async () => {
    mockEnsureSessionForGuard.mockResolvedValue(null);

    await resolveGuardRedirect({ roles: ["USER"] }, baseMember, "/dashboard");

    expect(mockClearAuthSession).toHaveBeenCalled();
  });

  it("redirects to 403 when member role is not allowed", async () => {
    const redirect = await resolveGuardRedirect({ roles: ["ADMIN"] }, baseMember, "/dashboard");

    expect(redirect).toBe("/403");
  });

  it("applies onboarding redirect for allowed role when onboarding is incomplete", async () => {
    mockResolveOnboardingRedirect.mockResolvedValue("/onboarding?next=%2Fdashboard");

    const redirect = await resolveGuardRedirect({ roles: ["USER"] }, baseMember, "/dashboard");

    expect(redirect).toBe("/onboarding?next=%2Fdashboard");
    expect(mockResolveOnboardingRedirect).toHaveBeenCalledWith(baseMember, "/dashboard");
  });

  it("allows navigation when auth and onboarding checks pass", async () => {
    const redirect = await resolveGuardRedirect({ roles: ["USER"] }, baseMember, "/dashboard");

    expect(redirect).toBeNull();
  });

  it("applies onboarding redirect even for routes without auth config", async () => {
    mockResolveOnboardingRedirect.mockResolvedValue("/onboarding?next=%2F");

    const redirect = await resolveGuardRedirect(undefined, baseMember, "/");

    expect(redirect).toBe("/onboarding?next=%2F");
  });
});
