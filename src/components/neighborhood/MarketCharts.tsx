"use client";

import { useState } from "react";

type TrendPoint = {
  month: string; // YYYY-MM
  medianListingPrice?: number | null;
  activeListingCount?: number | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
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

function formatMonthFull(month: string) {
  const [y, m] = month.split("-");
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const idx = Number(m) - 1;
  return `${monthNames[idx] || m} ${y}`;
}

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  offsetX = 0,
  offsetY = 0,
  minY?: number,
  maxY?: number,
) {
  if (values.length === 0) return "";
  if (values.length === 1) {
    const y = offsetY + height * 0.5;
    const x = offsetX + width * 0.5;
    return `M${x.toFixed(1)},${y.toFixed(1)}`;
  }
  const min = minY ?? Math.min(...values);
  const max = maxY ?? Math.max(...values);
  const range = max - min || 1;

  return values
    .map((v, i) => {
      const x = offsetX + (i / (values.length - 1)) * width;
      const t = (v - min) / range;
      const y = offsetY + (height - t * height);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function getPaddedExtent(values: number[]) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.1 || 1;
  return { min: min - pad, max: max + pad };
}

function formatMoney(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function formatMoneySpaced(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `$ ${Math.round(n).toLocaleString()}`;
}

function formatNumber(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

function pickTickIndices(count: number) {
  if (count <= 4) return Array.from({ length: count }, (_, i) => i);
  const last = count - 1;
  const q1 = Math.round(last * 0.33);
  const q2 = Math.round(last * 0.66);
  return Array.from(new Set([0, q1, q2, last])).sort((a, b) => a - b);
}

export function MarketCharts({ trend }: { trend: TrendPoint[] }) {
  const series = trend.filter((p) => p?.medianListingPrice);
  const prices = series.map((p) => p.medianListingPrice as number);
  const inventory = trend.map((p) => p.activeListingCount || 0);
  const invSeries = trend.filter((p) => typeof p.activeListingCount === "number");
  const [priceTip, setPriceTip] = useState<null | { x: number; y: number; primary: string; secondary: string }>(null);
  const [invTip, setInvTip] = useState<null | { x: number; y: number; primary: string; secondary: string }>(null);

  const lineWidth = 520;
  const lineHeight = 180;
  const linePadding = { left: 10, right: 10, top: 6, bottom: 30 };
  const lineSvgHeight = lineHeight + linePadding.top + linePadding.bottom;
  const barHeight = 160;
  const barPadding = { left: 10, right: 10, top: 6, bottom: 30 };
  const barSvgHeight = barHeight + barPadding.top + barPadding.bottom;
  const linePlotWidth = lineWidth - linePadding.left - linePadding.right;
  const barPlotWidth = lineWidth - barPadding.left - barPadding.right;

  const priceExtent = getPaddedExtent(prices);
  const priceRange = priceExtent ? priceExtent.max - priceExtent.min || 1 : 1;
  const linePath = buildLinePath(
    prices,
    linePlotWidth,
    lineHeight - linePadding.top,
    linePadding.left,
    linePadding.top,
    priceExtent?.min,
    priceExtent?.max,
  );

  const invMax = Math.max(...inventory, 1);
  const priceHigh = prices.length ? Math.max(...prices) : null;
  const priceLow = prices.length ? Math.min(...prices) : null;
  const priceLast = prices.length ? prices[prices.length - 1] : null;

  const invValues = invSeries.map((p) => p.activeListingCount as number);
  const invHigh = invValues.length ? Math.max(...invValues) : null;
  const invLow = invValues.length ? Math.min(...invValues) : null;
  const invLast = invValues.length ? invValues[invValues.length - 1] : null;

  const priceTicks = pickTickIndices(series.length);
  const invTicks = pickTickIndices(trend.length);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="card p-5">
        <div className="text-sm uppercase tracking-[0.18em] text-muted">Median Price Trend</div>
        <div className="mt-3 flex gap-3">
          <div className="flex-1 relative">
            <svg
              viewBox={`0 0 ${lineWidth} ${lineSvgHeight}`}
              className="w-full h-[210px]"
              onClick={() => setPriceTip(null)}
            >
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-text"
            />
            {prices.map((value, i) => {
              const x =
                prices.length === 1
                  ? lineWidth * 0.5
                  : linePadding.left + (i / (prices.length - 1)) * linePlotWidth;
              const cy =
                linePadding.top +
                (1 - (value - (priceExtent?.min ?? value)) / priceRange) *
                  (lineHeight - linePadding.top);
              const monthText = formatMonthLabel(series[i].month);
              return (
                <circle
                  key={`${value}-${i}`}
                  cx={x}
                  cy={cy}
                  r="3"
                  tabIndex={0}
                  onMouseEnter={(event) => {
                    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (!bounds) return;
                    setPriceTip({
                      x: event.clientX - bounds.left,
                      y: event.clientY - bounds.top,
                      primary: formatMoneySpaced(value),
                      secondary: `in ${monthText}`,
                    });
                  }}
                  onMouseMove={(event) => {
                    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (!bounds) return;
                    setPriceTip({
                      x: event.clientX - bounds.left,
                      y: event.clientY - bounds.top,
                      primary: formatMoneySpaced(value),
                      secondary: `in ${monthText}`,
                    });
                  }}
                  onMouseLeave={() => setPriceTip(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPriceTip({
                      x,
                      y: cy,
                      primary: formatMoneySpaced(value),
                      secondary: `in ${monthText}`,
                    });
                  }}
                  onFocus={(event) => {
                    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (!bounds) return;
                    setPriceTip({
                      x: x,
                      y: cy,
                      primary: formatMoneySpaced(value),
                      secondary: `in ${monthText}`,
                    });
                  }}
                  onBlur={() => setPriceTip(null)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setPriceTip({
                      x,
                      y: cy,
                      primary: formatMoneySpaced(value),
                      secondary: `in ${monthText}`,
                    });
                  }}
                  className="fill-[rgb(var(--prestige))]"
                />
              );
            })}
            {prices.length ? (() => {
              const last = prices[prices.length - 1];
              const lastX =
                prices.length === 1
                  ? lineWidth * 0.5
                  : linePadding.left + linePlotWidth;
              const lastY =
                linePadding.top +
                (1 - (last - (priceExtent?.min ?? last)) / priceRange) *
                  (lineHeight - linePadding.top);
              return (
                <line
                  x1={lastX}
                  y1={lastY}
                  x2={lineWidth}
                  y2={lastY}
                  stroke="rgb(var(--prestige))"
                  strokeWidth="1"
                />
              );
            })() : null}
            {priceTicks.map((i) => {
              const x =
                series.length <= 1
                  ? lineWidth * 0.5
                  : linePadding.left + (i / (series.length - 1)) * linePlotWidth;
              return (
                <text
                  key={series[i].month}
                  x={x}
                  y={lineSvgHeight - 6}
                  textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
                  className="fill-[rgb(var(--muted))] text-[11px]"
                >
                  {formatMonthLabel(series[i].month)}
                </text>
              );
            })}
          </svg>
            {priceTip ? (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full -mt-2 rounded-md border border-border bg-bg/95 px-2 py-1 text-[11px] text-text shadow-lg"
                style={{ left: priceTip.x, top: priceTip.y }}
              >
                <div className="text-xs font-semibold">{priceTip.primary}</div>
                <div className="text-[11px] text-muted">{priceTip.secondary}</div>
              </div>
            ) : null}
            <div className="mt-2 text-[11px] text-muted">
              Legend: Line = median listing price. Dots mark monthly observations.
            </div>
          </div>
          <div className="w-24 shrink-0 text-xs text-muted">
            <div>High</div>
            <div className="text-base font-semibold text-text">{formatMoney(priceHigh)}</div>
            <div className="mt-3">Last</div>
            <div className="text-base font-semibold text-[rgb(var(--prestige))]">{formatMoney(priceLast)}</div>
            <div className="mt-3">Low</div>
            <div className="text-base font-semibold text-text">{formatMoney(priceLow)}</div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm uppercase tracking-[0.18em] text-muted">Active Listings</div>
        <div className="mt-3 flex gap-3">
          <div className="flex-1 relative">
            <svg
              viewBox={`0 0 ${lineWidth} ${barSvgHeight}`}
              className="w-full h-[210px]"
              onClick={() => setInvTip(null)}
            >
            {inventory.map((v, i) => {
              const barWidth = barPlotWidth / inventory.length - 6;
              const x = barPadding.left + i * (barPlotWidth / inventory.length) + 3;
              const height = clamp((v / invMax) * barHeight, 4, barHeight);
              const y = barPadding.top + (barHeight - height);
              const monthText = formatMonthLabel(trend[i].month);
              return (
                <rect
                  key={`${v}-${i}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  rx="4"
                  tabIndex={0}
                  onMouseEnter={(event) => {
                    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (!bounds) return;
                    setInvTip({
                      x: event.clientX - bounds.left,
                      y: event.clientY - bounds.top,
                      primary: `${formatNumber(v)} Listings`,
                      secondary: `in ${monthText}`,
                    });
                  }}
                  onMouseMove={(event) => {
                    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (!bounds) return;
                    setInvTip({
                      x: event.clientX - bounds.left,
                      y: event.clientY - bounds.top,
                      primary: `${formatNumber(v)} Listings`,
                      secondary: `in ${monthText}`,
                    });
                  }}
                  onMouseLeave={() => setInvTip(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    setInvTip({
                      x: x + barWidth * 0.5,
                      y,
                      primary: `${formatNumber(v)} Listings`,
                      secondary: `in ${monthText}`,
                    });
                  }}
                  onFocus={() =>
                    setInvTip({
                      x: x + barWidth * 0.5,
                      y,
                      primary: `${formatNumber(v)} Listings`,
                      secondary: `in ${monthText}`,
                    })
                  }
                  onBlur={() => setInvTip(null)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setInvTip({
                      x: x + barWidth * 0.5,
                      y,
                      primary: `${formatNumber(v)} Listings`,
                      secondary: `in ${monthText}`,
                    });
                  }}
                  className="fill-[rgb(var(--brand))] opacity-80"
                />
              );
            })}
            {inventory.length ? (() => {
              const barWidth = barPlotWidth / inventory.length - 6;
              const lastIndex = inventory.length - 1;
              const lastX =
                barPadding.left + lastIndex * (barPlotWidth / inventory.length) + 3 + barWidth;
              const lastHeight = clamp((inventory[lastIndex] / invMax) * barHeight, 4, barHeight);
              const lastY = barPadding.top + (barHeight - lastHeight);
              return (
                <line
                  x1={lastX}
                  y1={lastY}
                  x2={lineWidth}
                  y2={lastY}
                  stroke="rgb(var(--brand))"
                  strokeWidth="1"
                />
              );
            })() : null}
            {invTicks.map((i) => {
              const x =
                trend.length <= 1
                  ? lineWidth * 0.5
                  : barPadding.left + (i / (trend.length - 1)) * barPlotWidth;
              return (
                <text
                  key={trend[i].month}
                  x={x}
                  y={barSvgHeight - 6}
                  textAnchor={i === 0 ? "start" : i === trend.length - 1 ? "end" : "middle"}
                  className="fill-[rgb(var(--muted))] text-[11px]"
                >
                  {formatMonthLabel(trend[i].month)}
                </text>
              );
            })}
          </svg>
            {invTip ? (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full -mt-2 rounded-md border border-border bg-bg/95 px-2 py-1 text-[11px] text-text shadow-lg"
                style={{ left: invTip.x, top: invTip.y }}
              >
                <div className="text-xs font-semibold">{invTip.primary}</div>
                <div className="text-[11px] text-muted">{invTip.secondary}</div>
              </div>
            ) : null}
            <div className="mt-2 text-[11px] text-muted">
              Legend: Bars = active listings. Higher bars indicate more inventory.
            </div>
          </div>
          <div className="w-24 shrink-0 text-xs text-muted">
            <div>High</div>
            <div className="text-base font-semibold text-text">{formatNumber(invHigh)}</div>
            <div className="mt-3">Last</div>
            <div className="text-base font-semibold text-[rgb(var(--brand))]">{formatNumber(invLast)}</div>
            <div className="mt-3">Low</div>
            <div className="text-base font-semibold text-text">{formatNumber(invLow)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
