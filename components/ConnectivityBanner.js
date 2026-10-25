'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Shows a red bar when offline and a green one for 3 seconds when back online
export default function ConnectivityBanner() {
  const [online, setOnline] = useState(true);
  const [showBack, setShowBack] = useState(false);
  const wasOffline = useRef(false);

  const updateStatus = useCallback((isOnline) => {
    setOnline(isOnline);
    if (!isOnline) {
      wasOffline.current = true;
      setShowBack(false);
    } else if (wasOffline.current) {
      wasOffline.current = false;
      setShowBack(true);
      setTimeout(() => setShowBack(false), 3000);
    }
  }, []);

  // navigator.onLine can lie, so we also make a tiny real request
  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) return updateStatus(false);
    try {
      const res = await fetch('/api/health', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      updateStatus(res.ok);
    } catch {
      updateStatus(false);
    }
  }, [updateStatus]);

  useEffect(() => {
    const handleOnline = () => checkConnection();
    const handleOffline = () => updateStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const timer = setInterval(checkConnection, 30000); // every 30 seconds
    checkConnection();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, [checkConnection, updateStatus]);

  if (online && !showBack) return null;

  return (
    <div className={`conn ${online ? 'ok' : 'bad'}`} role="status" aria-live="polite">
      {online ? '✔ Back online' : '⚠ No internet connection. Some features may not work.'}
    </div>
  );
}
