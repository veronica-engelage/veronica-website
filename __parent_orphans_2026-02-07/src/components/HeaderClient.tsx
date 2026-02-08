"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { NavItem } from "@/lib/siteSettings";
import TextCtaButton from "@/components/TextCtaButton";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative inline-block h-4 w-5">
      <span
        className={[
          "absolute left-0 top-0 h-[2px] w-5 rounded-full bg-text transition-transform duration-200",
          open ? "translate-y-[7px] rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[7px] h-[2px] w-5 rounded-full bg-text transition-opacity duration-200",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[14px] h-[2px] w-5 rounded-full bg-text transition-transform duration-200",
          open ? "translate-y-[-7px] -rotate-45" : "",
        ].join(" ")}
      />
    </span>
  );
}

function isHttpExternal(href?: string) {
  return !!href && /^https?:\/\//i.test(href);
}
function isScheme(href?: string, scheme?: string) {
  return !!href && !!scheme && href.toLowerCase().startsWith(`${scheme}:`);
}
function ensureTel(href: string) {
  return href.startsWith("tel:") ? href : `tel:${href}`;
}
function ensureSms(href: string) {
  return href.startsWith("sms:") ? href : `sms:${href}`;
}

function defaultSmsHref(phone?: string) {
  if (!phone) return null;
  const body = encodeURIComponent(
    "Hi Veronica, I found your website and would like to talk about buying or selling in Charleston / Mount Pleasant."
  );
  return `sms:${phone}?&body=${body}`;
}

