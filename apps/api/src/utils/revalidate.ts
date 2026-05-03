// Posts a revalidate request to the Next.js storefront. Best-effort — failures are logged
// but never block the originating request; the next ISR window will repair eventually.
//
// Tag conventions:
//   theme:<storeId>          — the published theme for that store
//   products:<storeId>       — product list/detail fetches
//   store:<storeId>          — store metadata fetches
//
// Caller is expected to pass tags relevant to the entity being mutated.
const NEXT_URL = process.env.NEXT_PUBLIC_WEB_URL ?? process.env.WEB_URL ?? 'http://localhost:3001'
const TOKEN = process.env.REVALIDATE_TOKEN

let warned = false
const warnOnce = () => {
  if (warned) return
  warned = true
  console.warn('[revalidate] REVALIDATE_TOKEN unset — revalidation calls disabled')
}

export const revalidateNext = async (tags: string[]): Promise<void> => {
  if (!TOKEN) return warnOnce()
  if (tags.length === 0) return

  try {
    await fetch(`${NEXT_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ tags }),
      // Short timeout — storefront revalidation is best-effort.
      signal: AbortSignal.timeout(2_000),
    })
  } catch (err) {
    console.warn('[revalidate] failed', { tags, err: (err as Error)?.message })
  }
}

export const tagFor = {
  theme: (storeId: string) => `theme:${storeId}`,
  products: (storeId: string) => `products:${storeId}`,
  store: (storeId: string) => `store:${storeId}`,
}
