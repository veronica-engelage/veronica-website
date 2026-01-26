import BrandLockup from "@/components/BrandLockup"
import Image from "next/image"

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

export default function Footer({ phone }: { phone: string }) {
  const phoneDisplay = formatPhoneDisplay(phone)
  const phoneTel = formatPhoneTel(phone)

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page py-16">
        {/* Top */}
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          {/* Brand */}
          <div className="max-w-xl">
            <BrandLockup />
            <p className="mt-4 max-w-md text-sm text-muted">
              Charleston & Mount Pleasant real estate, guided with discretion,
              local intelligence, and calm execution.
            </p>

            
          </div>

          {/* Contact */}
          <div className="md:justify-self-end">
            <div className="flex flex-col gap-2 text-sm">
              <a href="/contact" className="text-text/80 hover:text-text transition">
                Get in touch
              </a>
              <a href={`tel:${phoneTel}`} className="text-text/80 hover:text-text transition">
                {phoneDisplay}
              </a>
              <span className="text-muted">
                Charleston & Mount Pleasant, SC
              </span>
            </div>
          </div>
        </div>

{/* Bottom */}
<div className="mt-12 border-t border-border pt-6">
  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
    {/* Legal links + disclaimer */}
    <div className="min-w-0">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        <a href="/privacy-policy" className="hover:text-text">Privacy Policy</a>
        <a href="/terms-of-use" className="hover:text-text">Terms of Use</a>
        <a href="/fair-housing" className="hover:text-text">Fair Housing</a>
        <a href="/accessibility" className="hover:text-text">Accessibility</a>
        <a href="/do-not-sell" className="hover:text-text">
          Do Not Sell or Share My Personal Information
        </a>
      </div>

      <p className="mt-4 max-w-3xl text-xs text-muted leading-relaxed">
        <strong>Disclaimer:</strong> Veronica Engelage is a real estate licensee
        affiliated with Carolina One Real Estate. Information deemed reliable
        but not guaranteed. All properties are subject to prior sale, change,
        or withdrawal. Neither listing broker(s) nor Carolina One Real Estate
        shall be responsible for any typographical errors, misinformation,
        or omissions.
      </p>

      <div className="mt-4 text-xs text-muted">
        © {new Date().getFullYear()} Veronica Engelage · Carolina One Real Estate
      </div>
    </div>

    {/* Broker logo (small, aligned, not screaming) */}
    <div className="shrink-0 md:pt-1">
      <Image
        src="/logos/carolina-one-dark.png"
        alt="Carolina One Real Estate"
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
