import Image from "next/image"

export default function Home() {
  return (
    <main>
   {/* =========================
          HERO (MOBILE)
         ========================= */}
      <section className="lg:hidden bg-bg">
  {/* FULL-BLEED IMAGE */}
  <div className="-mx-6 sm:-mx-10">
    <div className="relative h-[44vh] sm:h-[48vh] overflow-hidden">
      <Image
        src="/images/hero-house.png"
        alt=""
        fill
        priority
        className="object-cover"
        style={{ objectPosition: "center 12%" }}
      />

      {/* overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-bg/95 to-transparent" />

      {/* cutout */}
      <div className="absolute bottom-0 left-0 w-[320px] pointer-events-none">
        <div className="relative h-[300px] sm:h-[320px] w-full overflow-hidden">
          <Image
            src="/images/veronica-cutout.png"
            alt="Veronica Engelage"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>
    </div>
  </div>

  {/* TEXT – BACK INSIDE CONTAINER */}
  <div className="container-page py-10">
    <h1 className="font-serif text-[2.25rem] sm:text-[2.5rem] tracking-tight text-text whitespace-nowrap">
      Veronica Engelage
    </h1>

    <p className="mt-6 text-lg text-text/80 leading-relaxed">
      Charleston & Mount Pleasant real estate, guided with discretion,
      local intelligence, and calm execution.
    </p>

    <div className="mt-10 flex flex-wrap gap-6">
      <a href="/contact" className="btn btn-primary">
        Get in touch
      </a>
      <a
        href="/about"
        className="text-sm text-text/70 underline underline-offset-4 hover:text-text transition"
      >
        Learn more
      </a>
    </div>
  </div>
</section>

      {/* =========================
          HERO (DESKTOP) – overlay masthead (your original)
         ========================= */}
      <section className="hidden lg:block relative w-full overflow-hidden bg-bg h-[66vh]">
        {/* Background image */}
        <Image
          src="/images/hero-house.png"
          alt=""
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "center 12%" }}
        />

        {/* overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/85 to-bg/55" />
        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-bg/95 to-transparent" />

        <div className="relative z-10 container-page flex h-full items-center">
          {/* Cutout */}
          <div className="absolute bottom-0 left-0 w-[420px] xl:w-[460px] translate-y-[-10px] pointer-events-none">
            <div className="relative h-[520px] xl:h-[560px] w-full overflow-hidden">
              <Image
                src="/images/veronica-cutout.png"
                alt="Veronica Engelage"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>

          {/* Text */}
          <div
            className="ml-auto max-w-xl pr-10"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
          >
            <h1 className="font-serif text-6xl tracking-tight text-text">
              Veronica Engelage
            </h1>

            <p className="mt-6 text-lg text-text/80 leading-relaxed">
              Charleston & Mount Pleasant real estate, guided with discretion,
              local intelligence, and calm execution.
            </p>

            <div className="mt-10 flex flex-wrap gap-6">
              <a href="/contact" className="btn btn-primary">
                Get in touch
              </a>
              <a
                href="/about"
                className="text-sm text-text/70 underline underline-offset-4 hover:text-text transition"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* rest of page sections here */}
    </main>
  )
}
