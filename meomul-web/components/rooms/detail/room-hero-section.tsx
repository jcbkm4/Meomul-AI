import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/router";
import { ArrowLeft, Star, X } from "lucide-react";
import type { DetailIconName } from "@/components/rooms/detail/detail-icon";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/utils/format";
import type { RoomDetailItem } from "@/types/hotel";

export interface RoomHeroHighlight {
  label: string;
  value: string;
  icon: DetailIconName;
}

interface RoomHeroSectionProps {
  coverImage: string;
  galleryImages: string[];
  roomTypeLabel: string;
  viewTypeLabel: string;
  roomNumber?: string | null;
  roomName: string;
  hotelTitle?: string;
  locationLabel: string;
  guestLine: string;
  priceLine?: string;
  basePrice: number;
  deal?: RoomDetailItem["lastMinuteDeal"];
  backHref?: string;
}

export const RoomHeroSection = memo(function RoomHeroSection({
  coverImage,
  galleryImages,
  roomTypeLabel,
  viewTypeLabel,
  roomNumber,
  roomName,
  hotelTitle,
  locationLabel,
  guestLine,
  priceLine,
  basePrice,
  deal,
  backHref = "/hotels",
}: RoomHeroSectionProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const effectivePrice = deal?.isActive ? deal.dealPrice : basePrice;
  const allImages = useMemo(() => {
    const seen = new Set<string>();
    return [coverImage, ...galleryImages].filter((image) => {
      if (!image || seen.has(image)) {
        return false;
      }
      seen.add(image);
      return true;
    });
  }, [coverImage, galleryImages]);
  const desktopGalleryImages = allImages.slice(0, 5);
  const primaryDesktopImage = desktopGalleryImages[0];
  const secondaryDesktopImages = desktopGalleryImages.slice(1, 5);
  const desktopGalleryCount = desktopGalleryImages.length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isGalleryOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isGalleryOpen]);

  return (
    <section id="overview" className="space-y-5">
      <div className="hidden flex-col gap-4 md:flex lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-stone-600">
            {hotelTitle ? `${hotelTitle} · ${locationLabel}` : locationLabel}
          </p>
          <h1 className="max-w-5xl text-3xl font-semibold tracking-tight text-stone-950 sm:text-[2.45rem]">
            {roomName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-stone-700">
            <span>{guestLine}</span>
            <span>·</span>
            <span>{roomTypeLabel}</span>
            <span>·</span>
            <span>{t("room_detail_view_suffix", { view: viewTypeLabel })}</span>
            {roomNumber ? (
              <>
                <span>·</span>
                <span>{t("room_detail_room_number", { number: roomNumber })}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-right shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {deal?.isActive ? t("room_detail_deal_price") : t("room_detail_nightly_rate")}
          </p>
          <p className="mt-1 text-3xl font-semibold text-stone-950">₩ {formatNumber(effectivePrice)}</p>
          {deal?.isActive ? (
            <p className="text-sm text-stone-500 line-through">₩ {formatNumber(deal.originalPrice)}</p>
          ) : priceLine ? (
            <p className="text-sm text-stone-600">{priceLine}</p>
          ) : null}
        </div>
      </div>

      <div className="md:hidden">
        {coverImage ? (
          <div className="-mx-3 overflow-hidden sm:-mx-6">
            <div className="relative bg-stone-100">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="block w-full text-left"
                aria-label={t("room_detail_show_gallery")}
              >
                <article className="relative min-h-[20rem] overflow-hidden bg-stone-100">
                  <Image
                    src={coverImage}
                    alt={roomName}
                    fill
                    priority
                    sizes="(max-width: 767px) calc(100vw - 1.5rem), 960px"
                    className="object-cover"
                  />
                </article>
              </button>

              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <button
                  type="button"
                  onClick={() => {
                    void router.push(backHref);
                  }}
                  className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-stone-950 shadow-sm"
                  aria-label={t("room_detail_back")}
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <div className="relative z-10 -mt-10 rounded-[2rem] bg-white px-4 pb-4 pt-5 shadow-[0_-6px_24px_-18px_rgba(15,23,42,0.18)]">
              <div className="space-y-3 pb-3 text-center">
                <h1 className="text-[1.85rem] font-semibold leading-tight tracking-tight text-stone-950">{roomName}</h1>
                <div className="space-y-1.5 text-stone-600">
                  <p className="text-base">{hotelTitle ? `${roomTypeLabel} in ${hotelTitle}` : roomTypeLabel}</p>
                  <p className="text-base">{guestLine}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-base font-medium text-stone-900">
                  <Star className="h-4 w-4 shrink-0 fill-current" />
                  <span>₩ {formatNumber(effectivePrice)}</span>
                  <span>·</span>
                  <span>{t("room_detail_view_suffix", { view: viewTypeLabel })}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="-mx-3 rounded-b-[2rem] bg-stone-100 px-6 py-20 text-center text-sm text-stone-600 sm:-mx-6">
            {t("room_detail_no_image")}
          </div>
        )}
      </div>

      {primaryDesktopImage ? (
        <div className="hidden md:block">
          {desktopGalleryCount > 1 ? (
            <div className="grid gap-2 overflow-hidden rounded-[1.75rem] md:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="group relative block min-h-[32rem] overflow-hidden rounded-l-[1.75rem] bg-stone-100 text-left"
                aria-label={t("room_detail_show_gallery")}
              >
                <Image
                  src={primaryDesktopImage}
                  alt={roomName}
                  fill
                  priority
                  sizes="(min-width: 768px) 52vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              </button>

              <div className="grid grid-cols-2 gap-2">
                {secondaryDesktopImages.map((image, index) => {
                  const isLastTile = index === secondaryDesktopImages.length - 1;
                  const shouldSpanFullWidth =
                    desktopGalleryCount === 3 || (desktopGalleryCount === 4 && isLastTile);

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setIsGalleryOpen(true)}
                      className={`group relative overflow-hidden bg-stone-100 text-left ${
                        shouldSpanFullWidth ? "col-span-2 min-h-[15.9rem]" : "min-h-[15.9rem]"
                      } ${index === 1 ? "rounded-tr-[1.75rem]" : ""} ${isLastTile ? "rounded-br-[1.75rem]" : ""}`}
                      aria-label={t("room_detail_show_gallery")}
                    >
                      <Image
                        src={image}
                        alt={`${roomName} ${index + 2}`}
                        fill
                        sizes="(min-width: 768px) 23vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      {isLastTile ? (
                        <span className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-950 shadow-sm transition group-hover:bg-stone-50">
                          {t("hotel_detail_show_all_photos")}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[1.75rem] bg-stone-100">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="group block w-full text-left"
                aria-label={t("room_detail_show_gallery")}
              >
                <article className="relative min-h-[18rem] overflow-hidden bg-stone-100 sm:min-h-[24rem] lg:min-h-[30rem]">
                  <Image
                    src={primaryDesktopImage}
                    alt={roomName}
                    fill
                    priority
                    sizes="(max-width: 767px) calc(100vw - 1.5rem), (max-width: 1023px) calc(100vw - 3rem), 960px"
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </article>
              </button>

              {allImages.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="absolute bottom-6 right-6 z-10 inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-stone-50"
                >
                  {t("hotel_detail_show_all_photos")}
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[1.75rem] bg-stone-100 px-6 py-20 text-center text-sm text-stone-600">
          {t("room_detail_no_image")}
        </div>
      )}

      {isMounted && isGalleryOpen && allImages.length > 0
        ? createPortal(
            <div className="fixed inset-0 z-[140] bg-black/72 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="absolute inset-0 h-full w-full cursor-default"
                aria-label={t("room_detail_close_gallery")}
              />

              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-6">
                <p className="text-sm font-semibold text-white">{roomName}</p>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-950 shadow-sm"
                  aria-label={t("room_detail_close_gallery")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="absolute inset-0 overflow-y-auto px-4 pb-8 pt-20 sm:px-6 sm:pt-24">
                <div className="mx-auto max-w-5xl space-y-4">
                  {allImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)]"
                    >
                      <div className="relative aspect-[16/10] w-full bg-stone-100">
                        <Image
                          src={image}
                          alt={`${roomName} ${index + 1}`}
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
