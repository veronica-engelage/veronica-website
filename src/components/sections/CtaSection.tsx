import Link from 'next/link'
import {resolveCtaHref} from '@/lib/linkResolver'

export function CtaSection({headline, text, cta}: any) {
  const resolved = resolveCtaHref(cta)

  return (
    <section className="container-page py-10">
      <div className="rounded-3xl border p-8 max-w-4xl">
        {headline ? <h2 className="text-2xl font-semibold">{headline}</h2> : null}
        {text ? <p className="mt-3 opacity-80 max-w-2xl">{text}</p> : null}

        {cta?.label && resolved ? (
          resolved.external ? (
            <a className="inline-block mt-6 rounded-2xl px-5 py-3 border" href={resolved.href} target="_blank" rel="noreferrer">
              {cta.label}
            </a>
          ) : (
            <Link className="inline-block mt-6 rounded-2xl px-5 py-3 border" href={resolved.href}>
              {cta.label}
            </Link>
          )
        ) : null}
      </div>
    </section>
  )
}
