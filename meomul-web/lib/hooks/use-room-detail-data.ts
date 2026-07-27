import { useApolloClient, useQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { GET_HOTEL_CONTEXT_QUERY, GET_PRICE_CALENDAR_QUERY, GET_ROOM_QUERY } from "@/graphql/hotel.gql";
import { getSessionMember } from "@/lib/auth/session";
import { formatDateInput } from "@/lib/rooms/booking";
import type {
  GetHotelContextQueryData,
  GetHotelContextQueryVars,
  GetPriceCalendarQueryData,
  GetPriceCalendarQueryVars,
  GetRoomQueryData,
  GetRoomQueryVars,
  RoomDetailItem,
} from "@/types/hotel";

interface UseRoomDetailDataResult {
  isHydrated: boolean;
  memberType: string | undefined;
  todayDate: string;
  todayMonth: string;
  calendarMonth: string;
  setCalendarMonth: (value: string) => void;
  roomId: string;
  room: RoomDetailItem | undefined;
  roomLoading: boolean;
  roomError: unknown;
  roomHotelId: string;
  priceCalendarData: GetPriceCalendarQueryData | undefined;
  priceCalendarLoading: boolean;
  priceCalendarError: unknown;
  refetchPriceCalendar: (variables?: GetPriceCalendarQueryVars) => Promise<unknown>;
  hotel: GetHotelContextQueryData["getHotel"] | undefined;
  hotelError: unknown;
  coverImage: string;
  galleryImages: string[];
  activeDeal: RoomDetailItem["lastMinuteDeal"] | null;
}

const CALENDAR_PREFETCH_OFFSETS = [-1, 1] as const;

const shiftMonthKey = (monthKey: string, offset: number): string => {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return monthKey;
  }

  const shifted = new Date(year, month - 1 + offset, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
};

export const useRoomDetailData = (): UseRoomDetailDataResult => {
  const apolloClient = useApolloClient();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [member, setMember] = useState<ReturnType<typeof getSessionMember>>(null);
  const prefetchedCalendarMonthsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsHydrated(true);
    setMember(getSessionMember());
  }, []);

  const todayDate = useMemo(() => formatDateInput(new Date()), []);
  const todayMonth = useMemo(() => todayDate.slice(0, 7), [todayDate]);
  const [calendarMonth, setCalendarMonth] = useState(todayMonth);

  const roomId = useMemo(() => {
    if (typeof router.query.roomId === "string") {
      return router.query.roomId;
    }
    return "";
  }, [router.query.roomId]);

  useEffect(() => {
    prefetchedCalendarMonthsRef.current.clear();
  }, [roomId]);

  const roomQueryVariables = useMemo<GetRoomQueryVars>(() => ({ roomId }), [roomId]);
  const priceCalendarQueryVariables = useMemo<GetPriceCalendarQueryVars>(
    () => ({
      input: {
        roomId,
        month: calendarMonth,
      },
    }),
    [calendarMonth, roomId],
  );

  const {
    data: roomData,
    loading: roomLoading,
    error: roomError,
  } = useQuery<GetRoomQueryData, GetRoomQueryVars>(GET_ROOM_QUERY, {
    skip: !isHydrated || !roomId,
    variables: roomQueryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const room = roomData?.getRoom;
  const roomHotelId = room?.hotelId ?? "";
  const hotelContextQueryVariables = useMemo<GetHotelContextQueryVars>(
    () => ({
      hotelId: roomHotelId,
    }),
    [roomHotelId],
  );

  const {
    data: priceCalendarData,
    loading: priceCalendarLoading,
    error: priceCalendarError,
    refetch: refetchPriceCalendar,
  } = useQuery<GetPriceCalendarQueryData, GetPriceCalendarQueryVars>(GET_PRICE_CALENDAR_QUERY, {
    skip: !isHydrated || !roomId,
    variables: priceCalendarQueryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (!isHydrated || !roomId) {
      return;
    }

    const targetMonths = CALENDAR_PREFETCH_OFFSETS.map((offset) => shiftMonthKey(calendarMonth, offset)).filter(
      (month) => month !== calendarMonth && !prefetchedCalendarMonthsRef.current.has(month),
    );

    if (targetMonths.length === 0) {
      return;
    }

    targetMonths.forEach((month) => {
      prefetchedCalendarMonthsRef.current.add(month);
    });

    let cancelled = false;
    const runPrefetch = (): void => {
      targetMonths.forEach((month) => {
        void apolloClient
          .query<GetPriceCalendarQueryData, GetPriceCalendarQueryVars>({
            query: GET_PRICE_CALENDAR_QUERY,
            variables: {
              input: {
                roomId,
                month,
              },
            },
            fetchPolicy: "cache-first",
          })
          .catch(() => {
            if (!cancelled) {
              prefetchedCalendarMonthsRef.current.delete(month);
            }
          });
      });
    };

    const windowWithIdle = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof windowWithIdle.requestIdleCallback === "function") {
      const idleId = windowWithIdle.requestIdleCallback(runPrefetch, { timeout: 1000 });
      return () => {
        cancelled = true;
        if (typeof windowWithIdle.cancelIdleCallback === "function") {
          windowWithIdle.cancelIdleCallback(idleId);
        }
      };
    }

    const timer = window.setTimeout(runPrefetch, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [apolloClient, calendarMonth, isHydrated, roomId]);

  const { data: hotelData, error: hotelError } = useQuery<GetHotelContextQueryData, GetHotelContextQueryVars>(GET_HOTEL_CONTEXT_QUERY, {
    skip: !isHydrated || !roomHotelId,
    variables: hotelContextQueryVariables,
    fetchPolicy: "cache-and-network",
  });

  const hotel = hotelData?.getHotel;
  const combinedGalleryImages = useMemo(() => {
    const seen = new Set<string>();
    const primaryImages = room?.roomImages?.length ? room.roomImages : hotel?.hotelImages ?? [];

    return primaryImages.filter((image) => {
      if (!image || seen.has(image)) {
        return false;
      }
      seen.add(image);
      return true;
    });
  }, [hotel?.hotelImages, room?.roomImages]);
  const coverImage = combinedGalleryImages[0] ?? "";
  const galleryImages = combinedGalleryImages.slice(1);
  const activeDeal = useMemo(() => {
    const deal = room?.lastMinuteDeal;
    if (!deal?.isActive) {
      return null;
    }

    const expiresAtMs = new Date(deal.validUntil).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
      return null;
    }

    return deal;
  }, [room?.lastMinuteDeal]);

  return {
    isHydrated,
    memberType: member?.memberType,
    todayDate,
    todayMonth,
    calendarMonth,
    setCalendarMonth,
    roomId,
    room,
    roomLoading,
    roomError,
    roomHotelId,
    priceCalendarData,
    priceCalendarLoading,
    priceCalendarError,
    refetchPriceCalendar,
    hotel,
    hotelError,
    coverImage,
    galleryImages,
    activeDeal,
  };
};
