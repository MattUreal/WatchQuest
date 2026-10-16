export const dynamic = 'force-dynamic';

// Tiny endpoint used by the connectivity banner
export function GET() {
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
