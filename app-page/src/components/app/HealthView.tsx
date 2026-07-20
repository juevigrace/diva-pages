import { useState, useEffect, useCallback } from 'react';
import { Button } from 'diva-ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from 'diva-ui/components/card';
import { Badge } from 'diva-ui/components/badge';
import { toast } from 'diva-ui/components/sonner';
import { useT } from '@lib/i18n/useT';

interface DatabaseHealth {
  is_connected: boolean;
  last_ping: string | number;
  ping_duration: number;
  error_message?: string;
}

interface ConnectionHealth {
  total_conns: number;
  idle_conns: number;
  acquired_conns: number;
  max_conns: number;
}

interface HealthData {
  status: string;
  message: string;
  timestamp: string | number;
  response_time: number;
  database: DatabaseHealth;
  connection: ConnectionHealth;
  metadata?: Record<string, string>;
}

function formatDuration(ns: number): string {
  if (ns < 1000) return `${ns}ns`;
  const µs = ns / 1000;
  if (µs < 1000) return `${µs.toFixed(1)}µs`;
  const ms = µs / 1000;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatTimestamp(ts: string | number): string {
  try {
    const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
    return date.toLocaleString();
  } catch {
    return String(ts);
  }
}

function connPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min((value / max) * 100, 100);
}

function PingDuration({ ns }: { ns: number }) {
  const duration = formatDuration(ns);
  const ms = ns / 1_000_000;
  const color = ms < 5 ? 'bg-green-500' : ms < 20 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {duration}
    </span>
  );
}

interface HealthViewProps {
  isVerified?: boolean;
  lang?: string;
}

export default function HealthView({ isVerified = true, lang = 'en' }: HealthViewProps) {
  const t = useT(lang);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        setHealth(json);
      } else {
        const j = await res.json();
        toast.error(j.message || t('common.error'));
      }
    } catch {
      toast.error(t('common.error'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isVerified) {
      fetchHealth();
    } else {
      setLoading(false);
    }
  }, [fetchHealth, isVerified]);

  if (!isVerified) {
    return (
      <div className="border-border bg-card rounded-xl border p-8 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">{t('admin.verifyToViewHealth')}</p>
        <a href="/verify" class="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">{t('nav.verifyNow')}</a>
      </div>
    );
  }

  if (loading && !health) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-border bg-card animate-pulse rounded-xl border p-6 shadow-sm">
              <div className="bg-muted h-4 w-20 rounded" />
              <div className="bg-muted mt-3 h-8 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="border-border bg-card rounded-xl border p-8 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">{t('common.error')}</p>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={fetchHealth}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const statusColor = health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500';
  const statusTextColor = health.status === 'healthy' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';
  const statusBgColor = health.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-3 w-3 rounded-full ${statusColor} ${health.status === 'healthy' ? 'animate-pulse' : ''}`} />
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBgColor} ${statusTextColor}`}>
                {health.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDuration(health.response_time)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${health.database.is_connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">{health.database.is_connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Ping: <PingDuration ns={health.database.ping_duration} />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Last Check</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatTimestamp(health.timestamp)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connection Pool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              { label: 'Total Connections', value: health.connection.total_conns, max: health.connection.max_conns },
              { label: 'Idle Connections', value: health.connection.idle_conns, max: health.connection.max_conns },
              { label: 'Acquired (In Use)', value: health.connection.acquired_conns, max: health.connection.max_conns },
            ] as const).map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value} / {item.max}</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${
                      connPercent(item.value, item.max) > 80 ? 'bg-red-500' : connPercent(item.value, item.max) > 50 ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                    style={{ width: `${connPercent(item.value, item.max)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2 text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{health.message}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2 text-sm">
              <span className="text-muted-foreground">Last Ping</span>
              <span className="font-medium">{formatTimestamp(health.database.last_ping)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2 text-sm">
              <span className="text-muted-foreground">Ping Duration</span>
              <span className="font-medium"><PingDuration ns={health.database.ping_duration} /></span>
            </div>
            {health.database.error_message && (
              <div className="flex items-center justify-between border-b pb-2 text-sm">
                <span className="text-muted-foreground">Error</span>
                <span className="text-destructive max-w-[200px] truncate font-medium">{health.database.error_message}</span>
              </div>
            )}
            {health.metadata && Object.entries(health.metadata).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between border-b pb-2 text-sm last:border-0">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium font-mono text-xs">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
