import {notFound} from 'next/navigation'
import {sanityClient} from '@/sanity/client'

const query = `*[_type == "subdivision" && slug.current == $slug][0]{
  _id,
  name,
  intro,
  marketStats,
  aiSummary
}`

type Params = { slug: string }

export default async function SubdivisionDetailPage(props: { params: Params | Promise<Params> }) {
  const params = await props.params
  const slug = params?.slug
  if (!slug) return notFound()

  const data = await sanityClient.fetch<{
    _id: string
    name: string
    aiSummary?: string | null
    marketStats?: { medianPrice?: number | null; daysOnMarket?: number | null; trend?: string | null } | null
  } | null>(query, { slug })

  if (!data?._id) return notFound()

  return (
    <main style={{padding: 24}}>
      <h1>{data.name}</h1>

      {data.marketStats && (
        <section style={{marginTop: 16}}>
          <h2>Market snapshot</h2>
          <ul>
            {typeof data.marketStats.medianPrice === 'number' && <li>Median price: {data.marketStats.medianPrice}</li>}
            {typeof data.marketStats.daysOnMarket === 'number' && <li>Days on market: {data.marketStats.daysOnMarket}</li>}
            {data.marketStats.trend && <li>Trend: {data.marketStats.trend}</li>}
          </ul>
        </section>
      )}

      {data.aiSummary && (
        <section style={{marginTop: 16}}>
          <h2>Summary</h2>
          <p>{data.aiSummary}</p>
        </section>
      )}
    </main>
  )
}


