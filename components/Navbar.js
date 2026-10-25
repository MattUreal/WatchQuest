'use client';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { user, isAdmin, loading } = useAuth();

  // first letter shown when the user has no photo
  const initial = (user?.displayName || user?.email || '?')[0].toUpperCase();

  return (
    <header className="nav">
      <Link href="/" className="logo">🎬 WatchQuest</Link>

      <nav>
        <Link href="/browse/movie/popular">Movies</Link>
        <Link href="/browse/tv/popular">TV Shows</Link>
        <Link href="/discover">Discover</Link>
        <Link href="/favorites">My Library</Link>
        {isAdmin && <Link href="/admin">Admin</Link>}
      </nav>

      <form action="/search" className="search">
        <input name="q" placeholder="Search movies & TV…" />
      </form>

      {!loading && user && (
        <>
          <Link href="/profile" className="avatar-link" title="Profile">
            {user.photoURL ? (
              <img className="avatar" src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" />
            ) : (
              <span className="avatar">{initial}</span>
            )}
          </Link>
          <button className="btn" onClick={() => signOut(auth)}>Sign out</button>
        </>
      )}
      {!loading && !user && <Link className="btn" href="/login">Sign in</Link>}
    </header>
  );
}
