import { gql } from "@apollo/client";

// NOTE: HAS_LIKED_QUERY and TOGGLE_LIKE_MUTATION already exist in hotel.gql.ts
// and are used by the hotel detail page. Import them from there when needed.

export const GET_LIKE_COUNT_QUERY = gql`
  query GetLikeCount($likeRefId: String!, $likeGroup: LikeGroup!) {
    getLikeCount(likeRefId: $likeRefId, likeGroup: $likeGroup)
  }
`;

export const GET_MY_LIKES_QUERY = gql`
  query GetMyLikes($likeGroup: LikeGroup!) {
    getMyLikes(likeGroup: $likeGroup) {
      _id
      likeGroup
      likeRefId
      memberId
      createdAt
    }
  }
`;
