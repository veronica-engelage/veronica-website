import { sanityClient } from "@/sanity/client";
import { groq } from "next-sanity";
import { CommunityCarousel } from "@/components/CommunityCarousel";
import { getMarketOverviewTeaser } from "@/lib/marketOverview";

type MarketItem = {
  _id: string;
  name: string;
  slug: string;
  summary?: string | null;
  heroImage?: {
    alt?: string | null;
    image?: { asset?: { url?: string | null } } | null;
  } | null;
};

type NeighborhoodItem = {
  _id: string;
  name: string;
  slug: string;
  summary?: string | null;
  heroImage?: {
    alt?: string | null;
    image?: { asset?: { url?: string | null } } | null;
  } | null;
};

type SectionProps = {
  eyebrow?: string | null;
  headline?: string | null;
  mode?: "markets" | "neighborhoods";
  markets?: MarketItem[];
  neighborhoods?: NeighborhoodItem[];
};

const allMarketsQuery = groq`
  *[_type == "market"] | order(order asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    summary,
    heroImage->{ alt, image{asset->{url}} }
  }
`;

const allNeighborhoodsQuery = groq`
  *[_type == "neighborhood"] | order(municipality asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    summary,
    heroImage->{ alt, image{asset->{url}} }
  }
`;

export async function CommunityCarouselSection(props: SectionProps) {
  const mode = props.mode || "markets";
  const teaser = await getMarketOverviewTeaser([
    "Daniel Island",
    "Charleston Peninsula",
    "Mount Pleasant",
  ]);

  let items: Array<MarketItem | NeighborhoodItem> = [];
  if (mode === "markets") {
    items = Array.isArray(props.markets) && props.markets.length
      ? props.markets
      : await sanityClient.fetch<MarketItem[]>(allMarketsQuery);
  } else {
    items = Array.isArray(props.neighborhoods) && props.neighborhoods.length
      ? props.neighborhoods
      : await sanityClient.fetch<NeighborhoodItem[]>(allNeighborhoodsQuery);
  }

  const carouselItems = items.map((item) => ({
    id: item._id,
    name: item.name,
    href: mode === "markets" ? `/markets/${item.slug}` : `/neighborhoods/${item.slug}`,
    summary: item.summary,
    imageUrl: item.heroImage?.image?.asset?.url || null,
    imageAlt: item.heroImage?.alt || item.name,
  }));

  const defaultEyebrow = mode === "markets" ? "Markets" : "Neighborhoods";
  const defaultHeadline =
    mode === "markets" ? "Community Market Guides" : "Neighborhood Guides";
  const highlight = {
    eyebrow: "Market Overview",
    title: "Compare every market and neighborhood side-by-side.",
    description:
      "Explore 24-month trends, rolling rankings, and ZIP-based market signals in one place.",
    ctaLabel: "Interactive Market Overview",
    ctaHref: "/markets/overview",
    chart: teaser,
  };

  return (
    <CommunityCarousel
      eyebrow={props.eyebrow ?? defaultEyebrow}
      headline={props.headline ?? defaultHeadline}
      items={carouselItems}
      viewAllHref={mode === "markets" ? "/markets" : "/neighborhoods"}
      highlight={highlight}
    />
  );
}
