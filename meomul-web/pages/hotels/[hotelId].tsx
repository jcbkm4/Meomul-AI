import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Loader2, MessageSquare } from "lucide-react";
import { getSessionMember } from "@/lib/auth/session";
import { createApolloClient } from "@/lib/apollo/client";
import { HotelAmenitiesSection } from "@/components/hotels/detail/hotel-amenities-section";
import { HotelFeaturesSection } from "@/components/hotels/detail/hotel-features-section";
import { HotelGallerySection } from "@/components/hotels/detail/hotel-gallery-section";
import { HotelLocationSection } from "@/components/hotels/detail/hotel-location-section";
import { HotelOverviewHero } from "@/components/hotels/detail/hotel-overview-hero";
import { HotelReviewsSection } from "@/components/hotels/detail/hotel-reviews-section";
import { HotelRoomsSection } from "@/components/hotels/detail/hotel-rooms-section";
import { HotelThingsToKnowSection } from "@/components/hotels/detail/hotel-things-to-know-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ErrorNotice } from "@/components/ui/error-notice";
import { confirmAction, errorAlert, infoAlert } from "@/lib/ui/alerts";
import { GET_MY_CHATS_QUERY, START_CHAT_MUTATION } from "@/graphql/chat.gql";
import { GET_HOTEL_DETAIL_QUERY, GET_ROOMS_BY_HOTEL_QUERY } from "@/graphql/hotel.gql";
import { useHotelDetailPageData } from "@/lib/hooks/use-hotel-detail-page-data";
import { useI18n } from "@/lib/i18n/provider";
import { env } from "@/lib/config/env";
import { getHotelLocationLabelLocalized, getHotelTypeLabel } from "@/lib/hotels/hotels-i18n";
import { ROOM_PAGE_SIZE } from "@/lib/hotels/detail-page-helpers";
import { pushRecentlyViewedHotel } from "@/lib/hotels/recently-viewed";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type {
  GetHotelQueryData,
  GetHotelQueryVars,
  GetRoomsByHotelQueryData,
  GetRoomsByHotelQueryVars,
  HotelDetailItem,
  RoomListItem,
} from "@/types/hotel";
import type {
  GetMyChatsQueryData,
  StartChatMutationData,
  StartChatMutationVars,
} from "@/types/chat";

interface HotelDetailPageProps {
  initialHotel: HotelDetailItem | null;
  initialRooms: RoomListItem[];
}

function HotelListSectionLoader() {
  const { t } = useI18n();

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
      {t("hotel_detail_loading_recommendations")}
    </section>
  );
}

const HotelListSection = dynamic(
  () =>
    import("@/components/hotels/detail/hotel-list-section").then(
      (mod) => mod.HotelListSection,
    ),
  {
    loading: () => <HotelListSectionLoader />,
  },
);

const HOTEL_DETAIL_MOTION_INTENSITY_CLASS = "motion-intensity-bold";

