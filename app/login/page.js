'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

const dest = () => {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/favorites';
};

export default function Login() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) router.replace(dest()); }, [user, router]);

  const run = async (fn) => {
    setError(''); setBusy(true);
    try { await fn(); } catch (e) { setError(e.message.replace('Firebase: ', '')); }
    setBusy(false);
  };

  const submit = (e) => {
    e.preventDefault();
    run(async () => {
      if (mode === 'login') await signInWithEmailAndPassword(auth, form.email, form.password);
      else {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        if (form.name) await updateProfile(cred.user, { displayName: form.name });
      }
    });
  };

  return (
    <form className="authbox" onSubmit={submit}>
      <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
      {mode === 'signup' && <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
      <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" required minLength={6} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{mode === 'login' ? 'Sign in' : 'Sign up'}</button>
      <button type="button" className="btn ghost" disabled={busy} onClick={() => run(() => signInWithPopup(auth, new GoogleAuthProvider()))}>Continue with Google</button>
      <p className="muted">
        {mode === 'login' ? 'No account? ' : 'Have an account? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login'); }}>
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </a>
      </p>
    </form>
  );
}
