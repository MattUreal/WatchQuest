import { tmdb } from '@/lib/tmdb';
import DiscoverForm from '@/components/DiscoverForm';
import MediaGrid from '@/components/MediaGrid';
import Pagination from '@/components/Pagination';

export default async function Discover({ searchParams }) {
  const type = searchParams.type === 'tv' ? 'tv' : 'movie';
  const genre = searchParams.genre || '';
  const year = searchParams.year || '';
  const sort = searchParams.sort || 'popularity.desc';
  const page = Math.max(1, parseInt(searchParams.page) || 1);

  const dateSort = type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
  const [m, t, data] = await Promise.all([
    tmdb('/genre/movie/list'), tmdb('/genre/tv/list'),
    tmdb(`/discover/${type}`, {
      page,
      with_genres: genre,
      [type === 'movie' ? 'primary_release_year' : 'first_air_date_year']: year,
      sort_by: sort === 'date.desc' ? dateSort : sort,
      'vote_count.gte': sort === 'vote_average.desc' ? 200 : undefined, // avoid 1-vote 10/10 titles
    }),
  ]);

  return (
    <>
      <h1>Discover</h1>
      <DiscoverForm genres={{ movie: m.genres, tv: t.genres }} initial={{ type, genre, year, sort }} />
      <MediaGrid results={data.results} type={type} />
      <Pagination base="/discover" params={{ type, genre, year, sort }} page={page} total={data.total_pages} />
    </>
  );
}
