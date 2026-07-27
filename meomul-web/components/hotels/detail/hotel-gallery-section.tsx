import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils/youtube";

interface HotelGallerySectionProps {
  images: string[];
  videos?: string[];
}

const clampIndex = (index: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }
  if (index < 0) {
    return 0;
  }
  if (index >= total) {
    return total - 1;
  }
  return index;
};

export const HotelGallerySection = memo(function HotelGallerySection({
  images,
  videos = [],
}: HotelGallerySectionProps) {
  const { t } = useI18n();
  const galleryImages = useMemo(
    () => images.map((image) => resolveMediaUrl(image)).filter((image) => image.length > 0),
    [images],
  );
  const galleryVideos = useMemo(
    () =>
      videos
        .map((video) => {
          const youtubeSrc = getYouTubeEmbedUrl(video);
          if (youtubeSrc) {
            return {
              kind: "youtube" as const,
              src: youtubeSrc,
              poster: getYouTubeThumbnailUrl(video),
            };
          }

          const resolved = resolveMediaUrl(video);
          return resolved ? { kind: "video" as const, src: resolved } : null;
        })
        .filter(
          (
            video,
          ): video is
            | { kind: "youtube"; src: string; poster: string }
            | { kind: "video"; src: string } => video !== null,
        ),
    [videos],
  );
  const mediaItems = useMemo(
    () => [
      ...galleryVideos,
      ...galleryImages.map((image) => ({ kind: "image" as const, src: image })),
    ],
    [galleryImages, galleryVideos],
  );
  const totalItems = mediaItems.length;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [playActiveYoutube, setPlayActiveYoutube] = useState(false);

  const activeMedia = totalItems > 0 ? mediaItems[activeImageIndex] : null;
  const selectImage = useCallback(
    (index: number): void => {
      setActiveImageIndex(clampIndex(index, totalItems));
    },
    [totalItems],
  );

  const handlePrev = useCallback((): void => {
    if (totalItems <= 1) {
      return;
    }
    setActiveImageIndex((previous) => (previous - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const handleNext = useCallback((): void => {
    if (totalItems <= 1) {
      return;
    }
    setActiveImageIndex((previous) => (previous + 1) % totalItems);
  }, [totalItems]);

  useEffect(() => {
    setPlayActiveYoutube(false);
  }, [activeImageIndex]);

  const selectMedia = useCallback(
    (index: number): void => {
      setPlayActiveYoutube(false);
      selectImage(index);
    },
    [selectImage],
  );

  return (
    <section id="gallery" className="space-y-4">
      <header className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t("hotel_gallery_eyebrow")}</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[1.75rem] font-semibold text-slate-900 sm:text-3xl">{t("hotel_gallery_title")}</h2>
            <p className="text-sm text-slate-600">{t("hotel_gallery_desc")}</p>
          </div>
        </div>
      </header>

      {totalItems > 0 && activeMedia ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 hover-lift sm:p-4">
          <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
            {activeMedia.kind === "youtube" ? (
              playActiveYoutube ? (
                <iframe
                  src={activeMedia.src}
                  title={`Hotel video ${activeImageIndex + 1}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-56 w-full border-0 sm:h-80 lg:h-[30rem]"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlayActiveYoutube(true)}
                  className="relative block h-56 w-full overflow-hidden bg-slate-900 sm:h-80 lg:h-[30rem]"
                >
                  {activeMedia.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeMedia.poster}
                      alt={`Hotel video ${activeImageIndex + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <span className="absolute inset-0 bg-black/30" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm">
                      <PlayCircle className="h-4 w-4" />
                      Play video
                    </span>
                  </span>
                </button>
              )
            ) : activeMedia.kind === "video" ? (
              <video
                key={activeMedia.src}
                src={activeMedia.src}
                controls
                playsInline
                preload="metadata"
                className="h-56 w-full object-cover sm:h-80 lg:h-[30rem]"
              />
            ) : (
              <Image
                src={activeMedia.src}
                alt={`Hotel scene ${activeImageIndex + 1}`}
                fill
                sizes="100vw"
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

            <div className="absolute right-3 top-3 rounded-full border border-white/30 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white">
              {String(activeImageIndex + 1).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
              <div />
              {totalItems > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="rounded-full border border-white/30 bg-black/45 px-3 py-1 text-xs font-semibold text-white transition hover:bg-black/60"
                  >
                    {t("hotel_gallery_prev")}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-full border border-white/30 bg-black/45 px-3 py-1 text-xs font-semibold text-white transition hover:bg-black/60"
                  >
                    {t("hotel_gallery_next")}
                  </button>
                </div>
              ) : null}
            </div>
          </article>

          <div>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {mediaItems.map((item, index) => (
                <button
                  key={`${item.kind}-${item.src}-thumb-${index}`}
                  type="button"
                    onClick={() => selectMedia(index)}
                  className={`group relative min-w-[5.5rem] overflow-hidden rounded-lg border transition duration-300 hover:-translate-y-0.5 hover:shadow-sm sm:min-w-[6.25rem] ${
                    index === activeImageIndex ? "border-slate-900" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {item.kind === "youtube" ? (
                    <div className="relative h-14 w-full overflow-hidden bg-slate-900 sm:h-16">
                      {item.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.poster}
                          alt={`YouTube thumbnail ${index + 1}`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      ) : null}
                      <span className="absolute left-1 top-1 rounded border border-white/40 bg-black/55 px-1 text-[9px] font-semibold uppercase text-white">
                        Video
                      </span>
                    </div>
                  ) : item.kind === "video" ? (
                    <div className="relative h-14 w-full overflow-hidden bg-slate-900 sm:h-16">
                      <video
                        src={item.src}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute left-1 top-1 rounded border border-white/40 bg-black/55 px-1 text-[9px] font-semibold uppercase text-white">
                        Video
                      </span>
                    </div>
                  ) : (
                    <div className="relative h-14 w-full overflow-hidden sm:h-16">
                      <Image
                        src={item.src}
                        alt={`Scene thumbnail ${index + 1}`}
                        fill
                        sizes="100px"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 rounded border border-white/40 bg-black/50 px-1 text-[9px] font-semibold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          {t("hotel_gallery_empty")}
        </section>
      )}
    </section>
  );
});
