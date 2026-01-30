import HeaderClient from "@/components/HeaderClient";
import { getSiteSettings } from "@/lib/siteSettings";
import { normalizeE164, smsHref } from "@/lib/phone";

type CtaMode = "link" | "tel" | "sms";

export default async function Header() {
  const settings = await getSiteSettings().catch(() => null);

  const nav =
    settings?.headerNav?.length
      ? settings.headerNav
      : [
          { label: "About", href: "/about", kind: "internal" as const },
          { label: "Contact", href: "/contact", kind: "internal" as const },
        ];

  const phoneE164 = normalizeE164(settings?.phone);

  const ctaLabel: string | undefined = settings?.headerCta?.label;
  const ctaMode: CtaMode | undefined = settings?.headerCta?.mode;
  const ctaValue: string | undefined =
    settings?.headerCta?.value || settings?.headerCta?.href;
  const ctaMessage: string | undefined = settings?.headerCta?.message;

  let cta:
    | { label: string; href: string; kind: "internal" | "external" | "tel" | "sms" }
    | undefined;

  if (ctaMode === "sms") {
    const phoneFromValue = normalizeE164(ctaValue) || phoneE164;
    if (phoneFromValue) {
      cta = {
        label: ctaLabel || "Text me",
        href: smsHref(
          phoneFromValue,
          ctaMessage ||
            "Hi Veronica, I found your website and would like to talk about buying or selling in Charleston / Mount Pleasant."
        ),
        kind: "sms",
      };
    }
  } else if (ctaMode === "tel") {
    const phoneFromValue = normalizeE164(ctaValue) || phoneE164 || ctaValue || "";
    if (phoneFromValue) {
      const tel = phoneFromValue.startsWith("tel:")
        ? phoneFromValue
        : `tel:${phoneFromValue}`;
      cta = { label: ctaLabel || "Call", href: tel, kind: "tel" };
    }
  } else {
    const href = ctaValue || "/contact";
    cta = { label: ctaLabel || "Get in touch", href, kind: "internal" };
  }

  if (!cta) {
    cta =
      phoneE164
        ? {
            label: "Text me",
            href: smsHref(
              phoneE164,
              "Hi Veronica, I found your website and would like to talk about buying or selling in Charleston / Mount Pleasant."
            ),
            kind: "sms",
          }
        : { label: "Get in touch", href: "/contact", kind: "internal" };
  }

  return <HeaderClient nav={nav} cta={cta as any} phone={phoneE164 || undefined} />;
}
