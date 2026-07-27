import type { SessionMember } from "@/types/auth";
import { resolveOnboardingRedirect } from "@/lib/auth/onboarding-status";
import { hasApprovedAgentAccess } from "@/lib/auth/host-access";
import {
  clearAuthSession,
  getSessionMember,
  ensureSessionForGuard,
} from "@/lib/auth/session";
import type { AuthRequirement } from "@/types/page";

const DASHBOARD_PATH = "/dashboard";
const FORBIDDEN_PATH = "/403";
const HOST_APPLICATION_PATH = "/host/apply";

const buildLoginPath = (nextPath: string): string => {
  const encodedPath = encodeURIComponent(nextPath);
  return `/auth/login?next=${encodedPath}`;
};

export const resolveGuardRedirect = async (
  auth: AuthRequirement | undefined,
  member: SessionMember | null,
  currentPath: string,
): Promise<string | null> => {
  if (auth?.guestOnly || (auth?.roles && auth.roles.length > 0)) {
    const resolvedMember = await ensureSessionForGuard();
    if (!resolvedMember && member) {
      clearAuthSession();
    }
    member = resolvedMember;
  }

  if (member) {
    const onboardingRedirect = await resolveOnboardingRedirect(member, currentPath);
    if (onboardingRedirect) {
      return onboardingRedirect;
    }
  }

  if (!auth) {
    return null;
  }

  if (auth.guestOnly && member) {
    return DASHBOARD_PATH;
  }

  if (!auth.roles || auth.roles.length === 0) {
    return null;
  }

  if (!member) {
    return buildLoginPath(currentPath);
  }

  if (!auth.roles.includes(member.memberType)) {
    return FORBIDDEN_PATH;
  }

  if (
    auth.requireApprovedHostAccess &&
    member.memberType === "AGENT" &&
    !hasApprovedAgentAccess(member.hostAccessStatus)
  ) {
    return `${HOST_APPLICATION_PATH}?next=${encodeURIComponent(currentPath)}`;
  }

  return null;
};
