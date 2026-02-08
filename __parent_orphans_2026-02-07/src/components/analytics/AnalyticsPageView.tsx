"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function AnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID) return
    // @ts-ignore
    if (typeof window === "undefined" || !window.gtag) return

    const qs = searchParams?.toString()
    const url = qs ? `${pathname}?${qs}` : pathname

    // @ts-ignore
    window.gtag("config", GA_ID, { page_path: url })
  }, [pathname, searchParams])

  return null
}
