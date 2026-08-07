import { useState } from 'react';
import { z } from 'zod';
import { Button } from 'diva-ui/components/button';
import { Input } from 'diva-ui/components/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from 'diva-ui/components/dialog';
import { toast } from 'diva-ui/components/sonner';
import { useT } from '@lib/i18n/useT';
import SessionsManager from './SessionsManager';
import DevicesManager from './DevicesManager';

const preferencesSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']),
  language: z.string().min(1, 'Language is required').max(10),
});

interface SettingsContentProps {
  uid: string;
  username?: string;
  initialPreferences: Record<string, any> | null;
  initialSessions?: Record<string, any>[] | null;
  initialDevices?: Record<string, any>[] | null;
  currentSessionId?: string;
  lastActiveAt?: number;
  hasProfile?: boolean;
  isVerified?: boolean;
  lang?: string;
}

function formatDate(ts?: number) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

export default function SettingsContent({
  uid,
  username = '',
  initialPreferences,
  initialSessions = null,
  initialDevices = null,
  currentSessionId,
  lastActiveAt,
  hasProfile = true,
  isVerified = true,
  lang = 'en',
}: SettingsContentProps) {
  const t = useT(lang);

  const [preferences, setPreferences] = useState(initialPreferences);
  const [theme, setTheme] = useState(preferences?.theme || 'SYSTEM');
  const [language, setLanguage] = useState(preferences?.language || 'en');

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences && !hasProfile) return;

    const parsed = preferencesSchema.safeParse({ theme, language });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    const langChanged = language !== (preferences?.language || 'en');
    const isCreate = !preferences;
    const body = JSON.stringify(isCreate ? { theme, language, onboarding_completed: true } : { theme, language });

    const res = await fetch(isCreate ? `/api/user/${uid}/preferences` : `/api/preferences/${preferences.id}`, {
      method: isCreate ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (res.ok) {
      const refetchRes = await fetch(`/api/user/${uid}/preferences`);
      if (refetchRes.ok) {
        const refetchJson = await refetchRes.json();
        const prefs = Array.isArray(refetchJson) ? refetchJson : (refetchJson?.data || []);
        setPreferences(prefs.length > 0 ? prefs[0] : { theme, language });
      }
      toast.success(isCreate ? t('settings.preferencesCreated') : t('settings.preferencesSaved'));
      if (langChanged) setTimeout(() => window.location.reload(), 300);
    } else {
      const json = await res.json();
      toast.error(json.message || (isCreate ? t('settings.failedCreatePreferences') : t('settings.failedSavePreferences')));
    }
  };

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAccount = async () => {
    const res = await fetch(`/api/user/${uid}/forever`, { method: 'DELETE' });
    setConfirmDelete(false);
    if (res.ok) {
      toast.success(t('settings.accountDeleted'));
      setTimeout(() => { window.location.href = '/home'; }, 1500);
    } else {
      const json = await res.json();
      toast.error(json.message || t('settings.failedDeleteAccount'));
    }
  };

  const deleteMatch = username ? confirmText === username : confirmText === 'DELETE';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {!isVerified && (
        <div className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-xl border p-4 text-center text-sm text-amber-800 dark:text-amber-200">
          {t('nav.verifyToManage')} <a href="/onboarding" className="underline font-medium">{t('nav.verifyNow')}</a>
        </div>
      )}

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-lg font-semibold">{t('settings.preferences')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{t('settings.customizeExperience')}</p>
        {preferences || hasProfile ? (
          <form onSubmit={handlePreferencesSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="theme">{t('settings.theme')}</label>
              <select
                id="theme"
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={theme}
                disabled={!isVerified}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="LIGHT">{t('settings.light')}</option>
                <option value="DARK">{t('settings.dark')}</option>
                <option value="SYSTEM">{t('settings.system')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="language">{t('settings.language')}</label>
              <select
                id="language"
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={language}
                disabled={!isVerified}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">{t('settings.english')}</option>
                <option value="es">{t('settings.spanish')}</option>
                <option value="fr">{t('settings.french')}</option>
                <option value="de">{t('settings.german')}</option>
                <option value="ja">{t('settings.japanese')}</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!isVerified}>{preferences ? t('settings.savePreferences') : t('settings.createPreferences')}</Button>
            </div>
          </form>
        ) : (
          <div className="border-border mt-6 flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{t('settings.preferencesLocked')}</p>
              <p className="text-muted-foreground text-xs">{t('settings.createProfileFirst')}</p>
            </div>
            <a href="/profile">
              <Button type="button" size="sm">{t('profile.createProfile')}</Button>
            </a>
          </div>
        )}
      </div>

      {isVerified && (
        <div className="space-y-8">
          <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{t('settings.security')}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{t('settings.securityDesc')}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">{t('settings.lastSignIn')}</p>
                  <p className="text-sm font-medium">{formatDate(lastActiveAt)}</p>
                </div>
                <a href="/profile#password">
                  <Button type="button" variant="outline" size="sm">{t('settings.changePassword')}</Button>
                </a>
              </div>
            </div>
          </div>

          <SessionsManager
            uid={uid}
            initialSessions={initialSessions}
            currentSessionId={currentSessionId}
            isVerified={isVerified}
            lang={lang}
          />

          <DevicesManager
            uid={uid}
            initialDevices={initialDevices}
            isVerified={isVerified}
            lang={lang}
          />
        </div>
      )}

      <div className="border-destructive/20 bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-destructive text-lg font-semibold">{t('settings.dangerZone')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{t('settings.irreversibleActions')}</p>
        <div className="border-border mt-6 flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">{t('settings.deleteAccount')}</p>
            <p className="text-muted-foreground text-xs">{t('settings.deleteAccountDesc')}</p>
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={() => { setConfirmText(''); setConfirmDelete(true); }} disabled={!isVerified}>{t('common.delete')}</Button>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.deleteAccount')}</DialogTitle>
            <DialogDescription>
              {t('settings.deleteAccountTypeConfirm', { username })}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={username || 'DELETE'}
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" disabled={!deleteMatch} onClick={handleDeleteAccount}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
