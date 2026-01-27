export const pageBySlugQuery = /* groq */ `
*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  seo,
  sections[]{
    _key,
    _type,

    // HERO
    _type == "sectionHero" => {
      eyebrow,
      headline,
      subheadline,
      layout,
      cta,
      "media": media->{
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

    // RICH TEXT
    _type == "sectionRichText" => {
      width,
      content
    },

    // GALLERY
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

    // SNIPPET
    _type == "sectionSnippet" => {
      "snippet": snippet->{
        title,
        content,
        tags
      }
    },

    // CTA
    _type == "sectionCta" => {
      headline,
      text,
      cta
    },

    // LISTINGS (collection mode)
    _type == "sectionListings" => {
      title,
      mode,
      "collection": collection->{
        title,
        slug,
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
    }
  }
`;
