import { gql } from "@apollo/client";

const MEMBER_FIELDS = gql`
  fragment MemberFields on MemberDto {
    _id
    memberType
    memberStatus
    hostAccessStatus
    memberPhone
    memberNick
    memberFullName
    memberImage
    memberAddress
    memberDesc
    subscriptionTier
    subscriptionExpiry
    memberPoints
    memberFollowers
    memberFollowings
    memberViews
    memberLikes
    memberRank
    createdAt
  }
`;

export const GET_MEMBER_QUERY = gql`
  query GetMember {
    getMember {
      ...MemberFields
    }
  }
  ${MEMBER_FIELDS}
`;

export const UPDATE_MEMBER_MUTATION = gql`
  mutation UpdateMember($input: MemberUpdate!) {
    updateMember(input: $input) {
      ...MemberFields
    }
  }
  ${MEMBER_FIELDS}
`;

export const GET_SUBSCRIPTION_STATUS_QUERY = gql`
  query GetSubscriptionStatus {
    getSubscriptionStatus {
      tier
      active
      expiresAt
      daysRemaining
      pendingRequestedTier
    }
  }
`;

export const REQUEST_SUBSCRIPTION_MUTATION = gql`
  mutation RequestSubscription($requestedTier: SubscriptionTier!) {
    requestSubscription(requestedTier: $requestedTier) {
      message
      success
    }
  }
`;

export const CANCEL_SUBSCRIPTION_MUTATION = gql`
  mutation CancelMySubscription {
    cancelMySubscription {
      message
      success
    }
  }
`;

export const HOST_APPLICATION_FIELDS = gql`
  fragment HostApplicationFields on HostApplicationDto {
    _id
    applicantMemberId
    applicantMemberNick
    businessName
    businessDescription
    contactPhone
    businessEmail
    intendedHotelName
    intendedHotelLocation
    hotelType
    suitableFor
    notes
    status
    reviewedByMemberId
    reviewedByMemberNick
    reviewNote
    reviewedAt
    createdAt
    updatedAt
  }
`;

export const GET_MY_HOST_APPLICATION_QUERY = gql`
  query GetMyHostApplication {
    getMyHostApplication {
      ...HostApplicationFields
    }
  }
  ${HOST_APPLICATION_FIELDS}
`;

export const REQUEST_HOST_APPLICATION_MUTATION = gql`
  mutation RequestHostApplication($input: HostApplicationInput!) {
    requestHostApplication(input: $input) {
      ...HostApplicationFields
    }
  }
  ${HOST_APPLICATION_FIELDS}
`;

export const GET_HOST_APPLICATIONS_BY_ADMIN_QUERY = gql`
  query GetHostApplicationsByAdmin($statusFilter: HostApplicationStatus) {
    getHostApplicationsByAdmin(statusFilter: $statusFilter) {
      ...HostApplicationFields
    }
  }
  ${HOST_APPLICATION_FIELDS}
`;

export const REVIEW_HOST_APPLICATION_MUTATION = gql`
  mutation ReviewHostApplication($input: HostApplicationReviewInput!) {
    reviewHostApplication(input: $input) {
      ...HostApplicationFields
    }
  }
  ${HOST_APPLICATION_FIELDS}
`;

// ─── Admin mutations ───────────────────────────────────────────────────────────

export const APPROVE_SUBSCRIPTION_MUTATION = gql`
  mutation ApproveSubscription(
    $memberId: String!
    $tier: SubscriptionTier!
    $durationDays: Int!
  ) {
    approveSubscription(
      memberId: $memberId
      tier: $tier
      durationDays: $durationDays
    ) {
      _id
      memberNick
      subscriptionTier
      subscriptionExpiry
    }
  }
`;

export const DENY_SUBSCRIPTION_MUTATION = gql`
  mutation DenySubscription($memberId: String!, $reason: String) {
    denySubscription(memberId: $memberId, reason: $reason) {
      message
      success
    }
  }
`;

// ─── Admin queries ─────────────────────────────────────────────────────────────

export const GET_ALL_MEMBERS_BY_ADMIN_QUERY = gql`
  query GetAllMembersByAdmin($input: PaginationInput!) {
    getAllMembersByAdmin(input: $input) {
      list {
        ...MemberFields
      }
      metaCounter {
        total
      }
      typeCounts {
        USER
        AGENT
        ADMIN
        ADMIN_OPERATOR
      }
    }
  }
  ${MEMBER_FIELDS}
`;

export const GET_MEMBER_BY_ADMIN_QUERY = gql`
  query GetMemberByAdmin($memberId: String!) {
    getMemberByAdmin(memberId: $memberId) {
      ...MemberFields
    }
  }
  ${MEMBER_FIELDS}
`;

export const UPDATE_MEMBER_BY_ADMIN_MUTATION = gql`
  mutation UpdateMemberByAdmin($input: MemberUpdate!) {
    updateMemberByAdmin(input: $input) {
      ...MemberFields
    }
  }
  ${MEMBER_FIELDS}
`;

export const DELETE_MEMBER_BY_ADMIN_MUTATION = gql`
  mutation DeleteMemberByAdmin($memberId: String!) {
    deleteMemberByAdmin(memberId: $memberId) {
      _id
      memberNick
      memberStatus
    }
  }
`;
