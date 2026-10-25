export const img = (p, size = 'w342') => (p ? `https://image.tmdb.org/t/p/${size}${p}` : null);

// Normalise a TMDB movie/tv object into the shape we use (and store in Firestore)
export const norm = (i, type) => ({
  id: i.id,
  type: i.media_type || type,
  title: i.title || i.name || 'Untitled',
  poster: i.poster_path || null,
  date: i.release_date || i.first_air_date || '',
  rating: i.vote_average || 0,
});
