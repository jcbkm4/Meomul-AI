const backendGraphqlUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3001/graphql";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
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
        destination: backendGraphqlUrl,
      },
      {
        source: "/upload/:path*",
        destination: `${apiUrl}/upload/:path*`,
      },
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
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
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
