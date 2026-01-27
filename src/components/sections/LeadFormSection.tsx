"use client";

type LeadFormSectionProps = {
  title?: string;
  intro?: string;
  form?: {
    submitCta?: string;
    consentText?: string;
  };
  successMessage?: string;
};

export function LeadFormSection({
  title,
  intro,
  form,
  successMessage,
}: LeadFormSectionProps) {
  if (!form) return null;

  return (
    <section className="container-page py-10">
      <div className="card p-8 sm:p-10 max-w-2xl">
        <h2 className="text-2xl font-semibold">{title || "Get in touch"}</h2>

        {intro ? <p className="mt-2 text-sm opacity-80">{intro}</p> : null}

        <form
          className="mt-6 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();

            // TODO: POST to /api/leads
            alert(successMessage || "Thanks. We’ll reach out shortly.");
          }}
        >
          <input className="field" placeholder="Name" name="name" autoComplete="name" required />
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
