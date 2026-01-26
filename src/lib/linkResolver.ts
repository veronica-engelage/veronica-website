// src/lib/linkResolver.ts

export type SanitySlug =
  | string
  | { current?: string | null }
  | null
  | undefined

export type SanityInternalPageRef =
  | {
      _type?: string
      slug?: SanitySlug
    }
  | null

export type SanityCta =
  | {
      label?: string | null
      link?:
        | {
            url?: string | null
            page?: SanityInternalPageRef
          }
        | null
    }
  | null

function isExternalUrl(url: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url)
}

function normalizeSlug(slug: SanitySlug): string | null {
  if (!slug) return null
  if (typeof slug === "string") return slug.trim() || null
  const current = slug.current?.trim()
  return current || null
}

export function resolveInternalHref(ref: SanityInternalPageRef): string | null {
  if (!ref?._type) return null

  const slug = normalizeSlug(ref.slug)
  if (!slug) return null

  switch (ref._type) {
    case "page":
      return slug === "home" ? "/" : `/${slug}`
    case "listing":
      return `/listings/${slug}`
    case "neighborhood":
      return `/neighborhoods/${slug}`
    case "subdivision":
      return `/subdivisions/${slug}`
    default:
      return null
  }
}

export function resolveCtaHref(
  cta: SanityCta
): { href: string; external: boolean } | null {
  const url = cta?.link?.url?.trim()
  if (url) return { href: url, external: isExternalUrl(url) }

  const internal = resolveInternalHref(cta?.link?.page ?? null)
  if (internal) return { href: internal, external: false }

  return null
}
