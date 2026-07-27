import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { RoomAmenitiesSection } from "@/components/rooms/detail/room-amenities-section";
import { PriceLockReadyBar } from "@/components/rooms/detail/price-lock-ready-bar";
import { RoomHeroSection } from "@/components/rooms/detail/room-hero-section";
import { RoomHotelContextSection } from "@/components/rooms/detail/room-hotel-context-section";
import { RoomOverviewSection } from "@/components/rooms/detail/room-overview-section";
import { LiveInterestFabContainer } from "@/components/rooms/live-interest-fab-container";
import { ErrorNotice } from "@/components/ui/error-notice";
import { GET_HOTEL_CONTEXT_QUERY, GET_ROOM_QUERY } from "@/graphql/hotel.gql";
import { createApolloClient } from "@/lib/apollo/client";
import { env } from "@/lib/config/env";
import { getBedTypeLabel, getHotelLocationLabelLocalized } from "@/lib/hotels/hotels-i18n";
import { useRoomDetailPageViewModel } from "@/lib/hooks/use-room-detail-page-view-model";
import { useI18n } from "@/lib/i18n/provider";
import { formatEnumLabel } from "@/lib/rooms/booking";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type {
  GetHotelContextQueryData,
  GetHotelContextQueryVars,
  GetRoomQueryData,
  GetRoomQueryVars,
} from "@/types/hotel";

function RoomBookingSidebarLoader() {
  const { t } = useI18n();

  return (
    <aside className="order-1 self-start rounded-2xl border border-slate-200 bg-white/90 p-3.5 text-sm text-slate-500 sm:rounded-3xl sm:p-4 lg:order-2">
      {t("room_detail_loading_panel")}
    </aside>
  );
}

const RoomBookingSidebar = dynamic(
  () => import("@/components/rooms/detail/room-booking-sidebar").then((mod) => mod.RoomBookingSidebar),
  { loading: () => <RoomBookingSidebarLoader /> },
);

const ROOM_DETAIL_MOTION_INTENSITY_CLASS = "motion-intensity-bold";

interface RoomDetailPageProps {
  initialMetaRoom: GetRoomQueryData["getRoom"] | null;
  initialMetaHotel: GetHotelContextQueryData["getHotel"] | null;
}

