import { useState } from 'react';
import { z } from 'zod';
import { Button } from 'diva-ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from 'diva-ui/components/dialog';
import { buildPageArray } from '@lib/ui';
import { useT } from '@lib/i18n/useT';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

const epSchema = z.object({
  method: z.string().min(1, 'Method is required').max(10),
  path_pattern: z.string().min(1, 'Path is required').max(255),
  permission_id: z.string().min(1, 'Permission is required').max(255),
});

interface EndpointPermissionsManagerProps {
  initialRows: Record<string, any>[];
  initialPage: number;
  initialTotalPages: number;
  initialTotalItems: number;
  allPermissions: Record<string, any>[];
  loadError: boolean;
  currentUserRole: string;
  isVerified?: boolean;
  lang?: string;
}

export default function EndpointPermissionsManager({
  initialRows,
  initialPage,
  initialTotalPages,
  initialTotalItems,
  allPermissions,
  loadError: initError,
  currentUserRole,
  isVerified = true,
  lang = 'en',
}: EndpointPermissionsManagerProps) {
  const t = useT(lang);
  const [rows, setRows] = useState(initialRows);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [loadError, setLoadError] = useState(initError);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [method, setMethod] = useState<string>(METHODS[0]);
  const [pathPattern, setPathPattern] = useState('');
  const [permissionId, setPermissionId] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [statusError, setStatusError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = currentUserRole === 'ADMIN';
  const permMap = new Map(allPermissions.map((p: any) => [p.id, p.name]));

  const showStatus = (msg: string, isError: boolean) => {
    setStatus(msg);
    setStatusError(isError);
    setTimeout(() => setStatus(''), 3000);
  };

  const loadPage = async (p: number) => {
    const res = await fetch(`/api/endpoint-permissions/?page=${p}&limit=20`);
    if (res.ok) {
      const json = await res.json();
      setRows(json.items || []);
      setPage(p);
      setTotalPages(json.pagination_info?.total_pages || 1);
      setTotalItems(json.pagination_info?.total_items || 0);
      setLoadError(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setMethod(METHODS[0]);
    setPathPattern('');
    setPermissionId(allPermissions[0]?.id || '');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, any>) => {
    setEditing(row);
    setMethod(row.method || METHODS[0]);
    setPathPattern(row.path_pattern || '');
    setPermissionId(row.permission_id || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = epSchema.safeParse({ method, path_pattern: pathPattern, permission_id: permissionId });
    if (!parsed.success) {
      showStatus(parsed.error.issues[0].message, true);
      return;
    }
    setSaving(true);
    try {
      const res = editing
        ? await fetch(`/api/endpoint-permissions/${editing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method, path_pattern: pathPattern }),
          })
        : await fetch(`/api/endpoint-permissions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method, path_pattern: pathPattern, permission_id: permissionId }),
          });
      if (res.ok) {
        showStatus(editing ? t('admin.endpointPermissionUpdated') : t('admin.endpointPermissionCreated'), false);
        setModalOpen(false);
        loadPage(page);
      } else {
        const json = await res.json();
        showStatus(json.message || t('admin.failedUpdateEndpointPermission'), true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/endpoint-permissions/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    if (res.ok) {
      showStatus(t('admin.endpointPermissionDeleted'), false);
      loadPage(page);
    } else {
      const json = await res.json();
      showStatus(json.message || t('admin.failedDeleteEndpointPermission'), true);
    }
  };

  const paginationPages = buildPageArray(page, totalPages);

  return (
    <div>
      <div className="border-border bg-card rounded-xl border shadow-sm">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">{t('admin.endpointPermissionName')}</h3>
          <Button type="button" size="sm" disabled={!isVerified || !isAdmin} onClick={openCreate}>
            {t('admin.addEndpointPermission')}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">{t('admin.method')}</th>
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">{t('admin.path')}</th>
                <th className="text-muted-foreground px-6 py-3 text-left font-medium">{t('admin.permissionName')}</th>
                <th className="text-muted-foreground px-6 py-3 text-right font-medium">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {!isVerified ? (
                <tr><td colSpan={4} className="text-muted-foreground px-6 py-12 text-center text-sm">{t('nav.verifyToManage')}</td></tr>
              ) : loadError ? (
                <tr><td colSpan={4} className="text-muted-foreground px-6 py-12 text-center text-sm">{t('common.error')}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="text-muted-foreground px-6 py-12 text-center text-sm">{t('admin.noEndpointPermissions')}</td></tr>
              ) : (
                rows.map((row: any) => (
                  <tr key={row.id} className="border-border hover:bg-muted/50 border-b">
                    <td className="px-6 py-4 font-mono text-xs">{row.method}</td>
                    <td className="text-muted-foreground px-6 py-4 font-mono text-xs">{row.path_pattern}</td>
                    <td className="px-6 py-4 font-medium">{permMap.get(row.permission_id) || row.permission_id}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <>
                            <Button type="button" variant="ghost" size="sm" disabled={!isVerified} onClick={() => openEdit(row)}>{t('admin.editPermission')}</Button>
                            <Button type="button" variant="ghost" size="sm" disabled={!isVerified || deletingId === row.id} onClick={() => handleDelete(row.id)}>{t('users.revoke')}</Button>
                          </>
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
          <p className="text-muted-foreground text-sm">{loadError ? '' : `${totalItems} ${t('admin.endpointPermissionCount')}`}</p>
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

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) setModalOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('admin.editEndpointPermission') : t('admin.addEndpointPermission')}</DialogTitle>
            <DialogDescription>{t('admin.endpointPermissionDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="ep-method">{t('admin.method')}</label>
              <select
                id="ep-method"
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="ep-path">{t('admin.path')}</label>
              <input
                id="ep-path"
                required
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                placeholder="/user/{uid}/profile"
                value={pathPattern}
                onChange={(e) => setPathPattern(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="ep-permission">{t('admin.permissionName')}</label>
              <select
                id="ep-permission"
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                value={permissionId}
                disabled={!!editing}
                onChange={(e) => setPermissionId(e.target.value)}
              >
                {allPermissions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={saving}>{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <span className={`text-xs ${statusError ? 'text-destructive' : 'text-muted-foreground'}`}>{status}</span>
    </div>
  );
}
