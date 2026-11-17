import { env } from "@/lib/config/env";

const PROFILE_FALLBACK_PATHS = new Set([
  "default-avatar",
  "default-avatar.png",
  "/default-avatar.png",
  "uploads/default-avatar.png",
  "/uploads/default-avatar.png",
  "uploads%2fdefault-avatar.png",
  "/uploads%2fdefault-avatar.png",
]);

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, "");

const resolveApiBaseUrl = (): string => {
  const candidates = [env.apiUrl, env.chatSocketUrl, env.graphqlUrl];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const trimmed = trimTrailingSlashes(candidate);
    if (!/^https?:\/\//i.test(trimmed)) continue;
    if (/\/graphql$/i.test(trimmed)) return trimmed.slice(0, -8);
    if (/\/room-viewers$/i.test(trimmed)) return trimmed.slice(0, -13);
    if (/\/chat$/i.test(trimmed)) return trimmed.slice(0, -5);
    return trimmed;
  }

  return "http://localhost:3001";
};

const API_BASE_URL = resolveApiBaseUrl();

/**
 * When the web app proxies /uploads to the API itself (NEXT_PUBLIC_MEDIA_SAME_ORIGIN=1, set by
 * deployments that also set INTERNAL_API_URL), media stays same-origin: the browser asks the
 * site, and the image optimizer reads it over the private network instead of the public API.
 */
const MEDIA_SAME_ORIGIN = process.env.NEXT_PUBLIC_MEDIA_SAME_ORIGIN === "1";
const API_HOSTNAME = (() => {
  try {
    return new URL(API_BASE_URL).hostname.toLowerCase();
  } catch {
    return "";
  }
})();

const toMediaUrl = (pathWithQuery: string): string =>
  MEDIA_SAME_ORIGIN && pathWithQuery.startsWith("/uploads/") ? pathWithQuery : `${API_BASE_URL}${pathWithQuery}`;

export const PROFILE_FALLBACK_IMAGE = toMediaUrl("/uploads/default-avatar.png");

const isLoopbackHostname = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "0.0.0.0" ||
    normalized === "::1"
  );
};

const sanitizeValue = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`;
  }

  try {
    return decodeURIComponent(trimmed).replace(/\\+/g, "/").trim();
  } catch {
    return trimmed.replace(/\\+/g, "/").trim();
  }
};

const normalizePath = (value: string): string => {
  const normalized = value.toLowerCase().split(/[?#]/)[0];
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

const isProfileFallbackValue = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "null" || normalized === "undefined" || normalized === "none") {
    return true;
  }

  if (PROFILE_FALLBACK_PATHS.has(normalized)) {
    return true;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      return PROFILE_FALLBACK_PATHS.has(new URL(normalized).pathname.toLowerCase());
    } catch {
      return false;
    }
  }

  return PROFILE_FALLBACK_PATHS.has(normalizePath(normalized));
};

export const resolveMediaUrl = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const sanitized = sanitizeValue(value);
  if (!sanitized) {
    return "";
  }

  if (isProfileFallbackValue(sanitized)) {
    return PROFILE_FALLBACK_IMAGE;
  }

  if (/^https?:\/\//i.test(sanitized)) {
    try {
      const parsed = new URL(sanitized);
      const pathWithQuery = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      if (isLoopbackHostname(parsed.hostname)) {
        return toMediaUrl(pathWithQuery);
      }
      if (MEDIA_SAME_ORIGIN && parsed.hostname.toLowerCase() === API_HOSTNAME) {
        return toMediaUrl(pathWithQuery);
      }
      return sanitized;
    } catch {
      return sanitized;
    }
  }

  if (sanitized.includes("://")) {
    return PROFILE_FALLBACK_IMAGE;
  }

  const normalizedPath = sanitized.startsWith("/") ? sanitized : `/${sanitized}`;
  return toMediaUrl(normalizedPath);
};

export const resolveProfileImageUrl = (value?: string | null): string => {
  return resolveMediaUrl(value) || PROFILE_FALLBACK_IMAGE;
};

export const resolveImageUrl = resolveMediaUrl;
