"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Market = {
  _id: string;
  name: string;
  slug: string;
  summary?: string | null;
  heroImage?: {
    alt?: string | null;
    image?: { asset?: { url?: string | null } } | null;
  } | null;
};

export function MarketsCarousel({ markets }: { markets: Market[] }) {
  if (!Array.isArray(markets) || markets.length === 0) return null;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [perPage, setPerPage] = useState(1);

  const items = useMemo(() => markets.filter(Boolean), [markets]);

  const pages = useMemo(() => {
    const chunked: Market[][] = [];
    for (let i = 0; i < items.length; i += perPage) {
      chunked.push(items.slice(i, i + perPage));
    }
    return chunked;
  }, [items, perPage]);

  const pageCount = pages.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setPerPage(mq.matches ? 3 : 1);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const view = el.clientWidth || 1;
      const current = Math.round(el.scrollLeft / view);
      setActivePage((prev) => {
        const next = Math.max(0, current);
        return prev === next ? prev : next;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [pageCount]);

  const jumpToPage = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const view = el.clientWidth || 1;
    el.scrollTo({ left: idx * view, behavior: "smooth" });
  };

  return (
    <section className="container-page py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Markets</div>
          <h2 className="mt-2 text-3xl font-semibold">Community Market Guides</h2>
        </div>
        <Link href="/markets" className="btn-tertiary">
          View all
        </Link>
      </div>

      <div className="mt-6 -mx-5 sm:-mx-8">
        <div
          ref={scrollerRef}
          className="flex gap-4 lg:gap-0 overflow-x-auto px-5 pb-2 sm:px-8 snap-x snap-mandatory scroll-smooth scrollbar-none"
          style={{ scrollPaddingLeft: "1.25rem", scrollPaddingRight: "1.25rem" }}
        >
          {pages.map((page, pageIdx) => (
            <div
              key={`page-${pageIdx}`}
              className="snap-center flex-shrink-0 w-[85%] sm:w-full grid grid-cols-1 lg:grid-cols-3"
              style={{ scrollSnapStop: "always" }}
            >
              {page.map((m, idx) => {
                const hero = m.heroImage?.image?.asset?.url || "/images/hero-house.png";
                return (
                  <Link
                    key={m._id}
                    href={`/markets/${m.slug}`}
                    className={[
                      "flex flex-col w-full",
                      "lg:px-6",
                      idx === 0 ? "lg:border-l-0" : "lg:border-l lg:border-border/60",
                    ].join(" ")}
                  >
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={hero}
                        alt={m.heroImage?.alt || `${m.name} market`}
                        fill
                        className="object-cover"
                        unoptimized={hero.endsWith(".svg")}
                      />
                    </div>
                    <div className="p-5">
                      <div className="text-lg font-semibold">{m.name}</div>
                      {m.summary ? (
                        <p className="mt-2 text-sm text-muted line-clamp-3 min-h-[3.6rem]">
                          {m.summary}
                        </p>
                      ) : (
                        <div className="mt-2 min-h-[3.6rem]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              className={[
                "h-2 w-2 rounded-full transition",
                idx === activePage ? "bg-text" : "bg-border",
              ].join(" ")}
              onClick={() => jumpToPage(idx)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
