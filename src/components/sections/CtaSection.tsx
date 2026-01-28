import Link from "next/link";
import { resolveCtaHref } from "@/lib/linkResolver";

type Resolved = { href: string; external?: boolean } | null;

type Cta = {
  label?: string;
  // keep "any" because your resolver likely supports multiple shapes
  link?: any;
};

type Props = {
  headline?: string;
  text?: string;
  cta?: Cta;
};

export function CtaSection({ headline, text, cta }: Props) {
  const resolved: Resolved = cta ? resolveCtaHref(cta) : null;

  // safe defaults (optional)
  const h = headline || "A calm conversation, when you’re ready";
  const t = text || "No pressure. No obligation. Just clear guidance.";

  const buttonClass =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium " +
    "border border-white/15 bg-white/5 hover:bg-white/10 transition";

  const hasAny = Boolean(headline || text || (cta?.label && resolved?.href));
  if (!hasAny) return null;

  const label = cta?.label;
  const href = resolved?.href;
  const isExternal = Boolean(resolved?.external);

  return (
    <section className="container-page py-14">
      <div className="mx-auto max-w-4xl">
        <div
          className={[
            "relative overflow-hidden rounded-3xl",
            "border border-white/10",
            "bg-white/[0.03]",
            "shadow-[0_18px_55px_rgba(0,0,0,0.35)]",
          ].join(" ")}
        >
          {/* gentle highlight wash */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

          <div className="relative px-8 py-12 sm:px-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {h}
            </h2>

            <p className="mt-4 max-w-2xl leading-relaxed opacity-80">{t}</p>

            {label && href ? (
              <div className="mt-7">
                {isExternal ? (
                  <a
                    className={buttonClass}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {label}
                  </a>
                ) : (
                  <Link className={buttonClass} href={href}>
                    {label}
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
