"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const width = 680;
  const height = isMobile ? 340 : 230;
  const padding = isMobile
    ? { left: 84, right: 20, top: 12, bottom: 18 }
    : { left: 24, right: 4, top: 10, bottom: 34 };
  const strokeWidth = isMobile ? 4.5 : 2.5;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const allValues = data.series.flatMap((s) => s.values).filter((v) => Number.isFinite(v));
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 1;
  const pad = (max - min) * (isMobile ? 0.06 : 0.08) || 1;
  const mobileTicks = [1500000, 1250000, 1000000, 750000];
  const minY = isMobile ? mobileTicks[3] : Math.min(min - pad, ...fixedTicks);
  const maxY = isMobile ? Math.max(max + pad, mobileTicks[0]) : Math.max(max + pad, ...fixedTicks);
  const ticks = isMobile ? mobileTicks : fixedTicks;

  return (
    <div className="mt-6">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">
        Median price trend · 24 months
      </div>
      <div className="mt-3 rounded-md bg-bg/60 p-0 sm:p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[340px] sm:h-[260px]"
        >
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
                  className={isMobile ? "text-[24px] fill-muted" : "text-[10px] fill-muted"}
                >
                  {value === 1500000
                    ? "$1.5M"
                    : value === 1250000
                      ? "$1.25M"
                      : value === 1000000
                        ? "$1.0M"
                        : "$750k"}
                </text>
              </g>
            );
          })}
          {data.months.length ? (
            (() => {
              const lastIdx = data.months.length - 1;
              const midIdx = Math.floor(lastIdx / 2);
              const indices = [0, midIdx, lastIdx];
              return indices.map((idx) => {
                const month = data.months[idx];
                if (!month) return null;
                const x = padding.left + (idx / Math.max(1, lastIdx)) * plotWidth;
                const anchor = idx === 0 ? "start" : idx === lastIdx ? "end" : "middle";
                const label =
                  idx === 0 ? "Mar '24" : idx === midIdx ? "Feb '25" : "Feb '26";
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
                      y={height - padding.bottom + (isMobile ? 24 : 20)}
                      textAnchor={anchor}
                      className={isMobile ? "text-[24px] fill-muted" : "text-[10px] fill-muted"}
                    >
                      {label}
                    </text>
                  </g>
                );
              });
            })()
          ) : null}
          {data.series.map((series, idx) => (
            <path
              key={series.id}
              d={buildLinePath(series.values, plotWidth, plotHeight, padding.left, padding.top, minY, maxY)}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
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
