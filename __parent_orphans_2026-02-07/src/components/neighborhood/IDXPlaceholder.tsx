import Link from "next/link";

export function IDXPlaceholder({ neighborhood }: { neighborhood: string }) {
  return (
    <section className="border-t border-border pt-8">
      <div className="eyebrow">Listings</div>
      <h3 className="mt-2 text-2xl font-semibold">
        Featured Listings in {neighborhood}
      </h3>
      <p className="mt-3 text-sm text-muted leading-relaxed max-w-2xl">
        IDX listings are coming next. For now, request a custom list of current
        homes for sale curated for your budget and timeline.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/contact" className="btn btn-primary">
          Request listings
        </Link>
        <Link href="/contact" className="btn-tertiary">
          Ask a question
        </Link>
      </div>
    </section>
  );
}
