'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';

const Ctx = createContext({ items: {}, toggle: async () => {} });

// Fields this app knows about. Other apps (e.g. Flutter) may add more.
const KNOWN_FIELDS = ['id', 'type', 'title', 'poster', 'date', 'rating', 'favorite', 'watched', 'watchLater', 'updatedAt'];

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState({});

  // Listen to the signed-in user's library in real time
  useEffect(() => {
    if (!user) {
      setItems({});
      return;
    }
    return onSnapshot(collection(db, 'users', user.uid, 'library'), (snapshot) => {
      const map = {};
      snapshot.forEach((d) => {
        map[d.id] = d.data();
      });
      setItems(map);
    });
  }, [user]);

  // flag is one of: 'favorite', 'watched', 'watchLater'
  const toggle = useCallback(
    async (media, flag) => {
      if (!user) return;

      const key = `${media.type}_${media.id}`;
      const current = items[key] || {};

      const next = {
        id: media.id,
        type: media.type,
        title: media.title,
        poster: media.poster,
        date: media.date,
        rating: media.rating,
        favorite: current.favorite === true,
        watched: current.watched === true,
        watchLater: current.watchLater === true,
        updatedAt: Date.now(),
      };

      next[flag] = !current[flag];

      // watched titles leave the watch-later list
      if (flag === 'watched' && next.watched) next.watchLater = false;

      const ref = doc(db, 'users', user.uid, 'library', key);
      const noFlagsLeft = !next.favorite && !next.watched && !next.watchLater;
      const hasExtraFields = Object.keys(current).some((k) => !KNOWN_FIELDS.includes(k));

      if (noFlagsLeft && !hasExtraFields) {
        await deleteDoc(ref);
      } else {
        // merge keeps fields we don't know about (written by other apps)
        await setDoc(ref, next, { merge: true });
      }
    },
    [user, items]
  );

  return <Ctx.Provider value={{ items, toggle }}>{children}</Ctx.Provider>;
}

export const useLibrary = () => useContext(Ctx);
