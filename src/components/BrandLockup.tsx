import Image from "next/image";

type BrandLockupProps = {
  showSignet?: boolean;
  align?: "left" | "center";
};

export default function BrandLockup({
  showSignet = true,
  align = "center",
}: BrandLockupProps) {
  const textAlign = align === "left" ? "text-left" : "text-center";

  return (
    <div className={showSignet ? "flex items-center gap-3" : ""}>
      {showSignet ? (
        <div className="relative mt-[2px] h-11 w-11 shrink-0 sm:h-12 sm:w-12">
          <Image
            src="/brand/logo-dark.svg"
            alt="Veronica Engelage Signet"
            fill
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/brand/logo-light.svg"
            alt="Veronica Engelage Signet"
            fill
            className="hidden object-contain dark:block"
            priority
          />
        </div>
      ) : null}

      <div className={`leading-[1.15] ${textAlign}`}>
        <div className="font-serif text-[26px] tracking-[-0.015em] text-brand dark:text-brandContrast sm:text-[28px]">
          Veronica Engelage
        </div>
        <div className="mt-[1px] font-sans text-[9px] uppercase tracking-[0.22em] text-brass sm:text-[10.5px]">
          Carolina One Real Estate
        </div>
      </div>
    </div>
  );
}
