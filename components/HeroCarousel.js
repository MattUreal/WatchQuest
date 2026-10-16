'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { img, norm } from '@/lib/utils';
import ListButtons from './ListButtons';

// Big sliding banner on the home page (mixed movies and TV)
export default function HeroCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const total = items.length;

  // go to the next slide every 6 seconds (unless paused)
  useEffect(() => {
    if (paused || total < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), 6000);
    return () => clearInterval(timer);
  }, [paused, total]);

  if (total === 0) return null;

  const move = (step) => setIndex((i) => (i + step + total) % total);

  const onTouchEnd = (e) => {
    if (touchStart !== null) {
      const distance = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1); // swipe
    }
    setTouchStart(null);
    setPaused(false);
  };

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { setTouchStart(e.touches[0].clientX); setPaused(true); }}
      onTouchEnd={onTouchEnd}
    >
      <div className="slides" style={{ transform: `translateX(-${index * 100}%)` }}>
        {items.map((item) => {
          const media = norm(item);
          const background = `linear-gradient(90deg,#0f1115ee 25%,#0f111500 75%), url(${img(item.backdrop_path, 'w1280')})`;
          return (
            <div key={`${media.type}_${media.id}`} className="slide" style={{ backgroundImage: background }}>
              <div className="slide-info">
                <span className="tag">{media.type === 'tv' ? 'TV Show' : 'Movie'}</span>
                <h2>{media.title}</h2>
                <p className="muted">★ {media.rating.toFixed(1)} · {media.date?.slice(0, 4)}</p>
                <p className="overview">{item.overview}</p>
                <div className="slide-actions">
                  <Link className="btn" href={`/${media.type}/${media.id}`}>View details</Link>
                  <ListButtons media={media} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button className="arrow left" onClick={() => move(-1)} aria-label="Previous">‹</button>
          <button className="arrow right" onClick={() => move(1)} aria-label="Next">›</button>
          <div className="dots">
            {items.map((_, i) => (
              <button key={i} className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
