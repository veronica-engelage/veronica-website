"use client";

import { useState } from "react";
import Link from "next/link";
import type { RankingGroup } from "@/lib/marketOverview";

export default function MarketOverviewRankings({
  markets,
  neighborhoods,
  marketOptions,
  showHeader = true,
}: {
  markets: RankingGroup[];
  neighborhoods: RankingGroup[];
  marketOptions: { id: string; name: string }[];
  showHeader?: boolean;
}) {
  const [mode, setMode] = useState<"markets" | "neighborhoods">("markets");
  const groups = mode === "markets" ? markets : neighborhoods;
  const basePath = mode === "markets" ? "/markets" : "/neighborhoods";
  const [marketFilter, setMarketFilter] = useState<string>("all");

  return (
    <>
      {showHeader ? (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Rankings</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
              Leaders by the last 3 months
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              className={mode === "markets" ? "btn btn-primary" : "btn-tertiary"}
              onClick={() => setMode("markets")}
              type="button"
            >
              Markets
            </button>
            <button
              className={mode === "neighborhoods" ? "btn btn-primary" : "btn-tertiary"}
              onClick={() => setMode("neighborhoods")}
              type="button"
            >
              Neighborhoods
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-muted">View</div>
        <div className="flex gap-2">
          <button
            className={mode === "markets" ? "btn btn-primary" : "btn-tertiary"}
            onClick={() => setMode("markets")}
            type="button"
          >
            Markets
          </button>
          <button
            className={mode === "neighborhoods" ? "btn btn-primary" : "btn-tertiary"}
            onClick={() => setMode("neighborhoods")}
            type="button"
          >
            Neighborhoods
          </button>
        </div>
        {mode === "neighborhoods" ? (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted">Market</span>
            <select
              className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
              value={marketFilter}
              onChange={(event) => setMarketFilter(event.target.value)}
            >
              <option value="all">All markets</option>
              {marketOptions.map((market) => (
                <option key={market.id} value={market.id}>
                  {market.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.title} className="card p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">
              {group.title}
            </div>
            <div className="mt-4 grid gap-2 text-sm text-muted">
              {(() => {
                const filtered = group.items.filter((item) =>
                  mode === "neighborhoods" && marketFilter !== "all"
                    ? item.marketId === marketFilter
                    : true
                );
                if (!filtered.length) {
                  return <div className="text-muted">No rankings available.</div>;
                }
                return filtered.slice(0, 5).map((item, idx) => (
                  <div key={`${group.title}-${item.id}`} className="flex items-center gap-3">
                    <span className="text-xs text-muted">{idx + 1}.</span>
                  <Link
                    href={`${basePath}/${item.slug}`}
                    className="text-text underline underline-offset-4 hover:text-[rgb(var(--prestige))]"
                  >
                    {item.name}
                  </Link>
                  </div>
                ));
              })()}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
