"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MarketItem = {
  name: string;
  slug: string;
};

export function MarketsFilterList({ markets }: { markets: MarketItem[] }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const normalized = query.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!normalized) return [];
    return markets
      .filter((m) => m.name.toLowerCase().includes(normalized))
      .slice(0, 6)
      .map((m) => ({
        label: m.name,
        href: `/markets/${m.slug}`,
      }));
  }, [markets, normalized]);

  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="relative">
      <div className="text-xs text-muted">Search communities</div>
      <input
        className="field mt-2 w-full"
        placeholder="Search by community"
        aria-label="Search markets"
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
              key={s.href}
              type="button"
              className={[
                "w-full text-left px-4 py-3 text-sm",
                i === activeIndex ? "bg-[rgb(var(--surface))]" : "hover:bg-[rgb(var(--surface))]",
              ].join(" ")}
              onClick={() => router.push(s.href)}
            >
              <div className="text-xs text-muted">Market</div>
              <div className="text-text font-medium">{s.label}</div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
