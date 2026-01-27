import Image from "next/image";
import Link from "next/link";
import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityClient } from "@/sanity/client";
import PortableText from "@/components/PortableText";
import { ListingGalleryLightbox } from "./ListingGalleryLightbox";

export const revalidate = 300;

function formatMoney(amount: unknown, currency: string = "USD") {
  const num = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(num) || num <= 0) return null;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `$${num.toLocaleString()}`;
  }
}

const query = groq`
  *[_type == "listing" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    status,
    propertyType,
    source,

    address,
    geo,
    neighborhood->{ _id, title, "slug": slug.current },
    subdivision->{ _id, title, "slug": slug.current },

    price,
    bedrooms,
    bathrooms,
    sqft,
    acres,
    yearBuilt,

    highlights,
    features,
    summary,
    description,

    heroMedia->{
      _id,
      _type,
      title,
      "imageUrl": image.asset->url,
      "thumbUrl": thumbnail.asset->url,
      "alt": coalesce(image.alt, title),
      url
    },

    media[]{
      category,
      caption,
      sortOrder,
      asset->{
        _id,
        _type,
        title,
        "imageUrl": image.asset->url,
        "thumbUrl": thumbnail.asset->url,
        "alt": coalesce(image.alt, title),

        // If your asset type is imageAsset and you want credits, add:
        credits{
          author,
          copyrightNotice,
          creditRequired
        },

        url
      }
    },

    documents[]->{
      _id,
      title,
      file{
        asset->{
          url,
          originalFilename
        }
      }
    },

    openHouses[]{ start, end, note },

    seo
  }
`;

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) return notFound();

  const listing = await sanityClient.fetch(query, { slug });
  if (!listing) return notFound();

  const priceText =
    listing.price?.display ||
    formatMoney(listing.price?.amount, listing.price?.currency);

  const addr = listing.address || {};
  const addressLine = [
    addr.street,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.zip,
  ]
    .filter(Boolean)
    .join(" • ");

  const heroImg =
    listing.heroMedia?.imageUrl || listing.heroMedia?.thumbUrl || null;

  const gallery = Array.isArray(listing.media)
    ? [...listing.media]
        .sort(
          (a: any, b: any) => (a?.sortOrder ?? 9999) - (b?.sortOrder ?? 9999)
        )
        .filter((m: any) => m?.asset?.imageUrl || m?.asset?.thumbUrl || m?.asset?.url)
    : [];

  const pills: Array<string> = [
    listing.status,
    listing.propertyType,
    listing.neighborhood?.title,
    listing.subdivision?.title,
  ].filter(Boolean);

  return (
    <main className="container-page py-10 sm:py-12">
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8">
          {/* Title block */}
          <header className="space-y-3">
            <div className="label">Listing</div>

            <h1 className="text-4xl sm:text-5xl tracking-tight">
              {listing.title || "Listing"}
            </h1>

            {addressLine ? <div className="text-sm text-muted">{addressLine}</div> : null}

            {pills.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {pills.map((t, i) => (
                  <span key={`${t}-${i}`} className="label rounded-full border px-3 py-1">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {priceText ? (
              <div className="pt-2">
                <div className="text-3xl sm:text-4xl font-medium text-text">
                  {priceText}
                </div>
              </div>
            ) : null}
          </header>

          {/* Hero media */}
          {heroImg ? (
            <section className="mt-8">
              <div className="media-frame card">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={heroImg}
                    alt={listing.heroMedia?.alt || listing.title || ""}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </section>
          ) : null}

          {/* Facts */}
          <section className="mt-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {typeof listing.bedrooms === "number" ? (
                <Fact label="Bedrooms" value={listing.bedrooms} />
              ) : null}
              {typeof listing.bathrooms === "number" ? (
                <Fact label="Bathrooms" value={listing.bathrooms} />
              ) : null}
              {typeof listing.sqft === "number" ? (
                <Fact label="Sq Ft" value={listing.sqft.toLocaleString()} />
              ) : null}
              {typeof listing.acres === "number" ? (
                <Fact label="Acres" value={listing.acres} />
              ) : null}
              {typeof listing.yearBuilt === "number" ? (
                <Fact label="Year Built" value={listing.yearBuilt} />
              ) : null}
            </div>
          </section>

          {/* Highlights */}
          {Array.isArray(listing.highlights) && listing.highlights.length ? (
            <section className="mt-12">
              <div className="eyebrow">Highlights</div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {listing.highlights.map((h: string, i: number) => (
                  <li key={i} className="card px-5 py-4 text-sm text-text">
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Features */}
          {Array.isArray(listing.features) && listing.features.length ? (
            <section className="mt-12">
              <div className="eyebrow">Features</div>
              <div className="flex flex-wrap gap-2">
                {listing.features.map((f: string, i: number) => (
                  <span key={i} className="label rounded-full border px-3 py-1">
                    {f}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* Description */}
          {listing.description ? (
            <section className="mt-12">
              <div className="eyebrow">Description</div>
              <div className="card p-6 sm:p-8">
                <PortableText value={listing.description} />
              </div>
            </section>
          ) : null}

          {/* Open Houses */}
          {Array.isArray(listing.openHouses) && listing.openHouses.length ? (
            <section className="mt-12">
              <div className="eyebrow">Open Houses</div>
              <div className="space-y-3">
                {listing.openHouses.map((oh: any, i: number) => (
                  <div key={i} className="card p-5">
                    <div className="text-sm font-medium text-text">
                      {oh.note || "Open House"}
                    </div>
                    <div className="mt-1 text-sm text-muted">
                      {formatOpenHouse(oh.start, oh.end)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Gallery */}
{gallery.length ? (
  <section className="mt-12">
    <div className="eyebrow">Gallery</div>

    <ListingGalleryLightbox
      gallery={gallery}
      listingTitle={listing.title || "Listing"}
      hero={{
        url: listing.heroMedia?.imageUrl || listing.heroMedia?.thumbUrl || null,
        thumb: listing.heroMedia?.thumbUrl || listing.heroMedia?.imageUrl || null,
        alt: listing.heroMedia?.alt || listing.title || "",
        caption: "Cover photo",
      }}
    />
  </section>
) : null}

        </div>

        {/* Right rail */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="card p-6 lg:sticky lg:top-24">
            <div className="eyebrow">Interested?</div>

            <div className="mt-2 text-sm text-muted leading-relaxed">
              Schedule a showing or request full details. Quick response, no spam,
              minimal human suffering.
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Link href="/contact" className="btn btn-primary">
                Contact Veronica
              </Link>

              <Link href="/contact" className="btn-tertiary">
                Ask a question first
              </Link>
            </div>
          </section>

          {Array.isArray(listing.documents) && listing.documents.length ? (
            <section className="card p-6">
              <div className="eyebrow">Documents</div>
              <ul className="mt-3 space-y-2">
                {listing.documents.map((d: any) => {
                  const url = d?.file?.asset?.url;
                  const label = d?.title || d?.file?.asset?.originalFilename || "Document";

                  return (
                    <li key={d._id} className="text-sm">
                      {url ? (
                        <a className="btn-tertiary" href={url} target="_blank" rel="noreferrer">
                          {label}
                        </a>
                      ) : (
                        <span className="text-muted">{label}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: any }) {
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className="mt-2 text-lg font-medium text-text">{value}</div>
    </div>
  );
}

function formatOpenHouse(start?: string, end?: string) {
  try {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;

    const date = s
      ? s.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
      : "";

    const time = s ? s.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";
    const timeEnd = e ? e.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";

    return [date, time + (timeEnd ? ` – ${timeEnd}` : "")]
      .filter(Boolean)
      .join(" • ");
  } catch {
    return "";
  }
}
