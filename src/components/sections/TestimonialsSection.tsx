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

  /**
   * Optional: small muted line under the title (for grid/carousel/single).
   * Not shown for hero (hero already has its own eyebrow).
   */
  intro?: string | null;

  /**
   * Optional: hide the big section title even if provided.
   * Useful if your CMS always provides a title but you don't want it in hero.
   */
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
    // Respect marketing approval without being annoying:
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

  // Default behavior: kill the big "Testimonials" title in hero mode.
  const showHeader =
    !hideTitle &&
    mode !== "hero" &&
    (Boolean(title) || Boolean(intro));

  return (
    <section className="container-page py-12 sm:py-14">
      {showHeader ? (
        <div className="max-w-3xl">
          {title ? (
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-text">
              {title}
            </h2>
          ) : null}
          {intro ? (
            <p className="mt-3 text-base leading-relaxed text-muted">
              {intro}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={showHeader ? "mt-8" : ""}>
        {mode === "hero" ? (
          <div className="max-w-5xl">
            <HeroCard t={chosen!} />
          </div>
        ) : mode === "single" ? (
          <div className="max-w-3xl">
            <Card t={chosen!} />
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

  // Expecting "YYYY-MM-DD" from Sanity date field
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
    <div className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">
      {bits.join(" · ")}
    </div>
  );
}

/* -----------------------------
   Building blocks
------------------------------ */

function Avatar({ photo, name }: { photo?: SanityImage; name?: string }) {
  const url = photo?.asset?.url;
  const alt = photo?.alt || name || "Client photo";

  if (url) {
    return (
      <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-brass/30">
        <Image src={url} alt={alt} fill sizes="48px" className="object-cover" />
      </div>
    );
  }

  // branded dot (no initial)
  return <div className="h-12 w-12 rounded-full bg-teal/80 ring-1 ring-brass/30" />;
}

function MetaLine({ transactionType }: { transactionType?: string }) {
  if (!transactionType) return null;
  return (
    <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
      {transactionType}
    </div>
  );
}

function Shell({ children, hero }: { children: React.ReactNode; hero?: boolean }) {
  return (
    <div
      className={[
        "rounded-2xl border border-border/30 bg-surface/70 shadow-sm h-full",
        hero ? "p-8 sm:p-10" : "p-7",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Quote({ children, hero }: { children: React.ReactNode; hero?: boolean }) {
  // Neutralize global blockquote styling + intentional brass rule.
  return (
    <blockquote
      className={[
        "m-0 border-l-0 p-0 leading-relaxed text-text/85",
        hero ? "text-base sm:text-lg" : "",
      ].join(" ")}
    >
      <div className="flex gap-4">
        <div className="w-px shrink-0 bg-brass/35 rounded-full" />
        <div>{children}</div>
      </div>
    </blockquote>
  );
}

/* -----------------------------
   Cards
------------------------------ */

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="h-full">
      <Shell>
        <div className="flex items-start gap-4 h-full">
          <div className="shrink-0 pt-0.5">
            <Avatar photo={t.photo} name={t.name} />
          </div>

          <div className="min-w-0 flex flex-col h-full">
            <Quote>{t.text}</Quote>

            <figcaption className="mt-auto pt-6 text-sm">
              <div className="font-medium tracking-wide text-text">{t.name}</div>
              <MetaLine transactionType={t.transactionType} />
            </figcaption>
          </div>
        </div>
      </Shell>
    </figure>
  );
}

function HeroCard({ t }: { t: Testimonial }) {
  if (t.approvedForMarketing === false) return null;

  return (
    <section className="py-2">
      <div className="divider mb-8 opacity-40" />

      <div className="max-w-5xl">
        <div className="eyebrow mb-3">Success story</div>

        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="min-w-0">
            {t.headline ? (
              <h3 className="text-lg sm:text-xl font-semibold text-text mb-3">
                {t.headline}
              </h3>
            ) : null}

            <Quote hero>
              <div className="min-w-0">
                <div className="text-base sm:text-lg leading-relaxed text-text/85 max-w-[70ch]">
                  {t.text}
                </div>
              </div>
            </Quote>

            <div className="mt-6 flex items-center gap-3">
              <Avatar photo={t.photo} name={t.name} />
              <div className="text-sm">
                <div className="font-medium tracking-wide text-text">{t.name}</div>
                <FactsLine t={t} />
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-right text-xs text-muted" />
        </div>
      </div>
    </section>
  );
}

/* -----------------------------
   Layout variants
------------------------------ */

function Grid({ items }: { items: Testimonial[] }) {
  return (
    <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
      {items.map((t, idx) => (
        <Card key={t._id || `${idx}`} t={t} />
      ))}
    </div>
  );
}

/* ---------- Carousel (chevrons + dots + swipe) ---------- */

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
    <div className="relative">
      {items.length > 1 ? (
        <div className="mb-3 hidden sm:flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous testimonial"
            className="h-9 w-9 rounded-full border border-border/40 bg-transparent text-text/90 hover:text-text hover:opacity-95 grid place-items-center"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next testimonial"
            className="h-9 w-9 rounded-full border border-border/40 bg-transparent text-text/90 hover:text-text hover:opacity-95 grid place-items-center"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 px-1 snap-x snap-mandatory scroll-px-6 [-webkit-overflow-scrolling:touch] scrollbar-none"
        role="region"
        aria-label="Testimonials carousel"
      >
        {items.map((t, idx) => (
          <div
            key={ids[idx]}
            data-id={ids[idx]}
            data-card
            className="snap-start shrink-0 w-[88%] sm:w-[440px] scroll-mx-6"
          >
            <Card t={t} />
          </div>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
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
                  isActive ? "bg-brass/80" : "bg-border/50 hover:bg-border/80",
                ].join(" ")}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
