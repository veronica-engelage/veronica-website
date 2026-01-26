import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityClient } from "@/sanity/client";

export const revalidate = 300;

const query = groq`
  *[_type == "neighborhood" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    intro
  }
`;

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const doc = await sanityClient.fetch(query, { slug });

  if (!doc) return notFound();

  return (
    <main className="container-page py-16">
      <h1 className="font-serif text-4xl tracking-tight">{doc.title}</h1>

      {doc.intro ? (
        <p className="mt-6 max-w-2xl text-lg text-text/80 leading-relaxed">
          {doc.intro}
        </p>
      ) : null}
    </main>
  );
}
