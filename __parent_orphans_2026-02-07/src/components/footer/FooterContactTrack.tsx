"use client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function track(eventName: string, params: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

type Props = {
  ctaLabel: string;
  ctaHref: string;
  phoneDisplay?: string;
  phoneTel?: string; // E.164 without "tel:" prefix, e.g. +1854...
  locationLine: string;
};

export default function FooterContactTrack({
  ctaLabel,
  ctaHref,
  phoneDisplay,
  phoneTel,
  locationLine,
}: Props) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <a
        href={ctaHref}
        className="text-text/80 hover:text-text transition"
        onClick={() =>
          track("footer_get_in_touch", {
            placement: "footer",
            destination: ctaHref,
            label: ctaLabel,
          })
        }
      >
        {ctaLabel}
      </a>

      {phoneTel && phoneDisplay ? (
        <a
          href={`tel:${phoneTel}`}
          className="text-text/80 hover:text-text transition"
          onClick={() =>
            track("footer_call", {
              placement: "footer",
              method: "tel",
              phone: phoneTel,
            })
          }
        >
          {phoneDisplay}
        </a>
      ) : null}

      <span className="text-muted">{locationLine}</span>
    </div>
  );
}
