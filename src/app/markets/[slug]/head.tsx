import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/client";
import { getSiteSettings } from "@/lib/siteSettings";

const marketQuery = groq`
  *[_type == "market" && slug.current == $slug][0]{
    name,
    "slug": slug.current
  }
`;

export default async function Head({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const market = await sanityClient.fetch(marketQuery, { slug });
  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = (settings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");

  const breadcrumbItems = [
    { name: "Home", url: `${siteUrl}/` },
    { name: "Markets", url: `${siteUrl}/markets` },
    {
      name: market?.name || "Market",
      url: `${siteUrl}/markets/${market?.slug || slug}`,
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
