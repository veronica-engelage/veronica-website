import Image from "next/image";

export function SocialFeedSection({
  title,
  platform,
  mode,
  posts,
  limit = 6,
}: any) {
  const normalizedPosts = Array.isArray(posts) ? posts.filter(Boolean) : [];
  const items = mode === "latest" ? normalizedPosts.slice(0, limit) : normalizedPosts;
  if (!items.length) return null;

  return (
    <section className="container-page py-12">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">{title || "Social"}</h2>
        {platform ? (
          <div className="text-sm opacity-70">{platform}</div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((p: any) => {
          const href = p.permalink || "#";

          const primaryUrl = p?.primaryImage?.asset?.url;
          const primaryAlt = p?.primaryAlt;

          const firstAsset = Array.isArray(p?.mediaAssets) ? p.mediaAssets[0] : null;
          const fallbackUrl =
            firstAsset?.image?.asset?.url ||
            firstAsset?.thumbnail?.asset?.url ||
            firstAsset?.url ||
            null;

          const imgUrl = primaryUrl || fallbackUrl;
          const altText = primaryAlt || firstAsset?.alt || p?.caption || "Social post";

          const isRealLink = href !== "#";

          return (
            <a
              key={p._id}
              href={href}
              target={isRealLink ? "_blank" : undefined}
              rel={isRealLink ? "noreferrer" : undefined}
              className="block card card-hover overflow-hidden"
            >
              {imgUrl ? (
                <div className="relative aspect-[4/3] media-frame">
                  <Image
                    src={imgUrl}
                    alt={altText}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] media-frame flex items-center justify-center text-sm opacity-60">
                  No image
                </div>
              )}

              <div className="p-5">
                <div className="text-xs tracking-wide uppercase opacity-70">
                  {p.postedAt ? new Date(p.postedAt).toLocaleDateString() : null}
                </div>

                <div className="mt-3 text-sm leading-relaxed line-clamp-4 opacity-90">
                  {p.caption || "View post"}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
