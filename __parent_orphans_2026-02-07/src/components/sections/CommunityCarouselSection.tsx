import { sanityClient } from "@/sanity/client";
import { groq } from "next-sanity";
import { CommunityCarousel } from "@/components/CommunityCarousel";

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

  return (
    <CommunityCarousel
      eyebrow={props.eyebrow ?? defaultEyebrow}
      headline={props.headline ?? defaultHeadline}
      items={carouselItems}
      viewAllHref={mode === "markets" ? "/markets" : "/neighborhoods"}
    />
  );
}
