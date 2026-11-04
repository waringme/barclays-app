import { NextResponse } from 'next/server';
import { fetchProductCard } from '@/lib/product-card';

export async function GET(request: Request) {
  const variation = new URL(request.url).searchParams.get('variation')?.trim() || 'master';
  if (!/^[\w-]{1,128}$/.test(variation)) {
    return NextResponse.json({ error: 'Invalid product-card variation name.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await fetchProductCard(variation), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Barclays product-card fetch failed', error);
    const message = error instanceof Error ? error.message : 'Unexpected Barclays content-service error.';
    return NextResponse.json({ error: message }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
