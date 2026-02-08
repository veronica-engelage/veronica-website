type SpacerDividerProps = {
  tone?: "default" | "prestige";
  space?: "sm" | "md" | "lg";
  showLine?: boolean;
};

const spaceMap: Record<NonNullable<SpacerDividerProps["space"]>, string> = {
  sm: "py-6",
  md: "py-10",
  lg: "py-16",
};

export function SpacerDivider({
  tone = "default",
  space = "md",
  showLine = true,
}: SpacerDividerProps) {
  const lineClass =
    tone === "prestige"
      ? "border-[rgb(var(--prestige))] border-opacity-50"
      : "border-border";

  return (
    <div className={spaceMap[space]}>
      <div className="container-page">
        {showLine ? <div className={`border-t ${lineClass}`} /> : null}
      </div>
    </div>
  );
}
