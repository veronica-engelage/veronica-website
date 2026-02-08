import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/client";
import { getSiteSettings } from "@/lib/siteSettings";

const query = groq`
  *[_type == "market"] | order(order asc, name asc) {
    name,
    "slug": slug.current
  }
`;

const settingsQuery = groq`
  *[_type == "pageSettings" && pageKey == "markets"][0]{
    heroHeadline,
    introText
  }
`;

export default async function Head() {
  const [markets, settings, siteSettings] = await Promise.all([
    sanityClient.fetch<Array<{ name: string; slug: string }>>(query),
    sanityClient.fetch<{ heroHeadline?: string; introText?: string } | null>(settingsQuery),
    getSiteSettings().catch(() => null),
  ]);

  const siteUrl = (siteSettings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");
  const canonicalBase = siteUrl.replace("https://veronicachs.com", "https://www.veronicachs.com");

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: settings?.heroHeadline || "Markets",
    description:
      settings?.introText ||
      "Explore Charleston‑area markets with curated neighborhood context, current pricing signals, and an editorial look at each community.",
    url: `${canonicalBase}/markets`,
    mainEntity: (markets || []).map((market) => ({
      "@type": "CollectionPage",
      name: market.name,
      url: `${canonicalBase}/markets/${market.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </>
  );
}
