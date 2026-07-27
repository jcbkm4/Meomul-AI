import type { HostAccessStatus, MemberType } from "@/types/auth";
import type { ChatStatus } from "@/types/chat";
import type { MetaCounterDto, PaginationInput } from "@/types/hotel";

// ─── Member status / subscription ──────────────────────────────────────────────

export type MemberStatus = "ACTIVE" | "BLOCK" | "DELETE";
export type SubscriptionTier = "FREE" | "BASIC" | "PREMIUM" | "ELITE";

// ─── Admin member item (matches MEMBER_FIELDS fragment) ────────────────────────

export interface AdminMemberItem {
  _id: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  hostAccessStatus?: HostAccessStatus;
  memberPhone: string;
  memberNick: string;
  memberFullName?: string | null;
  memberImage?: string | null;
  memberAddress?: string | null;
  memberDesc?: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string | null;
  memberPoints: number;
  memberFollowers: number;
  memberFollowings: number;
  memberViews: number;
  memberLikes: number;
  memberRank: number;
  createdAt: string;
}

export interface MemberTypeCounts {
  USER: number;
  AGENT: number;
  ADMIN: number;
  ADMIN_OPERATOR: number;
}

export interface AdminMembersDto {
  list: AdminMemberItem[];
  metaCounter: MetaCounterDto;
  typeCounts?: MemberTypeCounts;
}

// ─── Query / mutation types ────────────────────────────────────────────────────

export interface GetAllMembersByAdminQueryData {
  getAllMembersByAdmin: AdminMembersDto;
}

export interface GetAllMembersByAdminQueryVars {
  input: PaginationInput;
}

export interface GetMemberByAdminQueryData {
  getMemberByAdmin: AdminMemberItem;
}

export interface GetMemberByAdminQueryVars {
  memberId: string;
}

export interface MemberUpdateInput {
  _id?: string;
  memberNick?: string;
  memberFullName?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberStatus?: MemberStatus;
  subscriptionTier?: SubscriptionTier;
}

export interface UpdateMemberByAdminMutationData {
  updateMemberByAdmin: AdminMemberItem;
}

export interface UpdateMemberByAdminMutationVars {
  input: MemberUpdateInput;
}

export interface DeleteMemberByAdminMutationData {
  deleteMemberByAdmin: {
    _id: string;
    memberNick: string;
    memberStatus: MemberStatus;
  };
}

export interface DeleteMemberByAdminMutationVars {
  memberId: string;
}

// ─── Admin chat types ──────────────────────────────────────────────────────────

export interface GetAllChatsAdminQueryData {
  getAllChatsAdmin: {
    list: import("@/types/chat").ChatDto[];
    metaCounter: MetaCounterDto;
  };
}

export interface GetAllChatsAdminQueryVars {
  input: PaginationInput;
  statusFilter?: ChatStatus;
}

// ─── Admin notification types ──────────────────────────────────────────────────

export interface NotificationItem {
  _id: string;
  userId: string;
  userNick?: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export interface AdminNotificationsDto {
  list: NotificationItem[];
  metaCounter: MetaCounterDto;
}

export interface GetAllNotificationsAdminQueryData {
  getAllNotificationsAdmin: AdminNotificationsDto;
}

export interface GetAllNotificationsAdminQueryVars {
  input: PaginationInput;
}
