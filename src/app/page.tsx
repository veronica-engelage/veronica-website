import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { sanityClient } from "@/sanity/client";

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
          alt,
          "url": coalesce(
            image.asset->url,
            thumbnail.asset->url,
            asset->url
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

  return (
    <main>
      <SectionRenderer sections={home.sections} />
    </main>
  );
}

