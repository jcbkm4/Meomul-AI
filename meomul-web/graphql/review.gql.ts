import { gql } from "@apollo/client";

// NOTE: GET_HOTEL_REVIEWS_QUERY and MARK_HELPFUL_MUTATION already exist in hotel.gql.ts
// and are used by the hotel detail page. Import them from there when needed.

const REVIEW_FIELDS = gql`
  fragment ReviewFields on ReviewDto {
    _id
    reviewerId
    reviewerNick
    reviewerImage
    hotelId
    bookingId
    verifiedStay
    stayDate
    overallRating
    cleanlinessRating
    locationRating
    valueRating
    serviceRating
    amenitiesRating
    reviewTitle
    reviewText
    guestPhotos
    helpfulCount
    reviewViews
    hotelResponse {
      responseText
      respondedBy
      respondedAt
    }
    reviewStatus
    createdAt
    updatedAt
  }
`;

export const GET_MY_REVIEWS_QUERY = gql`
  query GetMyReviews($input: PaginationInput!) {
    getMyReviews(input: $input) {
      list {
        ...ReviewFields
      }
      metaCounter {
        total
      }
    }
  }
  ${REVIEW_FIELDS}
`;

export const GET_ALL_REVIEWS_ADMIN_QUERY = gql`
  query GetAllReviewsAdmin($input: PaginationInput!, $statusFilter: ReviewStatus) {
    getAllReviewsAdmin(input: $input, statusFilter: $statusFilter) {
      list {
        ...ReviewFields
      }
      metaCounter {
        total
      }
      ratingsSummary {
        totalReviews
        overallRating
        cleanlinessRating
        locationRating
        serviceRating
        amenitiesRating
        valueRating
      }
    }
  }
  ${REVIEW_FIELDS}
`;

export const GET_REVIEW_QUERY = gql`
  query GetReview($reviewId: String!) {
    getReview(reviewId: $reviewId) {
      ...ReviewFields
    }
  }
  ${REVIEW_FIELDS}
`;

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      ...ReviewFields
    }
  }
  ${REVIEW_FIELDS}
`;

export const UPDATE_REVIEW_MUTATION = gql`
  mutation UpdateReview($input: ReviewUpdate!) {
    updateReview(input: $input) {
      ...ReviewFields
    }
  }
  ${REVIEW_FIELDS}
`;

export const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($reviewId: String!) {
    deleteReview(reviewId: $reviewId) {
      _id
    }
  }
`;

export const RESPOND_TO_REVIEW_MUTATION = gql`
  mutation RespondToReview($reviewId: String!, $responseText: String!) {
    respondToReview(reviewId: $reviewId, responseText: $responseText) {
      ...ReviewFields
    }
  }
  ${REVIEW_FIELDS}
`;

export const UPDATE_REVIEW_STATUS_MUTATION = gql`
  mutation UpdateReviewStatus($reviewId: String!, $status: ReviewStatus!) {
    updateReviewStatus(reviewId: $reviewId, status: $status) {
      _id
      reviewStatus
    }
  }
`;
