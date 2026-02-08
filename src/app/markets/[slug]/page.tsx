import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityClient } from "@/sanity/client";
import { HeroSection } from "@/components/sections/HeroSection";
import { MarketStatsSection } from "@/components/neighborhood/MarketStatsSection";
import { getSiteSettings } from "@/lib/siteSettings";
import { ContactInlineForm } from "@/components/ContactInlineForm";

export const revalidate = 86400;

const marketQuery = groq`
  *[_type == "market" && slug.current == $slug][0]{
    _id,
    name,
    municipality,
    "slug": slug.current,
    summary,
    overview,
    heroHeadline,
    heroSubheadline,
    heroImage->{
      title,
      alt,
      image{asset->{url, metadata{dimensions}}}
    }
  }
`;

const neighborhoodQuery = groq`
  *[_type == "neighborhood" && municipality == $municipality] | order(name asc) {
    _id,
    name,
    municipality,
    "slug": slug.current,
    summary,
    zipMappings[]{ zip, weight }
  }
`;

const statsQuery = groq`
  *[_type == "marketStatMonthly" && zip in $zips]
    | order(month asc){
      zip,
      month,
      medianListingPrice,
      medianListingPriceYoY,
      medianListingPriceMoM,
      pricePerSqft,
      activeListingCount,
      activeListingCountYoY,
      pendingListingCount,
      medianDaysOnMarket,
      marketHotnessScore,
      marketHotnessRank,
      sourceLabel,
      sourceUrl
    }
`;

type Neighborhood = {
  _id: string;
  name: string;
  municipality?: string | null;
  slug: string;
  summary?: string | null;
  zipMappings?: Array<{ zip: string; weight?: number | null }>;
};

type MarketStat = {
  zip: string;
  month: string;
  medianListingPrice?: number | null;
  medianListingPriceYoY?: number | null;
  pricePerSqft?: number | null;
  activeListingCount?: number | null;
  pendingListingCount?: number | null;
  medianDaysOnMarket?: number | null;
  marketHotnessScore?: number | null;
  marketHotnessRank?: number | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
};

