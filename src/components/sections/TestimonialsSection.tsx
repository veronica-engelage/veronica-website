"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

type SanityImage = {
  alt?: string;
  asset?: { url?: string };
};

type Testimonial = {
  _id?: string;
  name?: string;
  headline?: string;
  text?: string;
  transactionType?: "buyer" | "seller" | string;
  location?: string;
  result?: string;
  date?: string; // YYYY-MM-DD
  approvedForMarketing?: boolean;
  photo?: SanityImage;
};

type Layout = "grid" | "carousel" | "single" | "hero";

type Props = {
  title?: string | null;
  layout?: Layout | null;
  featured?: Testimonial | null;
  testimonials?: Testimonial[] | null;

  intro?: string | null;
  hideTitle?: boolean;
};

export function TestimonialsSection({
  title,
  intro,
  layout = "grid",
  featured,
  testimonials,
  hideTitle,
}: Props) {
  const mode: Layout = (layout || "grid") as Layout;

  const items = useMemo(() => {
    const arr = Array.isArray(testimonials) ? testimonials.filter(Boolean) : [];
    return arr.filter((t) => t?.approvedForMarketing !== false);
  }, [testimonials]);

  const chosen = useMemo(() => {
    if (mode === "single" || mode === "hero") {
      const c = featured || items[0] || null;
      if (c?.approvedForMarketing === false) return null;
      return c;
    }
    return null;
  }, [mode, featured, items]);

  if ((mode === "single" || mode === "hero") && !chosen) return null;
  if (!(mode === "single" || mode === "hero") && items.length === 0) return null;

  const showHeader =
    !hideTitle &&
    mode !== "hero" &&
    (Boolean(title) || Boolean(intro));

  return (
    <section className="container-page py-12 sm:py-16">
      {showHeader ? (
        <div className="mx-auto max-w-[72ch]">
          {title ? (
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-text">
              {title}
            </h2>
          ) : null}
          {intro ? (
            <p className="mt-3 leading-relaxed text-muted">{intro}</p>
          ) : null}
          <div className="divider mt-8 opacity-40" />
        </div>
      ) : null}

      <div className={showHeader ? "mt-10" : ""}>
        {mode === "hero" ? (
          <div className="mx-auto max-w-[72ch]">
            <HeroBlock t={chosen!} />
          </div>
        ) : mode === "single" ? (
          <div className="mx-auto max-w-[72ch]">
            <EditorialQuote t={chosen!} />
          </div>
        ) : mode === "carousel" ? (
          <Carousel items={items} />
        ) : (
          <Grid items={items} />
        )}
      </div>
    </section>
  );
}

/* -----------------------------
   Helpers
------------------------------ */

function formatMonthYear(date?: string) {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;

  const year = m[1];
  const monthIndex = Number(m[2]) - 1;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[monthIndex];
  if (!month) return null;

  return `${month} ${year}`;
}

function FactsLine({ t }: { t: Testimonial }) {
  const bits = [
    t.transactionType ? String(t.transactionType).toUpperCase() : null,
    t.location || null,
    t.result || null,
    formatMonthYear(t.date),
  ].filter(Boolean);

  if (!bits.length) return null;

  return (
    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
      {bits.join(" · ")}
    </div>
  );
}

function Avatar({ photo, name }: { photo?: SanityImage; name?: string }) {
  const url = photo?.asset?.url;
  const alt = photo?.alt || name || "Client photo";

  if (url) {
    return (
      <div className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-border/50">
        <Image src={url} alt={alt} fill sizes="44px" className="object-cover" />
      </div>
    );
  }

  // quiet fallback dot
  return <div className="h-11 w-11 rounded-full bg-text/20 ring-1 ring-border/50" />;
}

function Quote({ children }: { children: React.ReactNode }) {
  // Editorial: a single hairline + whitespace, not a “card”
  return (
    <blockquote className="m-0 border-l-0 p-0">
      <div className="flex gap-5">
        <div className="w-px shrink-0 bg-border/60" />
        <div className="min-w-0">
          <div className="text-base sm:text-lg leading-relaxed text-text/85 max-w-[72ch]">
            {children}
          </div>
        </div>
      </div>
    </blockquote>
  );
}

/* -----------------------------
   Blocks
------------------------------ */

function EditorialQuote({ t }: { t: Testimonial }) {
  return (
    <figure className="py-2">
      <Quote>{t.text}</Quote>

      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar photo={t.photo} name={t.name} />
        <div className="text-sm">
          <div className="font-medium tracking-wide text-text">{t.name}</div>
          <FactsLine t={t} />
        </div>
      </figcaption>
    </figure>
  );
}

function HeroBlock({ t }: { t: Testimonial }) {
  return (
    <div className="py-2">
      {/* section rhythm */}
      <div className="eyebrow mb-3">Success story</div>
      <div className="divider mb-8 opacity-40" />

      {t.headline ? (
        <h3 className="text-lg sm:text-xl font-semibold text-text mb-4">
          {t.headline}
        </h3>
      ) : null}

      <EditorialQuote t={t} />
    </div>
  );
}

/* -----------------------------
   Layout variants
------------------------------ */

function Grid({ items }: { items: Testimonial[] }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="grid gap-10 sm:gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, idx) => (
          <div key={t._id || `${idx}`} className="min-w-0">
            <EditorialQuote t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Carousel (quiet arrows + dots + swipe) ---------- */

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Carousel({ items }: { items: Testimonial[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const ids = useMemo(
    () => items.map((t, i) => t._id || `testimonial-${i}`),
    [items]
  );

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    if (!el) return;

    const clamped = Math.max(0, Math.min(index, items.length - 1));
    const target = el.querySelector<HTMLElement>(`[data-id="${ids[clamped]}"]`);
    if (!target) return;

    el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActive(clamped);
  }

  function scrollByCards(dir: 1 | -1) {
    scrollToIndex(active + dir);
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
        if (!children.length) return;

        const left = el.scrollLeft;
        let bestIdx = 0;
        let bestDist = Infinity;

        children.forEach((node, idx) => {
          const dist = Math.abs(node.offsetLeft - left);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        });

        setActive(bestIdx);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [items.length]);

  return (
    <div className="mx-auto max-w-[1100px]">
      {items.length > 1 ? (
        <div className="mb-6 hidden sm:flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous testimonial"
            className="h-9 w-9 rounded-full border border-border/50 bg-transparent text-text/80 hover:text-text grid place-items-center"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next testimonial"
            className="h-9 w-9 rounded-full border border-border/50 bg-transparent text-text/80 hover:text-text grid place-items-center"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div
        ref={scrollerRef}
        className="flex gap-10 overflow-x-auto pb-2 px-1 snap-x snap-mandatory scroll-px-6 [-webkit-overflow-scrolling:touch] scrollbar-none"
        role="region"
        aria-label="Testimonials carousel"
      >
        {items.map((t, idx) => (
          <div
            key={ids[idx]}
            data-id={ids[idx]}
            data-card
            className="snap-start shrink-0 w-[88%] sm:w-[520px] scroll-mx-6"
          >
            <EditorialQuote t={t} />
          </div>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          {items.map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={`dot-${ids[i]}`}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={[
                  "h-2 w-2 rounded-full transition",
                  isActive ? "bg-text/70" : "bg-border/60 hover:bg-border/90",
                ].join(" ")}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
