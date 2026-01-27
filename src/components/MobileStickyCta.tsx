"use client";

type Props = {
  phone?: string | null; // ideally E.164 like +18548372944
};

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

export default function MobileStickyCta({ phone }: Props) {
  const phoneE164 = normalizePhone(phone);
  if (!phoneE164) return null;

  const sms = smsHref(
    phoneE164,
    "Hi Veronica, I found your website and would like to talk about buying or selling in Charleston / Mount Pleasant."
  );
  const tel = telHref(phoneE164);

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-[60]">
      <div className="pointer-events-none px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto max-w-[1280px] rounded-2xl border border-border bg-bg/92 backdrop-blur shadow-lg p-3">
          <div className="grid grid-cols-2 gap-3">
            <a className="btn btn-primary w-full" href={sms}>
              <span>Text me</span>
            </a>
            <a className="btn btn-secondary w-full" href={tel}>
              <span>Call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
