import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GET_HOTEL_DETAIL_QUERY,
  GET_HOTEL_REVIEWS_QUERY,
  GET_ROOMS_BY_HOTEL_QUERY,
} from "@/graphql/hotel.gql";
import { getAccessToken, getSessionMember } from "@/lib/auth/session";
import {
  asPercent,
  canUseMemberActions,
  canUsePersonalizedRecommendations,
  getMapEmbedLink,
  getMapLink,
  REVIEW_PAGE_SIZE,
  ROOM_PAGE_SIZE,
  shortenText,
} from "@/lib/hotels/detail-page-helpers";
import { getHotelAmenityLabel } from "@/lib/hotels/hotels-i18n";
import { useHotelDetailActions } from "@/lib/hooks/use-hotel-detail-actions";
import { useHotelDetailDiscovery } from "@/lib/hooks/use-hotel-detail-discovery";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import type {
  GetHotelQueryData,
  GetHotelQueryVars,
  GetHotelReviewsQueryData,
  GetHotelReviewsQueryVars,
  GetRoomsByHotelQueryData,
  GetRoomsByHotelQueryVars,
  HotelDetailItem,
  ReviewRatingsSummaryDto,
  RoomListItem,
} from "@/types/hotel";

interface UseHotelDetailPageDataInput {
  initialHotel: HotelDetailItem | null;
  initialRooms: RoomListItem[];
}

