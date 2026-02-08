"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  phone?: string | null; // ideally E.164: +1854...
  label?: string;
  className?: string;
  message?: string;
};

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

function isMobileUA() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function normalizePhone(phone?: string | null) {
  if (!phone) return null;
  const raw = phone.trim();

  if (raw.startsWith("+")) return raw;

  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function smsHref(phoneE164: string, message: string) {
  return `sms:${phoneE164}?&body=${encodeURIComponent(message)}`;
}

function telHref(phoneE164: string) {
  return `tel:${phoneE164}`;
}

export default function TextCtaButton({
  phone,
  label = "Text me",
  className = "btn btn-primary",
  message = "Hi Veronica, I found your website and would like to talk about buying or selling in Charleston / Mount Pleasant.",
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const phoneE164 = useMemo(() => normalizePhone(phone), [phone]);
  const sms = phoneE164 ? smsHref(phoneE164, message) : null;
  const tel = phoneE164 ? telHref(phoneE164) : null;

  const baseParams = {
    placement: "header_text_cta",
    label,
  };

  const onPrimaryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If phone missing, we won't be here (we render Link). But keep safe.
    if (!phoneE164 || !sms) return;

    // Mobile: go straight to sms:
    if (isMobileUA()) {
      track("cta_text_open_sms", { ...baseParams, method: "sms", destination: "messages_app" });
      return;
    }

    // Desktop: show fallback modal
    e.preventDefault();
    track("cta_text_open_modal", { ...baseParams });
    setOpen(true);
  };

  const onCopy = async () => {
    if (!phoneE164) return;
    try {
      await navigator.clipboard.writeText(phoneE164);
      setCopied(true);
      track("cta_text_modal_copy_number", { ...baseParams, phone: phoneE164 });
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may fail silently; do nothing
    }
  };

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // If phone missing, degrade to /contact so you don't have dead buttons
  if (!phoneE164) {
    return (
      <Link
        className={className}
        href="/contact"
        onClick={() => track("cta_text_fallback_contact", { ...baseParams, reason: "no_phone" })}
      >
        <span>Contact</span>
      </Link>
    );
  }

  return (
    <>
      <a className={className} href={sms || "#"} onClick={onPrimaryClick}>
        <span>{label}</span>
      </a>

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Contact options"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative mx-auto mt-24 w-[min(92vw,520px)] rounded-2xl border border-border bg-bg p-5 shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            {/* Close (X) */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="
                absolute right-4 top-4
                inline-flex h-9 w-9 items-center justify-center
                rounded-full
                text-text/70
                hover:text-text
                hover:bg-white/5
                transition
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="pr-10">
              <div className="text-lg font-semibold text-text">Contact Veronica</div>
              <p className="mt-2 text-sm text-text/70">
                Choose how you’d like to get in touch.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <a
                className="btn btn-primary w-full"
                href={sms || "#"}
                onClick={() =>
                  track("cta_text_modal_open_sms", {
                    ...baseParams,
                    method: "sms",
                    destination: "messages_app",
                  })
                }
              >
                <span>Open Messages</span>
              </a>

              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={onCopy}
                aria-live="polite"
              >
                <span>{copied ? "Copied" : "Copy number"}</span>
              </button>

              {tel ? (
                <a
                  className="btn btn-secondary w-full"
                  href={tel}
                  onClick={() =>
                    track("cta_text_modal_call", {
                      ...baseParams,
                      method: "tel",
                      destination: "dialer",
                    })
                  }
                >
                  <span>Call</span>
                </a>
              ) : (
                <button className="btn btn-secondary w-full" disabled>
                  <span>Call</span>
                </button>
              )}

              <a
                className="btn btn-tertiary w-full text-center"
                href="/contact"
                onClick={() => track("cta_text_modal_contact_form", { ...baseParams })}
              >
                Use contact form
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
