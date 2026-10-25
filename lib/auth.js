'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Shared login state: { user, isAdmin, loading, refresh }
const Ctx = createContext({ user: null, isAdmin: false, loading: true, refresh: async () => {} });

// Admin is a "custom claim" inside the user's token (set only by the server)
async function readAdminClaim(user, forceRefresh = false) {
  if (!user) return false;
  try {
    const result = await user.getIdTokenResult(forceRefresh);
    return result.claims.admin === true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, isAdmin: false, loading: true, v: 0 });

  // Runs when the user signs in or out
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      const isAdmin = await readAdminClaim(user);
      setState((s) => ({ user, isAdmin, loading: false, v: s.v + 1 }));
    });
  }, []);

  // Call this after changing the name, verifying email, etc.
  const refresh = useCallback(async () => {
    await auth.currentUser?.reload();
    const isAdmin = await readAdminClaim(auth.currentUser, true);
    setState((s) => ({ ...s, user: auth.currentUser, isAdmin, v: s.v + 1 }));
  }, []);

  return <Ctx.Provider value={{ ...state, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
