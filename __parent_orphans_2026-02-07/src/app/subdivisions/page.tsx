import Link from 'next/link'
import {sanityClient} from '@/sanity/client'

const query = `*[_type == "subdivision"] | order(name asc) { _id, name, "slug": slug.current }`

export default async function SubdivisionsPage() {
  const items = await sanityClient.fetch<Array<{_id: string; name: string; slug: string}>>(query)

  return (
    <main style={{padding: 24}}>
      <h1>Subdivisions</h1>
      <ul>
        {items.map((s) => (
          <li key={s._id}>
            <Link href={`/subdivisions/${s.slug}`}>{s.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

