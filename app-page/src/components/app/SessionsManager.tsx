import { useState, useMemo } from 'react';
import { Button } from 'diva-ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from 'diva-ui/components/card';
import { Badge } from 'diva-ui/components/badge';
import { toast } from 'diva-ui/components/sonner';

interface SessionData {
  session_id?: string;
  id?: string;
  type?: string;
  device?: string;
  ip?: string;
  agent?: string;
  status?: string;
  created_at?: number;
  updated_at?: number;
  access_expires_at?: number;
}

interface SessionsManagerProps {
  uid: string;
  initialSessions: SessionData[] | null;
  currentSessionId?: string;
}

function formatDate(ts?: number) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
}

function isExpired(s: SessionData): boolean {
  if (!s.access_expires_at) return false;
  return Date.now() > s.access_expires_at * 1000;
}

type SessionGroup = 'active' | 'expired' | 'closed';

function sessionGroup(s: SessionData): SessionGroup {
  if (s.status?.toUpperCase() === 'CLOSED') return 'closed';
  if (isExpired(s)) return 'expired';
  return 'active';
}

const groupLabels: Record<SessionGroup, string> = {
  active: 'Active',
  expired: 'Expired',
  closed: 'Closed',
};

const groupBadges: Record<SessionGroup, React.ReactNode> = {
  active: <Badge variant="default" className="bg-green-600">Active</Badge>,
  expired: <Badge variant="secondary">Expired</Badge>,
  closed: <Badge variant="secondary">Closed</Badge>,
};

function SessionRow({ s, loading, onClose }: {
  s: SessionData;
  loading: boolean;
  onClose: (sid: string) => void;
}) {
  const sid = s.session_id || s.id || '';
  const group = sessionGroup(s);

  return (
    <div className="flex items-center justify-between py-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{s.device || 'Unknown device'}</span>
          {groupBadges[group]}
        </div>
        <p className="text-muted-foreground text-xs">
          {s.ip ? `${s.ip} · ` : ''}{s.agent?.substring(0, 40) || ''}
          {s.agent && s.agent.length > 40 ? '...' : ''}
        </p>
        <p className="text-muted-foreground text-xs">
          Created: {formatDate(s.created_at)}
          {s.updated_at ? ` · Last active: ${formatDate(s.updated_at)}` : ''}
        </p>
      </div>
      {group === 'active' && (
        <Button variant="ghost" size="sm" onClick={() => onClose(sid)} disabled={loading}>
          {loading ? 'Closing...' : 'Close'}
        </Button>
      )}
    </div>
  );
}

export default function SessionsManager({ uid, initialSessions, currentSessionId }: SessionsManagerProps) {
  const [sessions, setSessions] = useState<SessionData[]>(initialSessions || []);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const grouped: Record<SessionGroup, SessionData[]> = { active: [], expired: [], closed: [] };
    for (const s of sessions) {
      grouped[sessionGroup(s)].push(s);
    }
    return grouped;
  }, [sessions]);

  const expiredCount = groups.expired.length;

  const closeSession = async (sid: string) => {
    setLoading((prev) => ({ ...prev, [sid]: true }));
    try {
      const res = await fetch(`/api/sessions/${sid}`, { method: 'DELETE' });
      if (res.ok) {
        if (sid === currentSessionId) {
          window.location.href = '/home';
          return;
        }
        setSessions((prev) => prev.map((s) =>
          (s.session_id || s.id) === sid ? { ...s, status: 'CLOSED' } : s,
        ));
        toast.success('Session closed');
      } else {
        const j = await res.json();
        toast.error(j.message || 'Failed to close session');
      }
    } catch {
      toast.error('Failed to close session');
    }
    setLoading((prev) => ({ ...prev, [sid]: false }));
  };

  const clearExpired = async () => {
    try {
      const res = await fetch('/api/sessions/expired', { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => !isExpired(s)));
        toast.success('Expired sessions cleared');
      } else {
        toast.error('Failed to clear expired sessions');
      }
    } catch {
      toast.error('Failed to clear expired sessions');
    }
  };

  const visibleGroups = (['active', 'expired', 'closed'] as SessionGroup[]).filter(
    (g) => groups[g].length > 0,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sessions</CardTitle>
          {expiredCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearExpired}>
              Clear {expiredCount} expired
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {visibleGroups.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No sessions found.</p>
          ) : (
            <div className="divide-y">
              {visibleGroups.map((group) => (
                <div key={group}>
                  <div className="text-muted-foreground flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider">
                    <span>{groupLabels[group]}</span>
                    <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px]">{groups[group].length}</span>
                  </div>
                  <div className="divide-y">
                    {groups[group].map((s) => {
                      const sid = s.session_id || s.id || '';
                      return (
                        <SessionRow key={sid} s={s} loading={loading[sid] || false} onClose={closeSession} />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
