import Link from "next/link";
import { resolveCtaHref } from "@/lib/linkResolver";

type Resolved = { href: string; external?: boolean } | null;

type Cta = {
  label?: string;
  link?: any; // resolver supports multiple shapes
};

type Variant = "card" | "band";

type Props = {
  headline?: string;
  text?: string;
  cta?: Cta;
  secondaryCta?: Cta;

  /**
   * Optional. If you don't have this in Sanity yet, just omit it
   * and you'll still get the "expensive" card default.
   */
  variant?: Variant;

  /**
   * Optional. For rare cases where CTA needs to be narrower/wider.
   */
  width?: "narrow" | "normal";
};

function Action({
  cta,
  className,
}: {
  cta?: Cta;
  className: string;
}) {
  const resolved: Resolved = cta ? resolveCtaHref(cta) : null;
  const label = cta?.label?.trim();
  const href = resolved?.href;

  if (!label || !href) return null;

  if (resolved?.external) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export function CtaSection({
  headline,
  text,
  cta,
  secondaryCta,
  variant = "card",
  width = "normal",
}: Props) {
  const hasAny = Boolean(headline || text || cta?.label || secondaryCta?.label);
  if (!hasAny) return null;

  const h = (headline || "A calm conversation, when you’re ready").trim();
  const t = (text || "No pressure. No obligation. Just clear guidance.").trim();

  const innerWidth =
    width === "narrow" ? "max-w-[72ch]" : "max-w-[92ch]";

  // shared layout
  const content = (
    <div className={["mx-auto", innerWidth].join(" ")}>
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl tracking-tight">{h}</h2>
        {t ? <p className="max-w-2xl leading-relaxed text-muted">{t}</p> : null}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Action cta={cta} className="btn btn-primary" />
        <Action cta={secondaryCta} className="btn btn-secondary" />
      </div>
    </div>
  );

  if (variant === "band") {
    // band = calmer, less “boxed”, works well between sections
    return (
      <section className="py-14 sm:py-18">
        <div className="container-page">
          <div className="divider mb-10" />
          {content}
          <div className="divider mt-10" />
        </div>
      </section>
    );
  }

  // card = your “expensive” look
  return (
    <section className="container-page py-14 sm:py-18">
      <div className="card p-8 sm:p-12">
        {/* subtle wash, no glow circus */}
        <div className="pointer-events-none absolute inset-0 opacity-0" />
        {content}
      </div>
    </section>
  );
}
