import type { HostAccessStatus } from "@/types/auth";

export const hasApprovedAgentAccess = (
  hostAccessStatus?: HostAccessStatus | null,
): boolean => hostAccessStatus !== "PENDING" && hostAccessStatus !== "REJECTED";