function NavLink({
  item,
  className,
  onClick,
  newTabExternal = true,
}: {
  item: NavItem;
  className: string;
  onClick?: () => void;
  newTabExternal?: boolean;
}) {
  const href = item?.href || "#";

  if (isScheme(href, "tel") || item?.kind === "tel") {
    const tel = ensureTel(href);
    return (
      <a href={tel} className={className} onClick={onClick}>
        {item?.label}
      </a>
    );
  }

  if (isScheme(href, "sms") || item?.kind === "sms") {
    const sms = ensureSms(href);
    return (
      <a href={sms} className={className} onClick={onClick}>
        {item?.label}
      </a>
    );
  }

  if (item?.kind === "external" || isHttpExternal(href)) {
    return (
      <a
        href={href}
        className={className}
        target={newTabExternal ? "_blank" : undefined}
        rel={newTabExternal ? "noreferrer" : undefined}
        onClick={onClick}
      >
        {item?.label}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {item?.label}
    </Link>
  );
}

function BrandSignet({ size = "lg" }: { size?: "lg" | "sm" }) {
  const dims =
    size === "lg"
      ? "h-16 w-16 sm:h-[72px] sm:w-[72px]"
      : "h-14 w-14"; // slightly bigger for scroll state (as you want)
  return (
    <div className={`relative ${dims} shrink-0`}>
      <Image
        src="/brand/logo-dark.svg"
        alt="Veronica Engelage Signet"
        fill
        className="object-contain dark:hidden"
        priority
      />
      <Image
        src="/brand/logo-light.svg"
        alt="Veronica Engelage Signet"
        fill
        className="hidden object-contain dark:block"
        priority
      />
    </div>
  );
}

export default function HeaderClient({
  nav,
  cta,
  phone,
}: {
  nav: NavItem[];
  cta: NavItem;
  phone?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const EXPAND_AT = 6;
    const COLLAPSE_AT = 36;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > COLLAPSE_AT) return true;
        if (prev && y < EXPAND_AT) return false;
        return prev;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll as any);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize as any);
  }, []);

  const mobileLinkClass = "text-lg sm:text-xl text-text/80 hover:text-text transition";

  const mobileCta: NavItem =
    cta?.href
      ? cta
      : phone
      ? { label: "Text me", href: defaultSmsHref(phone) || "#", kind: "sms" }
      : { label: "Get in touch", href: "/contact", kind: "internal" };

  const ctaNode = useMemo(() => {
    if (!cta) return null;
    if (cta?.href?.startsWith("sms:") || cta?.kind === "sms") {
      return (
        <TextCtaButton
          phone={phone}
          label={cta?.label || "Text me"}
          className="btn btn-primary"
        />
      );
    }
    return <NavLink item={cta} className="btn btn-primary" />;
  }, [cta, phone]);

  // Up to 3 shortcut links (first paint only). Later you can pass a dedicated prop from Sanity.
  const shortcuts = (nav || []).slice(0, 3);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-bg/92 backdrop-blur border-b border-border"
          : "bg-bg/40 backdrop-blur border-b border-transparent",
      ].join(" ")}
    >
      <div className="container-page">
        <div
          className={[
            "relative transition-all duration-300",
            scrolled ? "h-[76px]" : "h-[140px] sm:h-[156px]",
          ].join(" ")}
        >
          {/* CENTER BRAND */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Link
              href="/"
              aria-label="Home"
              className="flex flex-col items-center text-center"
            >
              <BrandSignet size={scrolled ? "sm" : "lg"} />

              <div
                className={[
                  "transition-all duration-300 overflow-hidden",
                  scrolled ? "max-h-0 opacity-0 mt-0" : "max-h-24 opacity-100 mt-[-8px]",
                ].join(" ")}
              >
                <div className="font-serif text-[26px] sm:text-[28px] tracking-[-0.015em] text-brand dark:text-brandContrast leading-[1.05]">
                  Veronica Engelage
                </div>
                <div className="mt-[1px] font-sans text-[9px] sm:text-[10.5px] uppercase tracking-[0.22em] text-brass">
                  Carolina One Real Estate
                </div>
              </div>
            </Link>
          </div>

          {/* RIGHT CONTROLS */}
          {/* IMPORTANT: no transforms here, so TextCtaButton's fixed modal/backdrop stays viewport-centered */}
          <div
            className={[
              "absolute right-0 flex flex-col items-end gap-8",
              // On scroll: center vertically (no translate)
              scrolled ? "top-1/2 mt-[-20px]" : "",
              // First paint: align to pedestal (no translate)
              scrolled ? "" : "top-[30%] mt-[-20px]",
            ].join(" ")}
          >
            {/* Shortcuts: show only on first paint, desktop only */}
            {!scrolled && shortcuts.length > 0 && (
  <div className="hidden lg:flex items-center justify-end gap-2 font-sans">
    {shortcuts.map((item, i) => (
      <span key={`${item.label}-shortcut-${i}`} className="flex items-center gap-2">
        <NavLink
          item={item}
          className="text-[11px] uppercase tracking-[0.18em] text-text/60 hover:text-text transition"
        />
        {i < shortcuts.length - 1 ? (
          <span aria-hidden="true" className="text-text/35">
            |
          </span>
        ) : null}
      </span>
    ))}
  </div>
)}


            {/* CTA + burger row */}
            <div className="flex items-center gap-4">
              {/* Hide CTA under 1024 */}
              <div className="hidden lg:block">{ctaNode}</div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={[
                  "inline-flex items-center justify-center h-10 w-10 rounded-md text-text hover:bg-bg/60",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prestige/50 transition",
                ].join(" ")}
              >
                <MenuIcon open={open} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu panel */}
      {open && (
        <div className="border-t border-border bg-bg/96 backdrop-blur">
          <div className="container-page py-6">
            <div className="flex flex-col gap-4 md:ml-auto md:max-w-xs lg:max-w-sm">
              {nav?.map((item, i) => (
                <NavLink
                  key={`${item.label}-m-${i}`}
                  item={item}
                  className={mobileLinkClass}
                  onClick={() => setOpen(false)}
                />
              ))}

              {/* Only show CTA in menu on <lg since top CTA is hidden there */}
              <div className="pt-3 lg:hidden">
                <NavLink
                  item={mobileCta}
                  className="btn btn-primary w-full"
                  onClick={() => setOpen(false)}
                  newTabExternal={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
