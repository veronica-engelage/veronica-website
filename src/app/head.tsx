import { getSiteSettings } from "@/lib/siteSettings";

export default async function Head() {
  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = (settings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");
  const canonicalBase = siteUrl.replace("https://veronicachs.com", "https://www.veronicachs.com");

  const agentName = settings?.agentName || "Veronica Engelage";
  const brokerageName = settings?.brokerageName || "Carolina One Real Estate";
  const phone = settings?.phone || "+18548372944";
  const email = settings?.email || "hello@veronicachs.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agentName,
    url: canonicalBase,
    telephone: phone,
    email,
    areaServed: ["Charleston, SC", "Mount Pleasant, SC"],
    affiliation: {
      "@type": "RealEstateAgent",
      name: brokerageName,
    },
    sameAs: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
