import Image from "next/image";
import { resolveCtaHref } from "@/lib/linkResolver";
import TrackedLink from "@/components/analytics/TrackedLink";
import TrackedExternalLink from "@/components/analytics/TrackedExternalLink";

type HeroVariant = "standard" | "signatureCutout";
type HeroLayout = "overlay" | "split";
type CtaLike = any;

type HeadlineAs = "h1" | "h2" | "p";

type HeroProps = {
  eyebrow?: string | null;
  headline?: string | null;
  subheadline?: string | null;

  variant?: HeroVariant | null;
  layout?: HeroLayout | null;

  /** NEW: controls semantic tag for the hero headline (default: h1) */
  headlineAs?: HeadlineAs | null;

  cta?: CtaLike; // primary
  secondaryCta?: CtaLike; // secondary
  media?: any;

  cutoutImage?: any;

  signatureBackgroundFallbackSrc?: string;
  signatureCutoutFallbackSrc?: string;
};

function isSmsHref(href: string) {
  return typeof href === "string" && href.startsWith("sms:");
}

/**
 * CTA behavior decision:
 * - For hero: keep it simple and non-redundant.
 * - If CTA resolves to sms:, override to /contact (header + sticky already handle sms/call).
 * - Track clicks via client wrappers.
 */
function CtaLink({
  cta,
  className,
  placement = "hero",
}: {
  cta: any;
  className: string;
  placement?: string;
}) {
  const resolved = resolveCtaHref(cta);
  if (!cta?.label || !resolved?.href) return null;

  const rawHref: string = resolved.href;
  const href = isSmsHref(rawHref) ? "/contact" : rawHref;

  const params = {
    placement,
    label: cta.label,
    destination: href,
    resolved_destination: rawHref,
    external: Boolean(resolved.external),
    overridden: href !== rawHref,
  };

  if (resolved.external) {
    return (
      <TrackedExternalLink
        className={className}
        href={rawHref}
        eventName="hero_cta_click"
        params={params}
      >
        {cta.label}
      </TrackedExternalLink>
    );
  }

  return (
    <TrackedLink
      className={className}
      href={href}
      eventName="hero_cta_click"
      params={params}
    >
      {cta.label}
    </TrackedLink>
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
      <CtaLink cta={primary} className={primaryClass} placement="hero_primary" />
      <CtaLink
        cta={secondary}
        className={secondaryClass}
        placement="hero_secondary"
      />
    </div>
  );
}

