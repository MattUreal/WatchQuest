'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  EmailAuthProvider, GoogleAuthProvider, deleteUser, reauthenticateWithCredential,
  reauthenticateWithPopup, sendEmailVerification, updatePassword, updateProfile,
} from 'firebase/auth';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { useLibrary } from '@/lib/library';
import AuthGuard from '@/components/AuthGuard';

function ProfileContent() {
  const { user, refresh } = useAuth();
  const { items } = useLibrary();
  const router = useRouter();

  const hasPassword = user.providerData.some((p) => p.providerId === 'password');
  const [name, setName] = useState(user.displayName || '');
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [deleteForm, setDeleteForm] = useState({ password: '', confirm: '' });
  const [messages, setMessages] = useState({});
  const [busy, setBusy] = useState(false);

  const joined = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '';
  const countFlag = (flag) => Object.values(items).filter((i) => i[flag]).length;

  // Runs an action and shows a success or error message under that section
  async function runAction(section, action, successText) {
    setBusy(true);
    try {
      await action();
      setMessages((m) => ({ ...m, [section]: { type: 'ok', text: successText } }));
    } catch (e) {
      setMessages((m) => ({ ...m, [section]: { type: 'error', text: e.message.replace('Firebase: ', '') } }));
    }
    setBusy(false);
  }

  // Sensitive actions need the user to log in again
  function reauthenticate(password) {
    if (hasPassword) {
      const credential = EmailAuthProvider.credential(user.email, password);
      return reauthenticateWithCredential(auth.currentUser, credential);
    }
    return reauthenticateWithPopup(auth.currentUser, new GoogleAuthProvider());
  }

  function saveName(e) {
    e.preventDefault();
    runAction('name', async () => {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await refresh();
    }, 'Name updated');
  }

  function changePassword(e) {
    e.preventDefault();
    runAction('password', async () => {
      await reauthenticate(passwords.current);
      await updatePassword(auth.currentUser, passwords.next);
      setPasswords({ current: '', next: '' });
    }, 'Password updated');
  }

  function deleteAccount(e) {
    e.preventDefault();
    runAction('delete', async () => {
      await reauthenticate(deleteForm.password);

      // delete the library first (in groups of 400, Firestore allows 500 per batch)
      const snap = await getDocs(collection(db, 'users', user.uid, 'library'));
      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = writeBatch(db);
        snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }

      await deleteUser(auth.currentUser);
      router.replace('/');
    }, '');
  }

  function Message({ section }) {
    const m = messages[section];
    return m?.text ? <p className={`msg ${m.type}`}>{m.text}</p> : null;
  }

  return (
    <div className="profile">
      <h1>My Profile</h1>

      <section className="pcard phead">
        {user.photoURL ? (
          <img className="avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <div className="avatar">{(user.displayName || user.email || '?')[0].toUpperCase()}</div>
        )}
        <div>
          <h2 style={{ margin: 0 }}>{user.displayName || 'No name set'}</h2>
          <div className="muted">{user.email}</div>
          <small className="muted">
            {user.emailVerified ? '✔ Email verified' : '⚠ Email not verified'}
            {joined && ` · Member since ${joined}`}
          </small>
        </div>
      </section>

      <section className="stats">
        <Link href="/favorites"><b>{countFlag('favorite')}</b>Favourites</Link>
        <Link href="/favorites"><b>{countFlag('watched')}</b>Watched</Link>
        <Link href="/favorites"><b>{countFlag('watchLater')}</b>Watch later</Link>
      </section>

      <section className="pcard">
        <h2>Display name</h2>
        <form className="pform" onSubmit={saveName}>
          <input value={name} maxLength={50} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <button className="btn" disabled={busy}>Save name</button>
          <Message section="name" />
        </form>
      </section>

      {!user.emailVerified && hasPassword && (
        <section className="pcard">
          <h2>Verify your email</h2>
          <button
            className="btn"
            disabled={busy}
            onClick={() => runAction('verify', () => sendEmailVerification(auth.currentUser), 'Email sent. Check your inbox, then reload this page.')}
          >
            Send verification email
          </button>
          <Message section="verify" />
        </section>
      )}

      {hasPassword && (
        <section className="pcard">
          <h2>Change password</h2>
          <form className="pform" onSubmit={changePassword}>
            <input type="password" required placeholder="Current password" value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            <input type="password" required minLength={6} placeholder="New password (min 6 characters)" value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
            <button className="btn" disabled={busy}>Update password</button>
            <Message section="password" />
          </form>
        </section>
      )}

      <section className="pcard danger">
        <h2>Delete account</h2>
        <p className="muted">This permanently deletes your account and your library. It can't be undone.</p>
        <form className="pform" onSubmit={deleteAccount}>
          {hasPassword && (
            <input type="password" required placeholder="Confirm your password" value={deleteForm.password}
              onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })} />
          )}
          <input required placeholder="Type DELETE to confirm" value={deleteForm.confirm}
            onChange={(e) => setDeleteForm({ ...deleteForm, confirm: e.target.value })} />
          <button className="btn red" disabled={busy || deleteForm.confirm !== 'DELETE'}>Delete my account</button>
          <Message section="delete" />
        </form>
      </section>
    </div>
  );
}

// Only signed-in users can see this page
export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
