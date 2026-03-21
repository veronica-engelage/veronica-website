"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Market, Neighborhood, TrendPoint } from "@/lib/marketOverview";

function formatMoney(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
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

function latestValue(trend: TrendPoint[], key: keyof TrendPoint) {
  const last = trend[trend.length - 1];
  return last?.[key] ?? null;
}

export default function MarketOverviewDrilldown({
  markets,
  neighborhoods,
  neighborhoodTrendsById,
  showHeader = true,
}: {
  markets: (Market & { neighborhoodIds: string[] })[];
  neighborhoods: (Neighborhood & { marketId?: string | null })[];
  neighborhoodTrendsById: Record<string, TrendPoint[]>;
  showHeader?: boolean;
}) {
  if (!markets.length) return null;
  const [marketId, setMarketId] = useState(markets[0]?._id || "");

  const rows = useMemo(() => {
    const items = neighborhoods
      .filter((n) => n.marketId === marketId)
      .map((n) => {
        const trend = neighborhoodTrendsById[n._id] || [];
        return {
          id: n._id,
          name: n.name,
          slug: n.slug,
          medianListingPrice: latestValue(trend, "medianListingPrice"),
          medianDaysOnMarket: latestValue(trend, "medianDaysOnMarket"),
          marketHotnessScore: latestValue(trend, "marketHotnessScore"),
          medianListingPriceYoY: latestValue(trend, "medianListingPriceYoY"),
        };
      });

    return items.sort((a, b) => {
      if (a.medianListingPrice === null) return 1;
      if (b.medianListingPrice === null) return -1;
      return b.medianListingPrice - a.medianListingPrice;
    });
  }, [marketId, neighborhoods, neighborhoodTrendsById]);

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="lg:col-span-5">
        {showHeader ? (
          <>
            <div className="eyebrow">Market drilldown</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
              Neighborhood rankings within a market
            </h2>
            <p className="mt-3 text-[1.05rem] text-muted leading-relaxed">
              See which neighborhoods lead on price, pace, and demand.
            </p>
          </>
        ) : null}
        <div className="mt-4">
          <select
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
            value={marketId}
            onChange={(event) => setMarketId(event.target.value)}
          >
            {markets.map((market) => (
              <option key={market._id} value={market._id}>
                {market.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="card p-5">
          <div className="grid grid-cols-5 text-xs uppercase tracking-[0.18em] text-muted">
            <div>Neighborhood</div>
            <div>Median Price</div>
            <div>Days</div>
            <div>Hotness</div>
            <div>YoY</div>
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-5 items-center rounded-md border border-border/60 px-3 py-2 text-muted"
              >
                <Link
                  href={`/neighborhoods/${row.slug}`}
                  className="text-text underline underline-offset-4 hover:text-[rgb(var(--prestige))]"
                >
                  {row.name}
                </Link>
                <div>{formatMoney(row.medianListingPrice)}</div>
                <div>{formatNumber(row.medianDaysOnMarket)}</div>
                <div>{formatNumber(row.marketHotnessScore)}</div>
                <div>{formatPct(row.medianListingPriceYoY)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
