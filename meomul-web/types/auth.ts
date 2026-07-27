export type MemberType = "USER" | "AGENT" | "ADMIN" | "ADMIN_OPERATOR";
export type HostApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type HostAccessStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type HotelType =
  | "HOTEL"
  | "MOTEL"
  | "RESORT"
  | "GUESTHOUSE"
  | "HANOK"
  | "PENSION";
export type StayPurpose =
  | "BUSINESS"
  | "ROMANTIC"
  | "FAMILY"
  | "SOLO"
  | "STAYCATION"
  | "EVENT"
  | "MEDICAL"
  | "LONG_TERM";

export type MemberAuthType = "EMAIL" | "PHONE" | "GOOGLE" | "KAKAO" | "NAVER";

export interface AuthMember {
  _id: string;
  accessToken: string;
  memberNick: string;
  memberType: MemberType;
  memberStatus: string;
  hostAccessStatus: HostAccessStatus;
  memberAuthType: MemberAuthType;
  memberPhone: string;
  memberFullName?: string | null;
  memberImage?: string | null;
}

export type SessionMember = Omit<AuthMember, "accessToken">;

export interface LoginMemberInput {
  memberNick: string;
  memberPassword: string;
}

export interface SignupMemberInput {
  memberNick: string;
  memberPassword: string;
  memberPhone: string;
  memberFullName?: string;
  memberType: MemberType;
  memberAuthType: MemberAuthType;
}

export interface AuthMemberMutationData {
  loginMember?: AuthMember;
  signupMember?: AuthMember;
}

export interface LoginMemberMutationVars {
  input: LoginMemberInput;
}

export interface SignupMemberMutationVars {
  input: SignupMemberInput;
}

export interface CheckAuthQueryData {
  checkAuth: string;
}

export interface RefreshTokenMutationData {
  refreshToken: AuthMember;
}

export interface LogoutMutationData {
  logout: {
    success: boolean;
    message: string;
  };
}

export interface ResetPasswordInput {
  memberNick: string;
  memberPhone: string;
  newPassword: string;
}

export interface ResetPasswordMutationData {
  resetPassword: {
    success: boolean;
    message: string;
  };
}

export interface ResetPasswordMutationVars {
  input: ResetPasswordInput;
}

export interface HostApplication {
  _id: string;
  applicantMemberId: string;
  applicantMemberNick?: string | null;
  businessName: string;
  businessDescription: string;
  contactPhone?: string | null;
  businessEmail?: string | null;
  intendedHotelName?: string | null;
  intendedHotelLocation?: string | null;
  hotelType: HotelType;
  suitableFor: StayPurpose[];
  notes?: string | null;
  status: HostApplicationStatus;
  reviewedByMemberId?: string | null;
  reviewedByMemberNick?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HostApplicationInput {
  businessName: string;
  businessDescription: string;
  contactPhone?: string;
  businessEmail?: string;
  intendedHotelName?: string;
  intendedHotelLocation?: string;
  hotelType: HotelType;
  suitableFor: StayPurpose[];
  notes?: string;
}

export interface GetMyHostApplicationQueryData {
  getMyHostApplication?: HostApplication | null;
}

export interface RequestHostApplicationMutationData {
  requestHostApplication: HostApplication;
}

export interface RequestHostApplicationMutationVars {
  input: HostApplicationInput;
}

export interface GetHostApplicationsByAdminQueryData {
  getHostApplicationsByAdmin: HostApplication[];
}

export interface GetHostApplicationsByAdminQueryVars {
  statusFilter?: HostApplicationStatus;
}

export interface HostApplicationReviewInput {
  applicationId: string;
  status: Extract<HostApplicationStatus, "APPROVED" | "REJECTED">;
  reviewNote?: string;
}

export interface ReviewHostApplicationMutationData {
  reviewHostApplication: HostApplication;
}

export interface ReviewHostApplicationMutationVars {
  input: HostApplicationReviewInput;
}
