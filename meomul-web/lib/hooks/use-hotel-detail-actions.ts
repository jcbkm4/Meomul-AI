import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HAS_LIKED_QUERY, MARK_HELPFUL_MUTATION, TOGGLE_LIKE_MUTATION } from "@/graphql/hotel.gql";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { getErrorMessage } from "@/lib/utils/error";
import type {
  HasLikedQueryData,
  HasLikedQueryVars,
  MarkHelpfulMutationData,
  MarkHelpfulMutationVars,
  ToggleLikeMutationData,
  ToggleLikeMutationVars,
} from "@/types/hotel";

interface UseHotelDetailActionsInput {
  hotelId: string;
  canUseLikeActions: boolean;
}

export const useHotelDetailActions = ({ hotelId, canUseLikeActions }: UseHotelDetailActionsInput) => {
  const [reviewActionError, setReviewActionError] = useState<string | null>(null);
  const [generalActionError, setGeneralActionError] = useState<string | null>(null);
  const [markingHelpfulReviewId, setMarkingHelpfulReviewId] = useState<string | null>(null);
  const [helpfulCountOverrides, setHelpfulCountOverrides] = useState<Record<string, number>>({});
  const [hotelLikeState, setHotelLikeState] = useState<{ liked: boolean; count: number } | null>(null);
  const isPageVisible = usePageVisible();
  const hasVisibilityMountedRef = useRef(false);
  const wasVisibleRef = useRef(false);

  const likedQueryVariables = useMemo<HasLikedQueryVars>(
    () => ({
      likeRefId: hotelId,
      likeGroup: "HOTEL",
    }),
    [hotelId],
  );

  const {
    data: hotelLikedData,
    error: hotelLikedError,
    refetch: refetchHotelLiked,
  } = useQuery<HasLikedQueryData, HasLikedQueryVars>(HAS_LIKED_QUERY, {
    skip: !hotelId || !canUseLikeActions,
    variables: likedQueryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const [toggleLikeMutation, { loading: togglingHotelLike }] = useMutation<ToggleLikeMutationData, ToggleLikeMutationVars>(
    TOGGLE_LIKE_MUTATION,
  );

  const [markHelpfulMutation] = useMutation<MarkHelpfulMutationData, MarkHelpfulMutationVars>(MARK_HELPFUL_MUTATION);

  useEffect(() => {
    setHotelLikeState(null);
    setHelpfulCountOverrides({});
    setReviewActionError(null);
    setGeneralActionError(null);
  }, [hotelId]);

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
    if (!becameVisible || !hotelId || !canUseLikeActions) {
      return;
    }

    void refetchHotelLiked();
  }, [canUseLikeActions, hotelId, isPageVisible, refetchHotelLiked]);

  const handleToggleHotelLike = useCallback(async (): Promise<void> => {
    if (!hotelId || !canUseLikeActions) {
      return;
    }

    setGeneralActionError(null);

    try {
      const response = await toggleLikeMutation({
        variables: {
          input: {
            likeGroup: "HOTEL",
            likeRefId: hotelId,
          },
        },
      });

      const payload = response.data?.toggleLike;
      if (payload) {
        setHotelLikeState({
          liked: payload.liked,
          count: payload.likeCount,
        });
      }
    } catch (error) {
      setGeneralActionError(getErrorMessage(error));
    }
  }, [canUseLikeActions, hotelId, toggleLikeMutation]);

  const handleMarkHelpful = useCallback(
    async (reviewId: string): Promise<void> => {
      if (!canUseLikeActions) {
        return;
      }

      setReviewActionError(null);
      setMarkingHelpfulReviewId(reviewId);

      try {
        const response = await markHelpfulMutation({
          variables: { reviewId },
        });

        const updated = response.data?.markHelpful;
        if (updated) {
          setHelpfulCountOverrides((previous) => ({
            ...previous,
            [updated._id]: updated.helpfulCount,
          }));
        }
      } catch (error) {
        setReviewActionError(getErrorMessage(error));
      } finally {
        setMarkingHelpfulReviewId(null);
      }
    },
    [canUseLikeActions, markHelpfulMutation],
  );

  return {
    hotelLikeState,
    hotelLikedFromServer: Boolean(hotelLikedData?.hasLiked),
    hotelLikedErrorMessage: hotelLikedError ? getErrorMessage(hotelLikedError) : null,
    generalActionError,
    reviewActionError,
    markingHelpfulReviewId,
    helpfulCountOverrides,
    togglingHotelLike,
    handleToggleHotelLike,
    handleMarkHelpful,
  };
};
