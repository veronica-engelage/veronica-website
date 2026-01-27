export function normalizeE164(phone?: string | null) {
  if (!phone) return null;
  const trimmed = phone.trim();
  // If it already starts with +, assume it's E.164
  if (trimmed.startsWith("+")) return trimmed;

  // If someone entered digits only (e.g. 8548372944), make a US guess
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  return null; // force you to fix bad input
}

export function smsHref(phoneE164: string, message: string) {
  const body = encodeURIComponent(message);
  // iOS uses ?body=, some Android clients accept &body=. This works fine.
  return `sms:${phoneE164}?&body=${body}`;
}

export function telHref(phoneE164: string) {
  return `tel:${phoneE164}`;
}
