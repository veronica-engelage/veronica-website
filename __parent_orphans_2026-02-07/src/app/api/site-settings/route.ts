import { NextResponse } from "next/server"
import { groq } from "next-sanity"
import { sanityClient } from "@/sanity/client"

const query = groq`
  *[_type == "siteSettings"][0]{
    headerNav[]{ label, href },
    headerCta{ label, href, mode }
  }
`

export async function GET() {
  const data = await sanityClient.fetch(query)
  return NextResponse.json(data || {})
}
