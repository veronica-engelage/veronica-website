import { PortableText } from "@portabletext/react";

export function RichTextSection({ content, width }: any) {
  const cls =
    width === "narrow"
      ? "max-w-2xl"
      : width === "wide"
      ? "max-w-5xl"
      : width === "full"
      ? "max-w-none"
      : "max-w-3xl";

  return (
    <section className="container-page py-10">
      <div className={`${cls} mx-auto`}>
        <PortableText value={content || []} />
      </div>
    </section>
  );
}
