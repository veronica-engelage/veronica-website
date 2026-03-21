import { HeroSection } from "@/components/sections/HeroSection";
import MarketOverviewCompare from "@/components/market/MarketOverviewCompare";
import MarketOverviewRankings from "@/components/market/MarketOverviewRankings";
import MarketOverviewDrilldown from "@/components/market/MarketOverviewDrilldown";
import MarketOverviewTrend from "@/components/market/MarketOverviewTrend";
import { getMarketOverviewData } from "@/lib/marketOverview";

export const revalidate = 3600;

function formatMoney(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function formatNumber(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

function formatMonth(month?: string | null) {
  if (!month) return "—";
  const [y, m] = month.split("-");
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const idx = Number(m) - 1;
  return `${monthNames[idx] || m} ${y}`;
}

function formatMonthFromDate(date: Date) {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const y = date.getFullYear();
  const m = date.getMonth();
  return `${monthNames[m] || m + 1} ${y}`;
}

export default async function MarketOverviewPage() {
  const data = await getMarketOverviewData();
  const latest = data.overallTrend[data.overallTrend.length - 1];
  const updatedLabel = formatMonthFromDate(new Date());

  const kpis = [
    { label: "Median Listing Price", value: formatMoney(latest?.medianListingPrice) },
    { label: "Price per Sqft", value: formatMoney(latest?.pricePerSqft) },
    { label: "Active Listings", value: formatNumber(latest?.activeListingCount) },
    { label: "Median Days on Market", value: formatNumber(latest?.medianDaysOnMarket) },
    { label: "Hotness Score", value: formatNumber(latest?.marketHotnessScore) },
  ];

  return (
    <main>
      <HeroSection
        headline="Market Overview"
        headlineAs="h2"
        layout="overlay"
        variant="standard"
        media={{
          url: "/images/hero-house.png",
          alt: "Market overview",
        }}
      />

      <section className="container-page pt-10">
        <div className="grid gap-6 lg:grid-cols-12 items-end">
          <div className="lg:col-span-8">
            <div className="eyebrow">Monthly snapshot</div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-serif tracking-tight">
              Charleston Market Pulse
            </h1>
            <p className="mt-3 text-[1.125rem] text-muted leading-relaxed max-w-2xl">
              Side-by-side comparisons across markets and neighborhoods with rolling rankings
              based on the last three months.
            </p>
          </div>
          <div className="lg:col-span-4">
            <div className="card p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">
                Data updated
              </div>
              <div className="mt-2 text-2xl font-semibold text-text">
                {updatedLabel}
              </div>
              <div className="mt-2 text-sm text-muted">
                Latest month: {formatMonth(data.latestMonth)} · 24-month window · 3-month blended rankings
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="card p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">
                {kpi.label}
              </div>
              <div className="mt-3 text-2xl font-semibold text-text">{kpi.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pt-10">
        <nav className="card p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-muted">Jump to</div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <a className="underline underline-offset-4 text-text" href="#market-trajectory">
              Market trajectory
            </a>
            <a className="underline underline-offset-4 text-text" href="#leaders">
              Leaders
            </a>
            <a className="underline underline-offset-4 text-text" href="#drilldown">
              Drilldown
            </a>
            <a className="underline underline-offset-4 text-text" href="#comparison-builder">
              Comparison builder
            </a>
          </div>
        </nav>
      </section>

      <div className="container-page py-10">
        <div className="divider" />
      </div>

      <section id="market-trajectory" className="container-page py-16">
        <div className="mb-10">
          <div className="eyebrow">Trend view</div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
            Market trajectory
          </h2>
          <p className="mt-3 text-[1.05rem] text-muted leading-relaxed">
            Compare movement over the last 24 months with a stable baseline.
          </p>
        </div>
        <MarketOverviewTrend
          markets={data.markets}
          neighborhoods={data.neighborhoods}
          marketTrendsById={data.marketTrendsById}
          neighborhoodTrendsById={data.neighborhoodTrendsById}
          overallTrend={data.overallTrend}
          showHeader={false}
        />
      </section>

      <div className="container-page py-10">
        <div className="divider" />
      </div>

      <section id="leaders" className="container-page py-16">
        <div className="mb-10">
          <div className="eyebrow">Rankings</div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
            Leaders by the last 3 months
          </h2>
          <p className="mt-3 text-[1.05rem] text-muted leading-relaxed">
            Blended rankings show who is leading across pricing and demand signals.
          </p>
        </div>
        <MarketOverviewRankings
          markets={data.rankings.markets}
          neighborhoods={data.rankings.neighborhoods}
          marketOptions={data.markets.map((market) => ({ id: market._id, name: market.name }))}
          showHeader={false}
        />
      </section>

      <div className="container-page py-10">
        <div className="divider" />
      </div>

      <section id="drilldown" className="container-page py-16">
        <div className="mb-10">
          <div className="eyebrow">Market drilldown</div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
            Neighborhood rankings within a market
          </h2>
          <p className="mt-3 text-[1.05rem] text-muted leading-relaxed">
            See which neighborhoods lead on price, pace, and demand.
          </p>
        </div>
        <MarketOverviewDrilldown
          markets={data.markets}
          neighborhoods={data.neighborhoods}
          neighborhoodTrendsById={data.neighborhoodTrendsById}
          showHeader={false}
        />
      </section>

      <div className="container-page py-10">
        <div className="divider" />
      </div>

      <section id="comparison-builder" className="container-page py-16">
        <div className="mb-10">
          <div className="eyebrow">Comparison builder</div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
            Market vs Neighborhood
          </h2>
          <p className="mt-3 text-[1.05rem] text-muted leading-relaxed">
            Compare pricing and demand at the market and neighborhood level.
          </p>
        </div>
        <MarketOverviewCompare
          markets={data.markets}
          neighborhoods={data.neighborhoods}
          marketTrendsById={data.marketTrendsById}
          neighborhoodTrendsById={data.neighborhoodTrendsById}
          showHeader={false}
        />
      </section>

      <div className="container-page py-10">
        <div className="divider" />
      </div>

      <section className="container-page pb-16">
        <details className="card p-5">
          <summary className="cursor-pointer text-sm uppercase tracking-[0.18em] text-muted">
            Data sources & disclosure
          </summary>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <p>
              Market metrics are derived from ZIP-level datasets and rolled up to neighborhoods and markets
              using the mappings in our database. Rankings use a blended view of the last three months.
            </p>
            <p>
              Source: Realtor.com® Economic Research data. All rights reserved.
            </p>
            <p>
              Information is deemed reliable but not guaranteed. Metrics reflect listing activity and may
              not represent closed sales.
            </p>
          </div>
        </details>
      </section>
    </main>
  );
}
