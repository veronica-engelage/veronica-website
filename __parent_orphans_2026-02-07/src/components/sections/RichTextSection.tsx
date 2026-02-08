import { PortableText } from "@portabletext/react";

type Width = "narrow" | "normal" | "wide" | "full";
type Spacing = "none" | "tight" | "normal" | "loose";

export function RichTextSection({
  content,
  width,
  spacing,
}: {
  content: any;
  width?: string;
  spacing?: string;
}) {
  const w = (width ?? "normal").toString().trim().toLowerCase() as Width;
  const s = (spacing ?? "normal").toString().trim().toLowerCase() as Spacing;

  const widthClass =
    w === "narrow"
      ? "mx-auto w-full max-w-[60ch] px-5 sm:px-8"
      : w === "wide"
      ? "mx-auto w-full max-w-[1200px] px-5 sm:px-8"
      : w === "full"
      ? "w-full"
      : "mx-auto w-full max-w-[72ch] px-5 sm:px-8"; // normal default

  const spacingClass =
    s === "none"
      ? ""
      : s === "tight"
      ? "py-4"
      : s === "loose"
      ? "py-16"
      : "py-10";

  return (
    <section className={spacingClass}>
      <div className={widthClass}>
        <PortableText value={content || []} />
      </div>
    </section>
  );
}
