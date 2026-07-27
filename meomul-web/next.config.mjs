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
        source: "/(.*)",
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
        hostname: "**.meomul.com",
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