export default function HotelDetailPage({
  initialHotel,
  initialRooms,
}: HotelDetailPageProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [member, setMember] =
    useState<ReturnType<typeof getSessionMember>>(null);
  useEffect(() => {
    setMember(getSessionMember());
  }, []);
  const isUser = member?.memberType === "USER";
  const [startingChat, setStartingChat] = useState(false);
  const [startChat] = useMutation<StartChatMutationData, StartChatMutationVars>(
    START_CHAT_MUTATION,
  );
  const { data: myChatsData } = useQuery<GetMyChatsQueryData>(
    GET_MY_CHATS_QUERY,
    {
      variables: {
        input: { page: 1, limit: 50, sort: "lastMessageAt", direction: -1 },
      },
      skip: !isUser,
      fetchPolicy: "cache-first",
    },
  );
  const trackedHotelIdRef = useRef<string>("");
  const {
    hotelId,
    hotel,
    hotelLoading,
    hotelErrorMessage,
    hotelLikedErrorMessage,
    generalActionError,
    reviewActionError,
    rooms,
    roomsLoading,
    roomsErrorMessage,
    reviews,
    reviewsLoading,
    reviewsErrorMessage,
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
    mapEmbedUrl,
    mapUrl,
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
    cancellationPolicyText,
    reviewsSectionRef,
  } = useHotelDetailPageData({ initialHotel, initialRooms });

  useEffect(() => {
    if (!hotel || trackedHotelIdRef.current === hotel._id) {
      return;
    }

    trackedHotelIdRef.current = hotel._id;
    pushRecentlyViewedHotel({
      hotelId: hotel._id,
      hotelTitle: hotel.hotelTitle,
      hotelLocation: hotel.hotelLocation,
      hotelType: hotel.hotelType,
      hotelRating: Number.isFinite(hotel.hotelRating) ? hotel.hotelRating : 0,
      hotelLikes: Number.isFinite(hotel.hotelLikes) ? hotel.hotelLikes : 0,
      imageUrl: resolveMediaUrl(hotel.hotelImages[0]),
    });
  }, [hotel]);

  if (!hotelId) {
    return (
      <main className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
        {t("hotel_detail_loading_route")}
      </main>
    );
  }

  if (hotelLoading && !hotel) {
    return (
      <main className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hotels"
            className="text-sm text-slate-600 underline underline-offset-4"
          >
            {t("hotel_detail_back")}
          </Link>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          {t("hotel_detail_loading_hotel")}
        </section>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hotels"
            className="text-sm text-slate-600 underline underline-offset-4"
          >
            {t("hotel_detail_back")}
          </Link>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          {t("hotel_detail_unavailable")}
          {hotelErrorMessage ? (
            <p className="mt-2 text-xs text-rose-600">{hotelErrorMessage}</p>
          ) : null}
        </section>
      </main>
    );
  }

  const siteUrl = env.siteUrl.replace(/\/+$/, "");
  const pageUrl = `${siteUrl}/hotels/${hotel._id}`;
  const pageTitle = `${hotel.hotelTitle} — ${hotel.hotelLocation} | Meomul`;
  const pageDescription =
    shortDescription ||
    t("hotel_detail_page_description_fallback", {
      hotelTitle: hotel.hotelTitle,
      hotelLocation: getHotelLocationLabelLocalized(hotel.hotelLocation, t),
      hotelType: getHotelTypeLabel(hotel.hotelType, t),
      rating: hotel.hotelRating?.toFixed(1) ?? "N/A",
    });
  const ogImage = heroImage
    ? resolveMediaUrl(heroImage)
    : `${siteUrl}/og-default.png`;
  const ogImageAlt = `${hotel.hotelTitle} in ${getHotelLocationLabelLocalized(hotel.hotelLocation, t)}`;
  const handleShareHotel = async (): Promise<void> => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: hotel.hotelTitle,
          text: pageDescription,
          url: pageUrl,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
        await infoAlert(
          t("hotel_detail_share_copied_title"),
          t("hotel_detail_share_copied_body"),
          { variant: "hotel" },
        );
      }
    } catch {
      await errorAlert(
        t("hotel_detail_share_failed_title"),
        t("hotel_detail_share_failed_body"),
        { variant: "hotel" },
      );
    }
  };

  const hotelStructuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: hotel.hotelTitle,
    description: pageDescription,
    image: ogImage,
    url: pageUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: hotel.hotelLocation,
      addressCountry: "KR",
    },
    ...(hotel.hotelRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: hotel.hotelRating.toFixed(1),
            bestRating: "5",
            reviewCount: String(hotel.hotelReviews ?? 0),
          },
        }
      : {}),
    ...(fromPrice
      ? {
          priceRange: `₩${fromPrice.toLocaleString()}~`,
        }
      : {}),
    checkinTime: hotel.checkInTime ?? undefined,
    checkoutTime: hotel.checkOutTime ?? undefined,
    starRating: hotel.starRating
      ? { "@type": "Rating", ratingValue: String(hotel.starRating) }
      : undefined,
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={ogImageAlt} />
        <meta property="og:site_name" content="Meomul" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={ogImageAlt} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(hotelStructuredData).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </Head>

      <main
        className={`w-full space-y-7 sm:space-y-10 [scroll-behavior:smooth] ${HOTEL_DETAIL_MOTION_INTENSITY_CLASS}`}
      >
        {hotelErrorMessage ? <ErrorNotice message={hotelErrorMessage} /> : null}
        {hotelLikedErrorMessage ? (
          <ErrorNotice message={hotelLikedErrorMessage} />
        ) : null}
        {generalActionError ? (
          <ErrorNotice message={generalActionError} />
        ) : null}

        <ScrollReveal delayMs={30}>
          <HotelOverviewHero
            hotel={hotel}
            heroImage={heroImage}
            heroVideo={heroVideo}
            secondaryImage={secondaryImage}
            shortDescription={shortDescription}
            reviewCountText={reviewCountText}
            satisfactionText={satisfactionText}
            cancellationPolicyText={cancellationPolicyText}
            hotelLikeCount={hotelLikeCount}
            hotelLiked={hotelLiked}
            canToggleLike={canUseLikeActions}
            togglingLike={togglingHotelLike}
            onToggleLike={handleToggleHotelLike}
            onShare={handleShareHotel}
          />
        </ScrollReveal>

        <div className="space-y-7 sm:space-y-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 hover-lift">
              <ScrollReveal delayMs={40}>
                <HotelFeaturesSection hotel={hotel} />
              </ScrollReveal>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 hover-lift">
              <ScrollReveal delayMs={45}>
                <HotelAmenitiesSection hotel={hotel} />
              </ScrollReveal>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 hover-lift">
              <ScrollReveal delayMs={50}>
                <HotelRoomsSection
                  rooms={rooms}
                  roomsLoading={roomsLoading}
                  roomsErrorMessage={roomsErrorMessage}
                  hotelId={hotelId}
                />
              </ScrollReveal>
            </div>

            <div
              ref={reviewsSectionRef}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 hover-lift"
            >
              <ScrollReveal delayMs={60}>
                <HotelReviewsSection
                  reviews={reviews}
                  reviewsLoading={reviewsLoading}
                  reviewsErrorMessage={reviewsErrorMessage}
                  reviewActionErrorMessage={reviewActionError}
                  reviewPage={reviewPage}
                  reviewTotalPages={reviewTotalPages}
                  reviewTotal={reviewTotal}
                  ratingsSummary={ratingsSummary}
                  onPrevPage={handlePrevReviewPage}
                  onNextPage={handleNextReviewPage}
                  canGoPrev={canGoPrev}
                  canGoNext={canGoNext}
                  canMarkHelpful={canUseLikeActions}
                  markingHelpfulReviewId={markingHelpfulReviewId}
                  helpfulCountOverrides={helpfulCountOverrides}
                  onMarkHelpful={handleMarkHelpful}
                />
              </ScrollReveal>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 hover-lift">
              <ScrollReveal delayMs={70}>
                <HotelThingsToKnowSection
                  hotel={hotel}
                  cancellationPolicyText={cancellationPolicyText}
                />
              </ScrollReveal>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 hover-lift">
              <ScrollReveal delayMs={80}>
                <HotelGallerySection images={galleryImages} videos={galleryVideos} />
              </ScrollReveal>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 hover-lift">
              <ScrollReveal delayMs={90}>
                <HotelLocationSection
                  hotel={hotel}
                  mapSectionRef={locationSectionRef}
                  shouldLoadMap={shouldLoadMap}
                  mapEmbedUrl={mapEmbedUrl}
                  mapUrl={mapUrl}
                />
              </ScrollReveal>
            </div>

            <section ref={discoverySectionRef} className="space-y-6">
            {shouldLoadDiscovery ? (
              <>
                <ScrollReveal delayMs={40}>
                  <HotelListSection
                    title={t("hotel_detail_similar_title")}
                    description={t("hotel_detail_similar_desc")}
                    hotels={similarHotels}
                    loading={similarLoading}
                    loadingText={t("hotel_detail_similar_loading")}
                    errorMessage={similarErrorMessage}
                    layout="horizontal"
                    trackingContext={{
                      source: "similar",
                      section: "hotel_detail_similar",
                    }}
                  />
                </ScrollReveal>

                <ScrollReveal delayMs={60}>
                  <HotelListSection
                    title={t("hotel_detail_trending_title", {
                      location: getHotelLocationLabelLocalized(hotel.hotelLocation, t),
                    })}
                    description={t("hotel_detail_trending_desc")}
                    hotels={trendingHotels}
                    loading={trendingLoading}
                    loadingText={t("hotel_detail_trending_loading")}
                    errorMessage={trendingErrorMessage}
                    layout="horizontal"
                    trackingContext={{
                      source: "trending_by_location",
                      section: "hotel_detail_trending_location",
                    }}
                  />
                </ScrollReveal>

                {canUseRecommendedQuery ? (
                  <ScrollReveal delayMs={80}>
                    <HotelListSection
                      title={t("hotel_detail_recommended_title")}
                      description={t("hotel_detail_recommended_desc")}
                      hotels={recommendedHotels}
                      loading={recommendedLoading}
                      loadingText={t("hotel_detail_recommended_loading")}
                      errorMessage={recommendedErrorMessage}
                      layout="horizontal"
                      recommendationExplanations={recommendedExplanationMap}
                      trackingContext={{
                        source: "recommended_v2",
                        section: "hotel_detail_recommended",
                        profileSource: recommendedMeta?.profileSource,
                        onboardingWeight: recommendedMeta?.onboardingWeight,
                        behaviorWeight: recommendedMeta?.behaviorWeight,
                      }}
                    />
                  </ScrollReveal>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">
                  {t("hotel_detail_preparing_recommendations")}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {t("hotel_detail_discovery_loading")}
                </p>
                <div className="mt-4 flex gap-3 overflow-hidden">
                  <div className="h-44 min-w-[16rem] flex-1 animate-pulse rounded-xl bg-slate-100" />
                  <div className="hidden h-44 min-w-[16rem] flex-1 animate-pulse rounded-xl bg-slate-100 sm:block" />
                  <div className="hidden h-44 min-w-[16rem] flex-1 animate-pulse rounded-xl bg-slate-100 lg:block" />
                </div>
              </div>
            )}
            </section>
        </div>
      </main>

      {/* Floating chat FAB — always visible for logged-in users */}
      {isUser && (
        <button
          type="button"
          disabled={startingChat}
          onClick={async () => {
            // Navigate to existing open chat if one exists for this hotel
            const existingChat = myChatsData?.getMyChats.list.find(
              (c) => c.hotelId === hotelId && c.chatStatus !== "CLOSED",
            );
            if (existingChat) {
              void router.push(`/chats/${existingChat._id}`);
              return;
            }
            const confirmed = await confirmAction({
              title: "Contact this hotel",
              text: t("hotel_detail_chat_initial_message", {
                hotelTitle: hotel?.hotelTitle ?? t("hotel_type_hotel"),
              }),
              confirmText: t("hotel_detail_chat_cta"),
              variant: "chat",
            });
            if (!confirmed) return;
            setStartingChat(true);
            try {
              const { data } = await startChat({
                variables: {
                    input: {
                      hotelId,
                    initialMessage: t("hotel_detail_chat_initial_message", {
                      hotelTitle: hotel?.hotelTitle ?? t("hotel_type_hotel"),
                    }),
                  },
                },
              });
              if (data?.startChat._id) {
                void router.push(`/chats/${data.startChat._id}`);
              }
            } catch {
              await errorAlert("Could not start chat", t("hotel_detail_chat_error"), {
                variant: "chat",
              });
              setStartingChat(false);
            }
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_-6px_rgba(14,165,233,0.5)] transition hover:bg-sky-600 hover:shadow-[0_8px_30px_-4px_rgba(14,165,233,0.6)] active:scale-95 disabled:opacity-70"
        >
          {startingChat ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <MessageSquare size={18} />
          )}
          <span className="hidden sm:inline">
            {startingChat ? t("hotel_detail_chat_starting") : t("hotel_detail_chat_cta")}
          </span>
        </button>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  HotelDetailPageProps
> = async (context) => {
  const rawHotelId = context.params?.hotelId;
  const hotelId = Array.isArray(rawHotelId) ? rawHotelId[0] : rawHotelId;

  if (!hotelId) {
    return { notFound: true };
  }

  if (context.res) {
    context.res.setHeader(
      "Cache-Control",
      process.env.NODE_ENV === "production"
        ? "public, s-maxage=60, stale-while-revalidate=300"
        : "no-store",
    );
  }

  const client = createApolloClient();

  try {
    const hotelResult = await client.query<GetHotelQueryData, GetHotelQueryVars>({
      query: GET_HOTEL_DETAIL_QUERY,
      variables: { hotelId },
      fetchPolicy: "no-cache",
    });

    const serverHotel = hotelResult.data?.getHotel ?? null;
    if (!serverHotel) {
      return { notFound: true };
    }

    let initialRooms: RoomListItem[] = [];

    try {
      const roomsResult = await client.query<
        GetRoomsByHotelQueryData,
        GetRoomsByHotelQueryVars
      >({
        query: GET_ROOMS_BY_HOTEL_QUERY,
        variables: {
          hotelId,
          input: {
            page: 1,
            limit: ROOM_PAGE_SIZE,
            sort: "createdAt",
            direction: -1,
          },
        },
        fetchPolicy: "no-cache",
      });

      initialRooms = roomsResult.data?.getRoomsByHotel.list ?? [];
    } catch {
      initialRooms = [];
    }

    return {
      props: {
        initialHotel: serverHotel,
        initialRooms,
      },
    };
  } catch (error) {
    console.error("[hotel-detail][ssr] failed to load hotel", hotelId, error);
    return {
      props: {
        initialHotel: null,
        initialRooms: [],
      },
    };
  }
};
