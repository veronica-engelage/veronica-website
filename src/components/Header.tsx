"use client"

import { useEffect, useState } from "react"
import BrandLockup from "@/components/BrandLockup"

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
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener("resize", onResize, { passive: true })
    return () => window.removeEventListener("resize", onResize)
  }, [])

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
        <a href="/" className="flex items-center" aria-label="Home">
          <BrandLockup />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10 text-sm">
          <a
  href="/about"
  className="text-text/70 hover:text-text transition tracking-[0.04em]"
>
  About
</a>
<a
  href="/contact"
  className="text-text/70 hover:text-text transition tracking-[0.04em]"
>
  Contact
</a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <a href="/contact" className="btn btn-primary">
            Get in touch
          </a>
        </div>

        {/* Mobile burger — icon only */}
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
              <a
                href="/about"
                className="text-sm text-text/80 hover:text-text transition"
                onClick={() => setOpen(false)}
              >
                About
              </a>
              <a
                href="/contact"
                className="text-sm text-text/80 hover:text-text transition"
                onClick={() => setOpen(false)}
              >
                Contact
              </a>

              <div className="pt-3">
                <a
  href="tel:+18435551234"
  className="btn btn-primary w-full"
  onClick={() => setOpen(false)}
>
  Get in touch
</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
