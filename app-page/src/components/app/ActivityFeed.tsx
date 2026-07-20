import { useEffect, useState } from 'react';
import { Badge } from 'diva-ui/components/badge';
import { useT } from '@lib/i18n/useT';

interface ActivityFeedProps {
  uid: string;
  isVerified?: boolean;
  lang?: string;
}

interface ActionItem {
  id?: string;
  action_id?: string;
  action_name?: string;
  target_type?: string;
  target_id?: string;
  created_at?: number;
  metadata?: Record<string, unknown>;
}

export default function ActivityFeed({ uid, isVerified = true, lang = 'en' }: ActivityFeedProps) {
  const t = useT(lang);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVerified) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/user/${uid}/actions/`);
        if (res.ok) {
          const data = await res.json();
          setActions(data || []);
        } else {
          setError(t('common.error'));
        }
      } catch {
        setError(t('common.error'));
      }
      setLoading(false);
    })();
  }, [uid, isVerified]);

  if (loading) {
    return (
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <h3 className="font-semibold">{t('users.activity')}</h3>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-12 animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <h3 className="font-semibold">{t('users.activity')}</h3>
        <p className="text-muted-foreground mt-4 text-center text-sm">{error}</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <h3 className="font-semibold">{t('users.activity')}</h3>
        <p className="text-muted-foreground mt-4 text-center text-sm">{t('users.noActivity')}</p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <h3 className="font-semibold">{t('users.activity')}</h3>
      <div className="mt-4 space-y-3">
        {actions.slice(0, 5).map((a) => {
          const aid = a.id || a.action_id || '';
          return (
            <div key={aid} className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                {(a.action_name || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{a.action_name || t('users.unknown')}</Badge>
                </div>
                {a.created_at && (
                  <p className="text-muted-foreground text-xs">
                    {new Date(a.created_at * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
