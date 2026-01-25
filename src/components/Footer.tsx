import BrandLockup from "@/components/BrandLockup"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page py-16 sm:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          
          {/* Brand */}
          <div className="max-w-sm">
            <BrandLockup />
            <p className="mt-4 text-sm text-muted">
              Charleston & Mount Pleasant real estate, guided with discretion,
              local intelligence, and calm execution.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3 text-sm">
            <a
              href="/contact"
              className="text-text/80 hover:text-text transition"
            >
              Get in touch
            </a>
            <a
              href="tel:+18435551234"
              className="text-text/80 hover:text-text transition"
            >
              (843) 555-1234
            </a>
            <span className="text-muted">
              Charleston & Mount Pleasant, SC
            </span>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-12 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Veronica Engelage · Carolina One Real Estate
        </div>
      </div>
    </footer>
  )
}
