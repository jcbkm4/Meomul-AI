import type { GetServerSideProps } from "next";
import { env } from "@/lib/config/env";

/**
 * Served dynamically rather than as a static public/robots.txt so the Sitemap line
 * follows NEXT_PUBLIC_SITE_URL. The static file hardcoded https://meomul.com, which
 * pointed staging and preview deployments at production's sitemap.
 */
const SITE_URL = env.siteUrl.replace(/\/+$/, "");

const ROBOTS = `User-agent: *
Allow: /
Allow: /hotels
Allow: /hotels/*
Allow: /rooms/*
Allow: /support

Disallow: /admin/*
Disallow: /api/*
Disallow: /auth/*
Disallow: /bookings/*
Disallow: /chats/*
Disallow: /dashboard
Disallow: /notifications
Disallow: /onboarding
Disallow: /profile
Disallow: /settings/*

Sitemap: ${SITE_URL}/sitemap.xml
`;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=43200",
  );
  res.write(ROBOTS);
  res.end();

  return { props: {} };
};

export default function Robots() {
  return null;
}
