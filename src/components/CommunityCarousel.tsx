"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type CarouselItem = {
  id: string;
  name: string;
  href: string;
  summary?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

type CommunityCarouselProps = {
  eyebrow?: string | null;
  headline?: string | null;
  items: CarouselItem[];
  viewAllHref?: string | null;
};

export function CommunityCarousel({
  eyebrow = "Markets",
  headline = "Community Market Guides",
  items,
  viewAllHref,
}: CommunityCarouselProps) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [perPage, setPerPage] = useState(1);

  const pages = useMemo(() => {
    const chunked: CarouselItem[][] = [];
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
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          {headline ? <h2 className="mt-2 text-3xl font-semibold">{headline}</h2> : null}
        </div>
        {viewAllHref ? (
          <Link href={viewAllHref} className="btn-tertiary">
            View all
          </Link>
        ) : null}
      </div>

      <div className="mt-6 -mx-5 sm:-mx-8">
        <div
          ref={scrollerRef}
          className="flex gap-0 overflow-x-auto px-5 pb-2 sm:px-8 snap-x snap-mandatory scroll-smooth scrollbar-none"
        >
          {pages.map((page, pageIdx) => (
            <div
              key={`page-${pageIdx}`}
              className="snap-start flex-shrink-0 w-full grid grid-cols-1 lg:grid-cols-3"
              style={{ scrollSnapStop: "always" }}
            >
              {page.map((item, idx) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={[
                    "flex flex-col w-full",
                    "lg:px-6",
                    idx === 0 ? "lg:border-l-0" : "lg:border-l lg:border-border/60",
                  ].join(" ")}
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={item.imageUrl || "/images/hero-house.png"}
                      alt={item.imageAlt || item.name}
                      fill
                      className="object-cover"
                      unoptimized={(item.imageUrl || "").endsWith(".svg")}
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-lg font-semibold">{item.name}</div>
                    {item.summary ? (
                      <p className="mt-2 text-sm text-muted line-clamp-3 min-h-[3.6rem]">
                        {item.summary}
                      </p>
                    ) : (
                      <div className="mt-2 min-h-[3.6rem]" />
                    )}
                  </div>
                </Link>
              ))}
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
