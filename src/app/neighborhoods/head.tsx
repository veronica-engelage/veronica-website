import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/client";
import { getSiteSettings } from "@/lib/siteSettings";

const query = groq`
  *[_type == "neighborhood"] | order(municipality asc, name asc) {
    name,
    "slug": slug.current
  }
`;

const settingsQuery = groq`
  *[_type == "pageSettings" && pageKey == "neighborhoods"][0]{
    heroHeadline,
    introText
  }
`;

export default async function Head() {
  const [items, settings, siteSettings] = await Promise.all([
    sanityClient.fetch<Array<{ name: string; slug: string }>>(query),
    sanityClient.fetch<{ heroHeadline?: string; introText?: string } | null>(settingsQuery),
    getSiteSettings().catch(() => null),
  ]);

  const siteUrl = (siteSettings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");
  const canonicalBase = siteUrl.replace("https://veronicachs.com", "https://www.veronicachs.com");

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: settings?.heroHeadline || "Neighborhoods",
    description:
      settings?.introText ||
      "Curated, data‑rich neighborhood guides with market snapshots, local context, and market‑savvy guidance.",
    url: `${canonicalBase}/neighborhoods`,
    mainEntity: (items || []).map((item) => ({
      "@type": "CollectionPage",
      name: item.name,
      url: `${canonicalBase}/neighborhoods/${item.slug}`,
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
