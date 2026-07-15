import { useState, useEffect } from 'react';
import { Button } from 'diva-ui/components/button';
import { getUserInitials, buildPageArray } from '../../nav-items';

interface UsersManagerProps {
  initialUsers: Record<string, any>[];
  initialPage: number;
  initialTotalPages: number;
  initialTotalItems: number;
  loadError: boolean;
}

export default function UsersManager({
  initialUsers,
  initialPage,
  initialTotalPages,
  initialTotalItems,
  loadError: initialLoadError,
}: UsersManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createStatus, setCreateStatus] = useState('');
  const [createError, setCreateError] = useState(false);
  const [tableStatus, setTableStatus] = useState('');
  const [tableError, setTableError] = useState(false);

  const showTableStatus = (msg: string, isError: boolean) => {
    setTableStatus(msg);
    setTableError(isError);
    setTimeout(() => { setTableStatus(''); }, 3000);
  };

  const loadPage = async (p: number) => {
    const res = await fetch(`/api/user/?page=${p}&limit=10`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      setUsers(json.items || []);
      setPage(p);
      setTotalPages(json.pagination_info?.total_pages || 1);
      setTotalItems(json.pagination_info?.total_items || 0);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      setCreateStatus('Email is required');
      setCreateError(true);
      return;
    }
    if (!newUsername || newUsername.length < 3) {
      setCreateStatus('Username must be at least 3 characters');
      setCreateError(true);
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setCreateStatus('Password must be at least 4 characters');
      setCreateError(true);
      return;
    }
    const res = await fetch('/api/user/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, username: newUsername, password: newPassword }),
    });
    if (res.ok) {
      setCreateStatus('User created.');
      setCreateError(false);
      setTimeout(() => {
        setShowModal(false);
        loadPage(1);
      }, 1000);
    } else {
      const json = await res.json();
      setCreateStatus(json.message || 'Failed to create user');
      setCreateError(true);
    }
  };

  const handleRoleChange = async (uid: string, role: string) => {
    const res = await fetch(`/api/user/${uid}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      showTableStatus('Role updated.', false);
    } else {
      const json = await res.json();
      showTableStatus(json.message || 'Failed to update role', true);
    }
  };

  const handleVerify = async (uid: string) => {
    const res = await fetch(`/api/user/${uid}/status/verified`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: true }),
    });
    if (res.ok) {
      showTableStatus('User verified.', false);
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, state: { ...u.state, verified: true } } : u)));
    } else {
      const json = await res.json();
      showTableStatus(json.message || 'Failed to verify user', true);
    }
  };

  const handleDelete = async (uid: string, username: string) => {
    if (!confirm(`Delete user "${username}"? This can be undone.`)) return;
    const res = await fetch(`/api/user/${uid}`, { method: 'DELETE' });
    if (res.ok) {
      showTableStatus('User deleted.', false);
      setTimeout(() => loadPage(page), 1000);
    } else {
      const json = await res.json();
      showTableStatus(json.message || 'Failed to delete user', true);
    }
  };

  const handleRestore = async (uid: string) => {
    const res = await fetch(`/api/user/${uid}/restore`, { method: 'PATCH' });
    if (res.ok) {
      showTableStatus('User restored.', false);
      setTimeout(() => loadPage(page), 1000);
    } else {
      const json = await res.json();
      showTableStatus(json.message || 'Failed to restore user', true);
    }
  };

  const filteredUsers = search
    ? users.filter(
        (u) =>
          (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const paginationPages = buildPageArray(page, totalPages);

  return (
    <div>
      <div className="border-border bg-card rounded-xl border shadow-sm">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">Users</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-60 rounded-md border bg-transparent pr-3 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="button" onClick={() => { setShowModal(true); setCreateStatus(''); }}>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add user
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">User</th>
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">Email</th>
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">Role</th>
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">Status</th>
                <th className="text-muted-foreground px-6 py-3 text-center font-medium">Verified</th>
                <th className="text-muted-foreground px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadError ? (
                <tr>
                  <td colSpan={6} className="text-muted-foreground px-6 py-12 text-center text-sm">
                    Could not load users. Check your permissions.
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted-foreground px-6 py-12 text-center text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border-border hover:bg-muted/50 border-b">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                          {getUserInitials(user.username, user.email)}
                        </div>
                        <a href={`/users/${user.id}`} className="font-medium hover:underline">
                          {user.username || 'Unknown'}
                        </a>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-6 py-4">{user.email || '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        className="border-border bg-background rounded-md border px-2 py-1 text-xs font-medium shadow-sm"
                        defaultValue={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="USER">User</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.state?.status === 'ACTIVE' || user.state?.status === 'active'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          user.state?.status === 'ACTIVE' || user.state?.status === 'active'
                            ? 'bg-primary' : 'bg-muted-foreground'
                        }`} />
                        {user.state?.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.state?.verified ? (
                        <svg className="text-primary mx-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <button type="button" onClick={() => handleVerify(user.id)} title="Mark as verified">
                          <svg className="text-muted-foreground hover:text-primary mx-auto h-4 w-4 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(user.id, user.username)}
                          title="Delete user"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                        {user.deleted_at && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRestore(user.id)}
                            title="Restore user"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-border flex items-center justify-between border-t px-6 py-4">
          <p className="text-muted-foreground text-sm">
            {loadError ? '' : `${totalItems} user${totalItems !== 1 ? 's' : ''}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Button type="button" variant="outline" size="icon" onClick={() => loadPage(page - 1)}>←</Button>
              )}
              {paginationPages.map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="text-muted-foreground px-1 text-xs">...</span>
                ) : (
                  <Button
                    key={p}
                    type="button"
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => loadPage(p)}
                  >
                    {p}
                  </Button>
                )
              )}
              {page < totalPages && (
                <Button type="button" variant="outline" size="icon" onClick={() => loadPage(page + 1)}>→</Button>
              )}
            </div>
          )}
        </div>
      </div>

      <span className={`text-xs ${tableError ? 'text-destructive' : 'text-muted-foreground'}`}>{tableStatus}</span>

      {showModal && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-border bg-card mx-4 w-full max-w-md rounded-xl border p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add User</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium" htmlFor="new-email">Email</label>
                <input
                  id="new-email"
                  type="email"
                  required
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium" htmlFor="new-username">Username</label>
                <input
                  id="new-username"
                  required
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium" htmlFor="new-password">Password</label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={4}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <p className={`text-xs ${createError ? 'text-destructive' : 'text-muted-foreground'}`}>{createStatus}</p>
              <Button type="submit" className="w-full">Create user</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
