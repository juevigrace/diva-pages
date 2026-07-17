import { useState } from 'react';
import { z } from 'zod';
import { Button } from 'diva-ui/components/button';
import { showStatus } from '../../nav-items';

const preferencesSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']),
  language: z.string().min(1, 'Language is required').max(10),
});

interface SettingsContentProps {
  uid: string;
  initialPreferences: Record<string, any> | null;
  isVerified?: boolean;
}

export default function SettingsContent({ uid, initialPreferences, isVerified = true }: SettingsContentProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [theme, setTheme] = useState(preferences?.theme || 'SYSTEM');
  const [language, setLanguage] = useState(preferences?.language || 'en');
  const [prefStatus, setPrefStatus] = useState('');
  const [prefError, setPrefError] = useState(false);
  const [dangerStatus, setDangerStatus] = useState('');
  const [dangerError, setDangerError] = useState(false);

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = preferencesSchema.safeParse({ theme, language });
    if (!parsed.success) {
      showStatus(setPrefStatus, setPrefError, parsed.error.issues[0].message, true);
      return;
    }

    if (preferences) {
      const res = await fetch(`/api/preferences/${preferences.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, language }),
      });
      if (res.ok) {
        const json = await res.json();
        setPreferences(json);
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
      {!isVerified && (
        <div className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-xl border p-4 text-center text-sm text-amber-800 dark:text-amber-200">
          Verify your email to manage settings. <a href="/verify" class="underline font-medium">Verify now</a>
        </div>
      )}

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
            <Button type="submit" disabled={!isVerified}>{preferences ? 'Save preferences' : 'Create preferences'}</Button>
            <span className={`text-xs ${prefError ? 'text-destructive' : 'text-muted-foreground'}`}>{prefStatus}</span>
          </div>
        </form>
      </div>

      <div className="border-destructive/20 bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-destructive text-lg font-semibold">Danger Zone</h3>
        <p className="text-muted-foreground mt-1 text-sm">Irreversible actions for your account.</p>
        <div className="border-border mt-6 flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-muted-foreground text-xs">Permanently delete your account and all associated data</p>
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={deleteAccount} disabled={!isVerified}>Delete</Button>
        </div>
        <span className={`text-xs ${dangerError ? 'text-destructive' : 'text-muted-foreground'}`}>{dangerStatus}</span>
      </div>
    </div>
  );
}
