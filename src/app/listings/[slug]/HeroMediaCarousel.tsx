"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListingGalleryLightbox } from "./ListingGalleryLightbox";

type GalleryItem = any;

type Props = {
  listingTitle: string;
  hero: {
    url: string | null;
    thumb: string | null;
    alt: string;
    caption?: string;
    credit?: string | null;
  };
  gallery: GalleryItem[];
};

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14.5 5.5L8 12l6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
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
        d="M9.5 5.5L16 12l-6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroMediaCarousel({ listingTitle, hero, gallery }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const slides = useMemo(() => {
    const heroUrl = hero?.url || hero?.thumb || null;

    const rest = (Array.isArray(gallery) ? gallery : [])
      .filter((m: any) => m?.asset?.imageUrl || m?.asset?.thumbUrl)
      .map((m: any) => ({
        url: m.asset.imageUrl || m.asset.thumbUrl,
        thumb: m.asset.thumbUrl || m.asset.imageUrl,
        alt: m.asset.alt || listingTitle || "",
        caption: m.caption || m.asset.title || "",
      }));

    if (!heroUrl) return rest;

    const heroSlide = {
      url: heroUrl,
      thumb: hero.thumb || heroUrl,
      alt: hero.alt || listingTitle || "",
      caption: hero.caption || "Cover photo",
    };

    // Deduplicate if hero appears in gallery
    const deduped = rest.filter((s) => s.url !== heroUrl);

    return [heroSlide, ...deduped];
  }, [gallery, hero, listingTitle]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = Array.from(el.children) as HTMLElement[];
        const target = el.scrollLeft + el.clientWidth * 0.5;

        let best = 0;
        let bestDist = Infinity;

        children.forEach((c, i) => {
          const center = c.offsetLeft + c.clientWidth * 0.5;
          const dist = Math.abs(center - target);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });

        setActive(best);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  function scrollTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.max(0, Math.min(i, slides.length - 1));
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  if (!slides.length) return null;

  return (
    <section className="mt-7">
      <div className="relative group">
        {/* Swipeable, editorial */}
        <div
          ref={scrollerRef}
          className="
            flex gap-3 overflow-x-auto scrollbar-none
            snap-x snap-mandatory
            -mx-5 px-5 sm:-mx-8 sm:px-8
          "
        >
          {slides.map((s, idx) => (
            <button
              key={s.url + idx}
              type="button"
              className="relative w-[92%] sm:w-full shrink-0 snap-center text-left"
              onClick={() => {
                setActive(idx);
                setOpen(true);
              }}
              aria-label={`Open photo ${idx + 1} of ${slides.length}`}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                <Image
                  src={s.url}
                  alt={s.alt}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                  sizes="(max-width: 1024px) 92vw, 66vw"
                />
              </div>

              {s.caption ? (
                <div className="caption mt-3 line-clamp-1">{s.caption}</div>
              ) : null}
            </button>
          ))}
        </div>

        {/* Arrow controls (desktop only, subtle, only on hover/focus) */}
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollTo(active - 1)}
              className="
                hidden sm:flex items-center justify-center
                absolute left-3 top-1/2 -translate-y-1/2
                h-10 w-10
                border border-[rgb(var(--border)/0.25)]
                bg-[rgb(var(--bg)/0.65)] backdrop-blur
                text-text/80 hover:text-text
                opacity-0 group-hover:opacity-100 focus:opacity-100
                transition
              "
              style={{ borderRadius: "999px" }}
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollTo(active + 1)}
              className="
                hidden sm:flex items-center justify-center
                absolute right-3 top-1/2 -translate-y-1/2
                h-10 w-10
                border border-[rgb(var(--border)/0.25)]
                bg-[rgb(var(--bg)/0.65)] backdrop-blur
                text-text/80 hover:text-text
                opacity-0 group-hover:opacity-100 focus:opacity-100
                transition
              "
              style={{ borderRadius: "999px" }}
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        ) : null}

        {/* Dots (Apple-ish minimal) */}
        {slides.length > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={[
                  "h-2 w-2 transition",
                  i === active ? "bg-text/70" : "bg-text/20 hover:bg-text/35",
                ].join(" ")}
                style={{ borderRadius: "999px" }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Lightbox: controlled, grid hidden */}
      <ListingGalleryLightbox
        gallery={gallery}
        listingTitle={listingTitle}
        hero={{
          url: hero.url,
          thumb: hero.thumb,
          alt: hero.alt,
          caption: hero.caption || "Cover photo",
          credit: hero.credit || null,
        }}
        open={open}
        onOpenChange={setOpen}
        initialIndex={active}
        hideGrid
      />
    </section>
  );
}
