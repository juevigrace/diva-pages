import { useState } from 'react';
import { z } from 'zod';
import { Button } from 'diva-ui/components/button';
import { toast } from 'diva-ui/components/sonner';
import InlineVerification from '../auth/InlineVerification';
import { useT } from '@lib/i18n/useT';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(255),
  last_name: z.string().min(1, 'Last name is required').max(255),
  alias: z.string().min(1, 'Alias is required').max(255),
  birth_date: z.string().min(1, 'Birth date is required'),
  bio: z.string().max(255).optional(),
});

interface OnboardingFlowProps {
  uid: string;
  email: string;
  verified: boolean;
  hasProfile: boolean;
  initialPreferences: Record<string, any> | null;
  lang?: string;
}

type Step = 'verify' | 'profile' | 'preferences' | 'done';

export default function OnboardingFlow({
  uid,
  email,
  verified,
  hasProfile,
  initialPreferences,
  lang = 'en',
}: OnboardingFlowProps) {
  const t = useT(lang);

  const [step, setStep] = useState<Step>(() => {
    if (!verified) return 'verify';
    if (!hasProfile) return 'profile';
    return 'preferences';
  });

  const [localPreferences, setLocalPreferences] = useState({
    theme: initialPreferences?.theme || 'SYSTEM',
    language: initialPreferences?.language || lang,
    onboarding_completed: false,
  });

  const [profile, setProfile] = useState({ first_name: '', last_name: '', alias: '', bio: '', birth_date: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const alreadyComplete = verified && hasProfile && initialPreferences?.onboardingCompleted === true;

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = profileSchema.safeParse({
      first_name: profile.first_name,
      last_name: profile.last_name,
      alias: profile.alias,
      birth_date: profile.birth_date,
      bio: profile.bio || undefined,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch(`/api/user/${uid}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          alias: profile.alias,
          bio: profile.bio,
          birth_date: Math.floor(new Date(profile.birth_date).getTime() / 1000),
        }),
      });
      if (res.ok) {
        toast.success(t('onboarding.profileSaved'));
        setStep('preferences');
      } else if (res.status === 403) {
        setStep('verify');
        toast.error(t('onboarding.verifyRequired'));
      } else {
        const json = await res.json();
        toast.error(json.message || t('profile.failedUpdateProfile'));
      }
    } catch {
      toast.error(t('auth.networkError'));
    }
    setLoading(false);
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/user/${uid}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...localPreferences, onboarding_completed: true }),
      });
      if (res.ok) {
        setStep('done');
      } else if (res.status === 403) {
        setStep('verify');
        toast.error(t('onboarding.verifyRequired'));
      } else {
        const json = await res.json();
        toast.error(json.message || t('settings.failedCreatePreferences'));
      }
    } catch {
      toast.error(t('auth.networkError'));
    }
    setLoading(false);
  };

  if (alreadyComplete || step === 'done') {
    return (
      <div className="border-border bg-card w-full max-w-lg rounded-2xl border p-8 text-center shadow-sm">
        <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-semibold">{t('onboarding.doneTitle')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('onboarding.doneDesc')}</p>
        <Button className="mt-6" onClick={() => (window.location.href = '/')}>
          {t('onboarding.goToDashboard')}
        </Button>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'verify', label: t('onboarding.stepVerify') },
    { key: 'profile', label: t('onboarding.stepProfile') },
    { key: 'preferences', label: t('onboarding.stepPreferences') },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="border-border bg-card w-full max-w-lg rounded-2xl border p-8 shadow-sm">
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="bg-border h-px w-6" />}
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : i < currentIndex
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i === currentIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {step === 'verify' && (
        <div>
          <h2 className="text-xl font-semibold">{t('onboarding.verifyTitle')}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t('onboarding.verifyDesc')}</p>
          <div className="mt-6">
            <InlineVerification
              action="USER_VERIFICATION"
              email={email}
              onVerified={() => setStep(hasProfile ? 'preferences' : 'profile')}
              onCancel={() => (window.location.href = '/')}
              autoRequest
              lang={lang}
            />
          </div>
        </div>
      )}

      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">{t('onboarding.profileTitle')}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{t('onboarding.profileDesc')}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="ob-first-name">{t('profile.firstName')}</label>
              <input
                id="ob-first-name"
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={profile.first_name}
                onChange={(e) => { setProfile({ ...profile, first_name: e.target.value }); clearFieldError('first_name'); }}
              />
              {fieldErrors.first_name && <p className="text-destructive text-xs">{fieldErrors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="ob-last-name">{t('profile.lastName')}</label>
              <input
                id="ob-last-name"
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={profile.last_name}
                onChange={(e) => { setProfile({ ...profile, last_name: e.target.value }); clearFieldError('last_name'); }}
              />
              {fieldErrors.last_name && <p className="text-destructive text-xs">{fieldErrors.last_name}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="ob-alias">{t('profile.displayAlias')}</label>
            <input
              id="ob-alias"
              className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={profile.alias}
              onChange={(e) => { setProfile({ ...profile, alias: e.target.value }); clearFieldError('alias'); }}
            />
            {fieldErrors.alias && <p className="text-destructive text-xs">{fieldErrors.alias}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="ob-bio">{t('profile.bio')}</label>
            <textarea
              id="ob-bio"
              rows={3}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={profile.bio}
              onChange={(e) => { setProfile({ ...profile, bio: e.target.value }); clearFieldError('bio'); }}
            />
            {fieldErrors.bio && <p className="text-destructive text-xs">{fieldErrors.bio}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="ob-birth-date">{t('profile.birthDate')}</label>
            <input
              id="ob-birth-date"
              type="date"
              className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={profile.birth_date}
              onChange={(e) => { setProfile({ ...profile, birth_date: e.target.value }); clearFieldError('birth_date'); }}
            />
            {fieldErrors.birth_date && <p className="text-destructive text-xs">{fieldErrors.birth_date}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('onboarding.saving') : t('common.continue')}
          </Button>
        </form>
      )}

      {step === 'preferences' && (
        <form onSubmit={handlePreferencesSubmit} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">{t('onboarding.preferencesTitle')}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{t('onboarding.preferencesDesc')}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="ob-theme">{t('settings.theme')}</label>
            <select
              id="ob-theme"
              className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={localPreferences.theme}
              onChange={(e) => setLocalPreferences({ ...localPreferences, theme: e.target.value })}
            >
              <option value="LIGHT">{t('settings.light')}</option>
              <option value="DARK">{t('settings.dark')}</option>
              <option value="SYSTEM">{t('settings.system')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="ob-language">{t('settings.language')}</label>
            <select
              id="ob-language"
              className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={localPreferences.language}
              onChange={(e) => setLocalPreferences({ ...localPreferences, language: e.target.value })}
            >
              <option value="en">{t('settings.english')}</option>
              <option value="es">{t('settings.spanish')}</option>
              <option value="fr">{t('settings.french')}</option>
              <option value="de">{t('settings.german')}</option>
              <option value="ja">{t('settings.japanese')}</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('onboarding.saving') : t('onboarding.finishSetup')}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center">
        <a href="/?ob_skip=1" className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2">
          {t('onboarding.skipForNow')}
        </a>
      </p>
    </div>
  );
}
