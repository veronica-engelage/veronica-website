import Image from "next/image";
import Link from "next/link";

function formatMoney(n: any) {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return null;
  return `$${num.toLocaleString()}`;
}

export function ListingsSection({ title, mode, collection }: any) {
  const items = collection?.items || [];
  if (mode === "collection" && items.length === 0) return null;

  return (
    <section className="container-page py-12">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">
          {title || collection?.title || "Listings"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((l: any) => {
          const img =
            l?.hero?.image?.asset?.url || l?.hero?.thumbnail?.asset?.url;

          const slug = typeof l?.slug === "string" ? l.slug : l?.slug?.current;
          if (!slug) return null;

          const href = `/listings/${slug}`;

          return (
            <Link
              key={l._id || slug}
              href={href}
              className="block card card-hover overflow-hidden"
            >
              <div className="relative aspect-[4/3] media-frame">
                {img ? (
                  <Image
                    src={img}
                    alt={l.title || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm opacity-60">
                    No image
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="text-xs tracking-wide uppercase opacity-70">
                  {l.status ? l.status : null}
                  {l.propertyType ? <span> • {l.propertyType}</span> : null}
                </div>

                <div className="mt-2 font-medium leading-snug">
                  {l.title}
                </div>

                {l.price?.display ? (
                  <div className="mt-2 font-serif text-lg">{l.price.display}</div>
                ) : l.price?.amount ? (
                  <div className="mt-2 font-serif text-lg">
                    {formatMoney(l.price.amount)}
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
