'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';

const CARDS = [
  ['total', 'Users'],
  ['newThisWeek', 'New (7 days)'],
  ['disabled', 'Disabled'],
  ['admins', 'Admins'],
  ['entries', 'Library entries'],
  ['favorites', 'Favourites'],
  ['watched', 'Watched'],
  ['watchLater', 'Watch later'],
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch('/api/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="muted">Loading…</p>;

  return (
    <div className="astats">
      {CARDS.map(([key, label]) => (
        <div key={key} className="pcard">
          <b>{stats[key] ?? '—'}</b>
          <span className="muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
