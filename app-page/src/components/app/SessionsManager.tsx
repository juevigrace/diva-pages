import { useState, useMemo } from 'react';
import { Button } from 'diva-ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from 'diva-ui/components/card';
import { Badge } from 'diva-ui/components/badge';
import { toast } from 'diva-ui/components/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from 'diva-ui/components/dialog';
import { useT } from '@lib/i18n/useT';

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
  isVerified?: boolean;
  lang?: string;
}

function formatDate(ts?: number) {
  if (!ts) return '\u2014';
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

function groupBadge(group: SessionGroup, t: (k: string) => string) {
  if (group === 'active') {
    return <Badge variant="default" className="bg-green-600">{t('sessionsPage.active')}</Badge>;
  }
  return <Badge variant="secondary">{t(`sessionsPage.${group}`)}</Badge>;
}

function SessionRow({ s, loading, onClose, isCurrent, isVerified, t, selected, onToggle }: {
  s: SessionData;
  loading: boolean;
  isCurrent: boolean;
  onClose: (sid: string) => void;
  isVerified: boolean;
  t: (k: string) => string;
  selected: boolean;
  onToggle: (sid: string) => void;
}) {
  const sid = s.session_id || s.id || '';
  const group = sessionGroup(s);
  const canSelect = group !== 'closed';

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input
          type="checkbox"
          checked={selected}
          disabled={!canSelect}
          onChange={() => onToggle(sid)}
          className="h-4 w-4 shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{s.device || t('sessionsPage.unknownDevice')}</span>
            {isCurrent && <Badge variant="outline" className="text-xs">{t('sessionsPage.active')}</Badge>}
            {groupBadge(group, t)}
          </div>
          <p className="text-muted-foreground text-xs">
            {s.ip ? `${s.ip} \u00b7 ` : ''}{s.agent?.substring(0, 40) || ''}
            {s.agent && s.agent.length > 40 ? '...' : ''}
          </p>
          <p className="text-muted-foreground text-xs">
            {t('sessionsPage.created')}: {formatDate(s.created_at)}
            {s.updated_at ? ` \u00b7 ${t('sessionsPage.lastActive')}: ${formatDate(s.updated_at)}` : ''}
          </p>
        </div>
      </div>
      {group === 'active' && (
        <Button variant="ghost" size="sm" onClick={() => onClose(sid)} disabled={loading}>
          {loading ? 'Closing...' : t('sessionsPage.closeSession')}
        </Button>
      )}
      {!isVerified && <span className="text-muted-foreground text-xs">{t('sessionsPage.verifyToManage')}</span>}
    </div>
  );
}

