import { useMutation } from "@apollo/client/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { TOGGLE_LIKE_MUTATION } from "@/graphql/hotel.gql";
import { getAccessToken, getSessionMember } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import type {
  HotelListItem,
  ToggleLikeMutationData,
  ToggleLikeMutationVars,
} from "@/types/hotel";

export interface HotelCardTrackingContext {
  source: string;
  section: string;
  profileSource?: "onboarding" | "computed";
  onboardingWeight?: number;
  behaviorWeight?: number;
}

interface HotelCardProps {
  hotel: HotelListItem;
  isInitiallyLiked?: boolean;
  trackingContext?: HotelCardTrackingContext;
  imagePriority?: boolean;
  imageSizes?: string;
}

const formatLocationLabel = (location: string): string =>
  location
    ? `${location.toLowerCase().charAt(0).toUpperCase()}${location.toLowerCase().slice(1)}`
    : "Unknown";

const DEFAULT_IMAGE_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw";

export const HotelCard = memo(function HotelCard({
  hotel,
  isInitiallyLiked = false,
  trackingContext,
  imagePriority = false,
  imageSizes = DEFAULT_IMAGE_SIZES,
}: HotelCardProps) {
  const router = useRouter();
  const articleRef = useRef<HTMLElement | null>(null);
  const hasPrefetchedRef = useRef(false);
  const hoverIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [likeState, setLikeState] = useState<{ liked: boolean; count: number } | null>(null);
  const coverImage = resolveMediaUrl(hotel.hotelImages[activeImageIndex] ?? hotel.hotelImages[0]);
  const hotelHref = `/hotels/${hotel._id}`;
  const ratingText = Number.isFinite(hotel.hotelRating) ? hotel.hotelRating.toFixed(1) : "0.0";
  const hasSession = Boolean(getSessionMember() || getAccessToken());
  const locationLabel = formatLocationLabel(hotel.hotelLocation);

  const [toggleLikeMutation, { loading: togglingLike }] = useMutation<
    ToggleLikeMutationData,
    ToggleLikeMutationVars
  >(TOGGLE_LIKE_MUTATION);

  const isLiked = likeState?.liked ?? isInitiallyLiked;
  const savedText = (likeState?.count ?? hotel.hotelLikes).toLocaleString();

  const handlePrefetchIntent = useCallback(() => {
    if (hasPrefetchedRef.current) {
      return;
    }

    hasPrefetchedRef.current = true;
    void router.prefetch(hotelHref);
  }, [hotelHref, router]);

  useEffect(() => {
    if (hasPrefetchedRef.current || !articleRef.current || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hasVisibleEntry = entries.some((entry) => entry.isIntersecting);
        if (!hasVisibleEntry) {
          return;
        }

        handlePrefetchIntent();
        observer.disconnect();
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(articleRef.current);

    return () => {
      observer.disconnect();
    };
  }, [handlePrefetchIntent]);

  useEffect(() => {
    setActiveImageIndex(0);
    setLikeState(null);
  }, [hotel._id]);

  const stopHoverCycle = useCallback(() => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }
    setActiveImageIndex(0);
  }, []);

  const startHoverCycle = useCallback(() => {
    handlePrefetchIntent();
    if (hotel.hotelImages.length <= 1 || hoverIntervalRef.current) {
      return;
    }

    hoverIntervalRef.current = setInterval(() => {
      setActiveImageIndex((previous) => (previous + 1) % hotel.hotelImages.length);
    }, 1100);
  }, [handlePrefetchIntent, hotel.hotelImages.length]);

  useEffect(() => () => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
    }
  }, []);

  const handleToggleSaved = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!hasSession) {
        await router.push({
          pathname: "/auth/login",
          query: { next: router.asPath },
        });
        return;
      }

      try {
        const response = await toggleLikeMutation({
          variables: {
            input: {
              likeGroup: "HOTEL",
              likeRefId: hotel._id,
            },
          },
        });

        const payload = response.data?.toggleLike;
        if (payload) {
          setLikeState({
            liked: payload.liked,
            count: payload.likeCount,
          });
        }
      } catch (error) {
        console.error("Failed to toggle hotel save state:", getErrorMessage(error));
      }
    },
    [hasSession, hotel._id, router, toggleLikeMutation],
  );

  return (
    <article
      ref={articleRef}
      className="group hover-lift rounded-[1.35rem] bg-white transition duration-300"
    >
      <Link
        href={hotelHref}
        prefetch={false}
        className="block h-full focus:outline-none"
        onMouseEnter={startHoverCycle}
        onMouseLeave={stopHoverCycle}
        onFocus={startHoverCycle}
        onBlur={stopHoverCycle}
        onClick={() => {
          if (!trackingContext) {
            return;
          }

          trackAnalyticsEvent("hotel_card_clicked", {
            hotelId: hotel._id,
            hotelLocation: hotel.hotelLocation,
            source: trackingContext.source,
            section: trackingContext.section,
            profileSource: trackingContext.profileSource ?? null,
            onboardingWeight: trackingContext.onboardingWeight ?? null,
            behaviorWeight: trackingContext.behaviorWeight ?? null,
          });
        }}
      >
        <div className="flex gap-2.5 sm:hidden">
          <div className="relative h-24 w-[38%] shrink-0 overflow-hidden rounded-[0.95rem] bg-slate-100">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={hotel.hotelTitle}
                fill
                priority={imagePriority}
                sizes="42vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-100 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500">
                curated stay
              </div>
            )}
            <button
              type="button"
              onClick={handleToggleSaved}
              disabled={togglingLike}
              className={`absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/92 text-slate-700 shadow-sm transition ${togglingLike ? "cursor-wait opacity-70" : "hover:bg-white"}`}
              aria-label={isLiked ? "Remove saved hotel" : "Save hotel"}
            >
              <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className={`h-3.5 w-3.5 ${isLiked ? "text-rose-500" : ""}`} aria-hidden>
                <path d="m12 21-1.45-1.32C5.4 15.02 2 11.92 2 8.12 2 5.02 4.42 3 7.44 3c1.7 0 3.33.79 4.36 2.03C12.83 3.79 14.46 3 16.16 3 19.18 3 21.6 5.02 21.6 8.12c0 3.8-3.4 6.9-8.55 11.57z" />
              </svg>
            </button>
          </div>
          <div className="min-w-0 flex-1 pr-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="line-clamp-2 text-[0.92rem] font-semibold leading-snug text-slate-950">
                  {hotel.hotelTitle}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-500">
                  {locationLabel}, South Korea
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {hotel.hotelType.toLowerCase()}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[11px] font-semibold text-slate-900">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
                  <path d="M12 2l2.95 6.08 6.72.98-4.86 4.67 1.15 6.6L12 17.2l-5.96 3.13 1.15-6.6L2.33 9.06l6.72-.98L12 2z" />
                </svg>
                {ratingText}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="truncate">{savedText} saved</span>
              {hotel.hotelImages.length > 1 ? (
                <div className="mr-0.5 flex shrink-0 items-center gap-1" aria-hidden>
                  {hotel.hotelImages.slice(0, 4).map((_, index) => (
                    <span
                      key={`${hotel._id}-dot-${index}`}
                      className={`h-1.5 w-1.5 rounded-full ${index === activeImageIndex ? "bg-slate-900" : "bg-slate-300"}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.55rem] bg-slate-100">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={hotel.hotelTitle}
                fill
                priority={imagePriority}
                sizes={imageSizes}
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-100 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                curated stay
              </div>
            )}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
                {locationLabel}
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                    <path d="M12 2l2.95 6.08 6.72.98-4.86 4.67 1.15 6.6L12 17.2l-5.96 3.13 1.15-6.6L2.33 9.06l6.72-.98L12 2z" />
                  </svg>
                  {ratingText}
                </span>
                <button
                  type="button"
                  onClick={handleToggleSaved}
                  disabled={togglingLike}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-slate-700 shadow-sm transition ${togglingLike ? "cursor-wait opacity-70" : "hover:bg-white"}`}
                  aria-label={isLiked ? "Remove saved hotel" : "Save hotel"}
                >
                  <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${isLiked ? "text-rose-500" : ""}`} aria-hidden>
                    <path d="m12 21-1.45-1.32C5.4 15.02 2 11.92 2 8.12 2 5.02 4.42 3 7.44 3c1.7 0 3.33.79 4.36 2.03C12.83 3.79 14.46 3 16.16 3 19.18 3 21.6 5.02 21.6 8.12c0 3.8-3.4 6.9-8.55 11.57z" />
                  </svg>
                </button>
              </div>
            </div>
            {hotel.hotelImages.length > 1 ? (
              <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5" aria-hidden>
                {hotel.hotelImages.slice(0, 5).map((_, index) => (
                  <span
                    key={`${hotel._id}-desktop-dot-${index}`}
                    className={`h-1.5 w-1.5 rounded-full ${index === activeImageIndex ? "bg-white" : "bg-white/55"}`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="px-2 pb-1 pt-3 sm:px-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-[1.02rem] font-semibold leading-snug text-slate-950">
                  {hotel.hotelTitle}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {locationLabel}, South Korea
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {hotel.hotelType.toLowerCase()}
                </p>
              </div>
              <span className="whitespace-nowrap text-sm font-medium text-slate-500">
                {savedText} saved
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
});
