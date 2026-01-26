import Image from "next/image";
import Link from "next/link";
import { resolveCtaHref } from "@/lib/linkResolver";

type HeroVariant = "standard" | "signatureCutout";
type HeroLayout = "overlay" | "split";
type CtaLike = any;

type HeroProps = {
  eyebrow?: string | null;
  headline?: string | null;
  subheadline?: string | null;

  variant?: HeroVariant | null;
  layout?: HeroLayout | null;

  cta?: CtaLike; // primary
  secondaryCta?: CtaLike; // secondary
  media?: any;

  cutoutImage?: any;

  signatureBackgroundFallbackSrc?: string;
  signatureCutoutFallbackSrc?: string;
};

function CtaLink({ cta, className }: { cta: any; className: string }) {
  const resolved = resolveCtaHref(cta);
  if (!cta?.label || !resolved) return null;

  if (resolved.external) {
    return (
      <a className={className} href={resolved.href} target="_blank" rel="noreferrer">
        {cta.label}
      </a>
    );
  }

  return (
    <Link className={className} href={resolved.href}>
      {cta.label}
    </Link>
  );
}

function CtaRow({
  primary,
  secondary,
  className,
  primaryClass,
  secondaryClass,
}: {
  primary?: any;
  secondary?: any;
  className: string;
  primaryClass: string;
  secondaryClass: string;
}) {
  const hasPrimary = !!(primary?.label && resolveCtaHref(primary));
  const hasSecondary = !!(secondary?.label && resolveCtaHref(secondary));
  if (!hasPrimary && !hasSecondary) return null;

  return (
    <div className={className}>
      <CtaLink cta={primary} className={primaryClass} />
      <CtaLink cta={secondary} className={secondaryClass} />
    </div>
  );
}

