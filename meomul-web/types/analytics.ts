import type { MemberType } from "@/types/auth";
import type { MetaCounterDto, PaginationInput } from "@/types/hotel";

export interface AnalyticsEventItem {
  _id: string;
  memberId: string;
  memberType: MemberType;
  eventName: string;
  eventPath?: string | null;
  payload?: string | null;
  source?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AnalyticsEventsDto {
  list: AnalyticsEventItem[];
  metaCounter: MetaCounterDto;
}

export interface AnalyticsEventSearchInput {
  eventName?: string;
  memberId?: string;
  memberType?: MemberType;
  source?: string;
  fromDate?: string;
  toDate?: string;
}

export interface GetAnalyticsEventsAdminQueryData {
  getAnalyticsEventsAdmin: AnalyticsEventsDto;
}

export interface GetAnalyticsEventsAdminQueryVars {
  input: PaginationInput;
  search?: AnalyticsEventSearchInput;
}
