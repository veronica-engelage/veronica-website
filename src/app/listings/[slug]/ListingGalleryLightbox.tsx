"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  url: string;
  thumb?: string;
  alt: string;
  caption?: string;
  credit?: string;
};

function normalizeUrl(u?: string | null) {
  return (u || "").trim();
}

export function ListingGalleryLightbox({
  gallery,
  listingTitle,
  hero,
}: {
  gallery: any[];
  listingTitle: string;
  hero?: {
    url?: string | null;
    thumb?: string | null;
    alt?: string | null;
    caption?: string | null;
    credit?: string | null;
  } | null;
}) {
  const slides = useMemo<Slide[]>(() => {
    const base = (Array.isArray(gallery) ? gallery : [])
      .map((m: any) => {
        const url = m?.asset?.imageUrl || m?.asset?.thumbUrl || m?.asset?.url;
        if (!url) return null;

        const thumb = m?.asset?.thumbUrl || m?.asset?.imageUrl || url;
        const caption = m?.caption || m?.asset?.title || undefined;

        const creditRequired = !!m?.asset?.credits?.creditRequired;
        const author = m?.asset?.credits?.author;
        const notice = m?.asset?.credits?.copyrightNotice;

        const credit =
          creditRequired
            ? author
              ? `Photo: ${author}`
              : notice
              ? `© ${notice}`
              : undefined
            : undefined;

        return {
          url,
          thumb,
          alt: m?.asset?.alt || caption || listingTitle || "",
          caption,
          credit,
        } satisfies Slide;
      })
      .filter(Boolean) as Slide[];

    const heroUrl = normalizeUrl(hero?.url || undefined);
    if (heroUrl) {
      const heroSlide: Slide = {
        url: heroUrl,
        thumb: normalizeUrl(hero?.thumb || undefined) || heroUrl,
        alt: (hero?.alt || listingTitle || "").trim(),
        caption: (hero?.caption || "").trim() || undefined,
        credit: (hero?.credit || "").trim() || undefined,
      };

      // Put hero first, then dedupe any gallery slide with same url
      const deduped = [heroSlide, ...base].filter((s, idx, arr) => {
        const u = normalizeUrl(s.url);
        return arr.findIndex((x) => normalizeUrl(x.url) === u) === idx;
      });

      return deduped;
    }

    // No hero, just dedupe gallery by url
    return base.filter((s, idx, arr) => {
      const u = normalizeUrl(s.url);
      return arr.findIndex((x) => normalizeUrl(x.url) === u) === idx;
    });
  }, [gallery, hero, listingTitle]);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  function openAt(i: number) {
    setActive(i);
    setOpen(true);
  }
  function close() {
    setOpen(false);
  }
  function prev() {
    setActive((v) => (v - 1 + slides.length) % slides.length);
  }
  function next() {
    setActive((v) => (v + 1) % slides.length);
  }

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slides.length]);

  if (!slides.length) return null;

  const showThumbStrip = slides.length >= 6;

  return (
    <>
      {/* grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slides.map((s, idx) => (
          <button
            key={s.url + idx}
            type="button"
            className="card overflow-hidden text-left cursor-zoom-in"
            onClick={() => openAt(idx)}
            aria-label={`Open image ${idx + 1}`}
          >
            <div className="relative aspect-[4/3] bg-black/5">
              <Image src={s.thumb || s.url} alt={s.alt} fill className="object-cover" />
            </div>
            {s.caption ? (
              <div className="p-3 text-xs text-muted line-clamp-2">{s.caption}</div>
            ) : null}
          </button>
        ))}
      </div>

      {/* lightbox */}
      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-[61] w-full max-w-6xl group" onClick={(e) => e.stopPropagation()}>
            <div className="card overflow-hidden">
              <div className="relative bg-black/10">
                <div className="relative mx-auto w-full max-w-[72rem] h-[80vh] sm:h-[82vh]">
                  <Image
                    src={slides[active].url}
                    alt={slides[active].alt}
                    fill
                    priority
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="absolute right-4 top-4 rounded-full px-3 py-2 text-lg leading-none text-text/70 hover:text-text hover:bg-black/10 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Close"
                >
                  ×
                </button>

                {slides.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-3xl leading-none text-text/55 hover:text-text hover:bg-black/10 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Previous"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-3xl leading-none text-text/55 hover:text-text hover:bg-black/10 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Next"
                    >
                      ›
                    </button>
                  </>
                ) : null}
              </div>

              {(slides[active].caption || slides[active].credit || showThumbStrip) ? (
                <div className="p-4 text-sm text-muted space-y-3">
                  {(slides[active].caption || slides[active].credit) ? (
                    <div className="space-y-1">
                      {slides[active].caption ? <div>{slides[active].caption}</div> : null}
                      {slides[active].credit ? (
                        <div className="text-xs opacity-80">{slides[active].credit}</div>
                      ) : null}
                    </div>
                  ) : null}

                  {showThumbStrip ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {slides.map((s, idx) => (
                        <button
                          key={(s.thumb || s.url) + idx}
                          type="button"
                          onClick={() => setActive(idx)}
                          className={[
                            "relative h-14 w-20 flex-none overflow-hidden rounded-lg border",
                            idx === active ? "border-text/60" : "border-transparent",
                          ].join(" ")}
                          aria-label={`Go to image ${idx + 1}`}
                        >
                          <Image
                            src={s.thumb || s.url}
                            alt={s.alt}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

