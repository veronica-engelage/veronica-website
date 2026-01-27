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

    sections[]{
      ...,

      _type == "sectionHero" => {
        ...,

        media->{
          _type,
          title,
          alt,

          image{
            asset->{
              url,
              metadata{dimensions}
            }
          },

          provider,
          url,
          file{asset->{url}},
          thumbnail{
            asset->{
              url,
              metadata{dimensions}
            }
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
            page->{
              _type,
              "slug": slug.current
            }
          }
        },

        secondaryCta{
          ...,
          link{
            ...,
            page->{
              _type,
              "slug": slug.current
            }
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

      cta{
        ...,
        link{
          ...,
          page->{
            _type,
            "slug": slug.current
          }
        }
      },

      secondaryCta{
        ...,
        link{
          ...,
          page->{
            _type,
            "slug": slug.current
          }
        }
      }
    }
  }
`;

export default async function HomePage() {
  const home = await sanityClient.fetch(homeQuery);
  if (!home) return notFound();

  const settings = await getSiteSettings().catch(() => null);
  const phone = normalizeE164(settings?.phone) || null;

  return (
    <main>
      <SectionRenderer sections={home.sections} phone={phone} />
    </main>
  );
}
