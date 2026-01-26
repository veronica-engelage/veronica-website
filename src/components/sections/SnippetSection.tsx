import {PortableText} from '@portabletext/react'

export function SnippetSection({snippet}: any) {
  if (!snippet) return null

  return (
    <section className="container-page py-10">
      <div className="max-w-3xl">
        {snippet.title ? <h2 className="text-2xl font-semibold mb-4">{snippet.title}</h2> : null}
        <PortableText value={snippet.content || []} />
      </div>
    </section>
  )
}
