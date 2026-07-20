import { useState } from 'react';
import { z } from 'zod';
import { Button } from 'diva-ui/components/button';
import { toast } from 'diva-ui/components/sonner';
import { showStatus } from '../../nav-items';
import { changeLanguage } from '@lib/i18n/config';
import { useT } from '@lib/i18n/useT';

const preferencesSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']),
  language: z.string().min(1, 'Language is required').max(10),
});

interface SettingsContentProps {
  uid: string;
  initialPreferences: Record<string, any> | null;
  isVerified?: boolean;
  lang?: string;
}

export default function SettingsContent({ uid, initialPreferences, isVerified = true, lang = 'en' }: SettingsContentProps) {
  const t = useT(lang);

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

    if (language !== (preferences?.language || 'en')) {
      changeLanguage(language);
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
        showStatus(setPrefStatus, setPrefError, t('settings.preferencesSaved'), false);
      } else {
        const json = await res.json();
        showStatus(setPrefStatus, setPrefError, json.message || t('settings.failedSavePreferences'), true);
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
        showStatus(setPrefStatus, setPrefError, t('settings.preferencesCreated'), false);
      } else {
        const json = await res.json();
        showStatus(setPrefStatus, setPrefError, json.message || t('settings.failedCreatePreferences'), true);
      }
    }
  };

  const deleteAccount = async () => {
    if (!confirm(t('settings.deleteAccountConfirm'))) return;
    const res = await fetch(`/api/user/${uid}/forever`, { method: 'DELETE' });
    if (res.ok) {
      showStatus(setDangerStatus, setDangerError, t('settings.accountDeleted'), false);
      setTimeout(() => { window.location.href = '/home'; }, 1500);
    } else {
      const json = await res.json();
      showStatus(setDangerStatus, setDangerError, json.message || t('settings.failedDeleteAccount'), true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {!isVerified && (
        <div className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-xl border p-4 text-center text-sm text-amber-800 dark:text-amber-200">
          {t('nav.verifyToManage')} <a href="/verify" class="underline font-medium">{t('nav.verifyNow')}</a>
        </div>
      )}

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-lg font-semibold">{t('settings.preferences')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{t('settings.customizeExperience')}</p>
        <form onSubmit={handlePreferencesSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="theme">{t('settings.theme')}</label>
            <select
              id="theme"
              className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={theme}
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
            <span className={`text-xs ${prefError ? 'text-destructive' : 'text-muted-foreground'}`}>{prefStatus}</span>
          </div>
        </form>
      </div>

      <div className="border-destructive/20 bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-destructive text-lg font-semibold">{t('settings.dangerZone')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{t('settings.irreversibleActions')}</p>
        <div className="border-border mt-6 flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">{t('settings.deleteAccount')}</p>
            <p className="text-muted-foreground text-xs">{t('settings.deleteAccountDesc')}</p>
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={deleteAccount} disabled={!isVerified}>{t('common.delete')}</Button>
        </div>
        <span className={`text-xs ${dangerError ? 'text-destructive' : 'text-muted-foreground'}`}>{dangerStatus}</span>
      </div>
    </div>
  );
}
