import { useState } from 'react';
import { Button } from 'diva-ui/components/button';

interface SettingsContentProps {
  uid: string;
  initialPreferences: Record<string, any> | null;
  initialSessions: Record<string, any>[] | null;
}

export default function SettingsContent({ uid, initialPreferences, initialSessions }: SettingsContentProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [sessions, setSessions] = useState(initialSessions || []);
  const [theme, setTheme] = useState(preferences?.theme || 'SYSTEM');
  const [language, setLanguage] = useState(preferences?.language || 'en');
  const [prefStatus, setPrefStatus] = useState('');
  const [prefError, setPrefError] = useState(false);
  const [sessStatus, setSessStatus] = useState('');
  const [sessError, setSessError] = useState(false);
  const [dangerStatus, setDangerStatus] = useState('');
  const [dangerError, setDangerError] = useState(false);

  const showStatus = (
    setter: (s: string) => void,
    _setError: (e: boolean) => void,
    msg: string,
    isError: boolean
  ) => {
    setter(msg);
    _setError(isError);
    setTimeout(() => setter(''), 3000);
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preferences) {
      const res = await fetch(`/api/preferences/${preferences.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, language }),
      });
      if (res.ok) {
        showStatus(setPrefStatus, setPrefError, 'Preferences saved.', false);
      } else {
        const json = await res.json();
        showStatus(setPrefStatus, setPrefError, json.message || 'Failed to save preferences', true);
      }
    } else {
      const res = await fetch(`/api/user/${uid}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, language, onboarding_completed: true }),
      });
      if (res.ok) {
        const json = await res.json();
        setPreferences(json);
        showStatus(setPrefStatus, setPrefError, 'Preferences created.', false);
      } else {
        const json = await res.json();
        showStatus(setPrefStatus, setPrefError, json.message || 'Failed to create preferences', true);
      }
    }
  };

  const closeSession = async (sid: string) => {
    const res = await fetch(`/api/sessions/${sid}`, { method: 'DELETE' });
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.session_id !== sid));
      showStatus(setSessStatus, setSessError, 'Session closed.', false);
    } else {
      const json = await res.json();
      showStatus(setSessStatus, setSessError, json.message || 'Failed to close session', true);
    }
  };

  const clearExpired = async () => {
    const res = await fetch('/api/sessions/expired', { method: 'DELETE' });
    if (res.ok) {
      showStatus(setSessStatus, setSessError, 'Expired sessions cleared.', false);
    } else {
      const json = await res.json();
      showStatus(setSessStatus, setSessError, json.message || 'Failed to clear expired sessions', true);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    const res = await fetch(`/api/user/${uid}/forever`, { method: 'DELETE' });
    if (res.ok) {
      showStatus(setDangerStatus, setDangerError, 'Account deleted. Redirecting...', false);
      setTimeout(() => { window.location.href = '/home'; }, 1500);
    } else {
      const json = await res.json();
      showStatus(setDangerStatus, setDangerError, json.message || 'Failed to delete account', true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-lg font-semibold">Preferences</h3>
        <p className="text-muted-foreground mt-1 text-sm">Customize your experience.</p>
        <form onSubmit={handlePreferencesSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="theme">Theme</label>
            <select
              id="theme"
              className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="LIGHT">Light</option>
              <option value="DARK">Dark</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="language">Language</label>
            <select
              id="language"
              className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit">{preferences ? 'Save preferences' : 'Create preferences'}</Button>
            <span className={`text-xs ${prefError ? 'text-destructive' : 'text-muted-foreground'}`}>{prefStatus}</span>
          </div>
        </form>
      </div>

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Sessions</h3>
            <p className="text-muted-foreground mt-1 text-sm">Manage your active sessions across devices.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={clearExpired}>Clear expired</Button>
        </div>
        <div className="mt-6 space-y-3">
          {sessions.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">No sessions found.</p>
          ) : (
            sessions.map((sess) => (
              <div key={sess.session_id} className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{sess.device || 'Unknown device'}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      sess.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {sess.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {sess.ip || 'Unknown IP'}
                    {sess.agent ? ` · ${sess.agent}` : ''}
                  </p>
                  {sess.created_at && (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Created {new Date(sess.created_at * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => closeSession(sess.session_id)}
                  title="Close session"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ))
          )}
        </div>
        <span className={`text-xs ${sessError ? 'text-destructive' : 'text-muted-foreground'}`}>{sessStatus}</span>
      </div>

      <div className="border-destructive/20 bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-destructive text-lg font-semibold">Danger Zone</h3>
        <p className="text-muted-foreground mt-1 text-sm">Irreversible actions for your account.</p>
        <div className="border-border mt-6 flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-muted-foreground text-xs">Permanently delete your account and all associated data</p>
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={deleteAccount}>Delete</Button>
        </div>
        <span className={`text-xs ${dangerError ? 'text-destructive' : 'text-muted-foreground'}`}>{dangerStatus}</span>
      </div>
    </div>
  );
}
