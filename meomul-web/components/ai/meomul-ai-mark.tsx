/**
 * Meomul's map-pin mark, the face of Meomul AI (instead of a generic sparkle).
 * The pin takes `currentColor`; the "M" and dot take `innerClassName` (a fill-* token class).
 */
export function MeomulAiMark({
  size = 20,
  innerClassName = "fill-harbor",
  className,
}: {
  size?: number;
  innerClassName?: string;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="30 16 68 90" fill="none" aria-hidden="true" className={className}>
      <path
        d="M64 103c17.42-22.56 29.04-39.09 29.04-54.32C93.04 31.8 80.05 19 64 19S34.96 31.8 34.96 48.68C34.96 63.91 46.58 80.44 64 103Z"
        fill="currentColor"
      />
      <path
        d="M46.89 70V40.15h8.55L64 51.16l8.56-11.01h8.55V70h-8.49V55.56l-6.18 7.72h-4.81l-6.18-7.72V70h-8.56Z"
        className={innerClassName}
      />
      <circle cx="64" cy="52.64" r="4.88" className={innerClassName} />
    </svg>
  );
}

/** The mark on a harbor-green disc, used as Meomul AI's avatar. */
export function MeomulAiAvatar({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "size-14" : size === "md" ? "size-9" : "size-7";
  const mark = size === "lg" ? 26 : size === "md" ? 17 : 14;
  return (
    <span className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full bg-harbor`}>
      <MeomulAiMark size={mark} className="text-paper" />
    </span>
  );
}
