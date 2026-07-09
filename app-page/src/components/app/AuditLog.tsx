import { useState, useEffect, useCallback } from 'react';
import { Button } from 'diva-ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from 'diva-ui/components/card';
import { Input } from 'diva-ui/components/input';
import { Badge } from 'diva-ui/components/badge';
import { toast } from 'diva-ui/components/sonner';

interface ActionData {
  id?: string;
  action_id?: string;
  action_name?: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: number;
}

export default function AuditLog() {
  const [actions, setActions] = useState<ActionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await fetch(`/api/user/?${params}`);
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || [];
        setActions(items);
        setTotalPages(json.data?.pagination_info?.total_pages || 1);
      }
    } catch {
      toast.error('Failed to load audit log');
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const filtered = search
    ? actions.filter(
        (a) =>
          (a.action_name || '').toLowerCase().includes(search.toLowerCase()) ||
          (a.target_type || '').toLowerCase().includes(search.toLowerCase()),
      )
    : actions;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Action History</CardTitle>
          <Input
            placeholder="Filter by action or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-muted h-12 animate-pulse rounded-md" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No actions found.</p>
          ) : (
            <div className="divide-y">
              {filtered.map((a) => {
                const aid = a.id || a.action_id || '';
                return (
                  <div key={aid} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {a.action_name || 'Unknown'}
                        </Badge>
                        {a.target_type && (
                          <span className="text-muted-foreground text-xs">
                            on {a.target_type}{a.target_id ? ` #${a.target_id.substring(0, 8)}` : ''}
                          </span>
                        )}
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
          )}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
