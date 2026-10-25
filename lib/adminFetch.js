import { auth } from './firebase';

// fetch() for admin routes: adds the login token automatically
export async function adminFetch(url, options = {}) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}
