import Link from "next/link";
import Image from "next/image";
import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/client";
import { HeroSection } from "@/components/sections/HeroSection";
import { MarketsFilterList } from "@/components/market/MarketsFilterList";
import { ContactInlineForm } from "@/components/ContactInlineForm";

export const revalidate = 86400;

const query = groq`
  *[_type == "market"] | order(order asc, name asc) {
    _id,
    name,
    municipality,
    "slug": slug.current,
    summary,
    heroImage->{
      title,
      alt,
      image{asset->{url, metadata{dimensions}}}
    }
  }
`;

type Market = {
  _id: string;
  name: string;
  municipality?: string | null;
  slug: string;
  summary?: string | null;
  heroImage?: {
    title?: string | null;
    alt?: string | null;
    image?: { asset?: { url?: string | null } } | null;
  } | null;
};

const settingsQuery = groq`
  *[_type == "pageSettings" && pageKey == "markets"][0]{
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

export default async function MarketsIndex() {
  const markets = await sanityClient.fetch<Market[]>(query);
  const settings = await sanityClient.fetch<PageSettings | null>(settingsQuery);
  return (
    <main>
      <HeroSection
        headline={settings?.heroHeadline || "Markets"}
        headlineAs="h2"
        layout="overlay"
        variant="standard"
        media={{
          url: settings?.heroImage?.image?.asset?.url || "/images/hero-house.png",
          alt:
            settings?.heroImage?.alt ||
            settings?.heroImage?.title ||
            "Markets overview",
        }}
      />

      <section className="container-page pt-8">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-text">
              {settings?.introHeadline || "Market overviews with neighborhood‑level clarity."}
            </h1>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-2xl">
              {settings?.introText ||
                "Explore Charleston‑area markets with curated neighborhood context, current pricing signals, and an editorial look at each community."}
            </p>
            <div className="mt-12 max-w-xl">
              <MarketsFilterList markets={markets} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <ContactInlineForm
              title="Reach out to Veronica"
              description="Tell me which markets you’re weighing and I’ll send a tailored snapshot."
              submitLabel="Send request"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-16">
          {markets.map((market) => {
            const hero =
              market.heroImage?.image?.asset?.url || "/images/hero-house.png";
            return (
              <div key={market._id} className="grid gap-6 lg:grid-cols-12 items-center">
                <div className="lg:col-span-5">
                  <div className="relative aspect-[16/9] overflow-hidden border border-border rounded-none">
                    <Image
                      src={hero}
                      alt={market.heroImage?.alt || `${market.name} market`}
                      fill
                      className="object-cover"
                      unoptimized={hero.endsWith(".svg")}
                    />
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="text-sm text-muted">Community</div>
                  <h3 className="mt-2 text-3xl sm:text-4xl font-serif tracking-tight">
                    {market.name}
                  </h3>
                  {market.summary ? (
                    <p className="mt-3 text-sm text-muted leading-relaxed max-w-2xl">
                      {market.summary}
                    </p>
                  ) : null}
                  <div className="mt-4">
                    <Link
                      href={`/markets/${market.slug}`}
                      className="btn-tertiary inline-flex"
                    >
                      Explore {market.name} Market Overview
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <div className="eyebrow">Let’s connect</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
              Want a custom market brief?
            </h2>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-2xl">
              I’ll share a tailored overview with market shifts, pricing signals,
              and the neighborhoods that match your goals.
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
