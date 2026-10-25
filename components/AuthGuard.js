'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

// Route-level authorization: only signed-in users see children
export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=' + encodeURIComponent(location.pathname));
  }, [user, loading, router]);
  if (loading || !user) return <p className="muted">Loading…</p>;
  return children;
}