export const useHotelDetailPageData = ({
  initialHotel,
  initialRooms,
}: UseHotelDetailPageDataInput) => {
  const { t } = useI18n();
  const router = useRouter();
  const isPageVisible = usePageVisible();

  const [isHydrated, setIsHydrated] = useState(false);
  const [member, setMember] =
    useState<ReturnType<typeof getSessionMember>>(null);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [shouldLoadReviews, setShouldLoadReviews] = useState(false);
  const reviewsSectionRef = useRef<HTMLDivElement | null>(null);
  const hasVisibilityMountedRef = useRef(false);
  const wasVisibleRef = useRef(false);

  const hotelId = useMemo(() => {
    if (typeof router.query.hotelId === "string") {
      return router.query.hotelId;
    }

    return "";
  }, [router.query.hotelId]);

  const memberType = member?.memberType;
  const canUseRecommendedQuery = canUsePersonalizedRecommendations(memberType);
  const canUseLikeActions =
    canUseMemberActions(memberType) || (!member && hasAccessToken);

  useEffect(() => {
    setIsHydrated(true);
    setMember(getSessionMember());
    setHasAccessToken(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    setReviewPage(1);
    setShouldLoadReviews(false);
  }, [hotelId]);

  const hasMatchingInitialHotel = useMemo(
    () => Boolean(initialHotel && initialHotel._id === hotelId),
    [hotelId, initialHotel],
  );

  useEffect(() => {
    if (shouldLoadReviews) {
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      setShouldLoadReviews(true);
    }, 1200);

    return () => window.clearTimeout(fallbackTimer);
  }, [shouldLoadReviews]);

  useEffect(() => {
    if (shouldLoadReviews) {
      return;
    }

    const target = reviewsSectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadReviews(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoadReviews]);

  const hotelQueryVariables = useMemo<GetHotelQueryVars>(
    () => ({ hotelId }),
    [hotelId],
  );

  const roomsQueryVariables = useMemo<GetRoomsByHotelQueryVars>(
    () => ({
      hotelId,
      input: {
        page: 1,
        limit: ROOM_PAGE_SIZE,
        sort: "createdAt",
        direction: -1,
      },
    }),
    [hotelId],
  );

  const reviewsQueryVariables = useMemo<GetHotelReviewsQueryVars>(
    () => ({
      hotelId,
      input: {
        page: reviewPage,
        limit: REVIEW_PAGE_SIZE,
        sort: "createdAt",
        direction: -1,
      },
    }),
    [hotelId, reviewPage],
  );

  const {
    data: hotelData,
    loading: hotelLoading,
    error: hotelError,
    refetch: refetchHotel,
  } = useQuery<GetHotelQueryData, GetHotelQueryVars>(GET_HOTEL_DETAIL_QUERY, {
    skip: !hotelId,
    variables: hotelQueryVariables,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const queriedHotel =
    hotelData?.getHotel && hotelData.getHotel._id === hotelId
      ? hotelData.getHotel
      : null;
  const hasResolvedHotelQuery = Boolean(hotelData) || Boolean(hotelError);
  const hotel =
    !isHydrated || !hasMatchingInitialHotel
      ? queriedHotel ?? initialHotel
      : queriedHotel ?? (hasResolvedHotelQuery ? null : initialHotel);
  const trendingLocation = hotel?.hotelLocation;

  const {
    data: roomsData,
    loading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms,
  } = useQuery<GetRoomsByHotelQueryData, GetRoomsByHotelQueryVars>(
    GET_ROOMS_BY_HOTEL_QUERY,
    {
      skip: !hotelId,
      variables: roomsQueryVariables,
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  const {
    data: reviewsData,
    loading: reviewsQueryLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery<GetHotelReviewsQueryData, GetHotelReviewsQueryVars>(
    GET_HOTEL_REVIEWS_QUERY,
    {
      skip: !hotelId || !shouldLoadReviews,
      variables: reviewsQueryVariables,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  useEffect(() => {
    if (!isPageVisible) {
      wasVisibleRef.current = false;
      return;
    }

    const becameVisible = !wasVisibleRef.current;
    wasVisibleRef.current = true;
    if (!hasVisibilityMountedRef.current) {
      hasVisibilityMountedRef.current = true;
      return;
    }
    if (!becameVisible || !hotelId) {
      return;
    }

    const refreshTasks: Array<Promise<unknown>> = [
      refetchHotel(),
      refetchRooms(),
    ];
    if (shouldLoadReviews) {
      refreshTasks.push(refetchReviews());
    }

    void Promise.allSettled(refreshTasks);
  }, [
    hotelId,
    isPageVisible,
    refetchHotel,
    refetchReviews,
    refetchRooms,
    shouldLoadReviews,
  ]);

  const {
    hotelLikeState,
    hotelLikedFromServer,
    hotelLikedErrorMessage,
    generalActionError,
    reviewActionError,
    markingHelpfulReviewId,
    helpfulCountOverrides,
    togglingHotelLike,
    handleToggleHotelLike,
    handleMarkHelpful,
  } = useHotelDetailActions({
    hotelId,
    canUseLikeActions,
  });

  const {
    discoverySectionRef,
    locationSectionRef,
    shouldLoadDiscovery,
    shouldLoadMap,
    similarHotels,
    similarLoading,
    similarErrorMessage,
    trendingHotels,
    trendingLoading,
    trendingErrorMessage,
    recommendedHotels,
    recommendedExplanationMap,
    recommendedMeta,
    recommendedLoading,
    recommendedErrorMessage,
  } = useHotelDetailDiscovery({
    hotelId,
    trendingLocation,
    canUseRecommendedQuery,
  });

  const queriedRooms = roomsData?.getRoomsByHotel?.list;
  const hasResolvedRoomsQuery = Boolean(roomsData) || Boolean(roomsError);
  const rooms = useMemo(
    () =>
      !isHydrated || !hasMatchingInitialHotel
        ? queriedRooms ?? initialRooms
        : queriedRooms ?? (hasResolvedRoomsQuery ? [] : initialRooms),
    [
      hasMatchingInitialHotel,
      hasResolvedRoomsQuery,
      initialRooms,
      isHydrated,
      queriedRooms,
    ],
  );

  const reviews = useMemo(
    () => (shouldLoadReviews ? (reviewsData?.getHotelReviews.list ?? []) : []),
    [reviewsData?.getHotelReviews.list, shouldLoadReviews],
  );
  const reviewTotal = shouldLoadReviews
    ? (reviewsData?.getHotelReviews.metaCounter.total ?? 0)
    : 0;
  const serverRatingsSummary = shouldLoadReviews
    ? (reviewsData?.getHotelReviews.ratingsSummary ?? null)
    : null;
  const ratingsSummary = useMemo<ReviewRatingsSummaryDto | null>(() => {
    if (serverRatingsSummary) {
      return serverRatingsSummary;
    }

    if (reviews.length === 0) {
      return null;
    }

    const count = reviews.length;
    const avg = (values: number[]): number =>
      values.reduce((sum, value) => sum + value, 0) / count;

    return {
      totalReviews: reviewTotal || count,
      overallRating: avg(reviews.map((review) => review.overallRating)),
      cleanlinessRating: avg(reviews.map((review) => review.cleanlinessRating)),
      locationRating: avg(reviews.map((review) => review.locationRating)),
      serviceRating: avg(reviews.map((review) => review.serviceRating)),
      amenitiesRating: avg(reviews.map((review) => review.amenitiesRating)),
      valueRating: avg(reviews.map((review) => review.valueRating)),
    };
  }, [reviewTotal, reviews, serverRatingsSummary]);
  const reviewTotalPages = Math.max(
    1,
    Math.ceil(reviewTotal / REVIEW_PAGE_SIZE),
  );
  const reviewsLoading = !shouldLoadReviews || reviewsQueryLoading;
  const canGoPrev = reviewPage > 1;
  const canGoNext = reviewPage < reviewTotalPages;

  const handlePrevReviewPage = useCallback(() => {
    setReviewPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextReviewPage = useCallback(() => {
    setReviewPage((prev) => Math.min(reviewTotalPages, prev + 1));
  }, [reviewTotalPages]);

  const fromPrice = useMemo(() => {
    if (typeof hotel?.startingPrice === "number" && hotel.startingPrice > 0) {
      return hotel.startingPrice;
    }
    const prices = rooms
      .map((room) => room.basePrice)
      .filter((price): price is number => typeof price === "number");
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [hotel?.startingPrice, rooms]);

  const heroImage = useMemo(
    () => hotel?.hotelImages[0] ?? rooms[0]?.roomImages[0] ?? "",
    [hotel?.hotelImages, rooms],
  );
  const heroVideo = useMemo(
    () => hotel?.hotelVideos?.[0] ?? "",
    [hotel?.hotelVideos],
  );
  const secondaryImage = useMemo(
    () => hotel?.hotelImages[1] ?? heroImage,
    [heroImage, hotel?.hotelImages],
  );
  const galleryVideos = useMemo(() => {
    if (!hotel?.hotelVideos?.length) {
      return [];
    }

    return hotel.hotelVideos.slice(1);
  }, [hotel?.hotelVideos]);

  const galleryImages = useMemo(() => {
    if (!hotel) {
      return [];
    }

    if (hotel.hotelImages.length > 2) {
      return hotel.hotelImages.slice(2);
    }

    return hotel.hotelImages;
  }, [hotel]);

  const activeAmenities = useMemo(() => {
    if (!hotel || !hotel.amenities) {
      return [];
    }

    return Object.entries(hotel.amenities)
      .filter(([, enabled]) => enabled === true)
      .map(([key]) =>
        getHotelAmenityLabel(key, t)
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/[_-]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      );
  }, [hotel, t]);

  const shortDescription = useMemo(
    () =>
      hotel
        ? shortenText(
            hotel.hotelDesc || t("hotel_detail_desc_fallback"),
            190,
          )
        : "",
    [hotel, t],
  );

  const reviewCountText = useMemo(
    () =>
      reviewTotal > 0
        ? formatNumber(reviewTotal)
        : reviewsLoading
          ? "..."
          : "0",
    [reviewTotal, reviewsLoading],
  );

  const satisfactionText = useMemo(
    () => (hotel ? asPercent(hotel.hotelRating) : "0%"),
    [hotel],
  );

  const hotelLikeCount = hotelLikeState?.count ?? hotel?.hotelLikes ?? 0;
  const hotelLiked = hotelLikeState?.liked ?? hotelLikedFromServer;

  return {
    hotelId,
    hotel,
    hotelLoading,
    hotelErrorMessage: hotelError ? getErrorMessage(hotelError) : null,
    hotelLikedErrorMessage,
    generalActionError,
    reviewActionError,
    rooms,
    roomsLoading,
    roomsErrorMessage: roomsError ? getErrorMessage(roomsError) : null,
    reviews,
    reviewsLoading,
    reviewsErrorMessage: reviewsError ? getErrorMessage(reviewsError) : null,
    reviewPage,
    reviewTotalPages,
    reviewTotal,
    ratingsSummary,
    canGoPrev,
    canGoNext,
    handlePrevReviewPage,
    handleNextReviewPage,
    markingHelpfulReviewId,
    helpfulCountOverrides,
    canUseLikeActions,
    canUseRecommendedQuery,
    togglingHotelLike,
    handleToggleHotelLike,
    handleMarkHelpful,
    fromPrice,
    activeAmenities,
    shortDescription,
    reviewCountText,
    satisfactionText,
    hotelLikeCount,
    hotelLiked,
    heroImage,
    heroVideo,
    secondaryImage,
    galleryVideos,
    galleryImages,
    discoverySectionRef,
    locationSectionRef,
    shouldLoadDiscovery,
    shouldLoadMap,
    mapEmbedUrl: hotel ? getMapEmbedLink(hotel) : "",
    mapUrl: hotel ? getMapLink(hotel) : "",
    similarHotels,
    similarLoading,
    similarErrorMessage,
    trendingHotels,
    trendingLoading,
    trendingErrorMessage,
    recommendedHotels,
    recommendedExplanationMap,
    recommendedMeta,
    recommendedLoading,
    recommendedErrorMessage,
    cancellationPolicyText: hotel
      ? hotel.cancellationPolicy === "FLEXIBLE"
        ? t("hotel_policy_flexible")
        : hotel.cancellationPolicy === "STRICT"
          ? t("hotel_policy_strict")
          : t("hotel_policy_moderate")
      : t("hotel_policy_moderate"),
    reviewsSectionRef,
  };
};
