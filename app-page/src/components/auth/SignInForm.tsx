import { useState } from 'react';
import { Button } from 'diva-ui/components/button';
import { toast } from 'diva-ui/components/sonner';
import { Input } from 'diva-ui/components/input';
import { signInInputSchema } from '@lib/schemas/auth';
import { useT } from '@lib/i18n/useT';
import { useFieldErrors } from '@lib/hooks/useFieldErrors';
import { getDeviceLabel } from '@lib/device';
import type { AccountInfo } from 'diva-types/auth/models/account';
import AccountPicker from './AccountPicker';

interface SignInFormProps {
  lang?: string;
  accounts?: AccountInfo[];
  activeAccountId?: string;
}

export default function SignInForm({ lang = 'en', accounts = [], activeAccountId }: SignInFormProps) {
  const t = useT(lang);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError, setFromZod, setFromApi } = useFieldErrors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = signInInputSchema.safeParse({ username, password });
    if (!parsed.success) {
      setFromZod(parsed.error);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, device: getDeviceLabel(navigator.userAgent) }),
      });

      if (res.ok) {
        window.location.href = '/';
        return;
      }

      const json = await res.json();

      if (res.status === 400 && json.fields) {
        setFromApi(json.fields);
        return;
      }

      if (res.status === 409 && json.message === 'user was deleted') {
        await fetch('/api/restore/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: username }),
        }).catch(() => {});
        window.location.href = '/restore';
        return;
      }

      toast.error(json.message || t('auth.anErrorOccurred'));
    } catch {
      toast.error(t('auth.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="bg-primary mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
          <span className="text-primary-foreground text-xl font-bold">D</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('auth.welcomeBack')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t('auth.signInToContinue')}</p>
      </div>

      {accounts.length > 0 && (
        <div className="space-y-6">
          <AccountPicker accounts={accounts} activeAccountId={activeAccountId} lang={lang} />
          <div className="flex items-center gap-3">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs uppercase">{t('auth.orSignIn')}</span>
            <span className="bg-border h-px flex-1" />
          </div>
        </div>
      )}

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="username">{t('auth.emailOrUsername')}</label>
            <Input
              id="username"
              type="text"
              placeholder={t('auth.emailPlaceholder')}
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
            />
            {fieldErrors.username && (
              <p className="text-destructive text-sm">{fieldErrors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm leading-none font-medium" htmlFor="password">{t('auth.password')}</label>
              <a href="/forgot-password" className="text-primary text-xs hover:underline">{t('auth.forgotPassword')}</a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
            />
            {fieldErrors.password && (
              <p className="text-destructive text-sm">{fieldErrors.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        {t('auth.noAccount')}{' '}
        <a href="/signUp" className="text-primary hover:underline">{t('auth.signUp')}</a>
      </p>
    </div>
  );
}