export function HeroSection(props: HeroProps) {
  const {
    eyebrow,
    headline,
    subheadline,
    cta,
    secondaryCta,
    media,
    variant,
    layout,
    cutoutImage,
    signatureBackgroundFallbackSrc = "/images/hero-house.png",
    signatureCutoutFallbackSrc = "/images/veronica-cutout.png",
  } = props;

  const heroVariant: HeroVariant = (variant as HeroVariant) || "standard";
  const heroLayout: HeroLayout = (layout as HeroLayout) || "overlay";

  const imgUrl: string | undefined =
    media?.image?.asset?.url || media?.thumbnail?.asset?.url || media?.asset?.url || media?.url;

  const alt = media?.alt || headline || "";

  const cutoutUrl: string | undefined = cutoutImage?.asset?.url || cutoutImage?.url;

  // =========================
  // SIGNATURE (homepage cutout)
  // =========================
  if (heroVariant === "signatureCutout") {
    const bgSrc = imgUrl || signatureBackgroundFallbackSrc;
    const cutoutSrc = cutoutUrl || signatureCutoutFallbackSrc;

    return (
      <section>
        {/* MOBILE */}
        <section className="lg:hidden bg-bg">
          <div className="-mx-6 sm:-mx-10">
            <div className="relative h-[44vh] sm:h-[48vh] overflow-hidden">
              <Image
                src={bgSrc}
                alt=""
                fill
                priority
                className="object-cover"
                style={{ objectPosition: "center 12%" }}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-bg/95 to-transparent" />

              <div className="absolute bottom-0 left-0 w-[320px] pointer-events-none">
                <div className="relative h-[300px] sm:h-[320px] w-full overflow-hidden">
                  <Image src={cutoutSrc} alt={headline || "Hero"} fill className="object-contain object-bottom" priority />
                </div>
              </div>
            </div>
          </div>

          <div className="container-page py-10">
            {headline ? (
              <h1 className="font-serif text-[2.25rem] sm:text-[2.5rem] tracking-tight text-text whitespace-nowrap">
                {headline}
              </h1>
            ) : null}

            {subheadline ? <p className="mt-6 text-lg text-text/80 leading-relaxed">{subheadline}</p> : null}

            <CtaRow
              primary={cta}
              secondary={secondaryCta}
              className="mt-10 flex flex-wrap gap-6"
              primaryClass="btn btn-primary"
              secondaryClass="text-sm text-text/70 underline underline-offset-4 hover:text-text transition"
            />
          </div>
        </section>

        {/* DESKTOP */}
        <section className="hidden lg:block relative w-full overflow-hidden bg-bg h-[66vh]">
          <Image
            src={bgSrc}
            alt=""
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center 12%" }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/85 to-bg/55" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-bg/95 to-transparent" />

          <div className="relative z-10 container-page flex h-full items-center">
            <div className="absolute bottom-0 left-0 w-[420px] xl:w-[460px] translate-y-[-10px] pointer-events-none">
              <div className="relative h-[520px] xl:h-[560px] w-full overflow-hidden">
                <Image src={cutoutSrc} alt={headline || "Hero"} fill className="object-contain object-bottom" priority />
              </div>
            </div>

            <div className="ml-auto max-w-xl pr-10" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
              {eyebrow ? <div className="text-sm tracking-wide text-text/80">{eyebrow}</div> : null}
              {headline ? <h1 className="font-serif text-6xl tracking-tight text-text">{headline}</h1> : null}
              {subheadline ? <p className="mt-6 text-lg text-text/80 leading-relaxed">{subheadline}</p> : null}

              <CtaRow
                primary={cta}
                secondary={secondaryCta}
                className="mt-10 flex flex-wrap gap-6"
                primaryClass="btn btn-primary"
                secondaryClass="text-sm text-text/70 underline underline-offset-4 hover:text-text transition"
              />
            </div>
          </div>
        </section>
      </section>
    );
  }

  // =========================
  // STANDARD HERO
  // =========================

  const overlay = (
    <section className="relative overflow-hidden">
      {imgUrl ? (
        <div className="relative h-[520px] w-full">
          <Image src={imgUrl} alt={alt} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/25" />
        </div>
      ) : (
        <div className="bg-neutral-100">
          <div className="container-page py-20" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center">
        <div className="container-page">
          <div className="max-w-2xl text-white">
            {eyebrow ? <div className="text-sm tracking-wide opacity-90">{eyebrow}</div> : null}
            {headline ? <h1 className="mt-2 text-4xl sm:text-5xl font-semibold">{headline}</h1> : null}
            {subheadline ? <p className="mt-4 text-lg opacity-95">{subheadline}</p> : null}

            <CtaRow
              primary={cta}
              secondary={secondaryCta}
              className="mt-6 flex flex-wrap items-center gap-6"
              primaryClass="rounded-2xl px-5 py-3 bg-white text-black"
              secondaryClass="text-sm text-white/80 underline underline-offset-4 hover:text-white transition"
            />
          </div>
        </div>
      </div>
    </section>
  );

  const split = (
    <section className="bg-bg">
      <div className="container-page py-12 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          {eyebrow ? <div className="text-sm tracking-wide text-text/70">{eyebrow}</div> : null}
          {headline ? <h1 className="mt-2 font-serif text-4xl sm:text-5xl tracking-tight text-text">{headline}</h1> : null}
          {subheadline ? <p className="mt-5 text-lg text-text/80 leading-relaxed">{subheadline}</p> : null}

          <CtaRow
            primary={cta}
            secondary={secondaryCta}
            className="mt-8 flex flex-wrap items-center gap-6"
            primaryClass="btn btn-primary"
            secondaryClass="text-sm text-text/70 underline underline-offset-4 hover:text-text transition"
          />
        </div>

        <div className="relative">
          {imgUrl ? (
            <div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden rounded-2xl">
              <Image src={imgUrl} alt={alt} fill className="object-cover" priority />
            </div>
          ) : (
            <div className="h-[360px] sm:h-[420px] w-full rounded-2xl bg-neutral-100" />
          )}
        </div>
      </div>
    </section>
  );

  return heroLayout === "split" ? split : overlay;
}
