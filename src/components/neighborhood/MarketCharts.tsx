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

function buildLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  if (values.length === 1) {
    const y = height * 0.5;
    return `M${(width * 0.5).toFixed(1)},${y.toFixed(1)}`;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.1 || 1;
  const minY = min - pad;
  const maxY = max + pad;

  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const t = (v - minY) / (maxY - minY);
      const y = height - t * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatMoney(n?: number | null) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}`;
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

  const lineWidth = 520;
  const lineHeight = 180;
  const lineSvgHeight = 220;
  const barHeight = 160;
  const barSvgHeight = 210;

  const linePath = buildLinePath(prices, lineWidth, lineHeight);

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
        <div className="mt-3 flex gap-4">
          <div className="flex-1">
            <svg viewBox={`0 0 ${lineWidth} ${lineSvgHeight}`} className="w-full h-[200px]">
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
                  : (i / (prices.length - 1)) * lineWidth;
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              const range = max - min || 1;
              const cy = lineHeight - ((value - min) / range) * lineHeight;
              return (
                <circle
                  key={`${value}-${i}`}
                  cx={x}
                  cy={cy}
                  r="3"
                  className="fill-[rgb(var(--prestige))]"
                />
              );
            })}
            {prices.length ? (() => {
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              const range = max - min || 1;
              const last = prices[prices.length - 1];
              const lastX = prices.length === 1 ? lineWidth * 0.5 : lineWidth;
              const lastY = lineHeight - ((last - min) / range) * lineHeight;
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
                series.length <= 1 ? lineWidth * 0.5 : (i / (series.length - 1)) * lineWidth;
              return (
                <text
                  key={series[i].month}
                  x={x}
                  y={lineSvgHeight - 4}
                  textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
                  className="fill-[rgb(var(--muted))] text-[11px]"
                >
                  {formatMonthLabel(series[i].month)}
                </text>
              );
            })}
          </svg>
            <div className="mt-2 text-[11px] text-muted">
              Legend: Line = median listing price. Dots mark monthly observations.
            </div>
          </div>
          <div className="w-36 shrink-0 text-xs text-muted">
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
        <div className="mt-3 flex gap-4">
          <div className="flex-1">
            <svg viewBox={`0 0 ${lineWidth} ${barSvgHeight}`} className="w-full h-[200px]">
            {inventory.map((v, i) => {
              const barWidth = lineWidth / inventory.length - 6;
              const x = i * (lineWidth / inventory.length) + 3;
              const height = clamp((v / invMax) * barHeight, 4, barHeight);
              const y = barHeight - height;
              return (
                <rect
                  key={`${v}-${i}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  rx="4"
                  className="fill-[rgb(var(--brand))] opacity-80"
                />
              );
            })}
            {inventory.length ? (() => {
              const barWidth = lineWidth / inventory.length - 6;
              const lastIndex = inventory.length - 1;
              const lastX = lastIndex * (lineWidth / inventory.length) + 3 + barWidth;
              const lastHeight = clamp((inventory[lastIndex] / invMax) * barHeight, 4, barHeight);
              const lastY = barHeight - lastHeight;
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
                trend.length <= 1 ? lineWidth * 0.5 : (i / (trend.length - 1)) * lineWidth;
              return (
                <text
                  key={trend[i].month}
                  x={x}
                  y={barSvgHeight - 4}
                  textAnchor={i === 0 ? "start" : i === trend.length - 1 ? "end" : "middle"}
                  className="fill-[rgb(var(--muted))] text-[11px]"
                >
                  {formatMonthLabel(trend[i].month)}
                </text>
              );
            })}
          </svg>
            <div className="mt-2 text-[11px] text-muted">
              Legend: Bars = active listings. Higher bars indicate more inventory.
            </div>
          </div>
          <div className="w-36 shrink-0 text-xs text-muted">
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
