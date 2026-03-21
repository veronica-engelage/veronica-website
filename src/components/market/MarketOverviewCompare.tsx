"use client";

import { useMemo, useState } from "react";
import type { Market, Neighborhood, TrendPoint } from "@/lib/marketOverview";

const metricOptions = [
  { key: "medianListingPrice", label: "Median listing price" },
  { key: "pricePerSqft", label: "Price per sqft" },
  { key: "medianDaysOnMarket", label: "Days on market" },
  { key: "marketHotnessScore", label: "Hotness score" },
  { key: "activeListingCount", label: "Active listings" },
] as const;

type MetricKey = (typeof metricOptions)[number]["key"];

type Series = {
  label: string;
  color: string;
  dot: string;
  values: number[];
};

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  offsetX = 0,
  offsetY = 0,
  minY?: number,
  maxY?: number,
) {
  const clean = values.map((v) => (Number.isFinite(v) ? v : null));
  if (!clean.length) return "";
  if (values.length === 1) {
    const y = offsetY + height * 0.5;
    const x = offsetX + width * 0.5;
    return `M${x.toFixed(1)},${y.toFixed(1)}`;
  }
  const finiteValues = clean.filter((v): v is number => typeof v === "number");
  if (!finiteValues.length) return "";
  const min = minY ?? Math.min(...finiteValues);
  const max = maxY ?? Math.max(...finiteValues);
  const range = max - min || 1;

  let started = false;
  return clean
    .map((v, i) => {
      if (v === null) return "";
      const x = offsetX + (i / (values.length - 1)) * width;
      const t = (v - min) / range;
      const y = offsetY + (height - t * height);
      const cmd = started ? "L" : "M";
      started = true;
      return `${cmd}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");
}

function pickTickIndices(count: number) {
  if (count <= 4) return Array.from({ length: count }, (_, i) => i);
  const last = count - 1;
  const q1 = Math.round(last * 0.33);
  const q2 = Math.round(last * 0.66);
  return Array.from(new Set([0, q1, q2, last])).sort((a, b) => a - b);
}

function formatMonthLabel(month: string) {
  const [y, m] = month.split("-");
  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const idx = Number(m) - 1;
  const label = monthNames[idx] || m;
  return `${label} '${y.slice(-2)}`;
}

function formatMoney(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function formatNumber(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

function valueFormatter(metric: MetricKey) {
  if (metric === "medianListingPrice" || metric === "pricePerSqft") return formatMoney;
  return formatNumber;
}

function toSeriesValues(
  trend: TrendPoint[],
  months: string[],
  metric: MetricKey,
) {
  const byMonth = new Map(trend.map((t) => [t.month, t]));
  return months.map((month) => {
    const value = byMonth.get(month)?.[metric];
    return typeof value === "number" && Number.isFinite(value) ? value : NaN;
  });
}

function latestValue(trend: TrendPoint[], key: keyof TrendPoint) {
  const last = trend[trend.length - 1];
  return last?.[key] ?? null;
}

export default function MarketOverviewCompare({
  markets,
  neighborhoods,
  marketTrendsById,
  neighborhoodTrendsById,
  showHeader = true,
}: {
  markets: (Market & { neighborhoodIds: string[] })[];
  neighborhoods: (Neighborhood & { marketId?: string | null })[];
  marketTrendsById: Record<string, TrendPoint[]>;
  neighborhoodTrendsById: Record<string, TrendPoint[]>;
  showHeader?: boolean;
}) {
  if (!markets.length) return null;

  const [metric, setMetric] = useState<MetricKey>("medianListingPrice");
  const [marketId, setMarketId] = useState(markets[0]?._id || "");

  const filteredNeighborhoods = useMemo(
    () => neighborhoods.filter((n) => n.marketId === marketId),
    [marketId, neighborhoods]
  );
  const [neighborhoodId, setNeighborhoodId] = useState(filteredNeighborhoods[0]?._id || "");

  const marketTrend = marketTrendsById[marketId] || [];
  const neighborhoodTrend = neighborhoodTrendsById[neighborhoodId] || [];
  const months = marketTrend.map((t) => t.month);

  const series: Series[] = useMemo(() => {
    return [
      {
        label: "Market",
        color: "text-brand",
        dot: "bg-[rgb(var(--brand))]",
        values: toSeriesValues(marketTrend, months, metric),
      },
      {
        label: "Neighborhood",
        color: "text-[rgb(var(--prestige))]",
        dot: "bg-[rgb(var(--prestige))]",
        values: toSeriesValues(neighborhoodTrend, months, metric),
      },
    ];
  }, [marketTrend, neighborhoodTrend, months, metric]);

  const allValues = series.flatMap((s) => s.values).filter((v) => Number.isFinite(v));
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 1;
  const pad = (max - min) * 0.1 || 1;
  const minY = min - pad;
  const maxY = max + pad;

  const width = 680;
  const height = 220;
  const padding = { left: 16, right: 16, top: 10, bottom: 36 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const ticks = pickTickIndices(months.length);

  const formatValue = valueFormatter(metric);

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="lg:col-span-5">
        {showHeader ? (
          <>
            <div className="eyebrow">Comparison builder</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
              Market vs Neighborhood
            </h2>
            <p className="mt-3 text-[1.05rem] text-muted leading-relaxed">
              Compare pricing and demand at the market and neighborhood level.
            </p>
          </>
        ) : null}

        <div className="mt-6 grid gap-4">
          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Market</div>
            <select
              className="mt-3 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
              value={marketId}
              onChange={(event) => {
                const next = event.target.value;
                setMarketId(next);
                const nextNeighborhood = neighborhoods.find((n) => n.marketId === next)?._id || "";
                setNeighborhoodId(nextNeighborhood);
              }}
            >
              {markets.map((market) => (
                <option key={market._id} value={market._id}>
                  {market.name}
                </option>
              ))}
            </select>
            <div className="mt-4 grid gap-2 text-sm text-muted">
              <div>Median price · {formatMoney(latestValue(marketTrend, "medianListingPrice"))}</div>
              <div>Days on market · {formatNumber(latestValue(marketTrend, "medianDaysOnMarket"))}</div>
              <div>Hotness score · {formatNumber(latestValue(marketTrend, "marketHotnessScore"))}</div>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Neighborhood</div>
            <select
              className="mt-3 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
              value={neighborhoodId}
              onChange={(event) => setNeighborhoodId(event.target.value)}
            >
              {filteredNeighborhoods.length ? (
                filteredNeighborhoods.map((neighborhood) => (
                  <option key={neighborhood._id} value={neighborhood._id}>
                    {neighborhood.name}
                  </option>
                ))
              ) : (
                <option value="">No neighborhoods mapped</option>
              )}
            </select>
            <div className="mt-4 grid gap-2 text-sm text-muted">
              <div>Median price · {formatMoney(latestValue(neighborhoodTrend, "medianListingPrice"))}</div>
              <div>Days on market · {formatNumber(latestValue(neighborhoodTrend, "medianDaysOnMarket"))}</div>
              <div>Hotness score · {formatNumber(latestValue(neighborhoodTrend, "marketHotnessScore"))}</div>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Metric</div>
            <select
              className="mt-3 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
              value={metric}
              onChange={(event) => setMetric(event.target.value as MetricKey)}
            >
              {metricOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="card p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-muted">
            24-month comparison
          </div>
          <div className="mt-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px]">
              {series.map((item) => (
                <path
                  key={item.label}
                  d={buildLinePath(item.values, plotWidth, plotHeight, padding.left, padding.top, minY, maxY)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={item.color}
                />
              ))}
              {ticks.map((idx) => {
                const x = padding.left + (idx / Math.max(1, months.length - 1)) * plotWidth;
                return (
                  <g key={`tick-${idx}`}>
                    <line
                      x1={x}
                      y1={height - padding.bottom}
                      x2={x}
                      y2={height - padding.bottom + 6}
                      stroke="currentColor"
                      className="text-border"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={height - padding.bottom + 20}
                      textAnchor="middle"
                      className="text-[10px] fill-muted"
                    >
                      {formatMonthLabel(months[idx] || "")}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
            {series.map((item) => {
              const last = [...item.values].reverse().find((v) => Number.isFinite(v));
              return (
                <div key={`${item.label}-legend`} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  <span>{item.label}</span>
                  <span className="text-text">{formatValue(last ?? null)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
