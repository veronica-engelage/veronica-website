import { notFound } from "next/navigation"
import { sanityClient } from "@/sanity/client"
import PortableText from "@/components/PortableText"
import { SectionRenderer } from "@/components/sections/SectionRenderer"

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
    }
  }
},


    _type == "sectionRichText" => { width, content },

    _type == "sectionGallery" => {
      title,
      layout,
      "items": items[]->{
        _type,
        title,
        alt,
        image{asset->{url, metadata{dimensions}}},
        provider,
        url,
        thumbnail{asset->{url, metadata{dimensions}}},
        file{asset->{url}}
      }
    },

    _type == "sectionSnippet" => {
      "snippet": snippet->{
        title,
        content,
        tags
      }
    },

   // CTA SECTION
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
    }
  }
}`

type ParamsLike = { slug?: string } | Promise<{ slug?: string }>

type PageData = {
  title?: string
  content?: any
  sections?: any[]
} | null

export default async function GenericPage(props: { params: ParamsLike }) {
  const resolvedParams =
    typeof (props.params as any)?.then === "function"
      ? await (props.params as Promise<{ slug?: string }>)
      : (props.params as { slug?: string })

  const slug = resolvedParams?.slug
  if (!slug) return notFound()
  if (slug === "home") return notFound()

  const page = await sanityClient.fetch<PageData>(query, { slug })
  if (!page) return notFound()

  const hasSections = Array.isArray(page.sections) && page.sections.length > 0

  // If you have migrated fully to sections, you can delete this fallback later.
  if (hasSections) {
    return (
      <main>
        <SectionRenderer sections={page.sections!} />
      </main>
    )
  }

  // Legacy fallback: title + content
  return (
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
  )
}
