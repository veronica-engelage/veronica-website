import Image from "next/image";
import type { Metadata } from "next";
import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityClient } from "@/sanity/client";
import PortableText from "@/components/PortableText";
import { MarketStatsSection } from "@/components/neighborhood/MarketStatsSection";
import { MapboxMap } from "@/components/neighborhood/MapboxMap";
import zipCentroids from "@/data/zip-centroids.json";
import { IDXPlaceholder } from "@/components/neighborhood/IDXPlaceholder";
import { getSiteSettings } from "@/lib/siteSettings";
import { ContactInlineForm } from "@/components/ContactInlineForm";
import { SpacerDivider } from "@/components/sections/SpacerDivider";

export const revalidate = 86400;

const neighborhoodQuery = groq`
  *[_type == "neighborhood" && slug.current == $slug][0]{
    _id,
    name,
    municipality,
    "slug": slug.current,
    summary,
    overview,
    lifestyle,
    schools[]{
      name,
      level,
      type,
      ratingLabel,
      ratingValue,
      ratingYear,
      sourceUrl,
      qualitativeNote
    },
    amenities,
    buyerInsights,
    sellerInsights,
    highlights,
    map{
      centerLat,
      centerLng,
      zoom,
      boundaryGeoJsonUrl
    },
    zipMappings[]{ zip, weight },
    faqs[]{ question, answer },
    seo{
      title,
      description,
      ogImage
    },
    heroImage->{
      title,
      alt,
      image{asset->{url, metadata{dimensions}}}
    },
    heroHeadline,
    heroSubheadline
  }
`;

const marketHeroQuery = groq`
  *[_type == "market" && municipality == $municipality][0]{
    heroImage->{
      title,
      alt,
      image{asset->{url}}
    }
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
      inventoryMonths,
      sourceLabel,
      sourceUrl
    }
`;

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

type ZipMapping = { zip: string; weight?: number | null };
type SchoolEntry = {
  name: string;
  level?: string | null;
  type?: string | null;
  ratingLabel?: string | null;
  ratingValue?: number | null;
  ratingYear?: string | null;
  sourceUrl?: string | null;
  qualitativeNote?: string | null;
};

type ZipCentroidMap = Record<string, { lat: number; lng: number }>;

type MarketPlaceholderValues = {
  marketMonth: string;
  medianListingPrice: string;
  activeListingCount: string;
  medianDaysOnMarket: string;
};

