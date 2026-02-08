import Image from "next/image"

export default function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      {/* Signet */}
      <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 mt-[2px]">
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

      {/* Text lockup */}
   <div className="leading-[1.15] text-center">
  <div className="font-serif text-[26px] sm:text-[28px] tracking-[-0.015em] text-brand dark:text-brandContrast">
    Veronica Engelage
  </div>
  <div className="mt-[1px] font-sans text-[9px] sm:text-[10.5px] uppercase tracking-[0.22em] text-brass">
  Carolina One Real Estate
</div>
</div>

    </div>
  )
}
