"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StickyMobileCta({
  heroSentinelId = "hero-sentinel",
}: {
  heroSentinelId?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById(heroSentinelId);
    if (!el) {
      setShow(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        // Show CTA when hero sentinel is NOT visible
        setShow(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [heroSentinelId]);

  return (
    <div
      className={[
        "fixed inset-x-0 bottom-0 z-50 sm:hidden",
        "transition-transform duration-200",
        show ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
    >
      {/* subtle top border, no card look */}
      <div className="border-t border-[rgb(var(--border)/0.30)] bg-[rgb(var(--bg)/0.92)] backdrop-blur">
        <div className="container-page py-3">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/contact" className="btn btn-primary">
              Contact
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Text / Questions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