export default function RoomDetailPage({ initialMetaRoom, initialMetaHotel }: RoomDetailPageProps) {
  const { t } = useI18n();
  const liveInterestWidgetClass =
    "bottom-[calc(env(safe-area-inset-bottom)+15.5rem)] sm:bottom-[16rem]";

  const {
    isHydrated,
    room,
    roomLoading,
    roomErrorMessage,
    hotelErrorMessage,
    myPriceLockErrorMessage,
    lockActionError,
    priceCalendarLoading,
    calendarLoadErrorMessage,
    hotel,
    coverImage,
    galleryImages,
    activeDeal,
    checkInDate,
    checkOutDate,
    adultCount,
    childCount,
    roomQuantity,
    availabilityByDate,
    visibleWindowCalendar,
    selectedStayMinAvailable,
    bookingValidationMessage,
    canContinueBooking,
    cheapestDateKey,
    peakDateKey,
    averageVisiblePrice,
    selectedRange,
    calendarMonthDate,
    minCalendarMonthDate,
    dayPickerClassNames,
    dayPickerStyle,
    disabledDays,
    onAdultCountChange,
    onChildCountChange,
    onRoomQuantityChange,
    onCalendarMonthChange,
    onCalendarDayClick,
    lockingPrice,
    lockRequestPrice,
    effectiveNightlyRate,
    effectiveNightlyRateSourceLabel,
    showBottomLockBar,
    onLockPrice,
    cheapestDatePrice,
    peakDatePrice,
    continueBookingHref,
    roomTypeLabel,
    viewTypeLabel,
    roomTypeLine,
    roomFactCards,
    roomAmenityCards,
  } = useRoomDetailPageViewModel();

  const handleLockPrice = useCallback(() => {
    void onLockPrice();
  }, [onLockPrice]);

  const locationLabel = hotel ? getHotelLocationLabelLocalized(hotel.hotelLocation, t) : "";
  const guestLine = room
    ? `${t("room_fact_guests_value", { count: room.maxOccupancy })} · ${t("room_fact_bed_value", { count: room.bedCount, bedType: getBedTypeLabel(room.bedType, t) })}`
    : "";
  const priceLine = hotel?.checkInTime && hotel?.checkOutTime ? `${hotel.checkInTime} - ${hotel.checkOutTime}` : undefined;
  const backHref = hotel?._id ? `/hotels/${hotel._id}` : "/hotels";
  const metaRoom = room ?? initialMetaRoom;
  const metaHotel = hotel ?? initialMetaHotel;
  const siteUrl = env.siteUrl.replace(/\/+$/, "");
  const roomUrl = metaRoom ? `${siteUrl}/rooms/${metaRoom._id}` : `${siteUrl}/rooms`;
  const roomTitle = metaRoom
    ? `${metaRoom.roomName} — ${metaHotel?.hotelTitle ?? "Room"} | Meomul`
    : "Room detail | Meomul";
  const roomDescription = metaRoom
    ? `${metaRoom.roomName} at ${metaHotel?.hotelTitle ?? "Meomul"} in ${metaHotel?.hotelLocation ?? "South Korea"}. ${metaRoom.maxOccupancy} guests · ${metaRoom.bedCount} ${getBedTypeLabel(metaRoom.bedType, t)} · ${metaRoom.viewType.toLowerCase()} view.`
    : "Explore room details, pricing, and availability on Meomul.";
  const metaImageSource = metaRoom?.roomImages?.[0] || metaHotel?.hotelImages?.[0];
  const roomOgImage = metaImageSource ? resolveMediaUrl(metaImageSource) : `${siteUrl}/og-default.png`;
  const roomOgImageAlt = metaRoom
    ? `${metaRoom.roomName} at ${metaHotel?.hotelTitle ?? "Meomul"}`
    : "Meomul room detail";
  const roomStructuredData = metaRoom
    ? {
        "@context": "https://schema.org",
        "@type": "HotelRoom",
        name: metaRoom.roomName,
        description: roomDescription,
        image: roomOgImage,
        url: roomUrl,
        occupancy: { "@type": "QuantitativeValue", value: metaRoom.maxOccupancy },
        bed: `${metaRoom.bedCount} ${metaRoom.bedType}`,
        floorSize: metaRoom.roomSize
          ? { "@type": "QuantitativeValue", value: metaRoom.roomSize, unitCode: "MTK" }
          : undefined,
      }
    : null;

  return (
    <>
      <Head>
        <title>{roomTitle}</title>
        <meta name="description" content={roomDescription} />
        <link rel="canonical" href={roomUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={roomTitle} />
        <meta property="og:description" content={roomDescription} />
        <meta property="og:url" content={roomUrl} />
        <meta property="og:image" content={roomOgImage} />
        <meta property="og:image:alt" content={roomOgImageAlt} />
        <meta property="og:site_name" content="Meomul" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={roomTitle} />
        <meta name="twitter:description" content={roomDescription} />
        <meta name="twitter:image" content={roomOgImage} />
        <meta name="twitter:image:alt" content={roomOgImageAlt} />
        {roomStructuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(roomStructuredData).replace(/</g, "\\u003c"),
            }}
          />
        ) : null}
      </Head>

      <main
        className={`${ROOM_DETAIL_MOTION_INTENSITY_CLASS} ${showBottomLockBar ? "space-y-6 pb-[calc(env(safe-area-inset-bottom)+9.5rem)] sm:pb-32" : "space-y-6"}`}
      >
        <div className="hidden flex-wrap items-center justify-between gap-3 motion-fade-up motion-delay-1 md:flex">
          <Link href={backHref} className="text-sm text-slate-600 underline underline-offset-4">
            {t("room_detail_back")}
          </Link>
        </div>

        {roomErrorMessage ? <ErrorNotice message={roomErrorMessage} /> : null}
        {hotelErrorMessage ? <ErrorNotice message={hotelErrorMessage} /> : null}
        {myPriceLockErrorMessage ? <ErrorNotice message={myPriceLockErrorMessage} /> : null}
        {lockActionError ? <ErrorNotice message={lockActionError} /> : null}

        {!isHydrated || roomLoading ? (
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600 motion-fade-up motion-delay-2">
            {t("room_detail_loading_room")}
          </section>
        ) : null}

        {isHydrated && !roomLoading && !room ? (
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600 motion-fade-up motion-delay-2">
            {t("room_detail_not_found")}
          </section>
        ) : null}

        {room ? (
          <>
            <div className="motion-pop-in motion-delay-1">
              <RoomHeroSection
                coverImage={coverImage}
                galleryImages={galleryImages}
                roomTypeLabel={roomTypeLabel}
                viewTypeLabel={viewTypeLabel}
                roomNumber={room.roomNumber}
                roomName={room.roomName}
                hotelTitle={hotel?.hotelTitle}
                locationLabel={locationLabel}
                guestLine={guestLine}
                priceLine={priceLine}
                basePrice={room.basePrice}
                deal={activeDeal ?? undefined}
                backHref={backHref}
              />
            </div>

            <section className="grid items-start gap-7 motion-fade-up motion-delay-2 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
              <div className="space-y-6">
                <div className="hover-lift rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_24px_55px_-35px_rgba(15,23,42,0.18)] sm:p-7">
                  <RoomOverviewSection
                    roomTypeLine={roomTypeLine}
                    hotelTitle={hotel?.hotelTitle}
                    hotelCheckInTime={hotel?.checkInTime}
                    hotelCheckOutTime={hotel?.checkOutTime}
                    hotelCancellationPolicy={hotel?.cancellationPolicy ? formatEnumLabel(hotel.cancellationPolicy) : undefined}
                    deal={activeDeal ?? undefined}
                    roomDesc={room.roomDesc}
                    factCards={roomFactCards}
                    isSafeStayCertified={hotel?.safeStayCertified}
                  />
                </div>

                <div className="hover-lift rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_24px_55px_-35px_rgba(15,23,42,0.18)] sm:p-7">
                  <RoomAmenitiesSection amenityCards={roomAmenityCards} />
                </div>

                <div className="hover-lift rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_24px_55px_-35px_rgba(15,23,42,0.18)] sm:p-7">
                  <RoomHotelContextSection hotel={hotel} />
                </div>
              </div>

              <RoomBookingSidebar
                effectiveNightlyRate={effectiveNightlyRate}
                effectiveNightlyRateSourceLabel={effectiveNightlyRateSourceLabel}
                adultCount={adultCount}
                childCount={childCount}
                roomQuantity={roomQuantity}
                onAdultCountChange={onAdultCountChange}
                onChildCountChange={onChildCountChange}
                onRoomQuantityChange={onRoomQuantityChange}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                availabilityByDate={availabilityByDate}
                selectedRange={selectedRange}
                calendarMonthDate={calendarMonthDate}
                minCalendarMonthDate={minCalendarMonthDate}
                onCalendarMonthChange={onCalendarMonthChange}
                onCalendarDayClick={onCalendarDayClick}
                disabledDays={disabledDays}
                dayPickerClassNames={dayPickerClassNames}
                dayPickerStyle={dayPickerStyle}
                calendarLoadInProgress={priceCalendarLoading}
                calendarLoadErrorMessage={calendarLoadErrorMessage}
                visibleWindowCalendarLength={visibleWindowCalendar.length}
                averageVisiblePrice={averageVisiblePrice}
                cheapestDateKey={cheapestDateKey}
                cheapestDatePrice={cheapestDatePrice}
                peakDateKey={peakDateKey}
                peakDatePrice={peakDatePrice}
                bookingValidationMessage={bookingValidationMessage}
                canContinueBooking={canContinueBooking}
                continueBookingHref={continueBookingHref}
              />
            </section>

            {showBottomLockBar ? (
              <PriceLockReadyBar basePrice={lockRequestPrice} locking={lockingPrice} onLockPrice={handleLockPrice} />
            ) : null}
            <LiveInterestFabContainer
              roomId={room._id}
              availableRooms={selectedStayMinAvailable ?? room.availableRooms}
              containerClassName={liveInterestWidgetClass}
            />
          </>
        ) : null}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<RoomDetailPageProps> = async (context) => {
  const roomId = typeof context.params?.roomId === "string" ? context.params.roomId : "";
  if (!roomId) {
    return {
      props: {
        initialMetaRoom: null,
        initialMetaHotel: null,
      },
    };
  }

  const apolloClient = createApolloClient();

  try {
    const roomResult = await apolloClient.query<GetRoomQueryData, GetRoomQueryVars>({
      query: GET_ROOM_QUERY,
      variables: { roomId },
      fetchPolicy: "network-only",
    });

    const initialMetaRoom = roomResult.data?.getRoom ?? null;
    if (!initialMetaRoom?.hotelId) {
      return {
        props: {
          initialMetaRoom,
          initialMetaHotel: null,
        },
      };
    }

    const hotelResult = await apolloClient.query<GetHotelContextQueryData, GetHotelContextQueryVars>({
      query: GET_HOTEL_CONTEXT_QUERY,
      variables: { hotelId: initialMetaRoom.hotelId },
      fetchPolicy: "network-only",
    });

    return {
      props: {
        initialMetaRoom,
        initialMetaHotel: hotelResult.data?.getHotel ?? null,
      },
    };
  } catch {
    return {
      props: {
        initialMetaRoom: null,
        initialMetaHotel: null,
      },
    };
  }
};
