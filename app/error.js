'use client';

// Shown when something fails on the server (for example TMDB is unreachable)
export default function Error({ reset }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>Something went wrong</h1>
      <p className="muted">We couldn't load movie data. Check your connection and try again.</p>
      <button className="btn" onClick={() => reset()}>Try again</button>
    </div>
  );
}
