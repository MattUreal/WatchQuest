import { notFound } from 'next/navigation';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { CATEGORIES } from '@/lib/categories';
import MediaGrid from '@/components/MediaGrid';
import Pagination from '@/components/Pagination';

export default async function Browse({ params, searchParams }) {
  const { type, category } = params;
  const cfg = CATEGORIES[type]?.[category];
  if (!cfg) notFound();
  const page = Math.max(1, parseInt(searchParams.page) || 1);
  const data = await tmdb(cfg.path, { page });

  return (
    <>
      <h1>{type === 'movie' ? 'Movies' : 'TV Shows'} – {cfg.label}</h1>
      <div className="tabs">
        {Object.entries(CATEGORIES[type]).map(([key, c]) => (
          <Link key={key} href={`/browse/${type}/${key}`} className={key === category ? 'active' : ''}>{c.label.split(' (')[0]}</Link>
        ))}
        <Link href={`/browse/${type === 'movie' ? 'tv' : 'movie'}/${category}`}>Switch to {type === 'movie' ? 'TV' : 'Movies'}</Link>
      </div>
      <MediaGrid results={data.results} type={type} />
      <Pagination base={`/browse/${type}/${category}`} page={page} total={data.total_pages} />
    </>
  );
}
