export function SocialFeedSection({title, platform, mode, posts = [], limit = 6}: any) {
  const items = mode === 'latest' ? posts.slice(0, limit) : posts
  if (!items.length) return null

  return (
    <section className="container-page py-10">
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold">{title || 'Social'}</h2>
        {platform ? <div className="text-sm opacity-70">{platform}</div> : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((p: any) => (
          <a
            key={p._id}
            href={p.permalink}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border p-4 hover:opacity-95 transition"
          >
            <div className="text-sm opacity-70">
              {p.postedAt ? new Date(p.postedAt).toLocaleDateString() : null}
            </div>
            <div className="mt-2 line-clamp-5">{p.caption || 'View post'}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
