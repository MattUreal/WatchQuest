'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const TABS = [
  ['/admin', 'Dashboard'],
  ['/admin/users', 'Users'],
  ['/admin/settings', 'Settings'],
];

// Wraps every /admin page. This is only for the screen: the API and Firestore rules do the real checking.
export default function AdminLayout({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/admin');
  }, [user, loading, router]);

  if (loading || !user) return <p className="muted">Loading…</p>;

  if (!isAdmin) {
    return (
      <div className="pcard">
        <h1>403 – Forbidden</h1>
        <p className="muted">You don't have permission to view this area.</p>
      </div>
    );
  }

  return (
    <>
      <h1>Admin</h1>
      <div className="tabs">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} className={pathname === href ? 'active' : ''}>{label}</Link>
        ))}
      </div>
      {children}
    </>
  );
}
