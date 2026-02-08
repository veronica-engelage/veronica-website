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
    image: "https://www.veronicachs.com/_next/image?url=%2Fimages%2Fveronica-profile.jpg&w=1200&q=75",
    description:
      "Veronica Engelage offers discreet, data-driven real estate guidance in Charleston & Mount Pleasant. Specializing in luxury listings and neighborhood insights.",
    url: `${canonicalBase}/`,
    telephone: phone,
    email,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2713 N Hwy 17",
      addressLocality: "Mount Pleasant",
      addressRegion: "SC",
      postalCode: "29466",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "32.8368",
      longitude: "-79.8247",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
    sameAs: [
      "https://www.facebook.com/veronica.engelage/",
      "https://www.instagram.com/veronica.chsrealtor/",
      "https://www.linkedin.com/in/veronica-engelage-18844b377/",
    ],
    parentOrganization: {
      "@type": "RealEstateAgent",
      name: brokerageName,
    },
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', useDark);
  } catch (e) {}
})();
          `,
        }}
      />

      {process.env.NEXT_PUBLIC_GA_ID ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
  anonymize_ip: true,
  send_page_view: true
});
              `,
            }}
          />
        </>
      ) : null}

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
