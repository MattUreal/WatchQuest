'use client';
import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MediaCard from '@/components/MediaCard';
import { useLibrary } from '@/lib/library';

const TABS = [['favorite', 'Favourites'], ['watched', 'Watched'], ['watchLater', 'Watch later']];

function Library() {
  const { items } = useLibrary();
  const [tab, setTab] = useState('favorite');
  const all = Object.values(items).sort((a, b) => b.updatedAt - a.updatedAt);
  const shown = all.filter((i) => i[tab]);

  return (
    <>
      <h1>My Library</h1>
      <div className="tabs">
        {TABS.map(([key, label]) => (
          <a key={key} href="#" className={tab === key ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab(key); }}>
            {label} ({all.filter((i) => i[key]).length})
          </a>
        ))}
      </div>
      {shown.length
        ? <div className="grid">{shown.map((m) => <MediaCard key={`${m.type}_${m.id}`} media={m} />)}</div>
        : <p className="muted">Nothing here yet. Use the ♥ ✔ ⏱ buttons on any title.</p>}
    </>
  );
}

export default function Favorites() {
  return <AuthGuard><Library /></AuthGuard>;
}
