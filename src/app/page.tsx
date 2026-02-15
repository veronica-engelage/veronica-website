import type { Metadata } from "next";
import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import Script from "next/script";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { sanityClient } from "@/sanity/client";
import { getSiteSettings } from "@/lib/siteSettings";
import { normalizeE164 } from "@/lib/phone";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Veronica Engelage | Charleston & Mount Pleasant Realtor",
  description:
    "Veronica Engelage offers data-driven real estate guidance in Charleston & Mount Pleasant. Explore luxury listings, neighborhoods, and market insights.",
  alternates: {
    canonical: "/",
  },
};

const homeQuery = groq`
  *[_type == "page" && slug.current == "home"][0]{
    _id,
    title,
    "slug": slug.current,

    sections[] {
      _key,
      _type,
      ...,

      _type == "sectionHero" => {
        ...,

        media->{
          _type,
          title,
          alt,

          image{
            asset->{ url, metadata{dimensions} }
          },

          provider,
          url,
          file{asset->{url}},
          thumbnail{
            asset->{ url, metadata{dimensions} }
          },

          "url": coalesce(
            image.asset->url,
            thumbnail.asset->url,
            file.asset->url,
            url
          )
        },

        "cutoutImage": cutoutImage{
          alt,
          "url": asset->url
        },

        cta{
          ...,
          link{
            ...,
            page->{ _type, "slug": slug.current }
          }
        },

        secondaryCta{
          ...,
          link{
            ...,
            page->{ _type, "slug": slug.current }
          }
        }
      },

      _type == "sectionGallery" => {
        title,
        layout,
        "items": items[]{
          _key,
          _type,

          _type == "imageRef" => @->{
            _id,
            _type,
            title,
            alt,
            image{asset->{url, metadata{dimensions}}},
            credits{
              author,
              copyrightNotice,
              license,
              creditRequired,
              usageNotes
            },
            "url": image.asset->url
          },

          _type == "videoRef" => @->{
            _id,
            _type,
            title,
            alt,
            provider,
            url,
            thumbnail{asset->{url, metadata{dimensions}}},
            file{asset->{url}},
            "url": coalesce(file.asset->url, url, thumbnail.asset->url)
          }
        }
      },

      _type == "sectionTestimonials" => {
        title,
        layout,

        "featured": featured->{
          _id,
          name,
          headline,
          text,
          transactionType,
          location,
          result,
          date,
          approvedForMarketing,
          photo{ alt, asset->{url, metadata{dimensions}} }
        },

        "testimonials": testimonials[]->{
          _id,
          name,
          headline,
          text,
          transactionType,
          location,
          result,
          date,
          approvedForMarketing,
          photo{ alt, asset->{url, metadata{dimensions}} }
        }
      },

      _type == "sectionRichText" => { width, content },

      _type == "sectionSnippet" => {
        "snippet": snippet->{ title, content, tags }
      },

      _type == "sectionCta" => {
        headline,
        text,
        "cta": cta{
          label,
          link{
            url,
            "page": page->{ _type, "slug": slug.current }
          }
        }
      },

      _type == "sectionSocialFeed" => {
        title,
        platform,
        mode,
        limit,
        "posts": posts[]->{
          _id,
          platform,
          permalink,
          caption,
          postedAt,
          mediaType,
          "mediaAssets": mediaAssets[]->{
            _type,
            title,
            alt,
            image{asset->{url, metadata{dimensions}}},
            thumbnail{asset->{url, metadata{dimensions}}},
            provider,
            url
          }
        }
      },

      _type == "sectionListings" => {
        title,
        mode,
        filters,
        "collection": collection->{
          title,
          "slug": slug.current,
          "items": items[]->{
            _id,
            title,
            "slug": slug.current,
            status,
            propertyType,
            price,
            address,
            "hero": heroMedia->{
              _type,
              title,
              alt,
              image{asset->{url, metadata{dimensions}}},
              thumbnail{asset->{url, metadata{dimensions}}},
              provider,
              url
            }
          }
        }
      },

      _type == "sectionLeadForm" => {
        title,
        intro,
        successMessage,
        "form": form->{
          _id,
          title,
          "slug": slug.current,
          kind,
          consentText,
          submitCta
        }
      },

      _type == "sectionCommunityCarousel" => {
        eyebrow,
        headline,
        mode,
        "markets": markets[]->{
          _id,
          name,
          "slug": slug.current,
          summary,
          heroImage->{ alt, image{asset->{url}} }
        },
        "neighborhoods": neighborhoods[]->{
          _id,
          name,
          "slug": slug.current,
          summary,
          heroImage->{ alt, image{asset->{url}} }
        }
      }
    }
  }
`;

type HomeData = {
  sections?: Array<{ _key: string; _type: string; [k: string]: any }>;
} | null;

function curateHomeSections(sections: any[]) {
  return sections.map((section) => {
    if (section?._type === "sectionHero") {
      return { ...section, headlineAs: "p", eyebrowAs: "h1" };
    }
    return section;
  });
}


export default async function HomePage() {
  const home = await sanityClient.fetch<HomeData>(homeQuery);
  if (!home) return notFound();

  const settings = await getSiteSettings().catch(() => null);
  const phone = normalizeE164(settings?.phone) || null;

  const siteUrl = (settings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");
  const canonicalBase = siteUrl.replace(/^https?:\/\/www\./, "https://");
  const agentName = settings?.agentName || "Veronica Engelage";
  const brokerageName = settings?.brokerageName || "Carolina One Real Estate";
  const telephone = settings?.phone || "+18548372944";
  const email = settings?.email || "hello@veronicachs.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agentName,
    image: "https://veronicachs.com/_next/image?url=%2Fimages%2Fveronica-profile.jpg&w=1200&q=75",
    description:
      "Veronica Engelage offers discreet, data-driven real estate guidance in Charleston & Mount Pleasant. Specializing in luxury listings and neighborhood insights.",
    url: `${canonicalBase}/`,
    telephone,
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

  const rawSections = Array.isArray(home.sections) ? home.sections : [];
  const sections = curateHomeSections(rawSections);

  return (
    <>
      <Script
        id="real-estate-agent-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main>
        <SectionRenderer sections={sections} phone={phone} />
      </main>
    </>
  );
}
