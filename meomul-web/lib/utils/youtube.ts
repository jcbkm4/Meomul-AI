const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function extractYouTubeVideoId(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (!YOUTUBE_HOSTS.has(hostname)) {
      return null;
    }

    if (hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\/+/, "").split("/")[0];
      return id || null;
    }

    if (url.pathname.startsWith("/embed/")) {
      const id = url.pathname.replace("/embed/", "").split("/")[0];
      return id || null;
    }

    const watchId = url.searchParams.get("v");
    if (watchId) {
      return watchId;
    }

    return null;
  } catch {
    return null;
  }
}

export function isYouTubeUrl(value?: string | null): boolean {
  return extractYouTubeVideoId(value) !== null;
}

export function getYouTubeEmbedUrl(value?: string | null): string {
  const videoId = extractYouTubeVideoId(value);
  if (!videoId) {
    return "";
  }

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    playsinline: "1",
    controls: "0",
    rel: "0",
    modestbranding: "1",
    loop: "1",
    playlist: videoId,
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeThumbnailUrl(value?: string | null): string {
  const videoId = extractYouTubeVideoId(value);
  if (!videoId) {
    return "";
  }

  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}
