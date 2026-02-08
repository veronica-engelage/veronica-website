"use client";

type Props = {
  phone?: string | null; // ideally E.164 like +18548372944
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void; // optional, if you ever add Meta Pixel
  }
}

function digitsOnly(s: string) {
  return s.replace(/[^\d+]/g, "");
}

function normalizePhone(phone?: string | null) {
  if (!phone) return null;
  const raw = phone.trim();

  // allow already-correct E.164
  if (raw.startsWith("+")) return raw;

  const digits = digitsOnly(raw).replace(/[^\d]/g, "");
  // US assumptions
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  return null;
}

function smsHref(phoneE164: string, message: string) {
  const body = encodeURIComponent(message);
  return `sms:${phoneE164}?&body=${body}`;
}

function telHref(phoneE164: string) {
  return `tel:${phoneE164}`;
}

function track(eventName: string, params: Record<string, any>) {
  // GA4
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  // Optional Meta Pixel mapping (harmless if fbq isn't installed)
  // You can remove this block if you don't want it.
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    // For Meta, "Lead" is the closest standard event.
    window.fbq("track", "Lead", { content_name: eventName, ...params });
  }
}

export default function MobileStickyCta({ phone }: Props) {
  const phoneE164 = normalizePhone(phone);
  if (!phoneE164) return null;

  const message =
    "Hi Veronica, I found your website and would like to talk about buying or selling in Charleston / Mount Pleasant.";

  const sms = smsHref(phoneE164, message);
  const tel = telHref(phoneE164);

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-[60]">
      <div className="pointer-events-none px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto max-w-[1280px] rounded-2xl border border-border bg-bg/92 backdrop-blur shadow-lg p-3">
          <div className="grid grid-cols-2 gap-3">
            <a
              className="btn btn-primary w-full"
              href={sms}
              onClick={() =>
                track("click_text", {
                  method: "sms",
                  placement: "mobile_sticky_cta",
                  phone: phoneE164,
                })
              }
            >
              <span>Text me</span>
            </a>

            <a
              className="btn btn-secondary w-full"
              href={tel}
              onClick={() =>
                track("click_call", {
                  method: "tel",
                  placement: "mobile_sticky_cta",
                  phone: phoneE164,
                })
              }
            >
              <span>Call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
