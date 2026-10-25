import { NextResponse } from 'next/server';
import { adminAuth } from './firebaseAdmin';

// Use at the top of every admin API route:
//   const check = await requireAdmin(req);
//   if (check.error) return check.error;
export async function requireAdmin(req) {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) };
  }

  try {
    // second argument true = also reject tokens that were revoked
    const decoded = await adminAuth.verifyIdToken(token, true);
    if (decoded.admin !== true) {
      return { error: NextResponse.json({ error: 'Admins only' }, { status: 403 }) };
    }
    return { uid: decoded.uid };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
}
