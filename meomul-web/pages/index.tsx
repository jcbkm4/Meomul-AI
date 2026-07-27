import { useQuery } from "@apollo/client/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { EditorialGuidesSection } from "@/components/homepage/editorial-guides-section";
import { HeroSection } from "@/components/homepage/hero-section";
import { LastMinuteDealsSection } from "@/components/homepage/last-minute-deals-section";
import { RecentlyViewedSection } from "@/components/homepage/recently-viewed-section";
import { RecommendedSection } from "@/components/homepage/recommended-section";
import { SubscriptionPlansSection } from "@/components/homepage/subscription-plans-section";
import { TestimonialsSection } from "@/components/homepage/testimonials-section";
import { TrendingSection } from "@/components/homepage/trending-section";
import { ValuePillarsSection } from "@/components/homepage/value-pillars-section";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  GET_HOME_FEED_QUERY,
  GET_RECOMMENDED_HOTELS_V2_QUERY,
} from "@/graphql/hotel.gql";
import { createApolloClient } from "@/lib/apollo/client";
import { getSessionMember } from "@/lib/auth/session";
import type { TranslationKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/provider";
import { env } from "@/lib/config/env";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type {
  GetHomeFeedQueryData,
  GetHomeFeedQueryVars,
  GetRecommendedHotelsV2QueryData,
  GetRecommendedHotelsV2QueryVars,
  HotelListItem,
  HotelLocation,
  RecommendationExplanationDto,
} from "@/types/hotel";
import type {
  EditorialGuideCard,
  HomePageProps,
  HeroSlide,
  RecommendedCard,
  ValuePillar,
} from "@/types/homepage";
import styles from "@/styles/home-landing-ovastin.module.css";

// ─── Constants ─────────────────────────────────────────────────────────────────

const HERO_LIMIT = 5;
const RECOMMENDED_GRID_LIMIT = 6;
const TRENDING_RAIL_LIMIT = 10;
const TESTIMONIAL_LIMIT = 6;
const LAST_MINUTE_DEALS_LIMIT = 8;
const REVIEW_LIMIT = 5;

// ─── Utilities ─────────────────────────────────────────────────────────────────

const createFallbackSlide = (index: number, title: string): HeroSlide => ({
  _id: `fallback-${index}`,
  title,
  location: "SEOUL",
  hotelType: "HOTEL",
  rating: 4.8,
  likes: 0,
  imageUrl: "",
});

const toHeroSlides = (hotels: HotelListItem[], fallbackTitle: string): HeroSlide[] => {
  const slides = hotels.slice(0, HERO_LIMIT).map((hotel) => ({
    _id: hotel._id,
    title: hotel.hotelTitle,
    location: hotel.hotelLocation,
    hotelType: hotel.hotelType,
    rating: Number.isFinite(hotel.hotelRating) ? hotel.hotelRating : 0,
    likes: Number.isFinite(hotel.hotelLikes) ? hotel.hotelLikes : 0,
    imageUrl: resolveMediaUrl(hotel.hotelImages[0]),
  }));
  if (slides.length >= HERO_LIMIT) return slides;
  const fallbacks = Array.from({ length: HERO_LIMIT - slides.length }, (_, i) =>
    createFallbackSlide(i, fallbackTitle),
  );
  return [...slides, ...fallbacks];
};

const uniqueHotelsById = (hotels: HotelListItem[]): HotelListItem[] => {
  const seen = new Set<string>();
  return hotels.filter((hotel) => {
    if (seen.has(hotel._id)) return false;
    seen.add(hotel._id);
    return true;
  });
};

const pickRecommendationSignal = (
  explanation: RecommendationExplanationDto,
  translate: (
    key: TranslationKey,
    params?: Record<string, string | number>,
  ) => string,
): string => {
  const genericRecommendationSignals = new Set<string>([
    translate("home_signal_saved_preferences"),
    translate("home_signal_core_preferences"),
    translate("home_signal_recent_browsing"),
    translate("home_signal_aligned_fallback"),
    translate("home_signal_popular_now"),
    translate("home_signal_activity_engagement"),
  ]);
  const specific = explanation.signals.find(
    (s) => !genericRecommendationSignals.has(s),
  );
  if (specific) return specific;
  if (explanation.likedSimilar) return translate("home_signal_liked_similar");
  if (explanation.matchedLocation) return translate("home_signal_matched_location");
  if (explanation.matchedPurposes.length > 0)
    return translate("home_signal_matched_purpose", {
      purposes: explanation.matchedPurposes.slice(0, 2).join(", "),
    });
  if (explanation.matchedType) return translate("home_signal_matched_type");
  if (explanation.matchedPrice) return translate("home_signal_matched_price");
  return explanation.signals[0] ?? translate("home_signal_fallback_quality");
};

const toIsoLocalDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (value: Date, amount: number): Date => {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
};

const getNextWeekendRange = (today: Date) => {
  const day = today.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const checkIn = addDays(today, daysUntilSaturday);
  return { checkIn: toIsoLocalDate(checkIn), checkOut: toIsoLocalDate(addDays(checkIn, 2)) };
};

const getNextBusinessRange = (today: Date) => {
  const day = today.getDay();
  const daysUntilMonday = ((8 - day) % 7) || 7;
  const checkIn = addDays(today, daysUntilMonday);
  return { checkIn: toIsoLocalDate(checkIn), checkOut: toIsoLocalDate(addDays(checkIn, 3)) };
};

const buildHotelsFilteredHref = (input: Record<string, string | undefined>): string => {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `/hotels?${query}` : "/hotels";
};

const formatReviewCountLabel = (
  count: number,
  locale: string,
  translate: (
    key: TranslationKey,
    params?: Record<string, string | number>,
  ) => string,
): string => {
  if (!Number.isFinite(count) || count <= 0) {
    return translate("home_common_no_reviews");
  }
  if (count >= 1000) {
    return translate("home_common_verified_reviews", {
      count: `${(count / 1000).toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}k`,
    });
  }
  return translate("home_common_verified_reviews", {
    count: count.toLocaleString(locale),
  });
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage({
  initialTopHotels,
  initialHotelInventoryTotal,
  initialTotalVerifiedReviews,
  initialTrendingHotels,
  initialFeaturedReviews,
  initialFeaturedRatingsSummary,
  initialTestimonials,
  initialLastMinuteDeals,
  initialRecommendationResult,
  serverTodayIso,
  initialLoadError,
}: HomePageProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [hasSession, setHasSession] = useState(Boolean(initialRecommendationResult));
  const [hasHydrated, setHasHydrated] = useState(false);
  const showRecommendationDebug = router.query.debugRec === "1";

  const { data: recommendedData, loading: recommendedLoading } = useQuery<
    GetRecommendedHotelsV2QueryData,
    GetRecommendedHotelsV2QueryVars
  >(GET_RECOMMENDED_HOTELS_V2_QUERY, {
    variables: { limit: RECOMMENDED_GRID_LIMIT },
    skip: !hasSession,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    setHasSession(Boolean(getSessionMember()));
    setHasHydrated(true);
  }, []);

  const effectiveRecommendationResult = useMemo(() => {
    if (!hasSession) {
      return null;
    }

    if (!hasHydrated) {
      return initialRecommendationResult;
    }

    return recommendedData?.getRecommendedHotelsV2 ?? initialRecommendationResult;
  }, [
    hasHydrated,
    hasSession,
    initialRecommendationResult,
    recommendedData?.getRecommendedHotelsV2,
  ]);

  // ─── Derived data ────────────────────────────────────────────────────────────

  const heroSlides = useMemo(
    () => toHeroSlides(initialTopHotels, t("home_fallback_slide_title")),
    [initialTopHotels, t],
  );

  const recommendationSignals = useMemo(() => {
    const map = new Map<string, string>();
    const explanations = effectiveRecommendationResult?.explanations ?? [];
    explanations.forEach((exp) => {
      const signal = pickRecommendationSignal(exp, t);
      if (signal) map.set(exp.hotelId, signal);
    });
    return map;
  }, [
    effectiveRecommendationResult?.explanations,
    t,
  ]);

  const recommendedCards = useMemo<RecommendedCard[]>(() => {
    const personalized = effectiveRecommendationResult?.list ?? [];
    const merged = uniqueHotelsById(
      personalized.length > 0
        ? personalized
        : [...initialTrendingHotels, ...initialTopHotels],
    ).slice(0, RECOMMENDED_GRID_LIMIT);
    return merged.map((hotel) => ({
      _id: hotel._id,
      title: hotel.hotelTitle,
      location: hotel.hotelLocation,
      hotelType: hotel.hotelType,
      rating: hotel.hotelRating ?? 0,
      likes: hotel.hotelLikes ?? 0,
      imageUrl: resolveMediaUrl(hotel.hotelImages[0]),
      signal:
        recommendationSignals.get(hotel._id) ??
        t("home_signal_fallback_quality"),
    }));
  }, [
    effectiveRecommendationResult?.list,
    initialTopHotels,
    initialTrendingHotels,
    recommendationSignals,
    t,
  ]);

  const recommendedRows = useMemo(
    () =>
      [recommendedCards.slice(0, 3), recommendedCards.slice(3, 6)].filter((r) => r.length > 0),
    [recommendedCards],
  );

  const recommendationDebugInfo = useMemo(() => {
    if (process.env.NODE_ENV === "production" || !hasSession || !showRecommendationDebug) {
      return null;
    }

    const liveResult = hasHydrated ? recommendedData?.getRecommendedHotelsV2 : null;
    const initialResult = initialRecommendationResult;
    const effectiveResult = effectiveRecommendationResult;

    return {
      source: !hasHydrated
        ? initialResult
          ? "ssr"
          : "none"
        : liveResult
          ? "client"
          : initialResult
            ? "ssr"
            : "none",
      listCount: effectiveResult?.list.length ?? 0,
      profileSource: effectiveResult?.meta.profileSource ?? null,
      strictCount: effectiveResult?.meta.strictStageCount ?? 0,
      relaxedCount: effectiveResult?.meta.relaxedStageCount ?? 0,
      generalCount: effectiveResult?.meta.generalStageCount ?? 0,
      fallbackCount: effectiveResult?.meta.fallbackCount ?? 0,
      matchedLocationCount: effectiveResult?.meta.matchedLocationCount ?? 0,
    };
  }, [
    hasHydrated,
    hasSession,
    effectiveRecommendationResult,
    initialRecommendationResult,
    recommendedData?.getRecommendedHotelsV2,
    showRecommendationDebug,
  ]);

  const trendingHotels = useMemo(() => {
    return uniqueHotelsById([...initialTrendingHotels, ...initialTopHotels]).slice(
      0,
      TRENDING_RAIL_LIMIT,
    );
  }, [
    initialTopHotels,
    initialTrendingHotels,
  ]);

  const valuePillars = useMemo<ValuePillar[]>(() => {
    const averageRating =
      initialTopHotels.length > 0
        ? initialTopHotels.reduce((sum, h) => sum + (h.hotelRating ?? 0), 0) /
          initialTopHotels.length
        : 0;
    const trendingLikes = trendingHotels.reduce((sum, h) => sum + (h.hotelLikes ?? 0), 0);
    const reviewCount = Math.max(
      0,
      Number.isFinite(initialTotalVerifiedReviews)
        ? initialTotalVerifiedReviews
        : 0,
    );
    const meta = effectiveRecommendationResult?.meta;
    const personalizationDetail = hasSession
      ? meta
        ? t("home_value_personal_detail_meta", {
            locations: meta.matchedLocationCount,
            strict: meta.strictStageCount + meta.relaxedStageCount,
          })
        : t("home_value_personal_detail_active")
      : t("home_value_personal_detail_signed_out");

    return [
      {
        title: t("home_value_destination_title"),
        metric:
          initialHotelInventoryTotal > 0
            ? t("hotels_count_hotels", {
                count: initialHotelInventoryTotal.toLocaleString(locale),
                suffix: initialHotelInventoryTotal === 1 ? "" : "s",
              })
            : t("home_value_destination_metric_fallback"),
        detail: t("home_value_destination_detail"),
      },
      {
        title: t("home_value_trust_title"),
        metric:
          reviewCount > 0
            ? formatReviewCountLabel(reviewCount, locale, t)
            : t("home_value_trust_metric_fallback"),
        detail: t("home_value_trust_detail"),
      },
      {
        title: t("home_value_demand_title"),
        metric:
          trendingLikes > 0
            ? t("home_value_demand_metric_count", {
                count: trendingLikes.toLocaleString(locale),
              })
            : t("home_value_demand_metric_fallback"),
        detail:
          averageRating > 0
            ? t("home_value_demand_detail_with_rating", {
                rating: averageRating.toFixed(1),
              })
            : t("home_value_demand_detail_fallback"),
      },
      {
        title: t("home_value_personal_title"),
        metric: hasSession
          ? t("home_value_personal_metric_signed_in")
          : t("home_value_personal_metric_signed_out"),
        detail: personalizationDetail,
      },
    ];
  }, [
    effectiveRecommendationResult?.meta,
    hasSession,
    initialFeaturedReviews.length,
    initialFeaturedRatingsSummary,
    initialHotelInventoryTotal,
    initialTotalVerifiedReviews,
    initialTopHotels,
    locale,
    t,
    trendingHotels,
  ]);

  const editorialGuideCards = useMemo<EditorialGuideCard[]>(() => {
    const baseDate = new Date(`${serverTodayIso}T00:00:00`);
    const weekendRange = getNextWeekendRange(baseDate);
    const businessRange = getNextBusinessRange(baseDate);
    const imageCandidates = uniqueHotelsById([...initialTopHotels, ...trendingHotels]);

    const pickImage = (location: HotelLocation, fallbackIndex: number): string => {
      const match = imageCandidates.find(
        (h) => h.hotelLocation === location && h.hotelImages[0],
      );
      if (match?.hotelImages[0]) return resolveMediaUrl(match.hotelImages[0]);
      return heroSlides[fallbackIndex % Math.max(1, heroSlides.length)]?.imageUrl ?? "";
    };

    const guides: Omit<EditorialGuideCard, "href" | "imageUrl">[] = [
      {
        id: "guide-jeju-weekend",
        eyebrow: t("home_guide_jeju_eyebrow"),
        title: t("home_guide_jeju_title"),
        description: t("home_guide_jeju_desc"),
        location: "JEJU",
        purpose: "STAYCATION",
        checkIn: weekendRange.checkIn,
        checkOut: weekendRange.checkOut,
        guests: "2",
        types: "RESORT,PENSION",
      },
      {
        id: "guide-seoul-business",
        eyebrow: t("home_guide_seoul_eyebrow"),
        title: t("home_guide_seoul_title"),
        description: t("home_guide_seoul_desc"),
        location: "SEOUL",
        purpose: "BUSINESS",
        checkIn: businessRange.checkIn,
        checkOut: businessRange.checkOut,
        guests: "1",
        types: "HOTEL",
      },
      {
        id: "guide-busan-romantic",
        eyebrow: t("home_guide_busan_eyebrow"),
        title: t("home_guide_busan_title"),
        description: t("home_guide_busan_desc"),
        location: "BUSAN",
        purpose: "ROMANTIC",
        checkIn: weekendRange.checkIn,
        checkOut: weekendRange.checkOut,
        guests: "2",
        types: "HOTEL,RESORT",
      },
      {
        id: "guide-gangneung-family",
        eyebrow: t("home_guide_gangneung_eyebrow"),
        title: t("home_guide_gangneung_title"),
        description: t("home_guide_gangneung_desc"),
        location: "GANGNEUNG",
        purpose: "FAMILY",
        checkIn: weekendRange.checkIn,
        checkOut: weekendRange.checkOut,
        guests: "4",
        types: "RESORT,PENSION,HOTEL",
      },
    ];

    return guides.map((guide, index) => ({
      ...guide,
      href: buildHotelsFilteredHref({
        location: guide.location,
        purpose: guide.purpose,
        checkIn: guide.checkIn,
        checkOut: guide.checkOut,
        guests: guide.guests,
        types: guide.types,
        sort: "RECOMMENDED",
      }),
      imageUrl: pickImage(guide.location, index),
    }));
  }, [heroSlides, initialTopHotels, serverTodayIso, t, trendingHotels]);

  // ─── SEO ─────────────────────────────────────────────────────────────────────

  const canonicalBaseUrl = env.siteUrl.replace(/\/+$/, "");
  const canonicalUrl = `${canonicalBaseUrl}/`;
  const metaTitle = hasSession
    ? t("home_meta_title_signed_in")
    : t("home_meta_title");
  const metaDescription = t("home_meta_desc");
  const ogImageUrl = `${canonicalBaseUrl}/og-default.png`;
  const ogImageAlt = "Meomul brand card for curated hotel stays across South Korea";
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Meomul",
    url: canonicalUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${canonicalBaseUrl}/hotels?text={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Meomul" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:alt" content={ogImageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content={ogImageAlt} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData) }}
        />
      </Head>

      <main className={styles.page}>
        <div className={styles.shell}>
          {initialLoadError && <ErrorNotice message={t("home_error_load")} />}

          <HeroSection
            slides={heroSlides}
            featuredReviews={initialFeaturedReviews}
            ratingsSummary={initialFeaturedRatingsSummary}
            totalVerifiedReviews={initialTotalVerifiedReviews}
          />

          <RecentlyViewedSection />

          <RecommendedSection
            cards={recommendedCards}
            rows={recommendedRows}
            isPersonalizing={hasSession && recommendedLoading}
            debugInfo={recommendationDebugInfo}
          />

          <TrendingSection hotels={trendingHotels} />

          <ValuePillarsSection pillars={valuePillars} />

          <LastMinuteDealsSection deals={initialLastMinuteDeals} />

          <TestimonialsSection
            testimonials={initialTestimonials}
            totalVerifiedReviews={initialTotalVerifiedReviews}
          />

          <SubscriptionPlansSection />

          <EditorialGuidesSection cards={editorialGuideCards} />
        </div>
      </main>
    </>
  );
}

