import { useEffect, useState } from 'react';

interface ActivityFeedProps {
  uid: string;
}

export default function ActivityFeed({ uid }: ActivityFeedProps) {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/user/${uid}/actions/`);
        if (res.ok) {
          const data = await res.json();
          setActions(data || []);
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="border-border bg-card rounded-xl border shadow-sm">
        <div className="border-border border-b px-6 py-4">
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-xl border shadow-sm">
      <div className="border-border border-b px-6 py-4">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <div className="divide-border divide-y">
        {actions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">No activity yet.</div>
        ) : (
          actions.slice(0, 5).map((a: any) => (
            <div key={a.id} className="flex items-center gap-4 px-6 py-4">
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
                {a.action_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">{a.action_name || 'Unknown action'}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
