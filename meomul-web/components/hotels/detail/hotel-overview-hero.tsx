import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/router";
import { ArrowLeft, Heart, PlayCircle, Share, Star, X } from "lucide-react";
import { getHotelLocationLabelLocalized, getHotelTypeLabel } from "@/lib/hotels/hotels-i18n";
import { useI18n } from "@/lib/i18n/provider";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils/youtube";
import type { HotelDetailItem } from "@/types/hotel";

interface HotelOverviewHeroProps {
  hotel: HotelDetailItem;
  heroImage: string;
  heroVideo?: string;
  secondaryImage: string;
  shortDescription: string;
  reviewCountText: string;
  satisfactionText: string;
  cancellationPolicyText: string;
  hotelLikeCount: number;
  hotelLiked: boolean;
  canToggleLike: boolean;
  togglingLike: boolean;
  onToggleLike: () => void;
  onShare?: () => void;
}

type MediaItem =
  | { kind: "youtube"; src: string }
  | { kind: "video"; src: string }
  | { kind: "image"; src: string };

export const HotelOverviewHero = memo(function HotelOverviewHero({
  hotel,
  heroImage,
  heroVideo,
  reviewCountText,
  hotelLiked,
  canToggleLike,
  togglingLike,
  onToggleLike,
  onShare,
}: HotelOverviewHeroProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [playPrimaryYoutube, setPlayPrimaryYoutube] = useState(false);
  const locationLabel = getHotelLocationLabelLocalized(hotel.hotelLocation, t);
  const hotelTypeLabel = getHotelTypeLabel(hotel.hotelType, t);
  const starLabel =
    typeof hotel.starRating === "number" && hotel.starRating > 0
      ? `${hotel.starRating}-star`
      : null;
  const primaryMedia = useMemo<MediaItem | null>(() => {
    const primaryVideoValue = heroVideo || hotel.hotelVideos[0] || "";
    const primaryYoutube = getYouTubeEmbedUrl(primaryVideoValue);
    const primaryVideo = primaryYoutube ? "" : resolveMediaUrl(primaryVideoValue);
    const primaryImage = resolveMediaUrl(heroImage || hotel.hotelImages[0] || "");

    if (primaryYoutube) {
      return { kind: "youtube", src: primaryYoutube };
    }
    if (primaryVideo) {
      return { kind: "video", src: primaryVideo };
    }
    if (primaryImage) {
      return { kind: "image", src: primaryImage };
    }
    return null;
  }, [heroImage, heroVideo, hotel.hotelImages, hotel.hotelVideos]);
  const primaryYoutubePoster = useMemo(() => {
    if (primaryMedia?.kind !== "youtube") {
      return "";
    }
    return getYouTubeThumbnailUrl(heroVideo || hotel.hotelVideos[0] || "");
  }, [heroVideo, hotel.hotelVideos, primaryMedia]);
  const collageImages = useMemo(() => {
    const seen = new Set<string>();
    const primaryImageSrc = primaryMedia?.kind === "image" ? primaryMedia.src : null;

    return hotel.hotelImages
      .map((image) => resolveMediaUrl(image))
      .filter((image) => {
        if (!image || seen.has(image) || image === primaryImageSrc) {
          return false;
        }
        seen.add(image);
        return true;
      })
      .slice(0, 4);
  }, [hotel.hotelImages, primaryMedia]);
  const allGalleryImages = useMemo(() => {
    const seen = new Set<string>();
    const mediaImages = [
      primaryMedia?.kind === "image" ? primaryMedia.src : null,
      ...hotel.hotelImages.map((image) => resolveMediaUrl(image)),
    ];

    return mediaImages.filter((image): image is string => {
      if (!image || seen.has(image)) {
        return false;
      }
      seen.add(image);
      return true;
    });
  }, [hotel.hotelImages, primaryMedia]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setPlayPrimaryYoutube(false);
  }, [primaryMedia?.kind, primaryMedia?.src]);

  useEffect(() => {
    if (!isGalleryOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsGalleryOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isGalleryOpen]);

  return (
    <section id="overview" className="space-y-5">
      <div className="hidden flex-col gap-4 md:flex lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="max-w-5xl text-3xl font-semibold tracking-tight text-stone-950 sm:text-[2.65rem]">
            {hotel.hotelTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-stone-700">
            <span className="inline-flex items-center gap-1 text-stone-950">
              <Star className="h-4 w-4 fill-current" />
              {(hotel.hotelRating ?? 0).toFixed(2)}
            </span>
            <span className="underline underline-offset-2">{reviewCountText} reviews</span>
            <span>{hotel.detailedLocation?.district || locationLabel}, South Korea</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold text-stone-950">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-stone-100"
          >
            <Share className="h-4 w-4" />
            <span className="underline underline-offset-2">{t("hotel_detail_share")}</span>
          </button>
          <button
            type="button"
            onClick={onToggleLike}
            disabled={!canToggleLike || togglingLike}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart className={`h-4 w-4 ${hotelLiked ? "fill-current text-rose-500" : ""}`} />
            <span className="underline underline-offset-2">
              {hotelLiked ? t("hotel_detail_saved") : t("hotel_detail_save")}
            </span>
          </button>
        </div>
      </div>

      <div className="md:hidden">
        {primaryMedia ? (
          <div className="-mx-3 overflow-hidden sm:-mx-6">
            <div className="relative bg-stone-100">
              <article className="relative min-h-[18rem] overflow-hidden bg-stone-100">
                {primaryMedia.kind === "youtube" ? (
                  playPrimaryYoutube ? (
                    <iframe
                      src={primaryMedia.src}
                      title={hotel.hotelTitle}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayPrimaryYoutube(true)}
                      className="absolute inset-0 block h-full w-full overflow-hidden bg-stone-900"
                      aria-label={t("hotel_detail_show_all_photos")}
                    >
                      {primaryYoutubePoster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={primaryYoutubePoster}
                          alt={hotel.hotelTitle}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                          loading="eager"
                        />
                      ) : null}
                      <span className="absolute inset-0 bg-black/30" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-stone-950 shadow-sm">
                          <PlayCircle className="h-4 w-4" />
                          Play video
                        </span>
                      </span>
                    </button>
                  )
                ) : primaryMedia.kind === "video" ? (
                  <video
                    key={primaryMedia.src}
                    src={primaryMedia.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <Image
                    src={primaryMedia.src}
                    alt={hotel.hotelTitle}
                    fill
                    priority
                    sizes="(max-width: 767px) calc(100vw - 1.5rem), 960px"
                    className="object-cover"
                  />
                )}
              </article>

              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      void router.back();
                      return;
                    }
                    void router.push("/hotels");
                  }}
                  className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-950 shadow-sm"
                  aria-label={t("hotel_detail_back")}
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>
                <div className="pointer-events-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="inline-flex rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-stone-950 shadow-sm"
                  >
                    {t("hotel_detail_show_all_photos")}
                  </button>
                  <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-950 shadow-sm"
                    aria-label={t("hotel_detail_share")}
                  >
                    <Share className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onToggleLike}
                    disabled={!canToggleLike || togglingLike}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-950 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={hotelLiked ? t("hotel_detail_saved") : t("hotel_detail_save")}
                  >
                    <Heart className={`h-4.5 w-4.5 ${hotelLiked ? "fill-current text-rose-500" : ""}`} />
                  </button>
                </div>
              </div>

            </div>

            <div className="relative z-10 -mt-10 rounded-[2rem] bg-white px-4 pb-2 pt-5 shadow-[0_-6px_24px_-18px_rgba(15,23,42,0.18)]">
              <div className="space-y-4 pb-4 text-center">
                <h1 className="text-[1.85rem] font-semibold leading-tight tracking-tight text-stone-950">
                  {hotel.hotelTitle}
                </h1>
                <div className="space-y-1.5 text-stone-600">
                  <p className="text-base">
                    {t("hotel_airbnb_intro_title", {
                      district: hotel.detailedLocation?.district || locationLabel,
                    })}
                  </p>
                  <p className="text-base">
                    {hotelTypeLabel}
                    {starLabel ? ` · ${starLabel}` : ""}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-base font-medium text-stone-900">
                  <Star className="h-4 w-4 shrink-0 fill-current" />
                  <span>{(hotel.hotelRating ?? 0).toFixed(2)}</span>
                  <span>·</span>
                  <span>{reviewCountText} reviews</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="-mx-3 rounded-b-[2rem] bg-stone-100 px-6 py-20 text-center text-sm text-stone-600 sm:-mx-6">
            {t("hotel_gallery_empty")}
          </div>
        )}
      </div>

      {primaryMedia ? (
        <div className="hidden md:block">
          {collageImages.length >= 4 ? (
            <div className="grid gap-2 overflow-hidden rounded-[1.75rem] md:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
              <article className="relative min-h-[32rem] overflow-hidden rounded-l-[1.75rem] bg-stone-100">
                {primaryMedia.kind === "youtube" ? (
                  playPrimaryYoutube ? (
                    <iframe
                      src={primaryMedia.src}
                      title={hotel.hotelTitle}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayPrimaryYoutube(true)}
                      className="absolute inset-0 block h-full w-full overflow-hidden bg-stone-900"
                      aria-label={hotel.hotelTitle}
                    >
                      {primaryYoutubePoster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={primaryYoutubePoster}
                          alt={hotel.hotelTitle}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                          loading="eager"
                        />
                      ) : null}
                      <span className="absolute inset-0 bg-black/30" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-stone-950 shadow-sm">
                          <PlayCircle className="h-4 w-4" />
                          Play video
                        </span>
                      </span>
                    </button>
                  )
                ) : primaryMedia.kind === "video" ? (
                  <video
                    key={primaryMedia.src}
                    src={primaryMedia.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <Image
                    src={primaryMedia.src}
                    alt={hotel.hotelTitle}
                    fill
                    priority
                    sizes="(min-width: 768px) 52vw, 100vw"
                    className="object-cover"
                  />
                )}
              </article>

              <div className="grid grid-cols-2 gap-2">
                {collageImages.map((image, index) => {
                  const isLastTile = index === collageImages.length - 1;
                  return (
                    <div
                      key={`${image}-${index}`}
                      className={`group relative min-h-[15.9rem] overflow-hidden bg-stone-100 ${
                        index === 1 ? "rounded-tr-[1.75rem]" : ""
                      } ${isLastTile ? "rounded-br-[1.75rem]" : ""}`}
                    >
                      <Image
                        src={image}
                        alt={`${hotel.hotelTitle} ${index + 2}`}
                        fill
                        sizes="(min-width: 768px) 23vw, 100vw"
                        className="object-cover"
                      />
                      {isLastTile ? (
                        <button
                          type="button"
                          onClick={() => setIsGalleryOpen(true)}
                          className="absolute bottom-4 right-4 inline-flex items-center rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-stone-50"
                        >
                          {t("hotel_detail_show_all_photos")}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[1.75rem] bg-stone-100">
              <article className="relative min-h-[16rem] overflow-hidden bg-stone-100 sm:min-h-[22rem] lg:min-h-[30rem]">
                {primaryMedia.kind === "youtube" ? (
                  playPrimaryYoutube ? (
                    <iframe
                      src={primaryMedia.src}
                      title={hotel.hotelTitle}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayPrimaryYoutube(true)}
                      className="absolute inset-0 block h-full w-full overflow-hidden bg-stone-900"
                      aria-label={hotel.hotelTitle}
                    >
                      {primaryYoutubePoster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={primaryYoutubePoster}
                          alt={hotel.hotelTitle}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                          loading="eager"
                        />
                      ) : null}
                      <span className="absolute inset-0 bg-black/30" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-stone-950 shadow-sm">
                          <PlayCircle className="h-4 w-4" />
                          Play video
                        </span>
                      </span>
                    </button>
                  )
                ) : primaryMedia.kind === "video" ? (
                  <video
                    key={primaryMedia.src}
                    src={primaryMedia.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <Image
                    src={primaryMedia.src}
                    alt={hotel.hotelTitle}
                    fill
                    priority
                    sizes="(max-width: 767px) calc(100vw - 1.5rem), 960px"
                    className="object-cover"
                  />
                )}
              </article>

              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="absolute bottom-4 right-4 inline-flex items-center rounded-xl border border-stone-900 bg-white px-4 py-3 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-stone-50"
              >
                {t("hotel_detail_show_all_photos")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[1.75rem] bg-stone-100 px-6 py-20 text-center text-sm text-stone-600">
          {t("hotel_gallery_empty")}
        </div>
      )}

      {isMounted && isGalleryOpen && allGalleryImages.length > 0
        ? createPortal(
            <div className="fixed inset-0 z-[140] bg-black/72 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="absolute inset-0 h-full w-full cursor-default"
                aria-label={t("hotel_detail_close_gallery")}
              />

              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-6">
                <p className="text-sm font-semibold text-white">{hotel.hotelTitle}</p>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-950 shadow-sm"
                  aria-label={t("hotel_detail_close_gallery")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="absolute inset-0 overflow-y-auto px-4 pb-8 pt-20 sm:px-6 sm:pt-24">
                <div className="mx-auto max-w-5xl space-y-4">
                  {allGalleryImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)]"
                    >
                      <div className="relative aspect-[16/10] w-full bg-stone-100">
                        <Image
                          src={image}
                          alt={`${hotel.hotelTitle} ${index + 1}`}
                          fill
                          sizes="(min-width: 1024px) 960px, 100vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
});