// ─── Server-side data ─────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  if (context.res) {
    context.res.setHeader(
      "Cache-Control",
      process.env.NODE_ENV === "production"
        ? "public, s-maxage=60, stale-while-revalidate=300"
        : "no-store",
    );
  }

  const cookie = context.req?.headers.cookie;
  const client = createApolloClient(cookie ? { headers: { cookie } } : undefined);
  const fallbackToday = new Date();
  const serverTodayIso = `${fallbackToday.getFullYear()}-${`${fallbackToday.getMonth() + 1}`.padStart(2, "0")}-${`${fallbackToday.getDate()}`.padStart(2, "0")}`;

  try {
    const result = await client.query<GetHomeFeedQueryData, GetHomeFeedQueryVars>({
      query: GET_HOME_FEED_QUERY,
      variables: {
        input: {
          heroLimit: HERO_LIMIT,
          trendingLimit: TRENDING_RAIL_LIMIT,
          dealsLimit: LAST_MINUTE_DEALS_LIMIT,
          testimonialsLimit: TESTIMONIAL_LIMIT,
          featuredReviewLimit: REVIEW_LIMIT,
          recommendationLimit: RECOMMENDED_GRID_LIMIT,
        },
      },
      fetchPolicy: "no-cache",
    });

    const feed = result.data?.getHomeFeed;

    return {
      props: {
        initialTopHotels: feed?.topHotels ?? [],
        initialHotelInventoryTotal: feed?.hotelInventoryTotal ?? 0,
        initialTotalVerifiedReviews: feed?.totalVerifiedReviews ?? 0,
        initialTrendingHotels: feed?.trendingHotels ?? [],
        initialFeaturedReviews: feed?.featuredReviews ?? [],
        initialFeaturedRatingsSummary: feed?.featuredRatingsSummary ?? null,
        initialTestimonials:
          feed?.testimonials.map((entry) => ({
            hotelId: entry.hotelId,
            hotelTitle: entry.hotelTitle,
            review: entry.review,
          })) ?? [],
        initialLastMinuteDeals:
          feed?.lastMinuteDeals.map((deal) => ({
            ...deal,
            imageUrl: resolveMediaUrl(deal.imageUrl),
            validUntil: String(deal.validUntil),
          })) ?? [],
        initialRecommendationResult: feed?.recommendationResult ?? null,
        serverTodayIso,
        initialLoadError: null,
      },
    };
  } catch {
    return {
      props: {
        initialTopHotels: [],
        initialHotelInventoryTotal: 0,
        initialTotalVerifiedReviews: 0,
        initialTrendingHotels: [],
        initialFeaturedReviews: [],
        initialFeaturedRatingsSummary: null,
        initialTestimonials: [],
        initialLastMinuteDeals: [],
        initialRecommendationResult: null,
        serverTodayIso,
        initialLoadError: "Failed to load homepage data right now.",
      },
    };
  }
};
