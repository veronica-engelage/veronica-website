"use client"
export function LeadFormSection({title, intro, form, successMessage}: any) {
  if (!form) return null

  return (
    <section className="container-page py-10">
      <div className="max-w-2xl rounded-3xl border p-8">
        <h2 className="text-2xl font-semibold">{title || 'Get in touch'}</h2>
        {intro ? <p className="mt-2 opacity-80">{intro}</p> : null}

        <form
          className="mt-6 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            // Next step: POST to /api/leads (we’ll build it).
            alert(successMessage || 'Thanks. We’ll reach out shortly.')
          }}
        >
          <input className="border rounded-xl p-3" placeholder="Name" name="name" />
          <input className="border rounded-xl p-3" placeholder="Email" name="email" />
          <textarea className="border rounded-xl p-3" placeholder="Message" name="message" rows={5} />
          <button className="rounded-xl p-3 border" type="submit">
            {form.submitCta || 'Send'}
          </button>
        </form>

        {form.consentText ? <p className="mt-3 text-sm opacity-70">{form.consentText}</p> : null}
      </div>
    </section>
  )
}
