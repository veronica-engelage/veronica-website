import Link from "next/link";
import { resolveCtaHref } from "@/lib/linkResolver";

export function CtaSection({ headline, text, cta }: any) {
  const resolved = resolveCtaHref(cta);

  return (
    <section className="container-page py-12">
      <div className="card p-10 max-w-4xl">
        {headline ? <h2 className="text-2xl font-semibold">{headline}</h2> : null}
        {text ? <p className="mt-4 opacity-80 max-w-2xl leading-relaxed">{text}</p> : null}

        {cta?.label && resolved ? (
          <div className="mt-7">
            {resolved.external ? (
              <a
                className="btn btn-secondary"
                href={resolved.href}
                target="_blank"
                rel="noreferrer"
              >
                {cta.label}
              </a>
            ) : (
              <Link className="btn btn-secondary" href={resolved.href}>
                {cta.label}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
