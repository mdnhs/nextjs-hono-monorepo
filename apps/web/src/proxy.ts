import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Per-instance cache for custom-domain → storeSlug. Populated on demand.
// `value === null` means we successfully looked up the host and it does NOT belong to a tenant —
// keep the negative entry so subsequent unknown-host hits do not hammer the API.
interface CacheEntry {
  value: string | null;
  expiresAt: number;
}

const POSITIVE_TTL_MS = 60_000;
const NEGATIVE_TTL_MS = 30_000;

const lookupCache = new Map<string, CacheEntry>();
// Stampede guard: if N concurrent requests miss the cache for the same host, only one fetches.
const inflight = new Map<string, Promise<string | null>>();

const getCached = (host: string): CacheEntry | null => {
  const entry = lookupCache.get(host);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    lookupCache.delete(host);
    return null;
  }
  return entry;
};

const setCached = (host: string, value: string | null) => {
  lookupCache.set(host, {
    value,
    expiresAt: Date.now() + (value ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS),
  });
};

const lookupCustomDomain = async (host: string): Promise<string | null> => {
  const cached = getCached(host);
  if (cached) return cached.value;

  const existing = inflight.get(host);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
      // 60s revalidation gives a second layer behind the in-memory cache when running multiple instances.
      const res = await fetch(`${apiUrl}/api/v1/stores/domain/${encodeURIComponent(host)}`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { data?: { slug?: string } };
      return json?.data?.slug ?? null;
    } catch (err) {
      console.error('Custom domain proxy error:', err);
      return null;
    }
  })();

  inflight.set(host, promise);
  try {
    const value = await promise;
    setCached(host, value);
    return value;
  } finally {
    inflight.delete(host);
  }
};

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || '';
  const baseDomain = process.env.APP_DOMAIN || 'localhost:3000';

  // Standard subdomain path — no API call needed.
  if (host === baseDomain || host.endsWith(`.${baseDomain}`)) {
    const subdomain = host.replace(`.${baseDomain}`, '').replace(baseDomain, '');
    if (!subdomain || subdomain === 'www') return NextResponse.next();
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}${url.search}`, req.url));
  }

  // Custom-domain path: in-memory cache, negative cache, in-flight dedupe.
  const hostname = host.split(':')[0];
  const slug = await lookupCustomDomain(hostname);
  if (slug) {
    return NextResponse.rewrite(new URL(`/${slug}${url.pathname}${url.search}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
