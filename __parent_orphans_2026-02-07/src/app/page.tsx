import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { sanityClient } from "@/sanity/client";
import { getSiteSettings } from "@/lib/siteSettings";
import { normalizeE164 } from "@/lib/phone";

export const revalidate = 60;

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
  return sections; // literally do nothing, Sanity is the source of truth
}


export default async function HomePage() {
  const home = await sanityClient.fetch<HomeData>(homeQuery);
  if (!home) return notFound();

  const settings = await getSiteSettings().catch(() => null);
  const phone = normalizeE164(settings?.phone) || null;

  const rawSections = Array.isArray(home.sections) ? home.sections : [];
  const sections = curateHomeSections(rawSections);

  return (
    <main>
      <SectionRenderer sections={sections} phone={phone} />
    </main>
  );
}
