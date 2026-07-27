import type { GetServerSideProps } from "next";
import { env } from "@/lib/config/env";

const SITE_URL = env.siteUrl.replace(/\/+$/, "");

const LOCATIONS = [
  "SEOUL",
  "BUSAN",
  "DAEGU",
  "DAEJON",
  "GWANGJU",
  "INCHEON",
  "JEJU",
  "GYEONGJU",
  "GANGNEUNG",
];

const HOTEL_TYPES = [
  "HOTEL",
  "MOTEL",
  "RESORT",
  "PENSION",
  "GUESTHOUSE",
  "HANOK",
];

function generateSitemapXml(): string {
  const now = new Date().toISOString();

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/hotels", priority: "0.9", changefreq: "daily" },
    { loc: "/support", priority: "0.3", changefreq: "monthly" },
    { loc: "/auth/login", priority: "0.2", changefreq: "monthly" },
    { loc: "/auth/signup", priority: "0.2", changefreq: "monthly" },
  ];

  // Generate URLs for hotel search by location
  const locationPages = LOCATIONS.map((loc) => ({
    loc: `/hotels?location=${loc}`,
    priority: "0.8",
    changefreq: "daily" as const,
  }));

  // Generate URLs for hotel search by type
  const typePages = HOTEL_TYPES.map((type) => ({
    loc: `/hotels?hotelTypes=${type}`,
    priority: "0.7",
    changefreq: "daily" as const,
  }));

  const allPages = [...staticPages, ...locationPages, ...typePages];

  const urls = allPages
    .map(
      (page) => `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSitemapXml();

  res.setHeader("Content-Type", "text/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=43200",
  );
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
