import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/client";
import { HeroSection } from "@/components/sections/HeroSection";
import { NeighborhoodsFilterList } from "@/components/neighborhood/NeighborhoodsFilterList";
import { ContactInlineForm } from "@/components/ContactInlineForm";

export const revalidate = 86400;

const query = groq`
  *[_type == "neighborhood"] | order(municipality asc, name asc) {
    _id,
    name,
    municipality,
    "slug": slug.current,
    summary
  }
`;

type Neighborhood = {
  _id: string;
  name: string;
  municipality?: string | null;
  slug: string;
  summary?: string | null;
};

const marketsQuery = groq`
  *[_type == "market"]{
    name,
    municipality,
    "slug": slug.current,
    heroImage->{
      alt,
      image{asset->{url}}
    }
  }
`;

const settingsQuery = groq`
  *[_type == "pageSettings" && pageKey == "neighborhoods"][0]{
    heroHeadline,
    heroImage->{
      alt,
      title,
      image{asset->{url}}
    },
    introHeadline,
    introText
  }
`;

type PageSettings = {
  heroHeadline?: string | null;
  heroImage?: {
    alt?: string | null;
    title?: string | null;
    image?: { asset?: { url?: string | null } } | null;
  } | null;
  introHeadline?: string | null;
  introText?: string | null;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function NeighborhoodsIndex() {
  const items = await sanityClient.fetch<Neighborhood[]>(query);
  const markets = await sanityClient.fetch(marketsQuery);
  const settings = await sanityClient.fetch<PageSettings | null>(settingsQuery);
  const marketHeroByMunicipality = new Map<string, { url: string; alt?: string }>();

  if (Array.isArray(markets)) {
    markets.forEach((m: any) => {
      const muni = m?.municipality || m?.name;
      const url = m?.heroImage?.image?.asset?.url;
      if (muni && url) {
        marketHeroByMunicipality.set(muni, {
          url,
          alt: m?.heroImage?.alt || `${muni} market`,
        });
      }
    });
  }

  return (
    <main>
      <HeroSection
        headline={settings?.heroHeadline || "Neighborhoods"}
        headlineAs="h2"
        layout="overlay"
        variant="standard"
        media={{
          url: settings?.heroImage?.image?.asset?.url || "/images/hero-house.png",
          alt:
            settings?.heroImage?.alt ||
            settings?.heroImage?.title ||
            "Neighborhood overview",
        }}
      />

      <NeighborhoodsFilterList
        items={items}
        markets={Array.isArray(markets) ? markets.map((m: any) => ({ name: m.name, slug: m.slug?.current || slugify(m.name) })) : []}
        marketHeroByMunicipality={Object.fromEntries(marketHeroByMunicipality)}
        introHeadline={settings?.introHeadline}
        introText={settings?.introText}
      />
      <section className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <div className="eyebrow">Let’s connect</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
              Want a private, data‑driven neighborhood match?
            </h2>
            <p className="mt-3 text-[1.125rem] text-muted leading-relaxed max-w-2xl">
              I’ll share a tailored shortlist with current market metrics, recent
              pricing shifts, and which pockets are moving fastest.
            </p>
          </div>
          <div className="lg:col-span-5">
            <ContactInlineForm
              title="Reach out to Veronica"
              description="Send a short note and I’ll reply with a curated market brief."
              submitLabel="Send message"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
