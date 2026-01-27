import BrandLockup from "@/components/BrandLockup"
import Image from "next/image"
import { getSiteSettings } from "@/lib/siteSettings"

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function formatPhoneTel(phone: string) {
  const digits = phone.replace(/\D/g, "")
  return digits.length === 10 ? `+1${digits}` : `+${digits}`
}

type FooterLink = { label?: string; href?: string }

export default async function Footer({ phone }: { phone: string }) {
  const settings = await getSiteSettings().catch(() => null)

  // --- copy defaults from your current design ---
  const fallbackTagline =
    "Charleston & Mount Pleasant real estate, guided with discretion, local intelligence, and calm execution."

  const fallbackLocation = "Charleston & Mount Pleasant, SC"

  // --- pull from siteSettings (but do not break if missing) ---
  const phoneRaw = (settings?.phone || phone || "").toString()
  const phoneDisplay = phoneRaw ? formatPhoneDisplay(phoneRaw) : ""
  const phoneTel = phoneRaw ? formatPhoneTel(phoneRaw) : ""

  const tagline = (settings?.footerTagline || settings?.brandTagline || fallbackTagline) as string
  const locationLine = (settings?.locationLine || fallbackLocation) as string

  const footerNav: FooterLink[] = Array.isArray(settings?.footerNav)
    ? settings.footerNav.filter(Boolean)
    : []

  // If you haven’t wired footerNav yet, keep your current links as fallback
  const legalLinks: FooterLink[] = footerNav.length
    ? footerNav
    : [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Use", href: "/terms-of-use" },
        { label: "Fair Housing", href: "/fair-housing" },
        { label: "Accessibility", href: "/accessibility" },
        { label: "Do Not Sell or Share My Personal Information", href: "/do-not-sell" },
      ]

  const ctaLabel = (settings?.footerCtaLabel || "Get in touch") as string
  const ctaHref = (settings?.footerCtaHref || "/contact") as string

  const agentName = (settings?.agentName || "Veronica Engelage") as string
  const brokerageName = (settings?.brokerageName || "Carolina One Real Estate") as string

  const disclaimer =
    (settings?.footerDisclaimer as string) ||
    `Veronica Engelage is a real estate licensee affiliated with Carolina One Real Estate. Information deemed reliable but not guaranteed. All properties are subject to prior sale, change, or withdrawal. Neither listing broker(s) nor Carolina One Real Estate shall be responsible for any typographical errors, misinformation, or omissions.`

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page py-16">
        {/* Top */}
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          {/* Brand */}
          <div className="max-w-xl">
            <BrandLockup />
            <p className="mt-4 max-w-md text-sm text-muted">{tagline}</p>
          </div>

          {/* Contact */}
          <div className="md:justify-self-end">
            <div className="flex flex-col gap-2 text-sm">
              <a href={ctaHref} className="text-text/80 hover:text-text transition">
                {ctaLabel}
              </a>

              {phoneRaw ? (
                <a href={`tel:${phoneTel}`} className="text-text/80 hover:text-text transition">
                  {phoneDisplay}
                </a>
              ) : null}

              <span className="text-muted">{locationLine}</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            {/* Legal links + disclaimer */}
            <div className="min-w-0">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                {legalLinks
                  .filter((l) => l?.label && l?.href)
                  .map((l) => (
                    <a key={`${l.href}-${l.label}`} href={l.href!} className="hover:text-text">
                      {l.label}
                    </a>
                  ))}
              </div>

              <p className="mt-4 max-w-3xl text-xs text-muted leading-relaxed">
                <strong>Disclaimer:</strong> {disclaimer}
              </p>

              <div className="mt-4 text-xs text-muted">
                © {new Date().getFullYear()} {agentName} · {brokerageName}
              </div>
            </div>

            {/* Broker logo (small, aligned, not screaming) */}
            <div className="shrink-0 md:pt-1">
              <Image
                src="/logos/carolina-one-dark.png"
                alt={brokerageName}
                width={140}
                height={36}
                className="opacity-70"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
