"use client";

import Link from "next/link";
import type { MarketOverviewTeaser } from "@/lib/marketOverview";

const palette = [
  "text-border", // Daniel Island
  "text-[rgb(var(--prestige))]", // Charleston Peninsula
  "text-brand", // Mount Pleasant
  "text-text", // Area median price (foreground)
];

const dotPalette = [
  "bg-border",
  "bg-[rgb(var(--prestige))]",
  "bg-[rgb(var(--brand))]",
  "bg-text",
];

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

function formatMoney(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}`;
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

const fixedTicks = [750000, 1000000, 1250000, 1500000];

export default function MarketOverviewTeaserChart({
  data,
}: {
  data: MarketOverviewTeaser;
}) {
  const width = 680;
  const height = 230;
  const padding = { left: 28, right: 0, top: 10, bottom: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const allValues = data.series.flatMap((s) => s.values).filter((v) => Number.isFinite(v));
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 1;
  const pad = (max - min) * 0.08 || 1;
  const minY = Math.min(min - pad, ...fixedTicks);
  const maxY = Math.max(max + pad, ...fixedTicks);
  const ticks = fixedTicks;

  return (
    <div className="mt-6">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">
        Median price trend · 24 months
      </div>
      <div className="mt-3 rounded-md border border-border/70 bg-bg/60 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px]">
          {ticks.map((value) => {
            const y = padding.top + (1 - (value - minY) / (maxY - minY || 1)) * plotHeight;
            return (
              <g key={`tick-${value}`}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border/60"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y - 4}
                  textAnchor="end"
                  className="text-[10px] fill-muted"
                >
                  {formatMoney(value)}
                </text>
              </g>
            );
          })}
          {data.months.length ? (
            data.months
              .filter((_, idx) => idx === 0 || idx === Math.floor((data.months.length - 1) / 2) || idx === data.months.length - 1)
              .map((month, idx, arr) => {
                const monthIndex = data.months.indexOf(month);
                const x = padding.left + (monthIndex / Math.max(1, data.months.length - 1)) * plotWidth;
                return (
                  <g key={`x-${month}`}>
                    <line
                      x1={x}
                      y1={height - padding.bottom}
                      x2={x}
                      y2={height - padding.bottom + 6}
                      stroke="currentColor"
                      className="text-border/60"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={height - padding.bottom + 20}
                      textAnchor="middle"
                      className="text-[10px] fill-muted"
                    >
                      {formatMonthLabel(month)}
                    </text>
                  </g>
                );
              })
          ) : null}
          {data.series.map((series, idx) => (
            <path
              key={series.id}
              d={buildLinePath(series.values, plotWidth, plotHeight, padding.left, padding.top, minY, maxY)}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={palette[idx] || "text-text"}
            />
          ))}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        {[...data.series]
          .sort((a, b) => {
            const order = ["Area median price", "Charleston Peninsula", "Mount Pleasant", "Daniel Island"];
            return order.indexOf(a.label) - order.indexOf(b.label);
          })
          .map((series) => {
            const idx = data.series.findIndex((s) => s.id === series.id);
            const last = [...series.values].reverse().find((v) => Number.isFinite(v));
            const href =
              series.label === "Area median price"
                ? "/markets/overview"
                : series.label === "Mount Pleasant"
                  ? "/markets/mount-pleasant"
                  : series.label === "Charleston Peninsula"
                    ? "/markets/charleston-peninsula"
                    : series.label === "Daniel Island"
                      ? "/markets/daniel-island"
                      : null;
            return (
              <div key={series.id} className="flex items-center gap-2">
                <span className={`h-2 w-6 rounded-full ${dotPalette[idx] || "bg-text"}`} />
                {href ? (
                  <Link
                    href={href}
                    className="text-text underline underline-offset-4 hover:text-[rgb(var(--prestige))]"
                  >
                    {series.label}
                  </Link>
                ) : (
                  <span>{series.label}</span>
                )}
                <span className="text-text">{formatMoney(last ?? null)}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
