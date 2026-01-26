import Image from 'next/image'

export function GallerySection({title, layout, items = []}: any) {
  // layout is currently informational; you can render carousel later.
  return (
    <section className="container-page py-10">
      {title ? <h2 className="text-2xl font-semibold mb-4">{title}</h2> : null}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((it: any, idx: number) => {
          const url = it?.image?.asset?.url || it?.thumbnail?.asset?.url
          if (!url) return null
          return (
            <div key={it._id || `${idx}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={url} alt={it?.alt || it?.title || ''} fill className="object-cover" />
            </div>
          )
        })}
      </div>

      {layout ? <div className="mt-3 text-sm opacity-60">Layout: {layout}</div> : null}
    </section>
  )
}
