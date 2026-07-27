import { gql } from "@apollo/client";

export const GET_ANALYTICS_EVENTS_ADMIN_QUERY = gql`
  query GetAnalyticsEventsAdmin($input: PaginationInput!, $search: AnalyticsEventSearchInput) {
    getAnalyticsEventsAdmin(input: $input, search: $search) {
      list {
        _id
        memberId
        memberType
        eventName
        eventPath
        payload
        source
        userAgent
        createdAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const TRACK_ANALYTICS_EVENT_MUTATION = gql`
  mutation TrackAnalyticsEvent($input: TrackAnalyticsEventInput!) {
    trackAnalyticsEvent(input: $input)
  }
`;

export const TRACK_ANALYTICS_EVENT_MUTATION_TEXT = `
  mutation TrackAnalyticsEvent($input: TrackAnalyticsEventInput!) {
    trackAnalyticsEvent(input: $input)
  }
`;
