"use client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function TrackedExternalLink({
  href,
  className,
  eventName,
  params,
  children,
  target = "_blank",
  rel = "noreferrer",
}: {
  href: string;
  className?: string;
  eventName: string;
  params?: Record<string, any>;
  children: React.ReactNode;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => {
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", eventName, params || {});
        }
      }}
    >
      {children}
    </a>
  );
}
