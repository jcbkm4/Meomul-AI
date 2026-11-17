import { getImageProps } from "next/image";

/** Hosts the image optimizer may fetch (mirrors images.remotePatterns in next.config.mjs). */
const OPTIMIZABLE_HOSTS = [/(^|\.)meomul\.dev$/i, /^images\.unsplash\.com$/i, /^plus\.unsplash\.com$/i, /^images\.pexels\.com$/i, /^i\.pravatar\.cc$/i];

const canOptimize = (src: string): boolean => {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZABLE_HOSTS.some((host) => host.test(url.hostname));
  } catch {
    return false;
  }
};

/**
 * A plain <img> that keeps its own CSS (class-based layouts on the home page) but loads a
 * resized WebP through the Next image optimizer instead of the full-size original.
 * `sizes` must describe the rendered width so the browser picks the right file.
 */
export function OptimizedImg({
  src,
  alt,
  sizes,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  eager?: boolean;
}) {
  if (!src) return null;
  if (!canOptimize(src)) {
    // eslint-disable-next-line @next/next/no-img-element -- host the optimizer may not fetch
    return <img src={src} alt={alt} className={className} loading={eager ? "eager" : "lazy"} decoding="async" />;
  }
  const { props } = getImageProps({ src, alt, fill: true, sizes, quality: 75, loading: eager ? "eager" : "lazy" });
  // getImageProps adds absolute positioning for `fill`; these images are laid out by their class.
  const { style: _style, ...imgProps } = props;
  void _style;
  // eslint-disable-next-line @next/next/no-img-element -- src/srcSet come from getImageProps (optimized)
  return <img {...imgProps} alt={alt} className={className} decoding="async" />;
}
