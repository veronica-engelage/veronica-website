import { groq } from "next-sanity"
import { sanityClient } from "@/sanity/client"

export interface NavItem {
  label: string
  href: string
  mode?: string
  kind?: "internal" | "external" | "tel" | "sms"
}

const query = groq`
*[_type=="siteSettings"][0]{
  agentName,
  brokerageName,
  brandTagline,
  phone,
  email,
  headerNav[]{label, href},
  headerCta{label, mode, value, message, href},
  footerNav[]{label, href},
  defaultSeoTitle,
  defaultSeoDescription,
  siteUrl
}
`

export async function getSiteSettings() {
  return sanityClient.fetch(query, {}, { next: { revalidate: 300 } });
}
