import Image from 'next/image'
import Link from 'next/link'

function formatMoney(n: any) {
  const num = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(num)) return null
  return `$${num.toLocaleString()}`
}

export function ListingsSection({title, mode, collection}: any) {
  const items = collection?.items || []
  if (mode === 'collection' && items.length === 0) return null

  return (
    <section className="container-page py-10">
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold">{title || collection?.title || 'Listings'}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((l: any) => {
          const img = l?.hero?.image?.asset?.url || l?.hero?.thumbnail?.asset?.url
          const href = l?.slug ? `/listings/${l.slug}` : '#'

          return (
            <Link
              key={l._id}
              href={href}
              className="block rounded-2xl overflow-hidden border hover:opacity-95 transition"
            >
              <div className="relative aspect-[4/3] bg-neutral-100">
                {img ? <Image src={img} alt={l.title || ''} fill className="object-cover" /> : null}
              </div>

              <div className="p-4">
                <div className="text-sm opacity-70">
                  {l.status ? l.status : null}
                  {l.propertyType ? <span> • {l.propertyType}</span> : null}
                </div>

                <div className="mt-1 font-medium">{l.title}</div>

                {l.price?.display ? (
                  <div className="mt-1">{l.price.display}</div>
                ) : l.price?.amount ? (
                  <div className="mt-1">{formatMoney(l.price.amount)}</div>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
