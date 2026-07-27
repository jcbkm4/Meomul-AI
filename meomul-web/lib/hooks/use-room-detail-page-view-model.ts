import type { LinkProps } from "next/link";
import { useMemo } from "react";
import { getRoomPresentation } from "@/components/rooms/detail/room-presenters";
import { useRoomBookingState } from "@/lib/hooks/use-room-booking-state";
import { useRoomDetailData } from "@/lib/hooks/use-room-detail-data";
import { useRoomPriceLock } from "@/lib/hooks/use-room-price-lock";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/utils/error";

const buildBookingHref = (
  hotelId: string,
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  adults: number,
  children: number,
  quantity: number,
): LinkProps["href"] => {
  const query: Record<string, string> = {
    hotelId,
    roomId,
    adultCount: String(adults),
    childCount: String(children),
    quantity: String(quantity),
  };

  if (checkInDate) {
    query.checkInDate = checkInDate;
  }
  if (checkOutDate) {
    query.checkOutDate = checkOutDate;
  }

  return {
    pathname: "/bookings/new",
    query,
  };
};

export const useRoomDetailPageViewModel = () => {
  const { t } = useI18n();
  const detail = useRoomDetailData();
  const booking = useRoomBookingState({
    roomId: detail.roomId,
    room: detail.room,
    roomHotelId: detail.roomHotelId,
    isHydrated: detail.isHydrated,
    todayDate: detail.todayDate,
    todayMonth: detail.todayMonth,
    calendarMonth: detail.calendarMonth,
    setCalendarMonth: detail.setCalendarMonth,
    priceCalendarData: detail.priceCalendarData,
    refetchPriceCalendar: detail.refetchPriceCalendar,
  });

  const priceLock = useRoomPriceLock({
    isHydrated: detail.isHydrated,
    roomId: detail.roomId,
    room: detail.room,
    memberType: detail.memberType,
    activeDeal: detail.activeDeal,
  });

  const presentation = useMemo(() => getRoomPresentation(detail.room, t), [detail.room, t]);
  const cheapestDatePrice = booking.cheapestDateKey ? booking.availabilityByDate.get(booking.cheapestDateKey)?.price : undefined;
  const peakDatePrice = booking.peakDateKey ? booking.availabilityByDate.get(booking.peakDateKey)?.price : undefined;
  const continueBookingHref =
    booking.canContinueBooking && detail.room
      ? buildBookingHref(
          detail.roomHotelId,
          detail.room._id,
          booking.checkInDate,
          booking.checkOutDate,
          booking.adultCount,
          booking.childCount,
          booking.roomQuantity,
        )
      : undefined;

  const roomErrorMessage = detail.roomError ? getErrorMessage(detail.roomError) : null;
  const hotelErrorMessage = detail.hotelError ? getErrorMessage(detail.hotelError) : null;
  const myPriceLockErrorMessage = priceLock.myPriceLockError ? getErrorMessage(priceLock.myPriceLockError) : null;
  const calendarLoadErrorMessage =
    detail.priceCalendarError && booking.visibleWindowCalendar.length === 0 ? getErrorMessage(detail.priceCalendarError) : null;

  return {
    ...detail,
    ...booking,
    ...priceLock,
    ...presentation,
    roomErrorMessage,
    hotelErrorMessage,
    myPriceLockErrorMessage,
    calendarLoadErrorMessage,
    cheapestDatePrice,
    peakDatePrice,
    continueBookingHref,
  };
};
