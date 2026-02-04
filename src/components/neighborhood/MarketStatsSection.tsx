import { MarketCharts } from "./MarketCharts";

type TrendPoint = {
  month: string;
  medianListingPrice?: number | null;
  pricePerSqft?: number | null;
  activeListingCount?: number | null;
  pendingListingCount?: number | null;
  medianDaysOnMarket?: number | null;
  medianListingPriceYoY?: number | null;
  marketHotnessScore?: number | null;
  marketHotnessRank?: number | null;
};

type MarketStatsProps = {
  neighborhood: string;
  trend: TrendPoint[];
  sourceLabel?: string | null;
  sourceUrl?: string | null;
};

function formatMoney(n?: number | null) {
  if (!n || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function formatNumber(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

function formatPct(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function TrendBadge({ value }: { value?: number | null }) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const up = value > 0;
  const down = value < 0;
  const arrow = up ? "↑" : down ? "↓" : "→";
  const tone = up ? "text-[rgb(var(--prestige))]" : down ? "text-[rgb(var(--error))]" : "text-muted";
  return (
    <span className={`ml-2 text-xs ${tone}`}>
      {arrow} {formatPct(value)}
    </span>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center group ml-2">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] text-muted normal-case leading-none">
        i
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-bg px-3 py-2 text-[11px] text-muted normal-case opacity-0 shadow-lg transition group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

function calcTrend(trend: TrendPoint[], key: keyof TrendPoint) {
  if (!Array.isArray(trend) || trend.length < 2) return null;
  const last = trend[trend.length - 1]?.[key];
  const prev = trend[trend.length - 2]?.[key];
  if (typeof last !== "number" || typeof prev !== "number" || prev === 0) return null;
  return ((last - prev) / prev) * 100;
}

function formatMonth(month: string) {
  const [y, m] = month.split("-");
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const idx = Number(m) - 1;
  return `${monthNames[idx] || m} ${y}`;
}

export function MarketStatsSection({
  neighborhood,
  trend,
  sourceLabel,
  sourceUrl,
}: MarketStatsProps) {
  if (!trend.length) return null;

  const latest = trend[trend.length - 1];
  const statsMonth = formatMonth(latest.month);
  const priceMoM = calcTrend(trend, "medianListingPrice");
  const pricePerSqftMoM = calcTrend(trend, "pricePerSqft");
  const activeMoM = calcTrend(trend, "activeListingCount");
  const domMoM = calcTrend(trend, "medianDaysOnMarket");
  const hotnessMoM = calcTrend(trend, "marketHotnessScore");

  return (
    <section className="container-page py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Market Snapshot</div>
          <h2 className="mt-2 text-3xl font-semibold">
            {neighborhood} Market Trends
          </h2>
          <p className="mt-3 text-sm text-muted">
            Updated {statsMonth}. Metrics reflect ZIP-level housing data.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="border-t border-border/60 pt-4 flex flex-col">
          <div className="text-xs uppercase tracking-[0.18em] text-muted min-h-[2.6rem]">
            Median Listing Price
            <InfoTip text="The midpoint listing price for homes currently on the market in this ZIP. Useful for understanding current seller pricing." />
          </div>
          <div className="mt-2 text-2xl font-semibold min-h-[2.25rem] flex items-end">
            {formatMoney(latest.medianListingPrice)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span>YoY</span>
            <TrendBadge value={latest.medianListingPriceYoY} />
            <span>MoM</span>
            <TrendBadge value={priceMoM} />
          </div>
        </div>
        <div className="border-t border-border/60 pt-4 flex flex-col">
          <div className="text-xs uppercase tracking-[0.18em] text-muted min-h-[2.6rem]">
            Price Per Sqft
            <InfoTip text="Median listing price divided by square footage. Helps compare value across different home sizes." />
          </div>
          <div className="mt-2 text-2xl font-semibold min-h-[2.25rem] flex items-end">
            {formatMoney(latest.pricePerSqft)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span>MoM</span>
            <TrendBadge value={pricePerSqftMoM} />
          </div>
        </div>
        <div className="border-t border-border/60 pt-4 flex flex-col">
          <div className="text-xs uppercase tracking-[0.18em] text-muted min-h-[2.6rem]">
            Active Listings
            <InfoTip text="Number of homes currently listed for sale in this ZIP. A quick read on available inventory." />
          </div>
          <div className="mt-2 text-2xl font-semibold min-h-[2.25rem] flex items-end">
            {formatNumber(latest.activeListingCount)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span>Pending {formatNumber(latest.pendingListingCount)}</span>
            <TrendBadge value={latest.activeListingCountYoY} />
            <TrendBadge value={activeMoM} />
          </div>
        </div>
        <div className="border-t border-border/60 pt-4 flex flex-col">
          <div className="text-xs uppercase tracking-[0.18em] text-muted min-h-[2.6rem]">
            Median Days on Market
            <InfoTip text="Median number of days a home stays on the market before going under contract. Lower often indicates stronger demand." />
          </div>
          <div className="mt-2 text-2xl font-semibold min-h-[2.25rem] flex items-end">
            {formatNumber(latest.medianDaysOnMarket)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span>MoM</span>
            <TrendBadge value={domMoM} />
          </div>
        </div>
        <div className="border-t border-border/60 pt-4 flex flex-col">
          <div className="text-xs uppercase tracking-[0.18em] text-muted min-h-[2.6rem]">
            Market Hotness
            <InfoTip text="A composite score reflecting demand vs. supply for this ZIP. Higher scores indicate a more competitive market." />
          </div>
          <div className="mt-2 text-2xl font-semibold min-h-[2.25rem] flex items-end">
            {formatNumber(latest.marketHotnessScore)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span>MoM</span>
            <TrendBadge value={hotnessMoM} />
          </div>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
            <span className="uppercase tracking-[0.18em] text-muted">Rank</span>
            <span className="font-semibold text-text">{formatNumber(latest.marketHotnessRank)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <MarketCharts trend={trend} />
      </div>

      <div className="mt-4 text-xs text-muted">
        Source:{" "}
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline">
            {sourceLabel || "Realtor.com® Economic Research"}
          </a>
        ) : (
          sourceLabel || "Realtor.com® Economic Research"
        )}
      </div>
    </section>
  );
}
