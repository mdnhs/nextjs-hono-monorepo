import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || '';

  // Get the base domain from env
  const baseDomain = process.env.APP_DOMAIN || 'localhost:3000';
  
  // Extract subdomain
  const subdomain = host.endsWith(baseDomain) 
    ? host.replace(`.${baseDomain}`, '').replace(baseDomain, '') 
    : '';

  // 1. Landing Page / Main App (no subdomain)
  if (!subdomain || subdomain === 'www') {
    return NextResponse.next();
  }

  // 2. Storefront (subdomain exists)
  // Rewrite to internal dynamic route /[storeSlug]
  // This avoids the user seeing /storefront/store-name in the URL
  return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}${url.search}`, req.url));
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
