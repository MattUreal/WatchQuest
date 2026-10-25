'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLibrary } from '@/lib/library';

const DEFS = [['favorite', '♥', 'Favourite'], ['watched', '✔', 'Watched'], ['watchLater', '⏱', 'Watch later']];

export default function ListButtons({ media, labels = false }) {
  const { user } = useAuth();
  const router = useRouter();
  const { items, toggle } = useLibrary();
  const cur = items[`${media.type}_${media.id}`] || {};

  const click = (flag) => {
    if (!user) return router.push('/login?next=' + encodeURIComponent(location.pathname));
    toggle(media, flag);
  };

  return (
    <div className="actions">
      {DEFS.map(([flag, icon, label]) => (
        <button key={flag} title={label} className={cur[flag] ? 'on' : ''} onClick={() => click(flag)}>
          {icon}{labels && ` ${label}`}
        </button>
      ))}
    </div>
  );
}
