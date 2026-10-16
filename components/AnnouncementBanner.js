'use client';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Shows the message an admin saved in Admin > Settings
export default function AnnouncementBanner() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    return onSnapshot(
      doc(db, 'settings', 'site'),
      (snap) => setSettings(snap.exists() ? snap.data() : null),
      () => {} // ignore errors (e.g. no settings yet)
    );
  }, []);

  if (!settings?.announcementEnabled || !settings.announcement) return null;
  return <div className="announce">📢 {settings.announcement}</div>;
}
