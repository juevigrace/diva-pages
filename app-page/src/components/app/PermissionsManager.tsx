import { useState } from 'react';
import { Button } from 'diva-ui/components/button';

interface PermissionsManagerProps {
  initialPermissions: Record<string, any>[];
  initialPage: number;
  initialTotalPages: number;
  initialTotalItems: number;
  loadError: boolean;
}

export default function PermissionsManager({
  initialPermissions, initialPage, initialTotalPages, initialTotalItems, loadError: initError,
}: PermissionsManagerProps) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [loadError, setLoadError] = useState(initError);
  const [showCreate, setShowCreate] = useState(false);
  const [editPid, setEditPid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [action, setAction] = useState('');
  const [level, setLevel] = useState('USER');
  const [status, setStatus] = useState('');
  const [statusError, setStatusError] = useState(false);

  const showStatus = (msg: string, isError: boolean) => {
    setStatus(msg);
    setStatusError(isError);
    setTimeout(() => setStatus(''), 3000);
  };

  const loadPage = async (p: number) => {
    const res = await fetch(`/api/permissions/?page=${p}&limit=20`);
    if (res.ok) {
      const json = await res.json();
      setPermissions(json.items || []);
      setPage(p);
      setTotalPages(json.pagination_info?.total_pages || 1);
      setTotalItems(json.pagination_info?.total_items || 0);
      setLoadError(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/permissions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, action, level }),
    });
    if (res.ok) {
      showStatus('Permission created.', false);
      setShowCreate(false);
      setName(''); setDescription(''); setAction(''); setLevel('USER');
      loadPage(1);
    } else {
      const json = await res.json();
      showStatus(json.message || 'Failed to create permission', true);
    }
  };

  const handleUpdate = async (pid: string) => {
    const res = await fetch(`/api/permissions/${pid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      showStatus('Permission updated.', false);
      setEditPid(null);
      loadPage(page);
    } else {
      const json = await res.json();
      showStatus(json.message || 'Failed to update permission', true);
    }
  };

  const handleDelete = async (pid: string) => {
    if (!confirm('Soft-delete this permission?')) return;
    const res = await fetch(`/api/permissions/${pid}`, { method: 'DELETE' });
    if (res.ok) {
      showStatus('Permission deleted.', false);
      loadPage(page);
    } else {
      const json = await res.json();
      showStatus(json.message || 'Failed to delete permission', true);
    }
  };

  const handleRestore = async (pid: string) => {
    const res = await fetch(`/api/permissions/${pid}/restore`, { method: 'PATCH' });
    if (res.ok) {
      showStatus('Permission restored.', false);
      loadPage(page);
    } else {
      const json = await res.json();
      showStatus(json.message || 'Failed to restore permission', true);
    }
  };

  const handleHardDelete = async (pid: string) => {
    if (!confirm('Permanently delete this permission? This cannot be undone.')) return;
    const res = await fetch(`/api/permissions/${pid}/forever`, { method: 'DELETE' });
    if (res.ok) {
      showStatus('Permission permanently deleted.', false);
      loadPage(page);
    } else {
      const json = await res.json();
      showStatus(json.message || 'Failed to permanently delete permission', true);
    }
  };

  const paginationPages: (number | 'ellipsis')[] = [];
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      if (Math.abs(i - page) <= 2 || i === 1 || i === totalPages) {
        paginationPages.push(i);
      } else if (paginationPages[paginationPages.length - 1] !== 'ellipsis') {
        paginationPages.push('ellipsis');
      }
    }
  }

  return (
    <div>
      <div className="border-border bg-card rounded-xl border shadow-sm">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">Permission Definitions</h3>
          <Button type="button" size="sm" onClick={() => setShowCreate(true)}>Create permission</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">Name</th>
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">Action</th>
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">Description</th>
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">Level</th>
                <th className="text-muted-foreground px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadError ? (
                <tr><td colSpan={5} className="text-muted-foreground px-6 py-12 text-center text-sm">Could not load permissions.</td></tr>
              ) : permissions.length === 0 ? (
                <tr><td colSpan={5} className="text-muted-foreground px-6 py-12 text-center text-sm">No permissions found.</td></tr>
              ) : (
                permissions.map((p: any) => (
                  <tr key={p.id} className="border-border hover:bg-muted/50 border-b">
                    <td className="px-6 py-4">
                      {editPid === p.id ? (
                        <input className="border-input bg-background focus-visible:ring-ring flex h-8 w-full rounded-md border px-2 text-sm focus-visible:ring-1 focus-visible:outline-none" value={name} onChange={(e) => setName(e.target.value)} />
                      ) : (
                        <span className="font-medium">{p.name}</span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-6 py-4 font-mono text-xs">{p.action}</td>
                    <td className="text-muted-foreground px-6 py-4">{p.description}</td>
                    <td className="px-6 py-4"><span className="border-border inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">{p.role_level}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editPid === p.id ? (
                          <>
                            <Button type="button" variant="default" size="sm" onClick={() => handleUpdate(p.id)}>Save</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setEditPid(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button type="button" variant="ghost" size="sm" onClick={() => { setEditPid(p.id); setName(p.name); setDescription(p.description); }}>Edit</Button>
                        )}
                        {p.deleted_at ? (
                          <>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRestore(p.id)}>Restore</Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => handleHardDelete(p.id)}>Delete forever</Button>
                          </>
                        ) : (
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
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
          <p className="text-muted-foreground text-sm">{loadError ? '' : `${totalItems} permission${totalItems !== 1 ? 's' : ''}`}</p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {page > 1 && <Button type="button" variant="outline" size="icon" onClick={() => loadPage(page - 1)}>←</Button>}
              {paginationPages.map((p, i) =>
                p === 'ellipsis' ? <span key={`e-${i}`} className="text-muted-foreground px-1 text-xs">...</span>
                : <Button key={p} type="button" variant={p === page ? 'default' : 'outline'} size="sm" className="h-8 w-8" onClick={() => loadPage(p)}>{p}</Button>
              )}
              {page < totalPages && <Button type="button" variant="outline" size="icon" onClick={() => loadPage(page + 1)}>→</Button>}
            </div>
          )}
        </div>
      </div>
      <span className={`text-xs ${statusError ? 'text-destructive' : 'text-muted-foreground'}`}>{status}</span>

      {showCreate && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-border bg-card mx-4 w-full max-w-md rounded-xl border p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Permission</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium" htmlFor="perm-name">Name</label>
                <input id="perm-name" required className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium" htmlFor="perm-action">Action</label>
                <input id="perm-action" required placeholder="e.g. USERS_READ" className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm font-mono focus-visible:ring-1 focus-visible:outline-none" value={action} onChange={(e) => setAction(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium" htmlFor="perm-desc">Description</label>
                <textarea id="perm-desc" rows={2} className="border-input bg-background focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium" htmlFor="perm-level">Minimum role level</label>
                <select id="perm-level" className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="USER">User</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Create permission</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