export default function SessionsManager({ uid, initialSessions, currentSessionId, isVerified = true, lang = 'en' }: SessionsManagerProps) {
  const t = useT(lang);
  const [sessions, setSessions] = useState<SessionData[]>(initialSessions || []);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [confirmSid, setConfirmSid] = useState<string | null>(null);
  const [selectedSids, setSelectedSids] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const grouped: Record<SessionGroup, SessionData[]> = { active: [], expired: [], closed: [] };
    for (const s of sessions) {
      grouped[sessionGroup(s)].push(s);
    }
    return grouped;
  }, [sessions]);

  const expiredCount = groups.expired.length;

  const toggleSelect = (sid: string) => {
    setSelectedSids((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  };

  const toggleSelectGroup = (group: SessionGroup) => {
    const groupSids = groups[group].map((s) => s.session_id || s.id || '');
    const allSelected = groupSids.every((sid) => selectedSids.has(sid));
    setSelectedSids((prev) => {
      const next = new Set(prev);
      for (const sid of groupSids) {
        if (allSelected) next.delete(sid);
        else next.add(sid);
      }
      return next;
    });
  };

  const refetchSessions = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/user/${uid}/sessions`);
      if (res.ok) {
        const json = await res.json();
        setSessions(json || []);
        setSelectedSids(new Set());
      } else {
        toast.error(t('sessionsPage.failedCloseSession'));
      }
    } catch {
      toast.error(t('sessionsPage.failedCloseSession'));
    }
    setRefreshing(false);
  };

  const closeSession = (sid: string) => {
    setConfirmSid(sid);
  };

  const confirmClose = async () => {
    if (!confirmSid) return;
    setLoading((prev) => ({ ...prev, [confirmSid]: true }));
    setConfirmSid(null);
    try {
      const res = await fetch(`/api/sessions/${confirmSid}`, { method: 'DELETE' });
      if (res.ok) {
        if (confirmSid === currentSessionId) {
          window.location.href = '/home';
          return;
        }
        setSessions((prev) => prev.map((s) =>
          (s.session_id || s.id) === confirmSid ? { ...s, status: 'CLOSED' } : s,
        ));
        toast.success(t('sessionsPage.sessionClosed'));
      } else {
        const j = await res.json();
        toast.error(j.message || t('sessionsPage.failedCloseSession'));
      }
    } catch {
      toast.error(t('sessionsPage.failedCloseSession'));
    }
    setLoading((prev) => ({ ...prev, [confirmSid]: false }));
  };

  const clearExpired = async () => {
    try {
      const res = await fetch('/api/sessions/expired', { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => !isExpired(s)));
        toast.success(t('sessionsPage.expiredCleared'));
      } else {
        toast.error(t('sessionsPage.failedClearExpired'));
      }
    } catch {
      toast.error(t('sessionsPage.failedClearExpired'));
    }
  };

  const batchClose = async () => {
    const ids = Array.from(selectedSids);
    if (ids.length === 0) return;

    try {
      const res = await fetch('/api/sessions/batch/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_ids: ids }),
      });
      if (res.ok) {
        const result = await res.json();
        setSessions((prev) => prev.map((s) => {
          const sid = s.session_id || s.id || '';
          return result.data.succeeded.includes(sid) ? { ...s, status: 'CLOSED' } : s;
        }));
        setSelectedSids(new Set());

        const succ = result.data.succeeded?.length || 0;
        const fail = result.data.failed?.length || 0;
        if (succ > 0) toast.success(`${succ} session${succ > 1 ? 's' : ''} closed`);
        if (fail > 0) toast.error(`${fail} session${fail > 1 ? 's' : ''} failed`);
      } else {
        const j = await res.json();
        toast.error(j.message || t('sessionsPage.failedCloseSession'));
      }
    } catch {
      toast.error(t('sessionsPage.failedCloseSession'));
    }
  };

  const visibleGroups = (['active', 'expired', 'closed'] as SessionGroup[]).filter(
    (g) => groups[g].length > 0,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('sessionsPage.title')}</CardTitle>
          <div className="flex items-center gap-2">
            {selectedSids.size > 0 && (
              <Button variant="destructive" size="sm" onClick={batchClose} disabled={!isVerified}>
                {t('sessionsPage.closeSession')} ({selectedSids.size})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={refetchSessions} disabled={refreshing || !isVerified}>
              {refreshing ? t('sessionsPage.refreshing') : t('sessionsPage.refresh')}
            </Button>
            {expiredCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearExpired} disabled={!isVerified}>
                {t('sessionsPage.clearExpired')} {expiredCount}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {visibleGroups.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('sessionsPage.noSessions')}</p>
          ) : (
            <div className="divide-y">
              {visibleGroups.map((group) => (
                <div key={group}>
                  <div className="text-muted-foreground flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={groups[group].every((s) => {
                        const sid = s.session_id || s.id || '';
                        return group === 'closed' || selectedSids.has(sid);
                      })}
                      disabled={group === 'closed'}
                      onChange={() => toggleSelectGroup(group)}
                      className="h-4 w-4"
                    />
                    <span>{t(`sessionsPage.${group}`)}</span>
                    <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px]">{groups[group].length}</span>
                  </div>
                  <div className="divide-y">
                    {groups[group].map((s) => {
                      const sid = s.session_id || s.id || '';
                      return (
                        <SessionRow
                          key={sid}
                          s={s}
                          loading={loading[sid] || false}
                          isCurrent={sid === currentSessionId}
                          onClose={closeSession}
                          isVerified={isVerified}
                          t={t}
                          selected={selectedSids.has(sid)}
                          onToggle={toggleSelect}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmSid !== null} onOpenChange={(open) => { if (!open) setConfirmSid(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sessionsPage.closeSession')}</DialogTitle>
            <DialogDescription>
              {t('sessionsPage.confirmCloseDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSid(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={confirmClose}>{t('sessionsPage.closeSession')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
