import type { AuthMember } from "@/types/auth";
import { hasApprovedAgentAccess } from "@/lib/auth/host-access";
import { buildOnboardingPath, resolveHasRecommendationProfile } from "@/lib/auth/onboarding-status";

const ONBOARDING_REQUIRED_MEMBER_TYPE = "USER";
const HOST_APPLICATION_PATH = "/host/apply";

const isSafeInternalPath = (path: string): boolean => path.startsWith("/");
const isHostIntentPath = (path: string): boolean =>
  path === "/dashboard" ||
  path === "/hotels/create" ||
  path === "/hotels/manage" ||
  path === "/bookings/manage" ||
  /^\/hotels\/[^/]+\/(edit|rooms|reviews)(?:$|[/?#])/.test(path);

export const resolvePostAuthRedirect = async (authMember: AuthMember, redirectTarget: string): Promise<string> => {
  const safeTarget = isSafeInternalPath(redirectTarget) ? redirectTarget : "/";

  if (
    authMember.memberType === "AGENT" &&
    !hasApprovedAgentAccess(authMember.hostAccessStatus) &&
    isHostIntentPath(safeTarget)
  ) {
    return `${HOST_APPLICATION_PATH}?next=${encodeURIComponent(safeTarget)}`;
  }

  if (authMember.memberType !== ONBOARDING_REQUIRED_MEMBER_TYPE) {
    return safeTarget;
  }

  if (isHostIntentPath(safeTarget)) {
    return "/";
  }

  const hasProfile = await resolveHasRecommendationProfile(authMember._id, {
    forceRefresh: true,
  });
  if (hasProfile === false) {
    return buildOnboardingPath(safeTarget);
  }

  return safeTarget;
};
