import { tmdb } from '@/lib/tmdb';
import { CATEGORIES } from '@/lib/categories';
import MediaRow from '@/components/MediaRow';
import HeroCarousel from '@/components/HeroCarousel';

// Which rows to show on the home page: [type, category]
const HOME_ROWS = [
  ['movie', 'trending'], ['movie', 'latest'], ['movie', 'popular'], ['movie', 'upcoming'],
  ['tv', 'trending'], ['tv', 'latest'], ['tv', 'popular'], ['tv', 'upcoming'],
];

export default async function Home() {
  // fetch everything at the same time (faster than one by one)
  const [mixed, ...rows] = await Promise.all([
    tmdb('/trending/all/week').catch(() => ({ results: [] })),
    ...HOME_ROWS.map(([type, category]) =>
      tmdb(CATEGORIES[type][category].path).catch(() => ({ results: [] }))
    ),
  ]);

  // carousel: only movies/tv that have a big picture, max 8
  const slides = mixed.results
    .filter((r) => (r.media_type === 'movie' || r.media_type === 'tv') && r.backdrop_path)
    .slice(0, 8);

  return (
    <>
      <HeroCarousel items={slides} />
      {HOME_ROWS.map(([type, category], i) => (
        <MediaRow
          key={`${type}-${category}`}
          title={`${type === 'movie' ? 'Movies' : 'TV'}: ${CATEGORIES[type][category].label}`}
          href={`/browse/${type}/${category}`}
          results={rows[i].results}
          type={type}
        />
      ))}
    </>
  );
}
