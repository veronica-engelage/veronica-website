import type { MetadataRoute } from "next";
import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/client";
import { getSiteSettings } from "@/lib/siteSettings";

export const revalidate = 3600;

type SlugEntry = { slug: string; _updatedAt?: string };

const excludedPageSlugs = [
  "test",
  "markets",
  "neighborhoods",
  "subdivisions",
  "listings",
  "thank-you",
  "thanks",
  "admin",
  "login",
  "404",
];

const pageSlugsQuery = groq`
  *[_type == "page" && defined(slug.current) && !(slug.current in $excludedPageSlugs)]{
    "slug": slug.current,
    _updatedAt
  }
`;

const marketSlugsQuery = groq`
  *[_type == "market" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`;

const neighborhoodSlugsQuery = groq`
  *[_type == "neighborhood" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = (settings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");

  const [pages, markets, neighborhoods] = await Promise.all([
    sanityClient.fetch<SlugEntry[]>(pageSlugsQuery, { excludedPageSlugs }),
    sanityClient.fetch<SlugEntry[]>(marketSlugsQuery),
    sanityClient.fetch<SlugEntry[]>(neighborhoodSlugsQuery),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/markets`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/neighborhoods`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const marketRoutes: MetadataRoute.Sitemap = markets.map((market) => ({
    url: `${siteUrl}/markets/${market.slug}`,
    lastModified: market._updatedAt ? new Date(market._updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const neighborhoodRoutes: MetadataRoute.Sitemap = neighborhoods.map((neighborhood) => ({
    url: `${siteUrl}/neighborhoods/${neighborhood.slug}`,
    lastModified: neighborhood._updatedAt ? new Date(neighborhood._updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...pageRoutes,
    ...marketRoutes,
    ...neighborhoodRoutes,
  ];
}
