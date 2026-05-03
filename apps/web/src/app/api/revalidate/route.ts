import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// API → Next.js revalidation hook. Hono fires this on product/theme writes so storefront
// pages re-fetch on the next request without waiting for the 60s ISR window.
//
// Auth: shared bearer token. Both apps read REVALIDATE_TOKEN from env.
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expected = process.env.REVALIDATE_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { tags?: string[] } | null;
  const tags = body?.tags ?? [];
  if (!Array.isArray(tags) || tags.length === 0) {
    return NextResponse.json({ error: 'tags required' }, { status: 400 });
  }

  for (const tag of tags) revalidateTag(tag);
  return NextResponse.json({ ok: true, revalidated: tags });
}
