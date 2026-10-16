'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const settingsRef = doc(db, 'settings', 'site');

export default function SettingsPage() {
  const [form, setForm] = useState({ announcement: '', announcementEnabled: false });
  const [message, setMessage] = useState(null);

  // load the saved settings once
  useEffect(() => {
    getDoc(settingsRef)
      .then((snap) => {
        if (snap.exists()) setForm((f) => ({ ...f, ...snap.data() }));
      })
      .catch(() => {});
  }, []);

  async function save(e) {
    e.preventDefault();
    try {
      await setDoc(settingsRef, {
        announcement: form.announcement.trim().slice(0, 300),
        announcementEnabled: form.announcementEnabled === true,
        updatedAt: Date.now(),
      });
      setMessage({ type: 'ok', text: 'Saved' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <form className="pcard pform" onSubmit={save}>
      <h2>Site announcement</h2>
      <textarea
        rows={3}
        maxLength={300}
        placeholder="Message shown at the top of every page"
        value={form.announcement}
        onChange={(e) => setForm({ ...form, announcement: e.target.value })}
      />
      <label>
        <input
          type="checkbox"
          checked={form.announcementEnabled === true}
          onChange={(e) => setForm({ ...form, announcementEnabled: e.target.checked })}
        />{' '}
        Show banner
      </label>
      <button className="btn">Save</button>
      {message && <p className={`msg ${message.type}`}>{message.text}</p>}
    </form>
  );
}