function weightedSeries(stats: MarketStat[], mappings: ZipMapping[]) {
  if (!stats.length || !mappings.length) return [];

  const weights = new Map<string, number>();
  mappings.forEach((m) => {
    if (!m?.zip) return;
    weights.set(m.zip, typeof m.weight === "number" ? m.weight : 1);
  });

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
    const weightSum = items.reduce((acc, item) => acc + (weights.get(item.zip) || 0), 0) || 1;

    const weightedAvg = (valueKey: keyof MarketStat) => {
      let total = 0;
      let totalWeight = 0;
      items.forEach((item) => {
        const v = item[valueKey];
        const w = weights.get(item.zip) || 0;
        if (typeof v === "number") {
          total += v * w;
          totalWeight += w;
        }
      });
      return totalWeight ? total / totalWeight : null;
    };

    const weightedSum = (valueKey: keyof MarketStat) => {
      let total = 0;
      let hasValue = false;
      items.forEach((item) => {
        const v = item[valueKey];
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

function formatMoney(n?: number | null) {
  if (!n || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function formatNumber(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

function formatMonthShort(month: string) {
  const [y, m] = month.split("-");
  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const idx = Number(m) - 1;
  const yy = y?.slice(-2) || y;
  return `${monthNames[idx] || m} '${yy}`;
}

function applyMarketPlaceholders(text: string | null | undefined, values: MarketPlaceholderValues) {
  if (!text) return "";
  return text
    .replaceAll("{{marketMonth}}", values.marketMonth)
    .replaceAll("{{medianListingPrice}}", values.medianListingPrice)
    .replaceAll("{{activeListingCount}}", values.activeListingCount)
    .replaceAll("{{medianDaysOnMarket}}", values.medianDaysOnMarket);
}

function formatNeighborhoodTitle(name: string, municipality?: string | null) {
  const muni = municipality ? `, ${municipality}` : "";
  return `${name}${muni} Real Estate`;
}

function computeCenterFromZips(mappings: ZipMapping[]) {
  const centroids = zipCentroids as ZipCentroidMap;
  let totalWeight = 0;
  let latSum = 0;
  let lngSum = 0;

  mappings.forEach((m) => {
    const z = m.zip;
    const c = centroids[z];
    if (!c) return;
    const w = typeof m.weight === "number" ? m.weight : 1;
    latSum += c.lat * w;
    lngSum += c.lng * w;
    totalWeight += w;
  });

  if (!totalWeight) return null;
  return { lat: latSum / totalWeight, lng: lngSum / totalWeight };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = await sanityClient.fetch(neighborhoodQuery, { slug });
  if (!neighborhood) return {};

  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = settings?.siteUrl || "https://veronicachs.com";
  const canonical = `${siteUrl}/neighborhoods/${neighborhood.slug}`;

  const title =
    neighborhood?.seo?.title ||
    formatNeighborhoodTitle(neighborhood.name, neighborhood.municipality);
  const description =
    neighborhood?.seo?.description ||
    neighborhood.summary ||
    `Explore ${neighborhood.name} real estate, lifestyle, and market trends in ${neighborhood.municipality || "Charleston, SC"}.`;

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

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const neighborhood = await sanityClient.fetch(neighborhoodQuery, { slug });
  if (!neighborhood) return notFound();
  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = settings?.siteUrl || "https://veronicachs.com";

  const zipMappings: ZipMapping[] = Array.isArray(neighborhood.zipMappings)
    ? neighborhood.zipMappings.filter((z: ZipMapping) => z?.zip)
    : [];
  const zips = zipMappings.map((z) => z.zip);

  const stats = zips.length
    ? await sanityClient.fetch<MarketStat[]>(statsQuery, { zips })
    : [];

  const series = weightedSeries(stats, zipMappings).slice(-12);
  const latest = series[series.length - 1];
  const latestSource = stats[stats.length - 1];

  const marketPlaceholderValues: MarketPlaceholderValues = {
    marketMonth: latest?.month ? formatMonthShort(latest.month) : "latest",
    medianListingPrice: formatMoney(latest?.medianListingPrice),
    activeListingCount: formatNumber(latest?.activeListingCount),
    medianDaysOnMarket: formatNumber(latest?.medianDaysOnMarket),
  };

  const marketHero =
    neighborhood?.municipality
      ? await sanityClient.fetch(marketHeroQuery, {
          municipality: neighborhood.municipality,
        })
      : null;

  const heroUrl =
    neighborhood?.heroImage?.image?.asset?.url ||
    marketHero?.heroImage?.image?.asset?.url ||
    "/images/hero-house.png";

  const heroAlt =
    neighborhood?.heroImage?.alt ||
    neighborhood?.heroImage?.title ||
    marketHero?.heroImage?.alt ||
    marketHero?.heroImage?.title ||
    neighborhood.name;

  const headline =
    neighborhood.heroHeadline || formatNeighborhoodTitle(neighborhood.name, neighborhood.municipality);
  const subheadline =
    neighborhood.heroSubheadline ||
    `A warm, factual guide to ${neighborhood.name} with market insights curated by Veronica Engelage.`;

  const mapCenter =
    neighborhood?.map?.centerLat && neighborhood?.map?.centerLng
      ? { lat: neighborhood.map.centerLat, lng: neighborhood.map.centerLng }
      : computeCenterFromZips(zipMappings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: neighborhood.name,
    description: neighborhood.summary || subheadline,
    url: `${siteUrl}/neighborhoods/${neighborhood.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: neighborhood.municipality || "Mount Pleasant",
      addressRegion: "SC",
      addressCountry: "US",
    },
    geo: mapCenter
      ? {
          "@type": "GeoCoordinates",
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
        }
      : undefined,
  };

  const schools: SchoolEntry[] = Array.isArray(neighborhood.schools)
    ? neighborhood.schools
    : [];

  return (
    <main>
      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6">
            <div className="eyebrow">Neighborhood Guide</div>
            <h1 className="mt-3 text-4xl sm:text-5xl tracking-tight">{headline}</h1>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
              {subheadline}
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden border border-border rounded-none">
              <Image
                src={heroUrl}
                alt={heroAlt}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-6 pt-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-[0.18em] text-muted/80">Jump to</span>
          <a href="#overview" className="hover:text-text transition">Overview</a>
          <a href="#lifestyle" className="hover:text-text transition">Lifestyle</a>
          {schools.length ? (
            <a href="#schools" className="hover:text-text transition">Schools</a>
          ) : null}
          <a href="#stats" className="hover:text-text transition">Market Stats</a>
          <a href="#insights" className="hover:text-text transition">Insights</a>
          <a href="#map" className="hover:text-text transition">Map</a>
          <a href="#listings" className="hover:text-text transition">Listings</a>
          {Array.isArray(neighborhood.faqs) && neighborhood.faqs.length ? (
            <a href="#faq" className="hover:text-text transition">FAQ</a>
          ) : null}
        </div>
        <div className="mt-5 border-t border-border/50" />
      </section>

      <section id="overview" className="container-page pb-12 scroll-mt-24">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
              Why {neighborhood.name}
            </h2>

            <div className="mt-5">
              <div className="eyebrow">At a Glance</div>
              <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {[...(neighborhood.highlights || []), ...(neighborhood.amenities || [])]
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((item: string, i: number) => (
                    <div key={i} className="border-t border-border/60 pt-2 text-base text-muted leading-relaxed">
                      {item}
                    </div>
                  ))}
              </div>
            </div>

            {neighborhood.overview || neighborhood.lifestyle ? (
              <div className="mt-10 grid gap-8 border-t border-border/60 pt-6 lg:grid-cols-2">
                {neighborhood.overview ? (
                  <div>
                    <div className="eyebrow">Overview</div>
                    <div className="mt-4">
                      <PortableText value={neighborhood.overview} />
                    </div>
                  </div>
                ) : null}
                {neighborhood.lifestyle ? (
                  <div id="lifestyle" className="scroll-mt-24">
                    <div className="eyebrow">Lifestyle & Vibe</div>
                    <div className="mt-4">
                      <PortableText value={neighborhood.lifestyle} />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {schools.length ? (
        <>
          <SpacerDivider space="md" />
          <section id="schools" className="container-page py-12 scroll-mt-24">
            <div className="eyebrow">Schools</div>
            <h2 className="mt-2 text-3xl font-semibold">Schools & Education</h2>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-2xl">
              School quality data is sourced from the South Carolina School Report Cards.
            </p>
            <div className="mt-6 grid gap-y-6 gap-x-10 md:grid-cols-2">
              {schools.map((school, i) => (
                <div key={`${school.name}-${i}`} className="border-t border-border pt-4">
                  <div className="text-lg font-semibold text-text">{school.name}</div>
                  <div className="mt-2 text-sm text-muted">
                    {[school.level, school.type].filter(Boolean).join(" · ")}
                  </div>
                  {school.qualitativeNote ? (
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {school.qualitativeNote}
                    </p>
                  ) : null}
                  {(school.ratingLabel || school.ratingValue) ? (
                    <div className="mt-2 text-sm text-text">
                      <span className="text-muted">SC Report Card:</span>{" "}
                      <span className="font-semibold">
                        {school.ratingLabel || school.ratingValue}
                      </span>
                      {school.ratingYear ? (
                        <span className="text-muted"> · {school.ratingYear}</span>
                      ) : null}
                    </div>
                  ) : null}
                  {school.sourceUrl ? (
                    <a
                      href={school.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-muted underline underline-offset-4 hover:text-text"
                    >
                      View official report
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <SpacerDivider space="md" />

      {series.length ? (
        <div id="stats" className="scroll-mt-24">
          <MarketStatsSection
            neighborhood={neighborhood.name}
            trend={series}
            sourceLabel={latestSource?.sourceLabel}
            sourceUrl={latestSource?.sourceUrl}
          />
        </div>
      ) : null}

      <SpacerDivider space="md" />

      <section id="insights" className="container-page py-12 scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="eyebrow">Insights</div>
            <h2 className="mt-2 text-3xl font-semibold">
              Buying & Selling in {neighborhood.name}
            </h2>

            {neighborhood.buyerInsights ? (
              <div className="mt-6">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">
                  For Buyers
                </div>
                <div className="mt-3">
                  <PortableText value={neighborhood.buyerInsights} />
                </div>
              </div>
            ) : null}

            {neighborhood.sellerInsights ? (
              <div className="mt-8">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">
                  For Sellers
                </div>
                <div className="mt-3">
                  <PortableText value={neighborhood.sellerInsights} />
                </div>
              </div>
            ) : null}
          </div>

          <div id="map" className="lg:col-span-5 scroll-mt-24">
            <div className="eyebrow">Neighborhood Map</div>
            <MapboxMap
              title={`${neighborhood.name}, ${neighborhood.municipality || "SC"}`}
              center={mapCenter || undefined}
              zoom={neighborhood?.map?.zoom || 12}
              boundaryGeoJsonUrl={neighborhood?.map?.boundaryGeoJsonUrl || null}
            />
          </div>
        </div>
      </section>

      <section id="listings" className="container-page py-16 scroll-mt-24">
        <IDXPlaceholder neighborhood={neighborhood.name} />
      </section>

      {Array.isArray(neighborhood.faqs) && neighborhood.faqs.length ? (
        <>
          <SpacerDivider space="md" />
          <section id="faq" className="container-page py-12 scroll-mt-24">
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-2 text-3xl font-semibold">
              {neighborhood.name} Questions, Answered
            </h2>
            <div className="mt-6 grid gap-y-6 gap-x-10 md:grid-cols-2">
              {neighborhood.faqs.map((faq: any, i: number) => (
                <div key={i} className="border-t border-border pt-4">
                  <div className="text-sm font-semibold">
                    {applyMarketPlaceholders(faq.question, marketPlaceholderValues)}
                  </div>
                  <p className="mt-3 text-sm text-muted leading-relaxed">
                    {applyMarketPlaceholders(faq.answer, marketPlaceholderValues)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <SpacerDivider tone="prestige" space="md" />

      <section className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <div className="eyebrow">Let’s connect</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
              Want a private, data‑driven neighborhood match?
            </h2>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-2xl">
              I’ll share a tailored shortlist with current market metrics, recent
              pricing shifts, and which pockets are moving fastest.
            </p>
          </div>
          <div className="lg:col-span-5">
            <ContactInlineForm
              title="Reach out to Veronica"
              description="If any of the listings above caught your eye, I’ll share details and a tailored market brief."
              submitLabel="Send message"
            />
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        // @ts-ignore
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
