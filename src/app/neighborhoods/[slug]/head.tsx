import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/client";
import { getSiteSettings } from "@/lib/siteSettings";

const neighborhoodQuery = groq`
  *[_type == "neighborhood" && slug.current == $slug][0]{
    name,
    municipality,
    "slug": slug.current
  }
`;

const marketQuery = groq`
  *[_type == "market" && municipality == $municipality][0]{
    name,
    "slug": slug.current
  }
`;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default async function Head({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const neighborhood = await sanityClient.fetch(neighborhoodQuery, { slug });
  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = (settings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");

  const market =
    neighborhood?.municipality
      ? await sanityClient.fetch(marketQuery, { municipality: neighborhood.municipality })
      : null;

  const marketName = market?.name || neighborhood?.municipality || "Market";
  const marketSlug = market?.slug || slugify(marketName);

  const breadcrumbItems = [
    { name: "Home", url: `${siteUrl}/` },
    { name: marketName, url: `${siteUrl}/markets/${marketSlug}` },
    {
      name: neighborhood?.name || "Neighborhood",
      url: `${siteUrl}/neighborhoods/${neighborhood?.slug || slug}`,
    },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
