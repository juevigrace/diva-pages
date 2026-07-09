import { useState } from 'react';
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
}

function formatDate(ts?: number) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
}

function isExpired(s: SessionData): boolean {
  if (!s.access_expires_at) return false;
  return Date.now() > s.access_expires_at * 1000;
}

export default function SessionsManager({ uid, initialSessions }: SessionsManagerProps) {
  const [sessions, setSessions] = useState<SessionData[]>(initialSessions || []);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const closeSession = async (sid: string) => {
    setLoading((prev) => ({ ...prev, [sid]: true }));
    try {
      const res = await fetch(`/api/sessions/${sid}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => (s.session_id || s.id) !== sid));
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

  const expiredCount = sessions.filter(isExpired).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Sessions</CardTitle>
          {expiredCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearExpired}>
              Clear {expiredCount} expired
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No active sessions.</p>
          ) : (
            <div className="divide-y">
              {sessions.map((s) => {
                const sid = s.session_id || s.id || '';
                const expired = isExpired(s);
                return (
                  <div key={sid} className="flex items-center justify-between py-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{s.device || 'Unknown device'}</span>
                        {expired && <Badge variant="secondary">Expired</Badge>}
                        {s.status === 'active' && !expired && (
                          <Badge variant="default" className="bg-green-600">Active</Badge>
                        )}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => closeSession(sid)}
                      disabled={loading[sid]}
                    >
                      {loading[sid] ? 'Closing...' : 'Close'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
