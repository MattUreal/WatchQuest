import Link from 'next/link';
import { img } from '@/lib/utils';
import ListButtons from './ListButtons';

export default function MediaCard({ media }) {
  const poster = img(media.poster);
  return (
    <div className="card">
      <Link href={`/${media.type}/${media.id}`}>
        {poster ? <img src={poster} alt={media.title} loading="lazy" /> : <div className="noposter">No image</div>}
      </Link>
      <span className="badge">★ {media.rating ? media.rating.toFixed(1) : 'NR'}</span>
      <ListButtons media={media} />
      <div className="meta">
        <Link href={`/${media.type}/${media.id}`}>{media.title}</Link>
        <small>{media.date?.slice(0, 4)}</small>
      </div>
    </div>
  );
}
