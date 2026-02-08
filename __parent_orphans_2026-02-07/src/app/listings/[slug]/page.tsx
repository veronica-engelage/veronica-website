import Link from "next/link";
import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityClient } from "@/sanity/client";
import PortableText from "@/components/PortableText";
import HeroMediaCarousel from "./HeroMediaCarousel";
import StickyMobileCta from "./StickyMobileCta";

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

function formatOpenHouse(start?: string | Date, end?: string | Date) {
  try {
    if (!start) return "Open House";
    const s = new Date(start);
    const e = end ? new Date(end) : null;

    const date = s.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const timeStart = s.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const timeEnd = e
      ? e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "";

    return [date, `${timeStart}${timeEnd ? ` – ${timeEnd}` : ""}`]
      .filter(Boolean)
      .join(" • ");
  } catch {
    return "Open House";
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

type KeyFact = { label: string; value: string };

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



  const gallery = Array.isArray(listing.media)
    ? [...listing.media]
        .sort(
          (a: any, b: any) => (a?.sortOrder ?? 9999) - (b?.sortOrder ?? 9999)
        )
        .filter(
          (m: any) => m?.asset?.imageUrl || m?.asset?.thumbUrl || m?.asset?.url
        )
    : [];

  const pills: Array<string> = [
    listing.status,
    listing.propertyType,
    listing.neighborhood?.title,
    listing.subdivision?.title,
  ].filter(Boolean);

  const facts: KeyFact[] = [
    typeof listing.bedrooms === "number"
      ? { label: "Bedrooms", value: String(listing.bedrooms) }
      : null,
    typeof listing.bathrooms === "number"
      ? { label: "Bathrooms", value: String(listing.bathrooms) }
      : null,
    typeof listing.sqft === "number"
      ? { label: "Square feet", value: listing.sqft.toLocaleString() }
      : null,
    typeof listing.acres === "number"
      ? { label: "Acres", value: String(listing.acres) }
      : null,
    typeof listing.yearBuilt === "number"
      ? { label: "Year built", value: String(listing.yearBuilt) }
      : null,
  ].filter(Boolean) as KeyFact[];


  return (
  <main className="container-page py-10 sm:py-12">
    {/* Title */}
    <header className="space-y-4">
      <div className="label">Listing</div>

      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl tracking-tight">
          {listing.title || "Listing"}
        </h1>

        {addressLine ? (
          <div className="text-sm text-muted">{addressLine}</div>
        ) : null}

        {priceText ? (
          <div className="pt-1 text-3xl sm:text-4xl font-medium text-text">
            {priceText}
          </div>
        ) : null}
      </div>

      {pills.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {pills.map((t, i) => (
            <span className="label border border-[rgb(var(--border)/0.35)] px-3 py-1" style={{ borderRadius: "6px" }}>

              {t}
            </span>
          ))}
        </div>
      ) : null}
    </header>

    {/* Hero + Rail + Content */}
    <div className="mt-8 grid gap-10 lg:grid-cols-12">
      {/* Main column */}
      <div className="lg:col-span-8">
        {/* Hero carousel that opens the lightbox. No gallery below. */}
        <HeroMediaCarousel
          listingTitle={listing.title || "Listing"}
          hero={{
            url: listing.heroMedia?.imageUrl || listing.heroMedia?.thumbUrl || null,
            thumb: listing.heroMedia?.thumbUrl || listing.heroMedia?.imageUrl || null,
            alt: listing.heroMedia?.alt || listing.title || "",
            caption: listing.heroMedia?.title || "Cover photo",
            credit: undefined,
          }}
          gallery={gallery}
        />

        {/* Sentinel AFTER the hero. This is what controls when mobile CTA appears. */}
        <div id="hero-sentinel" className="h-px" />

        {/* Editorial facts (not tiles) */}
        {facts.length ? (
          <section className="mt-10">
            <div className="eyebrow">Key facts</div>
            <div className="divider my-4" />
            <dl className="grid gap-y-4 gap-x-10 sm:grid-cols-2">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="flex items-baseline justify-between gap-6"
                >
                  <dt className="label text-muted">{f.label}</dt>
                  <dd className="text-base font-medium text-text">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* Highlights */}
        {Array.isArray(listing.highlights) && listing.highlights.length ? (
          <section className="mt-12">
            <div className="eyebrow">Highlights</div>
            <div className="divider my-4" />
            <ul className="space-y-3">
              {listing.highlights.map((h: string, i: number) => (
                <li key={i} className="text-sm text-text leading-relaxed">
                  <span className="mr-2 text-muted">•</span>
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
            <div className="divider my-4" />
            <div className="flex flex-wrap gap-2">
              {listing.features.map((f: string, i: number) => (
                <span
                  key={i}
                  className="label border px-3 py-1"
                  style={{ borderRadius: "6px" }}
                >
                  {f}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* Description */}
        {listing.description ? (
<section className="mt-12">
  <div className="container-prose px-0">
    <div className="eyebrow">Highlights</div>
    <div className="divider my-4" />
              <PortableText value={listing.description} />
            </div>
          </section>
        ) : null}

        {/* Open Houses */}
        {Array.isArray(listing.openHouses) && listing.openHouses.length ? (
          <section className="mt-12">
            <div className="eyebrow">Open Houses</div>
            <div className="divider my-4" />
            <ul className="space-y-3">
              {listing.openHouses.map((oh: any, i: number) => (
                <li key={i} className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-text">
                    {oh.note || "Open House"}
                  </div>
                  <div className="text-sm text-muted">
                    {formatOpenHouse(oh.start, oh.end)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Documents (optional) */}
        {Array.isArray(listing.documents) && listing.documents.length ? (
          <section className="mt-12">
            <div className="eyebrow">Documents</div>
            <div className="divider my-4" />
            <ul className="space-y-2">
              {listing.documents.map((d: any) => {
                const url = d?.file?.asset?.url;
                const label =
                  d?.title || d?.file?.asset?.originalFilename || "Document";
                return (
                  <li key={d._id} className="text-sm">
                    {url ? (
                      <a
                        className="btn-tertiary"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
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
      </div>

      {/* Right rail (desktop): NOT sticky */}
      <aside className="lg:col-span-4 space-y-8">
        <section className="card card-cta p-6">
          <div className="eyebrow">Interested?</div>
          <div className="mt-2 text-sm text-muted leading-relaxed">
            Schedule a showing or request full details. Quick response, no spam.
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
      </aside>
    </div>

    {/* Desktop bottom CTA (mobile already has sticky CTA) */}
<section className="mt-16 hidden sm:block">
  <div className="divider my-6" />
  <div className="grid gap-6 sm:grid-cols-12 items-center">
    <div className="sm:col-span-7">
      <div className="eyebrow">Next step</div>
      <h2 className="text-2xl mt-2">Want to see it in person?</h2>
      <p className="mt-2 text-sm text-muted">
        Request full details or schedule a private showing.
      </p>
    </div>
    <div className="sm:col-span-5 flex gap-3 sm:justify-end">
      <Link href="/contact" className="btn btn-primary">
        Contact Veronica
      </Link>
      <Link href="/contact" className="btn btn-secondary">
        Ask a question
      </Link>
    </div>
  </div>
</section>


    {/* Mobile sticky CTA: shows only after you scroll past hero */}
    <StickyMobileCta heroSentinelId="hero-sentinel" />
  </main>
  );
}
