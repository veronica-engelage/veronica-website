"use client";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEl = e.currentTarget;
    const data = new FormData(formEl);

    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
    };

    try {
      // TODO: replace with real endpoint
      // await fetch("/api/leads", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      // ✅ Only track AFTER success
      track("lead_form_submit", {
        placement: "lead_form_section",
        method: "form",
      });

      alert(successMessage || "Thanks. We’ll reach out shortly.");
      formEl.reset();
    } catch {
      // optional: track failed submits later if you care
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="container-page py-10">
      <div className="card p-8 sm:p-10 max-w-2xl">
        <h2 className="text-2xl font-semibold">{title || "Get in touch"}</h2>

        {intro ? <p className="mt-2 text-sm opacity-80">{intro}</p> : null}

        <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
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
          <textarea
            className="field"
            placeholder="Message"
            name="message"
            rows={5}
            required
          />

          <button className="btn btn-primary w-full sm:w-auto" type="submit">
            {form.submitCta || "Send"}
          </button>
        </form>

        {form.consentText ? (
          <p className="mt-4 text-xs opacity-70">{form.consentText}</p>
        ) : null}
      </div>
    </section>
  );
}
