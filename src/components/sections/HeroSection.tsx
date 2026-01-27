import Image from "next/image";
import Link from "next/link";
import { resolveCtaHref } from "@/lib/linkResolver";
import TextCtaButton from "@/components/TextCtaButton";

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

/**
 * Primary CTA behavior:
 * - If primary resolves to sms:, on DESKTOP we show TextCtaButton (fallback modal).
 * - On MOBILE we avoid sms CTA in-hero (sticky bar already covers it) and send to /contact.
 * - Otherwise, render normal CtaLink.
 */
function PrimaryCta({
  cta,
  className,
  phone,
  message,
}: {
  cta?: any;
  className: string;
  phone?: string | null;
  message?: string;
}) {
  const resolved = resolveCtaHref(cta);
  if (!cta?.label || !resolved) return null;

  const isSms =
    !!resolved?.href && typeof resolved.href === "string" && resolved.href.startsWith("sms:");

  if (!isSms) {
    return <CtaLink cta={cta} className={className} />;
  }

  return (
    <>
      {/* Desktop: text with fallback modal */}
      <div className="hidden md:block">
        <TextCtaButton
          phone={phone}
          label={cta?.label || "Text me"}
          className={className}
          message={message}
        />
      </div>

      {/* Mobile: keep it simple; sticky bar does sms/call */}
      <Link className={`${className} md:hidden`} href="/contact">
  <span>Get in touch</span>
</Link>
    </>
  );
}