function Headline({
  as = "h1",
  className,
  children,
}: {
  as?: HeadlineAs;
  className: string;
  children: React.ReactNode;
}) {
  if (as === "h2") return <h2 className={className}>{children}</h2>;
  if (as === "p") return <p className={className}>{children}</p>;
  return <h1 className={className}>{children}</h1>;
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
    headlineAs = "h1",
    cutoutImage,
    signatureBackgroundFallbackSrc = "/images/hero-house.png",
    signatureCutoutFallbackSrc = "/images/veronica-cutout.png",
  } = props;

  const heroVariant: HeroVariant = (variant as HeroVariant) || "standard";
  const heroLayout: HeroLayout = (layout as HeroLayout) || "overlay";
  const as: HeadlineAs = (headlineAs as HeadlineAs) || "h1";

  const imgUrl: string | undefined =
    media?.image?.asset?.url ||
    media?.thumbnail?.asset?.url ||
    media?.asset?.url ||
    media?.url;

  const alt = media?.alt || headline || "";

  const cutoutUrl: string | undefined = cutoutImage?.asset?.url || cutoutImage?.url;

  // =========================
  // SIGNATURE (homepage cutout)
  // =========================
  if (heroVariant === "signatureCutout") {
    const bgSrc = imgUrl || signatureBackgroundFallbackSrc;
    const cutoutSrc = cutoutUrl || signatureCutoutFallbackSrc;

    return (
      <section aria-label="Hero">
        {/* MOBILE */}
        <div className="lg:hidden bg-bg overflow-x-hidden">
          <div className="-mx-5 sm:-mx-8">
            <div className="relative h-[clamp(300px,38svh,380px)] overflow-hidden">
              <Image
                src={bgSrc}
                alt=""
                fill
                priority
                className="object-cover"
                style={{ objectPosition: "center 8%" }}
              />

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-bg/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-bg/82 to-transparent" />
              <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-bg/78 via-bg/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 hidden dark:block h-[40%] bg-gradient-to-t from-bg/88 to-transparent" />

              {/* Cutout */}
              <div className="absolute inset-y-0 left-0 w-[400px] sm:w-[440px] pointer-events-none">
                <div className="relative h-full w-full flex items-end">
                  <div className="relative w-full h-[min(420px,100%)] translate-y-2">
                    <Image
                      src={cutoutSrc}
                      alt={headline || "Hero"}
                      fill
                      priority
                      className="object-contain object-bottom"
                      sizes="(min-width: 640px) 440px, 400px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container-page py-6">
            {headline ? (
              <Headline
                as={as}
                className="font-serif text-[2.1rem] sm:text-[2.5rem] tracking-tight text-text leading-[1.05]"
              >
                {headline}
              </Headline>
            ) : null}

            {subheadline ? (
              <p className="mt-4 text-[1.05rem] text-text/80 leading-relaxed">
                {subheadline}
              </p>
            ) : null}

            <CtaRow
              primary={cta}
              secondary={secondaryCta}
              className="mt-6 flex flex-wrap items-center gap-4"
              primaryClass="btn btn-primary"
              secondaryClass="btn-tertiary"
            />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:block relative w-full overflow-hidden bg-bg h-[clamp(520px,58vh,700px)]">
          <Image
            src={bgSrc}
            alt=""
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center 10%" }}
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg/78 via-bg/45 to-bg/18" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-bg/84 to-transparent" />
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-bg/82 via-bg/50 to-bg/22" />
          <div className="absolute inset-x-0 bottom-0 hidden dark:block h-[34%] bg-gradient-to-t from-bg/88 to-transparent" />

          <div className="relative z-10 container-page flex h-full items-center">
            {/* Cutout */}
            <div className="absolute inset-y-0 left-0 w-[480px] xl:w-[520px] pointer-events-none">
              <div className="relative h-full w-full flex items-end">
                <div className="relative w-full h-[min(640px,100%)] translate-y-3">
                  <Image
                    src={cutoutSrc}
                    alt={headline || "Hero"}
                    fill
                    priority
                    className="object-contain object-bottom"
                    sizes="(min-width: 1280px) 520px, 480px"
                  />
                </div>
              </div>
            </div>

            <div
              className="ml-auto max-w-xl pr-10"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
            >
              {eyebrow ? <div className="eyebrow text-text/80">{eyebrow}</div> : null}

              {headline ? (
                <Headline
                  as={as}
                  className="font-serif text-6xl tracking-tight text-text"
                >
                  {headline}
                </Headline>
              ) : null}

              {subheadline ? (
                <p className="mt-6 text-lg text-text/80 leading-relaxed">
                  {subheadline}
                </p>
              ) : null}

              <CtaRow
                primary={cta}
                secondary={secondaryCta}
                className="mt-10 flex flex-wrap items-center gap-6"
                primaryClass="btn btn-primary"
                secondaryClass="btn-tertiary"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================
  // STANDARD HERO (non-homepage)
  // =========================

  const OverlayHero = () => (
    <section aria-label="Hero" className="relative overflow-hidden bg-bg">
      {imgUrl ? (
        <div
          className="
            relative w-full
            h-[clamp(280px,38svh,360px)]
            sm:h-[clamp(360px,42svh,440px)]
            lg:h-[clamp(420px,46vh,520px)]
          "
        >
          <Image src={imgUrl} alt={alt} fill className="object-cover" priority />

          {/* Light mode */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-bg/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-bg/80 to-transparent" />

          {/* Dark mode */}
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

            {headline ? (
              <Headline as={as} className="hero-shout text-text">
                {headline}
              </Headline>
            ) : null}

            {subheadline ? (
              <p className="mt-5 text-lg text-text/80 leading-relaxed max-w-prose">
                {subheadline}
              </p>
            ) : null}

            <CtaRow
              primary={cta}
              secondary={secondaryCta}
              className="mt-8 flex flex-wrap items-center gap-6"
              primaryClass="btn btn-primary"
              secondaryClass="text-sm text-text/70 underline underline-offset-4 hover:text-text transition"
            />
          </div>
        </div>
      </div>
    </section>
  );

  const SplitHero = () => (
    <section aria-label="Hero" className="bg-bg">
      <div className="container-page py-12 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}

          {headline ? (
            <Headline as={as} className="hero-shout-md text-text">
              {headline}
            </Headline>
          ) : null}

          {subheadline ? (
            <p className="mt-5 text-lg text-text/80 leading-relaxed max-w-prose">
              {subheadline}
            </p>
          ) : null}

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
            <div className="card media-frame relative h-[320px] sm:h-[380px] lg:h-[420px] w-full overflow-hidden">
              <Image src={imgUrl} alt={alt} fill className="object-cover" priority />
            </div>
          ) : (
            <div className="card media-frame h-[320px] sm:h-[380px] lg:h-[420px] w-full" />
          )}
        </div>
      </div>
    </section>
  );

  return heroLayout === "split" ? <SplitHero /> : <OverlayHero />;
}
