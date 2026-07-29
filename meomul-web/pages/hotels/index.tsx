import { useApolloClient, useQuery } from "@apollo/client/react";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { AskMeomulDrawer } from "@/components/concierge/ask-meomul-drawer";
import { HotelsActiveFilterChips } from "@/components/hotels/hotels-active-filter-chips";
import { HotelsDiscoveryToolbar } from "@/components/hotels/hotels-discovery-toolbar";
import { HotelsResultsSkeleton } from "@/components/hotels/hotels-results-skeleton";
import { HotelCard } from "@/components/hotels/hotel-card";
import { ErrorNotice } from "@/components/ui/error-notice";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GET_HOTELS_QUERY } from "@/graphql/hotel.gql";
import { GET_MY_LIKES_QUERY } from "@/graphql/like.gql";
import { createApolloClient } from "@/lib/apollo/client";
import { getAccessToken, getSessionMember } from "@/lib/auth/session";
import { HOTELS_PAGE_SIZE } from "@/lib/hotels/hotels-filter-config";
import { useHotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import { useI18n } from "@/lib/i18n/provider";
import { formatHotelsPaginationSummaryLocalized } from "@/lib/hotels/hotels-i18n";
import { getErrorMessage } from "@/lib/utils/error";
import type {
  GetMyLikesQueryData,
  GetMyLikesQueryVars,
  GetHotelsQueryData,
  GetHotelsQueryVars,
  HotelListItem,
} from "@/types/hotel";
import { LocalizedSeo } from "@/components/seo/localized-seo";

const HotelsFiltersDrawer = dynamic(
  () =>
    import("@/components/hotels/hotels-filters-drawer").then(
      (mod) => mod.HotelsFiltersDrawer,
    ),
  { ssr: false },
);

const HOTELS_MOTION_INTENSITY_CLASS = "motion-intensity-balanced";

interface HotelsPageProps {
  initialHotels: HotelListItem[];
  initialTotal: number;
}

export default function HotelsPage({
  initialHotels,
  initialTotal,
}: HotelsPageProps) {
  const { t } = useI18n();
  const apolloClient = useApolloClient();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [displayedHotels, setDisplayedHotels] =
    useState<HotelListItem[]>(initialHotels);
  const [displayedTotal, setDisplayedTotal] = useState(initialTotal);
  const queryState = useHotelsPageQueryState();
  const hasSession = Boolean(getSessionMember() || getAccessToken());

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { data, loading, error } = useQuery<
    GetHotelsQueryData,
    GetHotelsQueryVars
  >(GET_HOTELS_QUERY, {
    variables: {
      input: {
        page: queryState.page,
        limit: HOTELS_PAGE_SIZE,
        sort: queryState.sortField,
        direction: queryState.sortDirection,
      },
      search: queryState.search,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const { data: myLikesData } = useQuery<
    GetMyLikesQueryData,
    GetMyLikesQueryVars
  >(GET_MY_LIKES_QUERY, {
    skip: !hasSession,
    variables: {
      likeGroup: "HOTEL",
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  useEffect(() => {
    setDisplayedHotels(initialHotels);
    setDisplayedTotal(initialTotal);
  }, [initialHotels, initialTotal]);

  useEffect(() => {
    const nextHotels = data?.getHotels;
    if (nextHotels) {
      setDisplayedHotels(nextHotels.list);
      setDisplayedTotal(nextHotels.metaCounter?.total ?? 0);
    }
  }, [data]);

  const hotels = displayedHotels;
  const total = displayedTotal;
  const likedHotelIds = useMemo(
    () => new Set((myLikesData?.getMyLikes ?? []).map((like) => like.likeRefId)),
    [myLikesData],
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / HOTELS_PAGE_SIZE)),
    [total],
  );

  const hasServerData = initialHotels.length > 0;
  const showInitialSkeleton =
    !isHydrated || (loading && hotels.length === 0 && !hasServerData);
  const showEmptyState = isHydrated && !loading && hotels.length === 0;
  const showResults = isHydrated && hotels.length > 0;
  const showResultsOverlay = isHydrated && loading && hotels.length > 0;

  useEffect(() => {
    if (!isHydrated || loading) {
      return;
    }

    const nextPage = queryState.page + 1;
    if (nextPage > totalPages) {
      return;
    }

    void apolloClient.query<GetHotelsQueryData, GetHotelsQueryVars>({
      query: GET_HOTELS_QUERY,
      variables: {
        input: {
          page: nextPage,
          limit: HOTELS_PAGE_SIZE,
          sort: queryState.sortField,
          direction: queryState.sortDirection,
        },
        search: queryState.search,
      },
      fetchPolicy: "cache-first",
    });
  }, [
    apolloClient,
    isHydrated,
    loading,
    queryState.page,
    queryState.search,
    queryState.sortDirection,
    queryState.sortField,
    totalPages,
  ]);

  return (
    <>
      <LocalizedSeo path="/hotels" withCanonical />
      <Head>
        <title>{t("hotels_meta_title")}</title>
        <meta
          name="description"
          content={t("hotels_meta_desc")}
        />
      </Head>

      <HotelsFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => {
          setIsFiltersOpen(false);
        }}
        state={queryState}
        appliedTotal={total}
      />

      <AskMeomulDrawer
        isOpen={isConciergeOpen}
        onClose={() => {
          setIsConciergeOpen(false);
        }}
      />

      <main className={`space-y-2.5 sm:space-y-4 ${HOTELS_MOTION_INTENSITY_CLASS}`}>
        <ScrollReveal delayMs={20} className="relative z-50">
          <HotelsDiscoveryToolbar
            state={queryState}
            total={total}
            loading={loading}
            onOpenFilters={() => {
              setIsFiltersOpen(true);
            }}
          />
        </ScrollReveal>

        <ScrollReveal delayMs={22}>
          <section className="overflow-hidden rounded-[1.4rem] border border-teal-100 bg-[#123b3a] shadow-[0_24px_80px_-54px_rgba(15,23,42,0.55)] sm:rounded-[1.8rem]">
            <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-50">
                  <Sparkles size={14} />
                  Ask Meomul
                </div>
                <h2 className="mt-2 font-display text-xl font-black tracking-tight text-white sm:text-2xl">
                  Describe the stay. Get matched options with tradeoffs.
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-teal-50/75">
                  The concierge checks active hotels, room fit, budget, trust signals, and price timing before explaining the best choices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsConciergeOpen(true);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#123b3a] shadow-sm transition hover:bg-teal-50"
              >
                <Sparkles size={17} />
                Open concierge
              </button>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delayMs={25}>
          <HotelsActiveFilterChips state={queryState} />
        </ScrollReveal>

        {error ? <ErrorNotice message={getErrorMessage(error)} /> : null}

        {showInitialSkeleton ? <HotelsResultsSkeleton /> : null}

        {showEmptyState ? (
          <div className="hover-lift rounded-[1.4rem] border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)] sm:rounded-[1.8rem] sm:px-5 sm:py-7">
            {t("hotels_empty")}
          </div>
        ) : null}

        {showResults ? (
          <>
            <ScrollReveal delayMs={40}>
              <div className="relative">
                <div
                  className={`grid gap-x-3 gap-y-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-4 sm:gap-y-5 transition duration-200 ${showResultsOverlay ? "opacity-75" : "opacity-100"}`}
                >
                  {hotels.map((hotel, index) => (
                    <HotelCard
                      key={hotel._id}
                      hotel={hotel}
                      isInitiallyLiked={likedHotelIds.has(hotel._id)}
                      imagePriority={index === 0}
                      imageSizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw"
                    />
                  ))}
                </div>

                {showResultsOverlay ? (
                  <div className="pointer-events-none absolute inset-0 flex items-start justify-center rounded-[1.4rem] bg-white/28 p-2.5 backdrop-blur-[1.5px] sm:rounded-[1.8rem] sm:p-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm sm:px-3 sm:text-xs sm:tracking-[0.14em]">
                      <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500" />
                      {t("hotels_refreshing")}
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={50}>
              <div className="hover-lift rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3.5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)] sm:rounded-[1.8rem] sm:px-5 sm:py-4">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    {formatHotelsPaginationSummaryLocalized(
                      queryState.page,
                      totalPages,
                      total,
                      t,
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      disabled={queryState.page <= 1}
                      onClick={() => {
                        queryState.patchQuery(
                          { page: String(Math.max(1, queryState.page - 1)) },
                          false,
                        );
                      }}
                      className="min-h-10 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0"
                    >
                      {t("hotels_prev")}
                    </button>
                    <button
                      type="button"
                      disabled={queryState.page >= totalPages}
                      onClick={() => {
                        queryState.patchQuery(
                          {
                            page: String(
                              Math.min(totalPages, queryState.page + 1),
                            ),
                          },
                          false,
                        );
                      }}
                      className="min-h-10 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0"
                    >
                      {t("hotels_next")}
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </>
        ) : null}
      </main>
    </>
  );
}

// ─── Server-side data ─────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<HotelsPageProps> = async (
  context,
) => {
  if (context.res) {
    context.res.setHeader(
      "Cache-Control",
      process.env.NODE_ENV === "production"
        ? "public, s-maxage=30, stale-while-revalidate=120"
        : "no-store",
    );
  }

  const client = createApolloClient();

  try {
    const result = await client.query<GetHotelsQueryData, GetHotelsQueryVars>({
      query: GET_HOTELS_QUERY,
      variables: {
        input: {
          page: 1,
          limit: HOTELS_PAGE_SIZE,
          sort: "hotelRank",
          direction: -1,
        },
      },
      fetchPolicy: "no-cache",
    });

    const hotelsData = result.data?.getHotels;

    return {
      props: {
        initialHotels: hotelsData?.list ?? [],
        initialTotal: hotelsData?.metaCounter?.total ?? 0,
      },
    };
  } catch {
    return {
      props: {
        initialHotels: [],
        initialTotal: 0,
      },
    };
  }
};
