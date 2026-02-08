import {sanityClient} from './client'

export async function sanityFetch<T>(
  query: string,
  params: Record<string, any> = {},
  options: Record<string, any> = {}
): Promise<T> {
  return sanityClient.fetch<T>(query, params, options)
}
