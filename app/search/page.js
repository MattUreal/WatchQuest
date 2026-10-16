import { tmdb } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import Pagination from '@/components/Pagination';

export default async function Search({ searchParams }) {
  const q = (searchParams.q || '').trim();
  const page = Math.max(1, parseInt(searchParams.page) || 1);
  const data = q ? await tmdb('/search/multi', { query: q, page }) : null;
  const results = (data?.results || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv');

  return (
    <>
      <h1>{q ? `Results for “${q}”` : 'Search'}</h1>
      {!q && <p className="muted">Type something in the search box above.</p>}
      {q && <MediaGrid results={results} />}
      {q && <Pagination base="/search" params={{ q }} page={page} total={data.total_pages} />}
    </>
  );
}
