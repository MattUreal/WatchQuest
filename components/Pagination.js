import Link from 'next/link';

export default function Pagination({ base, params = {}, page, total }) {
  const max = Math.min(total || 1, 500); // TMDB caps at 500 pages
  const href = (p) => {
    const clean = Object.fromEntries(Object.entries({ ...params, page: p }).filter(([, v]) => v));
    return `${base}?${new URLSearchParams(clean)}`;
  };
  return (
    <div className="pager">
      {page > 1 && <Link href={href(page - 1)}>← Prev</Link>}
      <span>Page {page} of {max}</span>
      {page < max && <Link href={href(page + 1)}>Next →</Link>}
    </div>
  );
}
