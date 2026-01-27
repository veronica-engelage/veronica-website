"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
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
  // Expect phone to be E.164 (e.g. +18548372944). Normalize upstream in Header.tsx if needed.
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

  // Special schemes: never use Next Link, never force new tab
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

  // Real external http(s)
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

  // Internal routes
  return (
    <Link href={href} className={className} onClick={onClick}>
      {item?.label}
    </Link>
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const desktopLinkClass =
    "text-text/70 hover:text-text transition tracking-[0.04em]";
  const mobileLinkClass = "text-sm text-text/80 hover:text-text transition";

  // Mobile CTA: prefer provided CTA. If missing, default to TEXT (sms) if phone exists; else /contact.
  const mobileCta: NavItem =
    cta?.href
      ? cta
      : phone
      ? { label: "Text me", href: defaultSmsHref(phone) || "#", kind: "sms" }
      : { label: "Get in touch", href: "/contact", kind: "internal" };

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-bg/90 backdrop-blur border-b border-border"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="container-page flex h-[76px] sm:h-20 items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Home">
          <BrandLockup />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10 text-sm">
          {nav?.map((item, i) => (
            <NavLink
              key={`${item.label}-${i}`}
              item={item}
              className={desktopLinkClass}
            />
          ))}
        </nav>

{/* Desktop CTA */}
<div className="hidden md:flex items-center">
  {cta?.href?.startsWith("sms:") || cta?.kind === "sms" ? (
    <TextCtaButton phone={phone} label={cta?.label || "Text me"} className="btn btn-primary" />
  ) : (
    <NavLink item={cta} className="btn btn-primary" />
  )}
</div>


        {/* Mobile burger */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="
            md:hidden
            inline-flex items-center justify-center
            h-10 w-10
            rounded-md
            text-text
            hover:bg-bg/60
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-prestige/50
            transition
          "
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-border bg-bg/96 backdrop-blur">
          <div className="container-page py-6">
            <div className="flex flex-col gap-4">
              {nav?.map((item, i) => (
                <NavLink
                  key={`${item.label}-m-${i}`}
                  item={item}
                  className={mobileLinkClass}
                  onClick={() => setOpen(false)}
                />
              ))}

              <div className="pt-3">
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
