import { gql } from "@apollo/client";

export const LOGIN_MEMBER_MUTATION = gql`
  mutation LoginMember($input: LoginInput!) {
    loginMember(input: $input) {
      _id
      accessToken
      memberNick
      memberType
      memberStatus
      hostAccessStatus
      memberAuthType
      memberPhone
      memberFullName
      memberImage
    }
  }
`;

export const SIGNUP_MEMBER_MUTATION = gql`
  mutation SignupMember($input: MemberInput!) {
    signupMember(input: $input) {
      _id
      accessToken
      memberNick
      memberType
      memberStatus
      hostAccessStatus
      memberAuthType
      memberPhone
      memberFullName
      memberImage
    }
  }
`;

export const CHECK_AUTH_QUERY = gql`
  query CheckAuth {
    checkAuth
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      _id
      accessToken
      memberNick
      memberType
      memberStatus
      hostAccessStatus
      memberAuthType
      memberPhone
      memberFullName
      memberImage
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;
