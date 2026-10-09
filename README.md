# CMS-Based SSR Landing Page

A small frontend internship assignment demonstrating:

- Next.js App Router
- Server-side rendering
- Sanity headless CMS
- GROQ
- Next.js Data Cache
- Tag-based on-demand revalidation
- Secure Sanity webhook validation
- Embedded Sanity Studio at `/studio`
- Responsive landing page with 2 CMS-driven sections

## 1. Architecture

```text
                 ┌────────────────────┐
                 │     Sanity CMS      │
                 │  Landing Page Doc   │
                 └─────────┬──────────┘
                           │
                    publish/update
                           │
                           ▼
                 ┌────────────────────┐
                 │ Sanity Webhook      │
                 └─────────┬──────────┘
                           │ signed POST
                           ▼
                 ┌────────────────────┐
                 │ /api/revalidate     │
                 │ verify signature     │
                 │ revalidateTag()      │
                 └─────────┬──────────┘
                           │
                    mark cache stale
                           │
                           ▼
Browser request ───────► Next.js SSR
                           │
                    cache HIT? ── yes ──► render cached content
                           │
                          no
                           │
                           ▼
                    Sanity Live API
                           │
                     cache new result
                           │
                           ▼
                        render
```

## 2. Why this satisfies "only call CMS when content changes"

The page query is cached with:

```ts
next: {
  revalidate: false,
  tags: ["landing-page"]
}
```

This means there is no timer/polling.

### First request

```text
Browser -> Next.js -> Sanity
                    -> save result in Next.js cache
```

### Second, third, 100th request without CMS changes

```text
Browser -> Next.js -> cache
                    X Sanity is NOT called
```

### Content is changed and published in Sanity

Sanity sends a signed webhook:

```text
Sanity -> POST /api/revalidate
       -> verify signature
       -> revalidateTag("landing-page", "max")
```

The next page request gets a cache miss and fetches the new content:

```text
Browser -> Next.js -> Sanity
                    -> cache new content
```

This is better than `revalidate: 60`, because a timer would still cause a CMS request even when the content did not change.

## 3. Create Sanity project

Create a free Sanity project, then obtain:

- Project ID
- Dataset name

Add them to `.env.local`.

Example:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_REVALIDATE_SECRET=use-a-long-random-secret
SANITY_API_VERSION=2026-05-15
```

Do NOT commit `.env.local`.

## 4. Install

```bash
npm install
```

## 5. Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Open the CMS:

```text
http://localhost:3000/studio
```

Create one `Landing Page` document and publish it.

## 6. Configure the Sanity webhook

In your Sanity project:

1. Open project management.
2. Go to API / Webhooks.
3. Create a webhook.
4. URL:

```text
https://YOUR-DOMAIN.com/api/revalidate
```

5. Method: `POST`
6. Dataset: your dataset
7. Trigger on: `Create`, `Update`, `Delete`
8. Filter:

```groq
_type == "landingPage"
```

9. Projection:

```json
{
  "_type": _type,
  "_id": _id
}
```

10. Secret:

Use exactly the same value as:

```env
SANITY_REVALIDATE_SECRET=...
```

For local development, the webhook cannot directly reach `localhost`. Use a public HTTPS tunnel such as your preferred tunneling tool, or test the deployed application.

## 7. Important implementation detail

Do not replace the data fetching with:

```ts
cache: "no-store"
```

or:

```ts
revalidate: 0
```

Those would make the server contact the CMS repeatedly.

Also avoid:

```ts
revalidate: 60
```

for this assignment because that is time-based polling/revalidation, not "only when content changes."

The important combination is:

```ts
revalidate: false,
tags: ["landing-page"]
```

plus:

```ts
revalidateTag("landing-page", "max")
```

from the CMS webhook.

## 8. How to demonstrate it during evaluation

Open the terminal and run:

```bash
npm run dev
```

With fetch logging enabled in `next.config.ts`, Next.js can show cache HIT/MISS information.

Then:

1. Open `/`.
2. First request should show a CMS fetch/cache MISS.
3. Refresh several times.
4. Subsequent requests should be cache HITs.
5. Change the heading in Sanity Studio and publish.
6. Sanity sends the webhook.
7. Refresh `/`.
8. The cache is invalidated and the updated heading appears.
9. Refresh again.
10. It is cached again.

## 9. Interview explanation

If asked:

### "How do you know the CMS content changed?"

I don't poll the CMS. Sanity acts as the source of truth and sends a signed webhook whenever the relevant document is created, updated, or deleted.

### "What happens on a normal request?"

The page is a Server Component. It calls the cached `sanityFetch` helper. If the `landing-page` cache entry is valid, Next.js returns the cached CMS result without making another CMS request.

### "What happens after an update?"

The Sanity webhook reaches `/api/revalidate`. After validating the signature, the route invalidates the `landing-page` tag. The next request becomes a cache miss, fetches the latest content from Sanity, and stores that result again.

### "Why not use ISR every 60 seconds?"

Because the requirement specifically says not to call the CMS if content has not changed. Time-based ISR can still contact the CMS after the interval even if nothing changed. Webhook-based revalidation is event-driven.

### "Why `useCdn: false`?"

After cache invalidation we want the fresh Sanity API response rather than introducing another CDN cache layer that could briefly return old content.

## 10. Production improvements

For a larger production application I would additionally consider:

- Preview/Draft Mode
- image optimization through Sanity image URLs
- automated TypeGen for GROQ results
- rate limiting on the webhook endpoint
- monitoring/logging
- separate Studio deployment
- automated tests
- Content Security Policy
- accessibility testing
- Playwright end-to-end tests
