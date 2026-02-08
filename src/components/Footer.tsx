import Image from "next/image";
import { getSiteSettings } from "@/lib/siteSettings";

type FooterLink = { label?: string; href?: string };

export default async function Footer({ phone: _phone }: { phone: string }) {
  const settings = await getSiteSettings().catch(() => null);

  const addressLine = (settings?.address ||
    settings?.primaryLocation ||
    "") as string;

  const footerNav: FooterLink[] = Array.isArray(settings?.footerNav)
    ? settings.footerNav.filter(Boolean)
    : [];

  // If you haven’t wired footerNav yet, keep your current links as fallback
  const legalLinks: FooterLink[] = footerNav.length
    ? footerNav
    : [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Use", href: "/terms-of-use" },
        { label: "Fair Housing", href: "/fair-housing" },
        { label: "Accessibility", href: "/accessibility" },
        { label: "Do Not Sell or Share My Personal Information", href: "/do-not-sell" },
      ];

  const normalizedLegalLinks = legalLinks.map((link) => {
    const label = link?.label?.trim();
    if (!label) return link;
    const lower = label.toLowerCase();
    if (lower === "fair-housing" || lower === "fair housing") {
      return { ...link, label: "Fair Housing" };
    }
    if (lower === "terms of use" || lower === "terms of use") {
      return { ...link, label: "Terms of Use" };
    }
    return link;
  });

  const agentName = (settings?.agentName || "Veronica Engelage") as string;
  const brokerageName = (settings?.brokerageName || "Carolina One Real Estate") as string;

  const disclaimer =
    (settings?.footerDisclaimer as string) ||
    `Veronica Engelage is a real estate licensee affiliated with Carolina One Real Estate. Information deemed reliable but not guaranteed. All properties are subject to prior sale, change, or withdrawal. Neither listing broker(s) nor Carolina One Real Estate shall be responsible for any typographical errors, misinformation, or omissions.`;

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page pt-14 pb-10">
        {/* Top */}
        <div className="flex flex-col items-center text-center">
          <div className="leading-[1.1]">
            <div className="font-serif text-[30px] tracking-[-0.015em] text-brand dark:text-brandContrast sm:text-[34px]">
              {agentName}
            </div>
            <div className="mt-[4px] font-serif text-[14px] uppercase tracking-[0.08em] text-prestige">
              {brokerageName}
            </div>
          </div>

          <div className="mt-6">
            <a
              href="https://carolinaone.com"
              target="_blank"
              rel="noreferrer"
              className="inline-block opacity-[0.85] transition-opacity hover:opacity-100 grayscale"
              aria-label={brokerageName}
            >
              <Image
                src="/logos/carolinaonelogo_dark.png"
                alt={brokerageName}
                width={270}
                height={74}
                className="h-[52px] w-auto dark:hidden"
              />
              <Image
                src="/logos/carolinaonelogo_light.png"
                alt={brokerageName}
                width={270}
                height={74}
                className="hidden h-[52px] w-auto dark:block"
              />
            </a>
          </div>

          {addressLine ? (
            <div className="mt-6 text-sm text-muted">{addressLine}</div>
          ) : null}
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Legal links + disclaimer */}
            <div className="min-w-0">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">
                {normalizedLegalLinks
                  .filter((l) => l?.label && l?.href)
                  .map((l) => (
                    <a key={`${l.href}-${l.label}`} href={l.href!} className="hover:text-text">
                      {l.label}
                    </a>
                  ))}
              </div>

              <p className="mt-4 max-w-[800px] text-xs text-muted leading-relaxed">
                <strong>Disclaimer:</strong> {disclaimer}
              </p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="opacity-[0.75] grayscale">
                  <Image
                    src="/logos/nar_membershipmark_dark.png"
                    alt="National Association of Realtors membership mark"
                    width={120}
                    height={40}
                    className="h-6 w-auto dark:hidden"
                  />
                  <Image
                    src="/logos/nar_membershipmark_light.png"
                    alt="National Association of Realtors membership mark"
                    width={120}
                    height={40}
                    className="hidden h-6 w-auto dark:block"
                  />
                </div>

                <div className="opacity-[0.75] grayscale">
                  <Image
                    src="/logos/equal-housing-opportunity-logo_dark.png"
                    alt="Equal Housing Opportunity"
                    width={110}
                    height={40}
                    className="h-6 w-auto dark:hidden"
                  />
                  <Image
                    src="/logos/equal_housing_opportunity_logo_light.png"
                    alt="Equal Housing Opportunity"
                    width={110}
                    height={40}
                    className="hidden h-6 w-auto dark:block"
                  />
                </div>
              </div>

              <div className="mt-4 text-xs text-muted">
                © {new Date().getFullYear()} {agentName} · {brokerageName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
