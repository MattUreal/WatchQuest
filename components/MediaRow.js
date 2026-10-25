import Link from 'next/link';
import MediaCard from './MediaCard';
import { norm } from '@/lib/utils';

export default function MediaRow({ title, href, results = [], type }) {
  return (
    <section>
      <div className="rowhead"><h2>{title}</h2><Link href={href}>See all →</Link></div>
      <div className="row">{results.slice(0, 15).map((r) => <MediaCard key={r.id} media={norm(r, type)} />)}</div>
    </section>
  );
}
