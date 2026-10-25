'use client';
import { useState } from 'react';

export default function DiscoverForm({ genres, initial }) {
  const [type, setType] = useState(initial.type);
  return (
    <form action="/discover" className="filters">
      <select name="type" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="movie">Movies</option>
        <option value="tv">TV Shows</option>
      </select>
      <select name="genre" key={type} defaultValue={type === initial.type ? initial.genre : ''}>
        <option value="">All genres</option>
        {genres[type].map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <input name="year" type="number" min="1900" max="2100" placeholder="Year" defaultValue={initial.year} />
      <select name="sort" defaultValue={initial.sort}>
        <option value="popularity.desc">Most popular</option>
        <option value="vote_average.desc">Highest rated</option>
        <option value="date.desc">Newest</option>
      </select>
      <button className="btn" type="submit">Apply</button>
    </form>
  );
}
