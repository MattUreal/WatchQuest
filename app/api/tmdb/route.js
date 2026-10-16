import { NextResponse } from 'next/server';
import { tmdb } from '@/lib/tmdb';

// Only these TMDB paths may be called through this proxy (including /movie/123 style details)
const ALLOWED = /^\/(search\/(multi|movie|tv)|discover\/(movie|tv)|genre\/(movie|tv)\/list|trending\/(all|movie|tv)\/(day|week)|(movie|tv)\/(popular|top_rated|upcoming|now_playing|airing_today|on_the_air)|(movie|tv)\/\d+)$/;

export async function GET(req) {
  const params = new URL(req.url).searchParams;
  const path = params.get('path') || '';
  params.delete('path');

  if (!ALLOWED.test(path)) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 400 });
  }

  try {
    const data = await tmdb(path, Object.fromEntries(params));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
