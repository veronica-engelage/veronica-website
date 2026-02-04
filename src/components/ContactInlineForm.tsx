"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  title?: string;
  description?: string;
  submitLabel?: string;
  eyebrow?: string;
};

export function ContactInlineForm({
  title = "Reach out to Veronica",
  description = "Send a quick note. You’ll get a personal response.",
  submitLabel = "Send",
  eyebrow = "Reach out",
}: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [showMessage, setShowMessage] = useState(false);
  const pathname = usePathname();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
      company: String(data.get("company") || "").trim(),
      sourcePath: pathname || "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const shellClass = [
    "border border-white/10",
    "bg-white/[0.03]",
    "rounded-3xl overflow-hidden",
    "shadow-[0_18px_55px_rgba(0,0,0,0.35)]",
  ].join(" ");

  return (
    <div className={shellClass}>
      <div className="relative px-6 py-8 sm:px-8 sm:py-9">
        <div className="text-xs uppercase tracking-[0.2em] text-muted">{eyebrow}</div>
        <div className="mt-2 text-lg font-semibold text-text">{title}</div>
        <p className="mt-3 text-sm text-muted leading-relaxed">{description}</p>

        <div className="divider my-6 opacity-60" />

        {status === "success" ? (
          <div className="text-sm text-text">Thanks — your note is in.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="hidden" aria-hidden="true">
              <label>
                Company
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" name="name" placeholder="Name" />
              <input className="field" name="email" placeholder="Email" type="email" required />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : submitLabel}
              </button>
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => setShowMessage((v) => !v)}
                aria-expanded={showMessage}
              >
                {showMessage ? "Hide message" : "Add message"}
              </button>
            </div>
            {showMessage ? (
              <textarea className="field" name="message" placeholder="Optional message" rows={3} />
            ) : (
              <input type="hidden" name="message" value="" />
            )}
            <div className="text-xs text-muted">
              I agree that Veronica may email me to follow up on my inquiry.
            </div>
            {status === "error" ? (
              <div className="text-xs text-muted">Something went wrong. Please try again.</div>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
