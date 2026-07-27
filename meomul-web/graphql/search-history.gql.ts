import { gql } from "@apollo/client";

export const GET_MY_SEARCH_HISTORY_QUERY = gql`
  query GetMySearchHistory($limit: Int) {
    getMySearchHistory(limit: $limit) {
      _id
      memberId
      location
      hotelTypes
      priceMin
      priceMax
      purpose
      amenities
      starRatings
      guestCount
      text
      createdAt
    }
  }
`;

export const DELETE_SEARCH_HISTORY_ITEM_MUTATION = gql`
  mutation DeleteSearchHistoryItem($historyId: String!) {
    deleteSearchHistoryItem(historyId: $historyId)
  }
`;

export const CLEAR_MY_SEARCH_HISTORY_MUTATION = gql`
  mutation ClearMySearchHistory {
    clearMySearchHistory
  }
`;
