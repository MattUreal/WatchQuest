import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Change a user: disable, enable, makeAdmin, removeAdmin
export async function PATCH(req, { params }) {
  const check = await requireAdmin(req);
  if (check.error) return check.error;

  const { uid } = params;
  if (uid === check.uid) return fail('You cannot change your own account here.'); // avoids locking yourself out

  const body = await req.json().catch(() => ({}));
  const action = body.action;

  try {
    const user = await adminAuth.getUser(uid);
    const claims = user.customClaims || {};

    if (action === 'disable') {
      await adminAuth.updateUser(uid, { disabled: true });
      await adminAuth.revokeRefreshTokens(uid); // signs them out everywhere
    } else if (action === 'enable') {
      await adminAuth.updateUser(uid, { disabled: false });
    } else if (action === 'makeAdmin') {
      await adminAuth.setCustomUserClaims(uid, { ...claims, admin: true });
    } else if (action === 'removeAdmin') {
      const { admin, ...otherClaims } = claims;
      await adminAuth.setCustomUserClaims(uid, otherClaims);
      await adminAuth.revokeRefreshTokens(uid);
    } else {
      return fail('Unknown action');
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e.message, 500);
  }
}

// Delete a user and their library
export async function DELETE(req, { params }) {
  const check = await requireAdmin(req);
  if (check.error) return check.error;

  const { uid } = params;
  if (uid === check.uid) return fail('You cannot delete your own account here.');

  try {
    // NOTE: this removes EVERYTHING under users/{uid}. If another app stores data there, change this.
    await adminDb.recursiveDelete(adminDb.doc(`users/${uid}`));
    await adminAuth.deleteUser(uid);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e.message, 500);
  }
}
