import MediaCard from './MediaCard';
import { norm } from '@/lib/utils';

export default function MediaGrid({ results = [], type }) {
  if (!results.length) return <p className="muted">Nothing found.</p>;
  return <div className="grid">{results.map((r) => <MediaCard key={`${r.media_type || type}_${r.id}`} media={norm(r, type)} />)}</div>;
}
