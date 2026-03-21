import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/client";

export type Market = {
  _id: string;
  name: string;
  slug: string;
  municipality: string;
};

export type Neighborhood = {
  _id: string;
  name: string;
  slug: string;
  municipality: string;
  zipMappings: { zip: string; weight?: number | null }[];
};

export type StatPoint = {
  zip: string;
  month: string; // YYYY-MM
  medianListingPrice?: number | null;
  medianListingPriceYoY?: number | null;
  pricePerSqft?: number | null;
  activeListingCount?: number | null;
  pendingListingCount?: number | null;
  medianDaysOnMarket?: number | null;
  marketHotnessScore?: number | null;
  marketHotnessRank?: number | null;
};

export type TrendPoint = {
  month: string;
  medianListingPrice?: number | null;
  medianListingPriceYoY?: number | null;
  pricePerSqft?: number | null;
  activeListingCount?: number | null;
  pendingListingCount?: number | null;
  medianDaysOnMarket?: number | null;
  marketHotnessScore?: number | null;
  marketHotnessRank?: number | null;
};

export type RankingItem = {
  id: string;
  name: string;
  slug: string;
  marketId?: string | null;
  value: number | null;
};

export type RankingGroup = {
  title: string;
  items: RankingItem[];
};

export type MarketOverviewData = {
  latestMonth: string | null;
  months: string[];
  markets: (Market & { neighborhoodIds: string[] })[];
  neighborhoods: (Neighborhood & { marketId?: string | null })[];
  marketTrendsById: Record<string, TrendPoint[]>;
  neighborhoodTrendsById: Record<string, TrendPoint[]>;
  overallTrend: TrendPoint[];
  rankings: {
    markets: RankingGroup[];
    neighborhoods: RankingGroup[];
  };
};

const marketQuery = groq`
  *[_type == "market"] | order(order asc, name asc) {
    _id,
    name,
    municipality,
    "slug": slug.current
  }
`;

const neighborhoodQuery = groq`
  *[_type == "neighborhood"] | order(name asc) {
    _id,
    name,
    municipality,
    "slug": slug.current,
    zipMappings[]{ zip, weight }
  }
`;

const statsQuery = groq`
  *[_type == "marketStatMonthly" && zip in $zips] | order(month asc) {
    zip,
    month,
    medianListingPrice,
    medianListingPriceYoY,
    pricePerSqft,
    activeListingCount,
    pendingListingCount,
    medianDaysOnMarket,
    marketHotnessScore,
    marketHotnessRank
  }
`;

function uniq<T>(items: T[]) {
  return Array.from(new Set(items));
}

function toMonthKey(value: string) {
  return value?.slice(0, 7);
}

function sortMonths(months: string[]) {
  return months.slice().sort();
}

