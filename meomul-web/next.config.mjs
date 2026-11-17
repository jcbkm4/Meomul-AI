const backendGraphqlUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3001/graphql";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Where the Next server itself reaches the API for the /graphql and /upload rewrites.
// When web and API run side by side (one Docker network), set INTERNAL_API_URL at build
// time (e.g. http://meomul-api:3001) so proxied requests stay inside that network instead
// of going out to the public domain and back.
const internalApiUrl = process.env.INTERNAL_API_URL;
const socketUrl =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_URL ?? "http://localhost:3001";

const isDev = process.env.NODE_ENV !== "production";

const resolveApiRemotePattern = () => {
  try {
    const parsed = new URL(apiUrl);
    if (!parsed.hostname) {
      return null;
    }

    const pattern = {
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
    };

    if (parsed.port) {
      pattern.port = parsed.port;
    }

    return pattern;
  } catch {
    return null;
  }
};

const apiRemotePattern = resolveApiRemotePattern();

const buildCsp = () =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://cdn.prod.website-files.com https://d3e54v103j8qbb.cloudfront.net https://ajax.googleapis.com https://static.cloudflareinsights.com`,
    "style-src 'self' 'unsafe-inline' https://cdn.prod.website-files.com",
    "font-src 'self' data:",
    `img-src 'self' data: blob: https: ${apiUrl}`,
    `media-src 'self' https://videos.pexels.com ${apiUrl}`,
    `connect-src 'self' ${apiUrl} ${socketUrl} ws: wss: https://cloudflareinsights.com`,
    "frame-src 'self' https://maps.google.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle with only the modules actually imported, so the
  // runtime image no longer has to carry a full production node_modules tree.
  output: "standalone",
  // @sentry/server-utils reaches for meriyah through a dynamic require, which the
  // file tracer cannot see. Without this the standalone server starts and then 500s on
  // every request with MODULE_NOT_FOUND.
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/meriyah/**/*"],
  },
  i18n: {
    locales: ["en", "ko", "ru", "uz"],
    defaultLocale: "en",
    localeDetection: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: internalApiUrl ? `${internalApiUrl}/graphql` : backendGraphqlUrl,
      },
      {
        source: "/upload/:path*",
        destination: `${internalApiUrl ?? apiUrl}/upload/:path*`,
      },
      // Same-origin media (see lib/utils/media-url.ts): /uploads is read from the API over the
      // private network, so neither browsers nor the image optimizer depend on the public API host.
      ...(internalApiUrl
        ? [{ source: "/uploads/:path*", destination: `${internalApiUrl}/uploads/:path*` }]
        : []),
      {
        source: "/about",
        destination: "/about.html",
        locale: false,
      },
      {
        source: "/about/",
        destination: "/about.html",
        locale: false,
      },
      {
        source: "/:locale/about",
        destination: "/about.html",
        locale: false,
      },
      {
        source: "/:locale/about/",
        destination: "/about.html",
        locale: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // `locale: false` is essential here. With i18n enabled Next rewrites a plain
        // source into `/:nextInternalLocale(en|ko|ru|uz)/(.*)`, whose regex demands both
        // a locale segment and a non-empty path after it. That silently excluded `/`,
        // `/ko`, `/ru` and `/uz` — the homepage in every language was served with no CSP,
        // no HSTS and no X-Frame-Options, while inner pages like /hotels were covered.
        //
        // `/:path*` with locale matching disabled matches the bare root as well.
        source: "/:path*",
        locale: false,
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: buildCsp(),
          },
        ],
      },
    ];
  },
  images: {
    // WebP only: one format per URL keeps optimized images safe to cache at the CDN edge
    // (AVIF-or-WebP by Accept header would need a Vary-aware cache), and it encodes faster.
    formats: ["image/webp"],
    // Optimized variants are keyed by source path, width and quality, and the sources never
    // change in place, so they can live in caches for a month.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // No 2048/3840 variants: nothing on the site is drawn wider than 1920 CSS px.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.meomul.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      ...(process.env.NODE_ENV === "development"
        ? [
            {
              protocol: "http",
              hostname: "localhost",
            },
          ]
        : []),
      ...(apiRemotePattern ? [apiRemotePattern] : []),
    ],
  },
};

export default nextConfig;
