"use client";

import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function TrackedLink({
  href,
  className,
  eventName,
  params,
  children,
}: {
  href: string;
  className?: string;
  eventName: string;
  params?: Record<string, any>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", eventName, params || {});
        }
      }}
    >
      {children}
    </Link>
  );
}
