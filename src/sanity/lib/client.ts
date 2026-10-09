import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/*
 * Important:
 * - useCdn: false ensures that after a webhook invalidates the Next.js cache,
 *   the next CMS request goes to Sanity's live API instead of potentially
 *   returning a stale CDN response.
 * - Next.js cache is controlled through the `next` options below.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false
});

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  tags = []
}: {
  query: QueryString;
  params?: QueryParams;
  tags?: string[];
}) {
  return client.fetch(query, params, {
    cache: "force-cache",
    next: {
      // false = keep this cache entry indefinitely until a webhook
      // explicitly invalidates its tag.
      revalidate: false,
      tags
    }
  });
}