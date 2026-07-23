import { useState, useMemo } from 'react';
import { Button } from 'diva-ui/components/button';
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
import DataList from './DataList';
import type { Column } from './DataList';

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
  return new Date(ts).toLocaleString();
}

function isExpired(s: SessionData): boolean {
  if (!s.access_expires_at) return false;
  return Date.now() > s.access_expires_at;
}

type SessionGroup = 'active' | 'expired' | 'closed';

function sessionGroup(s: SessionData): SessionGroup {
  if (s.status?.toUpperCase() === 'CLOSED') return 'closed';
  if (isExpired(s)) return 'expired';
  return 'active';
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

  const allSessions = useMemo(() => {
    const order: SessionGroup[] = ['active', 'expired', 'closed'];
    return order.flatMap((g) => groups[g]);
  }, [groups]);

  const toggleSelect = (sid: string) => {
    setSelectedSids((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const selectable = allSessions.filter((s) => sessionGroup(s) !== 'closed');
    const allSelected = selectable.every((s) => selectedSids.has(s.session_id || s.id || ''));
    setSelectedSids((prev) => {
      const next = new Set(prev);
      for (const s of selectable) {
        const sid = s.session_id || s.id || '';
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

  const selectableCount = allSessions.filter((s) => sessionGroup(s) !== 'closed').length;
  const selectableSelected = allSessions.filter((s) => sessionGroup(s) !== 'closed' && selectedSids.has(s.session_id || s.id || ''));
  const allSelectableSelected = selectableCount > 0 && selectableSelected.length === selectableCount;

  const sessionColumns: Column<SessionData>[] = [
    {
      key: 'device',
      header: t('sessionsPage.device') || 'Device',
      render: (s: SessionData) => {
        const sid = s.session_id || s.id || '';
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{s.device || t('sessionsPage.unknownDevice')}</span>
            {sid === currentSessionId && <Badge variant="outline" className="text-xs">{t('sessionsPage.current') || 'Current'}</Badge>}
          </div>
        );
      },
    },
    {
      key: 'info',
      header: t('sessionsPage.info') || 'Info',
      render: (s: SessionData) => (
        <div className="text-muted-foreground text-xs whitespace-nowrap">
          {s.ip || '\u2014'}
        </div>
      ),
    },
    {
      key: 'created',
      header: t('sessionsPage.created'),
      render: (s: SessionData) => (
        <div className="text-muted-foreground text-xs whitespace-nowrap">
          {formatDate(s.created_at)}
        </div>
      ),
    },
    {
      key: 'lastActive',
      header: t('sessionsPage.lastActive'),
      render: (s: SessionData) => (
        <div className="text-muted-foreground text-xs whitespace-nowrap">
          {formatDate(s.updated_at)}
        </div>
      ),
    },
    {
      key: 'expires',
      header: t('sessionsPage.expires'),
      render: (s: SessionData) => (
        <div className="text-muted-foreground text-xs whitespace-nowrap">
          {formatDate(s.access_expires_at)}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('sessionsPage.status') || 'Status',
      render: (s: SessionData) => {
        const group = sessionGroup(s);
        if (group === 'active') {
          return <Badge variant="default" className="bg-green-600">{t('sessionsPage.active')}</Badge>;
        }
        return <Badge variant="secondary">{t(`sessionsPage.${group}`)}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <DataList
        columns={sessionColumns}
        data={allSessions}
        getId={(s: SessionData) => s.session_id || s.id || ''}
        selectable={isVerified}
        selectedIds={selectedSids}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        allSelected={allSelectableSelected}
        hasPermission={true}
        emptyMessage={t('sessionsPage.noSessions')}
        actions={(s: SessionData) => {
          const sid = s.session_id || s.id || '';
          const group = sessionGroup(s);
          return group === 'active' ? (
            <Button variant="ghost" size="sm" onClick={() => closeSession(sid)} disabled={loading[sid] || false}>
              {loading[sid] ? 'Closing...' : t('sessionsPage.closeSession')}
            </Button>
          ) : null;
        }}
        actionHeader={t('users.actions')}
        toolbar={
          <div className="flex items-center justify-between px-6 py-4">
            <h3 className="font-semibold">{t('sessionsPage.title')}</h3>
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
          </div>
        }
      />

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
