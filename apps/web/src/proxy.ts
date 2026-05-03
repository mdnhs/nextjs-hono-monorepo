import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || '';

  // Get the base domain from env
  const baseDomain = process.env.APP_DOMAIN || 'localhost:3000';
  
  // 1. Check for standard subdomain
  if (host === baseDomain || host.endsWith(`.${baseDomain}`)) {
    const subdomain = host.replace(`.${baseDomain}`, '').replace(baseDomain, '');
    
    // Landing Page / Main App (no subdomain or www)
    if (!subdomain || subdomain === 'www') {
      return NextResponse.next();
    }

    // Storefront (subdomain exists)
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}${url.search}`, req.url));
  }

  // 2. Custom Domain handling
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    // Remove port if present for domain lookup
    const hostname = host.split(':')[0];
    
    // Call Hono API to find the store by custom domain
    // Using Next.js fetch with revalidation to cache the lookup
    const res = await fetch(`${apiUrl}/api/stores/domain/${encodeURIComponent(hostname)}`, {
      next: { revalidate: 60 } // cache for 60 seconds
    });
    
    if (res.ok) {
      const json = await res.json();
      const slug = json?.data?.slug;
      if (slug) {
        // Rewrite to internal dynamic route /[storeSlug]
        return NextResponse.rewrite(new URL(`/${slug}${url.pathname}${url.search}`, req.url));
      }
    }
  } catch (error) {
    console.error('Custom domain proxy error:', error);
  }

  // Fallback to next if no custom domain matched
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
