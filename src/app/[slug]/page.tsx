import { notFound } from "next/navigation";
import Script from "next/script";
import { sanityClient } from "@/sanity/client";
import PortableText from "@/components/PortableText";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getSiteSettings } from "@/lib/siteSettings";
import { normalizeE164 } from "@/lib/phone";

const query = `*[_type == "page" && slug.current == $slug][0]{
  title,
  content,
  sections[]{
    _key,
    _type,

    _type == "sectionHero" => {
      eyebrow,
      headline,
      subheadline,
      layout,

      "cta": cta{
        label,
        link{
          url,
          "page": page->{
            _type,
            "slug": slug.current
          }
        }
      },

      "secondaryCta": secondaryCta{
        label,
        link{
          url,
          "page": page->{
            _type,
            "slug": slug.current
          }
        }
      },

      "media": media->{
        _type,
        title,
        alt,

        // imageAsset
        image{
          asset->{
            url,
            metadata{dimensions}
          }
        },

        // videoAsset
        provider,
        url,
        file{asset->{url}},
        thumbnail{
          asset->{
            url,
            metadata{dimensions}
          }
        },

        // convenience url
        "url": coalesce(
          image.asset->url,
          thumbnail.asset->url,
          file.asset->url,
          url
        )
      }
    },

    _type == "sectionRichText" => { width, content },

    // ✅ FIXED: Gallery items are inline ref objects, deref with @->
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

    _type == "sectionSnippet" => {
      "snippet": snippet->{
        title,
        content,
        tags
      }
    },

    _type == "sectionCta" => {
      headline,
      text,
      "cta": cta{
        label,
        link{
          url,
          "page": page->{
            _type,
            "slug": slug.current
          }
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
  photo{
    alt,
    asset->{url, metadata{dimensions}}
  }
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
  photo{
    alt,
    asset->{url, metadata{dimensions}}
  }
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
    },

    _type == "sectionIdxWidget" => {
      title,
      widgetId,
      widgetHost
    }
  }
}`;

type PageData =
  | {
      title?: string;
      content?: any;
      sections?: any[];
    }
  | null;

type GenericPageProps = {
  // Next.js 15 typing: params may be async, so treat it as a Promise
  params: Promise<{ slug: string }>;
};

export default async function GenericPage({ params }: GenericPageProps) {
  const { slug } = await params;

  if (!slug) return notFound();
  if (slug === "home") return notFound();

  const page = await sanityClient.fetch<PageData>(query, { slug });
  if (!page) return notFound();

  // Fetch site settings phone for TextCtaButton fallback in hero
  const settings = await getSiteSettings().catch(() => null);
  const phone = normalizeE164(settings?.phone) || null;
  const siteUrl = (settings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");
  const canonicalBase = siteUrl.replace(/^https?:\/\/www\./, "https://");
  const brokerageName = settings?.brokerageName || "Carolina One Real Estate";

  const aboutSchema =
    slug === "about"
      ? {
          "@context": "https://schema.org",
          "@type": "Person",
          name: settings?.agentName || "Veronica Engelage",
          jobTitle: "Real Estate Agent",
          affiliation: {
            "@type": "Organization",
            name: brokerageName,
          },
          url: `${canonicalBase}/about`,
          knowsAbout: [
            "Charleston Real Estate",
            "Mount Pleasant Neighborhoods",
            "Luxury Home Sales",
          ],
          worksFor: {
            "@type": "RealEstateAgent",
            name: brokerageName,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Mount Pleasant",
              addressRegion: "SC",
            },
          },
        }
      : null;

  const hasSections = Array.isArray(page.sections) && page.sections.length > 0;

  if (hasSections) {
    return (
      <>
        {aboutSchema ? (
          <Script
            id="about-person-schema"
            type="application/ld+json"
            strategy="beforeInteractive"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
          />
        ) : null}
        <main>
          <SectionRenderer sections={page.sections!} phone={phone} />
        </main>
      </>
    );
  }

  // Legacy fallback
  return (
    <>
      {aboutSchema ? (
        <Script
          id="about-person-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
        />
      ) : null}
      <main>
        <section className="container-page pt-28 pb-24">
          {page.title ? (
            <h1 className="font-serif text-4xl sm:text-5xl tracking-[-0.015em] text-text">
              {page.title}
            </h1>
          ) : null}

          <div className="mt-10 max-w-3xl">
            {page.content ? <PortableText value={page.content} /> : null}
          </div>
        </section>
      </main>
    </>
  );
}
