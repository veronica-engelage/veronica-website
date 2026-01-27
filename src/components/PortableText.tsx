import { PortableText as PT } from "@portabletext/react"

export default function PortableText({ value }: { value: any }) {
  return (
    <div className="space-y-4 leading-relaxed text-text">
      <PT
        value={value}
        components={{
          block: {
            h2: ({ children }) => (
              <h2 className="mt-10 text-2xl font-semibold text-text">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-8 text-xl font-semibold text-text">
                {children}
              </h3>
            ),
            normal: ({ children }) => (
              <p className="mt-4 leading-relaxed text-muted">{children}</p>
            ),
          },
          list: {
            bullet: ({ children }) => (
              <ul className="mt-4 list-disc pl-6 text-muted">{children}</ul>
            ),
            number: ({ children }) => (
              <ol className="mt-4 list-decimal pl-6 text-muted">{children}</ol>
            ),
          },
          listItem: {
            bullet: ({ children }) => <li className="mt-2">{children}</li>,
            number: ({ children }) => <li className="mt-2">{children}</li>,
          },
          marks: {
            link: ({ children, value }) => (
              <a
                className="underline underline-offset-4"
                href={value?.href}
                rel={value?.href?.startsWith("http") ? "noreferrer noopener" : undefined}
                target={value?.href?.startsWith("http") ? "_blank" : undefined}
              >
                {children}
              </a>
            ),
          },
        }}
      />
    </div>
  )
}
