import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const check = await requireAdmin(req);
  if (check.error) return check.error;

  // count users by looping through all pages of 1000
  let total = 0, disabled = 0, admins = 0, newThisWeek = 0, pageToken;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  do {
    const result = await adminAuth.listUsers(1000, pageToken);
    result.users.forEach((u) => {
      total++;
      if (u.disabled) disabled++;
      if (u.customClaims?.admin) admins++;
      if (new Date(u.metadata.creationTime).getTime() > weekAgo) newThisWeek++;
    });
    pageToken = result.pageToken;
  } while (pageToken);

  // library counts (filtered counts need a Firestore index, so they may be null at first)
  const library = adminDb.collectionGroup('library');
  const countOf = (query) => query.count().get().then((s) => s.data().count).catch(() => null);
  const [entries, favorites, watched, watchLater] = await Promise.all([
    countOf(library),
    countOf(library.where('favorite', '==', true)),
    countOf(library.where('watched', '==', true)),
    countOf(library.where('watchLater', '==', true)),
  ]);

  return NextResponse.json({ total, disabled, admins, newThisWeek, entries, favorites, watched, watchLater });
}
