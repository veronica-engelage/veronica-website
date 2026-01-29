"use client";

import React, { useMemo, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

type LeadFormSectionProps = {
  title?: string;
  intro?: string;
  form?: {
    submitCta?: string;
    consentText?: string;
  };
  successMessage?: string;
};

function track(eventName: string, params: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export function LeadFormSection({
  title,
  intro,
  form,
  successMessage,
}: LeadFormSectionProps) {
  if (!form) return null;

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [showMessage, setShowMessage] = useState(false);

  const headline = title || "Get in touch";
  const sub = intro || "Send a quick note. I’ll respond personally.";

  const submitLabel = form.submitCta || "Send";
  const okText = successMessage || "Thanks. I’ll reach out shortly.";
  const errText = "Something went wrong. Please try again.";

  const shellClass = useMemo(
    () =>
      [
        "mx-auto max-w-3xl",
        "border border-white/10",
        "bg-white/[0.03]",
        "rounded-3xl overflow-hidden",
        "shadow-[0_18px_55px_rgba(0,0,0,0.35)]",
      ].join(" "),
    []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");

    const formEl = e.currentTarget;
    const data = new FormData(formEl);

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    try {
      // TODO: replace with real endpoint
      // await fetch("/api/leads", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      // Track only after "success"
      track("lead_form_submit", {
        placement: "lead_form_section",
        method: "form",
        has_message: Boolean(payload.message),
      });

      setStatus("success");
      formEl.reset();
      setShowMessage(false);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="container-page py-12 sm:py-14">
      <div className={shellClass}>
        {/* subtle wash */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block bg-gradient-to-br from-white/5 via-transparent to-transparent" />

        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          <div className="max-w-2xl">
            <div className="eyebrow">Get in touch</div>

            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-text">
              {headline}
            </h2>

            <p className="mt-3 text-base leading-relaxed text-muted">{sub}</p>
          </div>

          <div className="divider my-8 opacity-60" />

          {status === "success" ? (
            <div className="max-w-2xl">
              <p className="text-base text-text/90 leading-relaxed">{okText}</p>
              <button
                type="button"
                className="btn-tertiary mt-4"
                onClick={() => setStatus("idle")}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="field"
                  placeholder="Name"
                  name="name"
                  autoComplete="name"
                  required
                />
                <input
                  className="field"
                  placeholder="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={status === "submitting"}
                  aria-busy={status === "submitting"}
                >
                  {status === "submitting" ? "Sending…" : submitLabel}
                </button>

                <button
                  type="button"
                  className="btn-tertiary"
                  onClick={() => setShowMessage((v) => !v)}
                  aria-expanded={showMessage}
                >
                  {showMessage ? "Hide message" : "Add a message"}
                </button>

                {status === "error" ? (
                  <span className="text-sm text-muted">{errText}</span>
                ) : null}
              </div>

              {showMessage ? (
                <div className="mt-4">
                  <textarea
                    className="field"
                    placeholder="Optional message"
                    name="message"
                    rows={4}
                  />
                </div>
              ) : (
                // still submit message field (empty) so payload is stable
                <input type="hidden" name="message" value="" />
              )}

              {form.consentText ? (
                <p className="mt-5 text-xs text-muted/90 leading-relaxed max-w-[65ch]">
                  {form.consentText}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
