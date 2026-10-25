import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only send the fields the admin page needs
function simplifyUser(u) {
  return {
    uid: u.uid,
    email: u.email || '',
    displayName: u.displayName || '',
    disabled: u.disabled,
    admin: u.customClaims?.admin === true,
    created: u.metadata.creationTime,
    lastSignIn: u.metadata.lastSignInTime,
  };
}

export async function GET(req) {
  const check = await requireAdmin(req);
  if (check.error) return check.error;

  const params = new URL(req.url).searchParams;
  const email = params.get('email');

  // search by exact email
  if (email) {
    try {
      const user = await adminAuth.getUserByEmail(email);
      return NextResponse.json({ users: [simplifyUser(user)] });
    } catch {
      return NextResponse.json({ users: [] });
    }
  }

  // otherwise list 50 users per page
  const result = await adminAuth.listUsers(50, params.get('pageToken') || undefined);
  return NextResponse.json({ users: result.users.map(simplifyUser), nextPageToken: result.pageToken || null });
}
