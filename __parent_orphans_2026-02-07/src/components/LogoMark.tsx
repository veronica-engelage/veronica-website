import Image from "next/image"

export default function LogoMark() {
  return (
    <div className="relative h-9 w-[160px] sm:h-10 sm:w-[180px]">
      {/* Light background → dark logo */}
      <Image
        src="/brand/logo-dark.svg"
        alt="Veronica Engelage Real Estate"
        fill
        className="object-contain dark:hidden"
        priority
      />

      {/* Dark background → light logo */}
      <Image
        src="/brand/logo-light.svg"
        alt="Veronica Engelage Real Estate"
        fill
        className="hidden object-contain dark:block"
        priority
      />
    </div>
  )
}
