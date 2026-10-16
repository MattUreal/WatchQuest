'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';
import { useAuth } from '@/lib/auth';

// Question shown in the confirm box for each action
const CONFIRM_TEXT = {
  disable: 'Disable this account? They will be signed out.',
  enable: 'Re-enable this account?',
  makeAdmin: 'Give this user admin access?',
  removeAdmin: 'Remove admin access from this user?',
  delete: 'PERMANENTLY delete this user and their library?',
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [busyUid, setBusyUid] = useState('');

  const loadUsers = useCallback(async ({ email, pageToken } = {}) => {
    setError('');
    try {
      const params = new URLSearchParams();
      if (email) params.set('email', email);
      if (pageToken) params.set('pageToken', pageToken);
      const data = await adminFetch('/api/admin/users?' + params);
      setUsers((old) => (pageToken ? [...old, ...data.users] : data.users));
      setNextPage(data.nextPageToken || null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleSearch(e) {
    e.preventDefault();
    loadUsers(search.trim() ? { email: search.trim() } : {});
  }

  async function doAction(u, action) {
    if (!confirm(`${CONFIRM_TEXT[action]}\n\n${u.email}`)) return;

    setBusyUid(u.uid);
    setError('');
    try {
      if (action === 'delete') {
        await adminFetch(`/api/admin/users/${u.uid}`, { method: 'DELETE' });
        setUsers((list) => list.filter((x) => x.uid !== u.uid));
      } else {
        await adminFetch(`/api/admin/users/${u.uid}`, { method: 'PATCH', body: JSON.stringify({ action }) });
        // update the row on screen without reloading
        const changes = {
          disable: { disabled: true },
          enable: { disabled: false },
          makeAdmin: { admin: true },
          removeAdmin: { admin: false },
        }[action];
        setUsers((list) => list.map((x) => (x.uid === u.uid ? { ...x, ...changes } : x)));
      }
    } catch (e) {
      setError(e.message);
    }
    setBusyUid('');
  }

  return (
    <>
      <form className="filters" onSubmit={handleSearch}>
        <input type="search" placeholder="Search by exact email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="tablewrap">
        <table className="atable">
          <thead>
            <tr><th>User</th><th>Status</th><th>Joined</th><th>Last sign-in</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.uid === me?.uid;
              return (
                <tr key={u.uid}>
                  <td>{u.displayName || '—'}<br /><small className="muted">{u.email}</small></td>
                  <td>{u.disabled ? '🚫 Disabled' : '✔ Active'}{u.admin && ' · 🛡 Admin'}</td>
                  <td>{u.created ? new Date(u.created).toLocaleDateString() : ''}</td>
                  <td>{u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString() : '—'}</td>
                  <td className="aact">
                    {isMe ? (
                      <small className="muted">You</small>
                    ) : (
                      <>
                        <button disabled={busyUid === u.uid} onClick={() => doAction(u, u.disabled ? 'enable' : 'disable')}>
                          {u.disabled ? 'Enable' : 'Disable'}
                        </button>
                        <button disabled={busyUid === u.uid} onClick={() => doAction(u, u.admin ? 'removeAdmin' : 'makeAdmin')}>
                          {u.admin ? 'Remove admin' : 'Make admin'}
                        </button>
                        <button className="del" disabled={busyUid === u.uid} onClick={() => doAction(u, 'delete')}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !error && <p className="muted">No users found.</p>}
      {nextPage && (
        <div className="pager">
          <button className="btn" onClick={() => loadUsers({ pageToken: nextPage })}>Load more</button>
        </div>
      )}
    </>
  );
}
