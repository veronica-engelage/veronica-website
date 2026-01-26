import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityClient } from "@/sanity/client";

export const revalidate = 300;

const query = groq`
  *[_type == "listing" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,

    // Optional fields (safe even if not present yet)
    price,
    addressLine1,
    city,
    state,
    postalCode,

    // If you have a hero image or gallery, project URLs (adjust to your schema)
    "mainImageUrl": mainImage.asset->url,
    "mainImageAlt": coalesce(mainImage.alt, title)
  }
`;

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const listing = await sanityClient.fetch(query, { slug });

  if (!listing) return notFound();

  return (
    <main className="container-page py-16">
      <h1 className="font-serif text-4xl tracking-tight">
        {listing.title || "Listing"}
      </h1>

      {/* Tiny “facts” row, optional */}
      <div className="mt-4 text-text/70">
        {[
          listing.addressLine1,
          [listing.city, listing.state].filter(Boolean).join(", "),
          listing.postalCode,
        ]
          .filter(Boolean)
          .join(" • ")}
      </div>

      {listing.price ? (
        <div className="mt-6 text-2xl text-text">{listing.price}</div>
      ) : null}

      <div className="mt-10 rounded-2xl bg-neutral-100 p-6 text-text/70">
        This is the initial listing page shell. You can flesh it out with gallery,
        features, map, and lead form when you feel like being productive again.
      </div>
    </main>
  );
}
