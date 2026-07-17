import { useState } from 'react';
import { z } from 'zod';
import { Button } from 'diva-ui/components/button';
import { buildPageArray } from '../../nav-items';
import PermissionLevelSelect from './PermissionLevelSelect';

const permissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required').max(255),
});

interface PermissionsManagerProps {
  initialPermissions: Record<string, any>[];
  initialPage: number;
  initialTotalPages: number;
  initialTotalItems: number;
  loadError: boolean;
  currentUserRole: string;
  isVerified?: boolean;
}

export default function PermissionsManager({
  initialPermissions, initialPage, initialTotalPages, initialTotalItems, loadError: initError, currentUserRole, isVerified = true,
}: PermissionsManagerProps) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [loadError, setLoadError] = useState(initError);
  const [editPid, setEditPid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [statusError, setStatusError] = useState(false);

  const isAdmin = currentUserRole === 'ADMIN';

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

  const handleUpdate = async (pid: string) => {
    const parsed = permissionSchema.safeParse({ name, description });
    if (!parsed.success) {
      showStatus(parsed.error.issues[0].message, true);
      return;
    }
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

  const handleLevelChanged = () => {
    showStatus('Role level updated.', false);
    loadPage(page);
  };

  const paginationPages = buildPageArray(page, totalPages);

  return (
    <div>
      <div className="border-border bg-card rounded-xl border shadow-sm">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">Permission Definitions</h3>
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
              {!isVerified ? (
                <tr><td colSpan={5} className="text-muted-foreground px-6 py-12 text-center text-sm">Verify your email to manage permissions.</td></tr>
              ) : loadError ? (
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
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <PermissionLevelSelect
                          pid={p.id}
                          currentLevel={p.role_level}
                          onLevelChanged={handleLevelChanged}
                        />
                      ) : (
                        <span className="border-border inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">{p.role_level}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editPid === p.id ? (
                          <>
                            <Button type="button" variant="default" size="sm" onClick={() => handleUpdate(p.id)}>Save</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setEditPid(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button type="button" variant="ghost" size="sm" disabled={!isVerified} onClick={() => { setEditPid(p.id); setName(p.name); setDescription(p.description); }}>Edit</Button>
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
    </div>
  );
}