const heroFallback = "/images/hero-house.png";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const market = await sanityClient.fetch(marketQuery, { slug });
  if (!market) return {};

  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = (settings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");
  const canonicalBase = siteUrl.replace("https://veronicachs.com", "https://www.veronicachs.com");
  const canonical = `${canonicalBase}/markets/${market.slug}`;

  const title = `${market.name} Real Estate Market | Veronica Engelage`;
  const description =
    market.summary ||
    `Explore ${market.name} real estate with this curated guide to market stats and lifestyle insights.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
  };
}

function weightedSeries(stats: MarketStat[], weights: Map<string, number>) {
  if (!stats.length || !weights.size) return [];

  const byMonth = new Map<string, MarketStat[]>();
  stats.forEach((s) => {
    if (!s.month) return;
    const list = byMonth.get(s.month) || [];
    list.push(s);
    byMonth.set(s.month, list);
  });

  const months = Array.from(byMonth.keys()).sort();

  const points = months.map((month) => {
    const items = byMonth.get(month) || [];
    const weightedAvg = (key: keyof MarketStat) => {
      let total = 0;
      let totalWeight = 0;
      items.forEach((item) => {
        const v = item[key];
        const w = weights.get(item.zip) || 0;
        if (typeof v === "number") {
          total += v * w;
          totalWeight += w;
        }
      });
      return totalWeight ? total / totalWeight : null;
    };
    const weightedSum = (key: keyof MarketStat) => {
      let total = 0;
      let hasValue = false;
      items.forEach((item) => {
        const v = item[key];
        const w = weights.get(item.zip) || 0;
        if (typeof v === "number") {
          total += v * w;
          hasValue = true;
        }
      });
      return hasValue ? total : null;
    };

    return {
      month,
      medianListingPrice: weightedAvg("medianListingPrice"),
      medianListingPriceYoY: weightedAvg("medianListingPriceYoY"),
      pricePerSqft: weightedAvg("pricePerSqft"),
      activeListingCount: weightedSum("activeListingCount"),
      pendingListingCount: weightedSum("pendingListingCount"),
      medianDaysOnMarket: weightedAvg("medianDaysOnMarket"),
      marketHotnessScore: weightedAvg("marketHotnessScore"),
      marketHotnessRank: weightedAvg("marketHotnessRank"),
    };
  });

  return points;
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const market = await sanityClient.fetch(marketQuery, { slug });
  if (!market) return notFound();
  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = (settings?.siteUrl || "https://veronicachs.com").replace(/\/+$/, "");

  const municipality = market.municipality;
  const inMarket = await sanityClient.fetch<Neighborhood[]>(neighborhoodQuery, { municipality });

  const zipWeights = new Map<string, number>();
  inMarket.forEach((n) => {
    (n.zipMappings || []).forEach((z) => {
      if (!z?.zip) return;
      const w = typeof z.weight === "number" ? z.weight : 1;
      zipWeights.set(z.zip, (zipWeights.get(z.zip) || 0) + w);
    });
  });

  const zips = Array.from(zipWeights.keys());
  const stats = zips.length
    ? await sanityClient.fetch<MarketStat[]>(statsQuery, { zips })
    : [];

  const series = weightedSeries(stats, zipWeights).slice(-12);
  const latest = stats[stats.length - 1];

  const breadcrumbItems = [
    { name: "Home", url: `${siteUrl}/`, href: "/" },
    { name: "Markets", url: `${siteUrl}/markets`, href: "/markets" },
    {
      name: market.name || municipality,
      url: `${siteUrl}/markets/${market.slug}`,
      href: `/markets/${market.slug}`,
    },
  ];

  return (
    <main>
      <nav aria-label="Breadcrumb" className="container-page pt-6">
        <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-[11px] uppercase tracking-[0.18em] text-muted">
          <li>
            <Link href={breadcrumbItems[0].href} className="hover:text-text">
              {breadcrumbItems[0].name}
            </Link>
          </li>
          <li className="opacity-60">›</li>
          <li>
            <Link href={breadcrumbItems[1].href} className="hover:text-text">
              {breadcrumbItems[1].name}
            </Link>
          </li>
          <li className="opacity-60">›</li>
          <li className="text-text">{breadcrumbItems[2].name}</li>
        </ol>
      </nav>

      <HeroSection
        eyebrow="Community"
        headline={market.heroHeadline || `${municipality} Market`}
        subheadline={
          market.heroSubheadline ||
          `A community‑level overview of market momentum, pricing trends, and the neighborhoods that define ${municipality}.`
        }
        layout="split"
        variant="standard"
        media={{
          url: market.heroImage?.image?.asset?.url || heroFallback,
          alt: market.heroImage?.alt || `${municipality} market`,
        }}
      />

      {series.length ? (
        <MarketStatsSection
          neighborhood={municipality}
          trend={series}
          sourceLabel={latest?.sourceLabel}
          sourceUrl={latest?.sourceUrl}
        />
      ) : null}

      <section className="container-page pb-12">
        <div className="eyebrow">Neighborhoods</div>
        <h2 className="mt-2 text-3xl font-semibold">{municipality} Communities</h2>
        <div className="mt-6 grid gap-y-6 gap-x-10 sm:grid-cols-2">
          {inMarket.map((n) => (
            <div key={n._id} className="border-t border-border pt-4">
              <div className="text-lg font-semibold text-text">{n.name}</div>
              {n.summary ? (
                <p className="mt-2 text-[1.125rem] text-muted line-clamp-3">{n.summary}</p>
              ) : null}
              <div className="mt-3">
                <Link href={`/neighborhoods/${n.slug}`} className="btn-tertiary inline-flex">
                  Explore this community
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

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