function average(values: Array<number | null | undefined>) {
  const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

function buildStatsIndex(stats: StatPoint[]) {
  const byZip: Record<string, Record<string, StatPoint>> = {};
  stats.forEach((row) => {
    const zip = row.zip;
    const month = toMonthKey(row.month);
    if (!zip || !month) return;
    if (!byZip[zip]) byZip[zip] = {};
    byZip[zip][month] = { ...row, month };
  });
  return byZip;
}

function buildTrendForZips(
  zips: string[],
  months: string[],
  byZip: Record<string, Record<string, StatPoint>>,
): TrendPoint[] {
  return months.map((month) => {
    const rows = zips
      .map((zip) => byZip[zip]?.[month])
      .filter(Boolean) as StatPoint[];

    return {
      month,
      medianListingPrice: average(rows.map((r) => r.medianListingPrice)),
      medianListingPriceYoY: average(rows.map((r) => r.medianListingPriceYoY)),
      pricePerSqft: average(rows.map((r) => r.pricePerSqft)),
      activeListingCount: average(rows.map((r) => r.activeListingCount)),
      pendingListingCount: average(rows.map((r) => r.pendingListingCount)),
      medianDaysOnMarket: average(rows.map((r) => r.medianDaysOnMarket)),
      marketHotnessScore: average(rows.map((r) => r.marketHotnessScore)),
      marketHotnessRank: average(rows.map((r) => r.marketHotnessRank)),
    };
  });
}

function trendValueForMonths(
  trend: TrendPoint[],
  months: string[],
  key: keyof TrendPoint,
) {
  const byMonth = new Map(trend.map((t) => [t.month, t]));
  const values = months
    .map((m) => byMonth.get(m)?.[key])
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  return average(values);
}

function buildRanking(
  entities: { id: string; name: string; slug: string; marketId?: string | null; trend: TrendPoint[] }[],
  months: string[],
  key: keyof TrendPoint,
  direction: "desc" | "asc" = "desc",
) {
  const items = entities.map((entity) => ({
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    marketId: entity.marketId ?? null,
    value: trendValueForMonths(entity.trend, months, key),
  }));

  return items
    .filter((item) => item.value !== null)
    .sort((a, b) => {
      if (a.value === null) return 1;
      if (b.value === null) return -1;
      return direction === "asc" ? a.value - b.value : b.value - a.value;
    })
    ;
}

export async function getMarketOverviewData(): Promise<MarketOverviewData> {
  const [markets, neighborhoods] = await Promise.all([
    sanityClient.fetch<Market[]>(marketQuery),
    sanityClient.fetch<Neighborhood[]>(neighborhoodQuery),
  ]);

  const zipList = uniq(
    neighborhoods.flatMap((n) => n.zipMappings?.map((z) => z.zip) || [])
  ).filter(Boolean);

  const stats = await sanityClient.fetch<StatPoint[]>(statsQuery, { zips: zipList });
  const byZip = buildStatsIndex(stats);

  const monthsAll = sortMonths(
    uniq(stats.map((row) => toMonthKey(row.month)).filter(Boolean) as string[])
  );
  const months = monthsAll.slice(-24);
  const latestMonth = months.length ? months[months.length - 1] : null;

  const marketsWithNeighborhoods = markets.map((market) => {
    const neighborhoodIds = neighborhoods
      .filter((n) => n.municipality === market.municipality)
      .map((n) => n._id);
    return { ...market, neighborhoodIds };
  });

  const neighborhoodsWithMarket = neighborhoods.map((n) => {
    const market = markets.find((m) => m.municipality === n.municipality);
    return { ...n, marketId: market?._id };
  });

  const neighborhoodTrendsById: Record<string, TrendPoint[]> = {};
  neighborhoodsWithMarket.forEach((n) => {
    const zips = n.zipMappings?.map((z) => z.zip).filter(Boolean) || [];
    neighborhoodTrendsById[n._id] = buildTrendForZips(zips, months, byZip);
  });

  const marketTrendsById: Record<string, TrendPoint[]> = {};
  marketsWithNeighborhoods.forEach((market) => {
    const marketNeighborhoods = neighborhoodsWithMarket.filter(
      (n) => n.municipality === market.municipality
    );
    const marketZips = uniq(
      marketNeighborhoods.flatMap((n) => n.zipMappings?.map((z) => z.zip) || [])
    ).filter(Boolean);
    marketTrendsById[market._id] = buildTrendForZips(marketZips, months, byZip);
  });

  const overallTrend = buildTrendForZips(zipList, months, byZip);

  const last3Months = months.slice(-3);
  const marketEntities = marketsWithNeighborhoods.map((market) => ({
    id: market._id,
    name: market.name,
    slug: market.slug,
    marketId: market._id,
    trend: marketTrendsById[market._id] || [],
  }));
  const neighborhoodEntities = neighborhoodsWithMarket.map((n) => ({
    id: n._id,
    name: n.name,
    slug: n.slug,
    marketId: n.marketId ?? null,
    trend: neighborhoodTrendsById[n._id] || [],
  }));

  const rankings = {
    markets: [
      { title: "Highest Median Price", items: buildRanking(marketEntities, last3Months, "medianListingPrice") },
      { title: "Fastest to Sell", items: buildRanking(marketEntities, last3Months, "medianDaysOnMarket", "asc") },
      { title: "Hottest Markets", items: buildRanking(marketEntities, last3Months, "marketHotnessScore") },
      { title: "Most Active Listings", items: buildRanking(marketEntities, last3Months, "activeListingCount") },
      { title: "Largest YoY Price Growth", items: buildRanking(marketEntities, last3Months, "medianListingPriceYoY") },
    ],
    neighborhoods: [
      { title: "Highest Median Price", items: buildRanking(neighborhoodEntities, last3Months, "medianListingPrice") },
      { title: "Fastest to Sell", items: buildRanking(neighborhoodEntities, last3Months, "medianDaysOnMarket", "asc") },
      { title: "Hottest Neighborhoods", items: buildRanking(neighborhoodEntities, last3Months, "marketHotnessScore") },
      { title: "Most Active Listings", items: buildRanking(neighborhoodEntities, last3Months, "activeListingCount") },
      { title: "Largest YoY Price Growth", items: buildRanking(neighborhoodEntities, last3Months, "medianListingPriceYoY") },
    ],
  };

  return {
    latestMonth,
    months,
    markets: marketsWithNeighborhoods,
    neighborhoods: neighborhoodsWithMarket,
    marketTrendsById,
    neighborhoodTrendsById,
    overallTrend,
    rankings,
  };
}
