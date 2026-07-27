import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  GET_RECOMMENDED_HOTELS_V2_QUERY,
  GET_SIMILAR_HOTELS_QUERY,
  GET_TRENDING_BY_LOCATION_QUERY,
} from "@/graphql/hotel.gql";
import { CARD_LIST_LIMIT, uniqueHotels } from "@/lib/hotels/detail-page-helpers";
import { getErrorMessage } from "@/lib/utils/error";
import type {
  GetRecommendedHotelsV2QueryData,
  GetRecommendedHotelsV2QueryVars,
  GetSimilarHotelsQueryData,
  GetSimilarHotelsQueryVars,
  GetTrendingByLocationQueryData,
  GetTrendingByLocationQueryVars,
  HotelLocation,
  RecommendationExplanationDto,
} from "@/types/hotel";

interface UseHotelDetailDiscoveryInput {
  hotelId: string;
  trendingLocation?: HotelLocation;
  canUseRecommendedQuery: boolean;
}

export const useHotelDetailDiscovery = ({
  hotelId,
  trendingLocation,
  canUseRecommendedQuery,
}: UseHotelDetailDiscoveryInput) => {
  const discoverySectionRef = useRef<HTMLElement | null>(null);
  const locationSectionRef = useRef<HTMLElement | null>(null);

  const [shouldLoadDiscovery, setShouldLoadDiscovery] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  const similarQueryVariables = useMemo<GetSimilarHotelsQueryVars>(
    () => ({
      hotelId,
      limit: CARD_LIST_LIMIT,
    }),
    [hotelId],
  );

  const trendingQueryVariables = useMemo<GetTrendingByLocationQueryVars>(
    () => ({
      location: (trendingLocation ?? "SEOUL") as HotelLocation,
      limit: CARD_LIST_LIMIT,
    }),
    [trendingLocation],
  );

  const recommendedQueryVariables = useMemo<GetRecommendedHotelsV2QueryVars>(
    () => ({
      limit: CARD_LIST_LIMIT,
    }),
    [],
  );

  useEffect(() => {
    setShouldLoadDiscovery(false);
  }, [hotelId]);

  useEffect(() => {
    if (shouldLoadDiscovery) {
      return;
    }

    const activateDiscovery = () => setShouldLoadDiscovery(true);
    const requestIdle = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      }
    ).requestIdleCallback;

    if (typeof requestIdle === "function") {
      const idleId = requestIdle(activateDiscovery, { timeout: 1500 });
      return () => {
        const cancelIdle = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
        if (typeof cancelIdle === "function") {
          cancelIdle(idleId);
        }
      };
    }

    const fallbackTimer = window.setTimeout(activateDiscovery, 1500);
    return () => window.clearTimeout(fallbackTimer);
  }, [shouldLoadDiscovery]);

  useEffect(() => {
    if (shouldLoadDiscovery) {
      return;
    }

    const target = discoverySectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadDiscovery(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoadDiscovery]);

  useEffect(() => {
    if (shouldLoadMap) {
      return;
    }

    const target = locationSectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setShouldLoadMap(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoadMap]);

  const {
    data: similarData,
    loading: similarLoading,
    error: similarError,
  } = useQuery<GetSimilarHotelsQueryData, GetSimilarHotelsQueryVars>(GET_SIMILAR_HOTELS_QUERY, {
    skip: !hotelId || !shouldLoadDiscovery,
    variables: similarQueryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const {
    data: trendingData,
    loading: trendingLoading,
    error: trendingError,
  } = useQuery<GetTrendingByLocationQueryData, GetTrendingByLocationQueryVars>(GET_TRENDING_BY_LOCATION_QUERY, {
    skip: !trendingLocation || !shouldLoadDiscovery,
    variables: trendingQueryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const {
    data: recommendedData,
    loading: recommendedLoading,
    error: recommendedError,
  } = useQuery<GetRecommendedHotelsV2QueryData, GetRecommendedHotelsV2QueryVars>(GET_RECOMMENDED_HOTELS_V2_QUERY, {
    skip: !canUseRecommendedQuery || !shouldLoadDiscovery,
    variables: recommendedQueryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const similarHotels = useMemo(
    () => (shouldLoadDiscovery ? uniqueHotels(similarData?.getSimilarHotels ?? [], hotelId) : []),
    [hotelId, shouldLoadDiscovery, similarData?.getSimilarHotels],
  );

  const trendingHotels = useMemo(
    () => (shouldLoadDiscovery ? uniqueHotels(trendingData?.getTrendingByLocation ?? [], hotelId) : []),
    [hotelId, shouldLoadDiscovery, trendingData?.getTrendingByLocation],
  );

  const recommendedHotels = useMemo(
    () => (shouldLoadDiscovery ? uniqueHotels(recommendedData?.getRecommendedHotelsV2.list ?? [], hotelId) : []),
    [hotelId, recommendedData?.getRecommendedHotelsV2.list, shouldLoadDiscovery],
  );
  const recommendedExplanationMap = useMemo(() => {
    if (!shouldLoadDiscovery) {
      return new Map<string, RecommendationExplanationDto>();
    }

    const explanations = recommendedData?.getRecommendedHotelsV2.explanations ?? [];
    const allowedHotelIds = new Set(recommendedHotels.map((hotel) => hotel._id));
    return new Map(
      explanations
        .filter((item) => allowedHotelIds.has(item.hotelId))
        .map((item) => [item.hotelId, item]),
    );
  }, [recommendedData?.getRecommendedHotelsV2.explanations, recommendedHotels, shouldLoadDiscovery]);

  return {
    discoverySectionRef,
    locationSectionRef,
    shouldLoadDiscovery,
    shouldLoadMap,
    similarHotels,
    similarLoading,
    similarErrorMessage: similarError ? getErrorMessage(similarError) : null,
    trendingHotels,
    trendingLoading,
    trendingErrorMessage: trendingError ? getErrorMessage(trendingError) : null,
    recommendedHotels,
    recommendedExplanationMap,
    recommendedMeta: recommendedData?.getRecommendedHotelsV2.meta ?? null,
    recommendedLoading,
    recommendedErrorMessage: recommendedError ? getErrorMessage(recommendedError) : null,
  };
};
