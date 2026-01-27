"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type GalleryLayout = "grid" | "featured" | "masonry";

type Slide = {
  url: string;
  alt: string;
  caption?: string;
  credit?: string;
};

function asNonEmptyString(v: any): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function unwrapItem(it: any): any {
  // Handle wrapper shape from schema:
  // { _type: "imageRef", imageRef: {...} } or { _type:"videoRef", videoRef:{...} }
  if (it?.imageRef) return it.imageRef;
  if (it?.videoRef) return it.videoRef;
  return it;
}

function pickUrl(raw: any): string | null {
  const it = unwrapItem(raw);

  // preferred normalized form from GROQ ("url": ...)
  const direct = asNonEmptyString(it?.url);
  if (direct) return direct;

  // imageAsset: image.asset.url
  const img =
    asNonEmptyString(it?.image?.asset?.url) ||
    asNonEmptyString(it?.image?.asset?.[0]?.url); // just in case something weird happens
  if (img) return img;

  // videoAsset possibilities
  const file = asNonEmptyString(it?.file?.asset?.url);
  if (file) return file;

  const thumb = asNonEmptyString(it?.thumbnail?.asset?.url);
  if (thumb) return thumb;

  const providerUrl = asNonEmptyString(it?.url);
  if (providerUrl) return providerUrl;

  // Legacy misc fallbacks
  return (
    asNonEmptyString(raw?.url) ||
    asNonEmptyString(raw?.image?.asset?.url) ||
    asNonEmptyString(raw?.thumbnail?.asset?.url) ||
    asNonEmptyString(raw?.file?.asset?.url) ||
    null
  );
}

function pickAlt(raw: any): string {
  const it = unwrapItem(raw);
  return it?.alt || it?.title || "";
}

function pickCaption(raw: any): string | undefined {
  const it = unwrapItem(raw);
  return it?.title || it?.alt || undefined;
}

function pickCredit(raw: any): string | undefined {
  const it = unwrapItem(raw);
  const required = !!it?.credits?.creditRequired;
  if (!required) return undefined;

  const author = asNonEmptyString(it?.credits?.author);
  const notice = asNonEmptyString(it?.credits?.copyrightNotice);

  if (author) return `Photo: ${author}`;
  if (notice) return `© ${notice}`;
  return undefined;
}

export function GallerySection({ title, layout, items = [] }: any) {
  const normalized = Array.isArray(items) ? items.filter(Boolean) : [];
  const mode: GalleryLayout = (layout as GalleryLayout) || "featured";

  // Useful debug: you can remove later
  useEffect(() => {
    // If this prints wrappers, your GROQ isn't normalizing/dereferencing how you think.
    console.log("[GallerySection] items sample:", normalized?.[0]);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const slides = useMemo<Slide[]>(() => {
    return normalized
      .map((raw: any) => {
        const url = pickUrl(raw);
        if (!url) return null;

        return {
          url,
          alt: pickAlt(raw),
          caption: pickCaption(raw),
          credit: pickCredit(raw),
        };
      })
      .filter(Boolean) as Slide[];
  }, [normalized]);

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

  // lock body scroll
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // keyboard support
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, slides.length]);

  const tileBase =
    "media-frame relative overflow-hidden bg-black/5 cursor-zoom-in block w-full text-left";

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {slides.map((s, idx) => (
        <button
          key={s.url + idx}
          type="button"
          onClick={() => openAt(idx)}
          className={`${tileBase} aspect-[4/3]`}
          aria-label={`Open image ${idx + 1}`}
        >
          <Image
            src={s.url}
            alt={s.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </button>
      ))}
    </div>
  );

  const renderFeatured = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slides.map((s, idx) => {
        const isFeatured = idx === 0;
        return (
          <button
            key={s.url + idx}
            type="button"
            onClick={() => openAt(idx)}
            className={[
              tileBase,
              isFeatured
                ? "md:col-span-2 aspect-[16/10] md:aspect-[16/9]"
                : "aspect-[4/3]",
            ].join(" ")}
            aria-label={`Open image ${idx + 1}`}
          >
            <Image
              src={s.url}
              alt={s.alt}
              fill
              className="object-cover"
              sizes={
                isFeatured
                  ? "(max-width: 768px) 100vw, 66vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
            />
          </button>
        );
      })}
    </div>
  );

  const renderMasonry = () => (
    <div className="columns-1 sm:columns-2 md:columns-3 gap-6 [column-fill:_balance]">
      {slides.map((s, idx) => (
        <button
          key={s.url + idx}
          type="button"
          onClick={() => openAt(idx)}
          className={`${tileBase} mb-6 break-inside-avoid`}
          aria-label={`Open image ${idx + 1}`}
        >
          <div className="relative w-full">
            <div className={idx % 5 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"} />
            <Image
              src={s.url}
              alt={s.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </button>
      ))}
    </div>
  );

  const GalleryGrid =
    mode === "masonry"
      ? renderMasonry
      : mode === "grid"
      ? renderGrid
      : renderFeatured;

  return (
    <section className="container-page py-12">
      {title ? <h2 className="text-2xl font-semibold mb-6">{title}</h2> : null}

      {!slides.length ? (
        <div className="text-sm text-muted">
          No gallery items resolved (items exist, but no URLs matched the expected
          shape).
        </div>
      ) : (
        GalleryGrid()
      )}

      {/* Lightbox */}
      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/55" />

          <div
            className="relative z-[61] w-full max-w-6xl group"
            onClick={(e) => e.stopPropagation()}
          >
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
                  aria-label="Close gallery"
                >
                  ×
                </button>

                {slides.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-3xl leading-none text-text/55 hover:text-text hover:bg-black/10 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-3xl leading-none text-text/55 hover:text-text hover:bg-black/10 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                ) : null}
              </div>

              {(slides[active].caption || slides[active].credit) ? (
                <div className="p-4 text-sm text-muted space-y-1">
                  {slides[active].caption ? <div>{slides[active].caption}</div> : null}
                  {slides[active].credit ? (
                    <div className="text-xs opacity-80">{slides[active].credit}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