function CtaRow({
  primary,
  secondary,
  className,
  primaryClass,
  secondaryClass,
  phone,
  message,
}: {
  primary?: any;
  secondary?: any;
  className: string;
  primaryClass: string;
  secondaryClass: string;
  phone?: string | null;
  message?: string;
}) {
  const hasPrimary = !!(primary?.label && resolveCtaHref(primary));
  const hasSecondary = !!(secondary?.label && resolveCtaHref(secondary));
  if (!hasPrimary && !hasSecondary) return null;

  return (
    <div className={className}>
      <PrimaryCta cta={primary} className={primaryClass} phone={phone} message={message} />
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

  // If your CTA message lives somewhere else, you can wire it here.
  const defaultSmsMessage =
    "Hi Veronica, I found your website and would like to talk about buying or selling in Charleston / Mount Pleasant.";

  // phone might be available via your settings wiring later; for now we let TextCtaButton normalize.
  // If you have it in props somewhere, pass it down. Otherwise it will still work if your cta href is sms: already.
  const phoneForTextCta: string | null =
    null;

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

              {/* Softer overlay (light) */}
              <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-bg/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-bg/82 to-transparent" />

              {/* Slightly stronger overlay (dark) */}
              <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-bg/78 via-bg/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 hidden dark:block h-[40%] bg-gradient-to-t from-bg/88 to-transparent" />

              <div className="absolute inset-y-0 left-0 w-[320px] pointer-events-none">
                {/* Full hero height, cutout always sits on bottom */}
                <div className="relative h-full w-full flex items-end">
                  {/* Never taller than hero, but can be as tall as it wants up to 320px */}
                  <div className="relative w-full h-[min(320px,100%)]">
                    <Image
                      src={cutoutSrc}
                      alt={headline || "Hero"}
                      fill
                      priority
                      className="object-contain object-bottom"
                      sizes="320px"
                    />
                  </div>
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
              className="mt-10 flex flex-wrap items-center gap-6"
              primaryClass="btn btn-primary"
              secondaryClass="btn-tertiary"
              phone={phoneForTextCta}
              message={defaultSmsMessage}
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

          {/* Softer overlay (light) */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg/78 via-bg/45 to-bg/18" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-bg/84 to-transparent" />

          {/* Slightly stronger overlay (dark) */}
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-bg/82 via-bg/50 to-bg/22" />
          <div className="absolute inset-x-0 bottom-0 hidden dark:block h-[34%] bg-gradient-to-t from-bg/88 to-transparent" />

          <div className="relative z-10 container-page flex h-full items-center">
            <div className="absolute inset-y-0 left-0 w-[420px] xl:w-[460px] pointer-events-none">
              {/* Full hero height, cutout always sits on bottom */}
              <div className="relative h-full w-full flex items-end">
                {/* Never taller than hero, but keep your “ideal” size when it fits */}
                <div className="relative w-full h-[min(560px,100%)]">
                  <Image
                    src={cutoutSrc}
                    alt={headline || "Hero"}
                    fill
                    priority
                    className="object-contain object-bottom"
                    sizes="(min-width: 1280px) 460px, 420px"
                  />
                </div>
              </div>
            </div>

            <div className="ml-auto max-w-xl pr-10" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
              {eyebrow ? <div className="eyebrow text-text/80">{eyebrow}</div> : null}
              {headline ? <h1 className="font-serif text-6xl tracking-tight text-text">{headline}</h1> : null}
              {subheadline ? <p className="mt-6 text-lg text-text/80 leading-relaxed">{subheadline}</p> : null}

              <CtaRow
                primary={cta}
                secondary={secondaryCta}
                className="mt-10 flex flex-wrap items-center gap-6"
                primaryClass="btn btn-primary"
                secondaryClass="btn-tertiary"
                phone={phoneForTextCta}
                message={defaultSmsMessage}
              />
            </div>
          </div>
        </section>
      </section>
    );
  }

  // =========================
  // STANDARD HERO (non-homepage)
  // =========================

  const overlay = (
    <section className="relative overflow-hidden bg-bg">
      {imgUrl ? (
        <div className="relative h-[520px] w-full">
          <Image src={imgUrl} alt={alt} fill className="object-cover" priority />

          {/* Light mode: soft, universal */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-bg/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-bg/80 to-transparent" />

          {/* Dark mode: slightly stronger */}
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-bg/78 via-bg/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 hidden dark:block h-[38%] bg-gradient-to-t from-bg/85 to-transparent" />
        </div>
      ) : (
        <div className="bg-bg">
          <div className="container-page py-20" />
        </div>
      )}

      <div className="absolute inset-0 flex items-end sm:items-center">
        <div className="container-page pb-10 sm:pb-0">
          <div className="max-w-2xl">
            {eyebrow ? <div className="eyebrow text-text/80">{eyebrow}</div> : null}
            {headline ? <h1 className="hero-shout text-text">{headline}</h1> : null}
            {subheadline ? <p className="mt-5 text-lg text-text/80 leading-relaxed max-w-prose">{subheadline}</p> : null}

            <CtaRow
              primary={cta}
              secondary={secondaryCta}
              className="mt-8 flex flex-wrap items-center gap-6"
              primaryClass="btn btn-primary"
              secondaryClass="text-sm text-text/70 underline underline-offset-4 hover:text-text transition"
              phone={phoneForTextCta}
              message={defaultSmsMessage}
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
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          {headline ? <h1 className="hero-shout-md text-text">{headline}</h1> : null}
          {subheadline ? <p className="mt-5 text-lg text-text/80 leading-relaxed max-w-prose">{subheadline}</p> : null}

          <CtaRow
            primary={cta}
            secondary={secondaryCta}
            className="mt-8 flex flex-wrap items-center gap-6"
            primaryClass="btn btn-primary"
            secondaryClass="text-sm text-text/70 underline underline-offset-4 hover:text-text transition"
            phone={phoneForTextCta}
            message={defaultSmsMessage}
          />
        </div>

        <div className="relative">
          {imgUrl ? (
            <div className="card media-frame relative h-[360px] sm:h-[420px] w-full overflow-hidden">
              <Image src={imgUrl} alt={alt} fill className="object-cover" priority />
            </div>
          ) : (
            <div className="card media-frame h-[360px] sm:h-[420px] w-full" />
          )}
        </div>
      </div>
    </section>
  );

  return heroLayout === "split" ? split : overlay;
}

