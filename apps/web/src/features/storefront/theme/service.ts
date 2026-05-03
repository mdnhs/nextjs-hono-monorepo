import type { PublishedTheme } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

// Storefront theme fetch. The API resolves the tenant from Host, so we forward it.
// Tag is keyed per-store so writes to one tenant do not invalidate everyone else.
export async function fetchPublishedTheme(host: string, storeId?: string): Promise<PublishedTheme | null> {
  const res = await fetch(`${API_BASE}/api/v1/themes/published`, {
    headers: { host },
    next: { revalidate: 60, tags: storeId ? [`theme:${storeId}`] : ['theme'] },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data: PublishedTheme | null };
  return json.data ?? null;
}
