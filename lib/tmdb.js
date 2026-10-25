// Server-side only: this file keeps TMDB_TOKEN away from the browser.
const BASE = 'https://api.themoviedb.org/3';

export async function tmdb(path, params = {}) {
  const url = new URL(BASE + path);

  // add every param that has a value
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}`, accept: 'application/json' },
      next: { revalidate: 600 }, // cache for 10 minutes
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  } catch (e) {
    // show the real reason (DNS, timeout...) so it is easier to debug
    const reason = e.cause?.code || e.cause?.message || e.message;
    throw new Error(`TMDB request failed (${reason}) for ${path}`);
  }
}
