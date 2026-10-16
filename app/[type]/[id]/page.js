import { notFound } from 'next/navigation';
import { tmdb } from '@/lib/tmdb';
import { img, norm } from '@/lib/utils';
import ListButtons from '@/components/ListButtons';
import MediaGrid from '@/components/MediaGrid';

export default async function Details({ params }) {
  const { type, id } = params;
  if (!['movie', 'tv'].includes(type) || !/^\d+$/.test(id)) notFound();
  const d = await tmdb(`/${type}/${id}`, { append_to_response: 'credits,videos,similar' }).catch(() => null);
  if (!d) notFound();

  const media = norm(d, type);
  const trailer = d.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const runtime = d.runtime ? `${d.runtime} min` : d.number_of_seasons ? `${d.number_of_seasons} season(s)` : '';

  return (
    <>
      <div className="hero" style={d.backdrop_path ? { backgroundImage: `linear-gradient(#0009,#0f1115), url(${img(d.backdrop_path, 'w1280')})` } : {}}>
        {d.poster_path && <img className="poster" src={img(d.poster_path, 'w500')} alt={media.title} />}
        <div>
          <h1>{media.title} <small>({media.date?.slice(0, 4)})</small></h1>
          {d.tagline && <p className="muted"><em>{d.tagline}</em></p>}
          <p>★ {media.rating.toFixed(1)} · {runtime} · {d.genres?.map((g) => g.name).join(', ')}</p>
          <p>{d.overview}</p>
          <ListButtons media={media} labels />
        </div>
      </div>

      {trailer && (
        <>
          <h2>Trailer</h2>
          <iframe className="trailer" src={`https://www.youtube.com/embed/${trailer.key}`} allowFullScreen title="Trailer" />
        </>
      )}

      <h2>Cast</h2>
      <div className="cast">
        {d.credits?.cast?.slice(0, 12).map((c) => (
          <div key={c.id}>
            {c.profile_path ? <img src={img(c.profile_path, 'w185')} alt={c.name} /> : <div className="noposter" />}
            <b>{c.name}</b><small>{c.character}</small>
          </div>
        ))}
      </div>

      <h2>Similar</h2>
      <MediaGrid results={d.similar?.results?.slice(0, 12)} type={type} />
    </>
  );
}
