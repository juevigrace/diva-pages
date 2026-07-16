import { useState } from 'react';
import { Button } from 'diva-ui/components/button';
import { getUserInitials, showStatus } from '../../nav-items';
import GrantPermissionForm from './GrantPermissionForm';

interface UserDetailContentProps {
  uid: string;
  user: Record<string, any> | null;
  profile: Record<string, any> | null;
  permissions: Record<string, any>[] | null;
  sessions: Record<string, any>[] | null;
  actions: Record<string, any>[] | null;
  allPermissions: Record<string, any>[];
  currentUserRole: string;
  isVerified?: boolean;
}

export default function UserDetailContent({ uid, user, profile, permissions: initialPermissions, sessions: initialSessions, actions, allPermissions, currentUserRole, isVerified = true }: UserDetailContentProps) {
  const [tab, setTab] = useState<'profile' | 'permissions' | 'sessions' | 'activity'>('profile');
  const [permStatus, setPermStatus] = useState('');
  const [permStatusError, setPermStatusError] = useState(false);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [sessions, setSessions] = useState(initialSessions);

  const canManage = isVerified && (currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR');

  const permMap = new Map(allPermissions.map((p: any) => [p.id, p]));

  const revokePermission = async (pid: string) => {
    const res = await fetch(`/api/user/${uid}/permissions/${pid}`, { method: 'DELETE' });
    if (res.ok) {
      setPermissions((prev) => (prev || []).filter((p: any) => p.permission_id !== pid));
      showStatus(setPermStatus, setPermStatusError, 'Permission revoked.', false);
    } else {
      const json = await res.json();
      showStatus(setPermStatus, setPermStatusError, json.message || 'Failed to revoke permission', true);
    }
  };

  const closeSession = async (sid: string) => {
    const res = await fetch(`/api/sessions/${sid}`, { method: 'DELETE' });
    if (res.ok) {
      setSessions((prev) => (prev || []).filter((s: any) => s.session_id !== sid));
    }
  };

  if (!user) {
    return <p className="text-muted-foreground text-sm">User not found.</p>;
  }

  const initials = getUserInitials(user.username);

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'activity', label: 'Activity' },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold">
            {initials}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{user.username}</h3>
            <p className="text-muted-foreground text-sm">{user.email || ''}</p>
            <div className="mt-2 flex gap-2">
              <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                {user.role || 'USER'}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                user.state?.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${user.state?.status === 'ACTIVE' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                {user.state?.status || 'ACTIVE'}
              </span>
              {user.deleted_at && (
                <span className="bg-destructive/10 text-destructive inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                  DELETED
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-border bg-card rounded-xl border shadow-sm">
        <div className="border-border flex border-b">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-primary text-foreground border-b-2'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium">{user.email || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium">{user.phone_number || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Username</p>
                  <p className="text-sm font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Role</p>
                  <p className="text-sm font-medium">{user.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Verified</p>
                  <p className="text-sm font-medium">{user.state?.verified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Created</p>
                  <p className="text-sm font-medium">
                    {user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
              {profile && (
                <div className="border-border mt-4 border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">Profile</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Name</p>
                      <p className="text-sm font-medium">{`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Alias</p>
                      <p className="text-sm font-medium">{profile.alias || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Bio</p>
                      <p className="text-sm font-medium">{profile.bio || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'permissions' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground text-sm">
                  {permissions ? `${permissions.length} permission${permissions.length !== 1 ? 's' : ''}` : ''}
                </p>
              </div>
              {canManage && (
                <GrantPermissionForm
                  uid={uid}
                  allPermissions={allPermissions}
                  onGranted={(perm) => setPermissions((prev) => [...(prev || []), perm])}
                />
              )}
              <span className={`text-xs ${permStatusError ? 'text-destructive' : 'text-muted-foreground'}`}>{permStatus}</span>
              {permissions && permissions.length > 0 ? (
                <div className="space-y-2">
                  {permissions.map((p: any) => {
                    const permDef = permMap.get(p.permission_id) || {};
                    return (
                      <div key={p.permission_id} className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{permDef.name || p.permission_id}</p>
                          <p className="text-muted-foreground text-xs">
                            {permDef.action ? `${permDef.action}` : p.permission_id}
                            {p.expires_at ? ` · Expires: ${new Date(p.expires_at * 1000).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                        {canManage && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => revokePermission(p.permission_id)}>
                            Revoke
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center text-sm">No permissions assigned.</p>
              )}
            </div>
          )}

          {tab === 'sessions' && (
            <div>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.map((s: any) => (
                    <div key={s.session_id} className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{s.device || 'Unknown device'}</p>
                        <p className="text-muted-foreground text-xs">
                          {s.ip || 'Unknown IP'}
                          {s.created_at ? ` · ${new Date(s.created_at * 1000).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>{s.status}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => closeSession(s.session_id)} title="Close">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center text-sm">No sessions found.</p>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div>
              {actions && actions.length > 0 ? (
                <div className="space-y-2">
                  {actions.map((a: any) => (
                    <div key={a.id} className="border-border flex items-center gap-3 rounded-lg border p-3">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                        {a.action_name?.charAt(0) || 'A'}
                      </div>
                      <p className="text-sm font-medium">{a.action_name || 'Unknown action'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center text-sm">No activity recorded.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
