"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SpacerDivider } from "@/components/sections/SpacerDivider";
import { ContactInlineForm } from "@/components/ContactInlineForm";

type Neighborhood = {
  _id: string;
  name: string;
  municipality?: string | null;
  slug: string;
  summary?: string | null;
};

type MarketHeroMap = Record<string, { url: string; alt?: string }>;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function NeighborhoodsFilterList({
  items,
  markets,
  marketHeroByMunicipality,
  introHeadline,
  introText,
}: {
  items: Neighborhood[];
  markets: Array<{ name: string; slug: string }>;
  marketHeroByMunicipality: MarketHeroMap;
  introHeadline?: string | null;
  introText?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalized) return items;
    return items.filter((n) =>
      [n.name, n.municipality].some((v) =>
        typeof v === "string" ? v.toLowerCase().includes(normalized) : false
      )
    );
  }, [items, normalized]);

  const groups = useMemo(() => {
    return filtered.reduce<Record<string, Neighborhood[]>>((acc, n) => {
      const key = n.municipality || "Other";
      acc[key] = acc[key] || [];
      acc[key].push(n);
      return acc;
    }, {});
  }, [filtered]);

  const municipalities = useMemo(
    () => Object.keys(groups).sort((a, b) => a.localeCompare(b)),
    [groups]
  );

  const suggestions = useMemo(() => {
    if (!normalized) return [];
    const nMatches = items
      .filter((n) => n.name.toLowerCase().includes(normalized))
      .slice(0, 6)
      .map((n) => ({
        label: n.name,
        href: `/neighborhoods/${n.slug}`,
        kind: "Neighborhood",
      }));
    const mMatches = (markets || [])
      .filter((m) => m.name.toLowerCase().includes(normalized))
      .slice(0, 4)
      .map((m) => ({
        label: m.name,
        href: `/markets/${m.slug}`,
        kind: "Market",
      }));
    return [...mMatches, ...nMatches];
  }, [items, markets, normalized]);

  const hasSuggestions = suggestions.length > 0;

  return (
    <>
      <section className="container-page pt-8">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">
              {introHeadline || "Curated neighborhood guides with market clarity."}
            </h2>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-2xl">
              {introText ||
                "Curated, data‑rich neighborhood guides with market snapshots, local context, and market‑savvy guidance."}
            </p>
            <div className="relative mt-12 max-w-xl">
              <div className="text-xs text-muted">Search communities</div>
              <input
                className="field mt-2 w-full"
                placeholder="Search by neighborhood or community"
                aria-label="Search neighborhoods"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (!hasSuggestions) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => (i + 1) % suggestions.length);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    router.push(suggestions[activeIndex].href);
                  }
                }}
              />
              {hasSuggestions ? (
                <div className="absolute left-0 right-0 top-full rounded-lg border border-border bg-bg shadow-lg z-30">
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.kind}-${s.href}`}
                      type="button"
                      className={[
                        "w-full text-left px-4 py-3 text-sm",
                        i === activeIndex ? "bg-[rgb(var(--surface))]" : "hover:bg-[rgb(var(--surface))]",
                      ].join(" ")}
                      onClick={() => router.push(s.href)}
                    >
                      <div className="text-xs text-muted">{s.kind}</div>
                      <div className="text-text font-medium">{s.label}</div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="lg:col-span-5">
            <ContactInlineForm
              title="Reach out to Veronica"
              description="Looking for a specific pocket in Charleston or Mount Pleasant? I’ll build a private shortlist with current pricing and notes."
              submitLabel="Send request"
            />
          </div>
        </div>
      </section>

      <div className="container-page mt-12 space-y-12">
        {municipalities.map((municipality) => (
          <section key={municipality}>
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="relative aspect-[16/9] overflow-hidden border border-border rounded-none">
                  <Image
                    src={marketHeroByMunicipality[municipality]?.url || "/images/hero-house.png"}
                    alt={`${municipality} neighborhood guide`}
                    fill
                    className="object-cover"
                    unoptimized={(marketHeroByMunicipality[municipality]?.url || "").endsWith(".svg")}
                  />
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="text-sm text-muted">Community</div>
                <h2 className="mt-2 text-3xl sm:text-4xl font-serif tracking-tight">{municipality}</h2>
                <p className="mt-3 text-sm text-muted leading-relaxed max-w-2xl">
                  Market overviews and lifestyle insights for the most in‑demand
                  pockets in {municipality}.
                </p>
                <div className="mt-4">
                  <Link
                    href={`/markets/${slugify(municipality)}`}
                    className="text-sm text-muted underline underline-offset-4 hover:text-text"
                  >
                    {municipality} Market Overview
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-y-6 gap-x-10 sm:grid-cols-2">
              {groups[municipality].map((n) => (
                <div key={n._id} className="border-t border-border pt-4">
                  <div className="text-lg font-semibold text-text">{n.name}</div>
                  {n.summary ? (
                    <p className="mt-2 text-sm text-muted line-clamp-3">
                      {n.summary}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <Link
                      href={`/neighborhoods/${n.slug}`}
                      className="btn-tertiary inline-flex"
                    >
                      Explore this community
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <SpacerDivider tone="prestige" space="lg" />
          </section>
        ))}
      </div>
    </>
  );
}
