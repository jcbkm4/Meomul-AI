import { gql } from "@apollo/client";

export const ASK_STAY_CONCIERGE_MUTATION = gql`
  mutation AskStayConcierge($input: AskStayConciergeInput!) {
    askStayConcierge(input: $input) {
      provider
      summary
      nextAction
      clarifyingQuestions
      intent {
        location
        district
        checkIn
        checkOut
        guests
        budgetMin
        budgetMax
        purpose
        amenities
        roomPreferences
        safetyPreferences
        transportPreferences
        language
        confidence
      }
      candidates {
        hotelId
        hotelTitle
        roomId
        roomName
        fitScore
        reasons
        tradeoffs
        trustSignals
        priceInsights
        estimatedPrice
        cheapestDate
        cheapestPrice
      }
    }
  }
`;

