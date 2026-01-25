import { notFound } from "next/navigation"
import { sanityClient } from "@/sanity/client"
import PortableText from "@/components/PortableText"

const query = `*[_type == "page" && slug.current == $slug][0]{
  title,
  content
}`

type ParamsLike =
  | { slug?: string }
  | Promise<{ slug?: string }>

export default async function GenericPage(props: { params: ParamsLike }) {
  // Handle both object and Promise forms safely
  const resolvedParams =
    typeof (props.params as any)?.then === "function"
      ? await (props.params as Promise<{ slug?: string }>)
      : (props.params as { slug?: string })

  const slug = resolvedParams?.slug

  // No slug = no page
  if (!slug) return notFound()

  // Optional: block /home if you really want that
  if (slug === "home") return notFound()

  const page = await sanityClient.fetch<{ title?: string; content?: any } | null>(
    query,
    { slug }
  )

  // Some CMS entries might have content but no title.
  // If you want to allow that, change this condition.
  if (!page) return notFound()

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
