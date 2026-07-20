import { useState, useRef, type FormEvent } from 'react';
import { Button } from 'diva-ui/components/button';
import { Input } from 'diva-ui/components/input';
import { toast } from 'diva-ui/components/sonner';
import { Loader2 } from 'lucide-react';
import { useT } from '@lib/i18n/useT';

interface VerificationFlowProps {
  action: string;
  email?: string;
  lang?: string;
}

export default function VerificationFlow({ action, email: initialEmail = '', lang = 'en' }: VerificationFlowProps) {
  const t = useT(lang);
  const [step, setStep] = useState<'request' | 'verify' | 'verified' | 'confirming' | 'new_password' | 'complete'>(initialEmail ? 'verify' : 'request');
  const [email, setEmail] = useState(initialEmail);
  const [actionId, setActionId] = useState('');
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const tokenInputs = useRef<(HTMLInputElement | null)[]>([]);

  const isPasswordReset = action === 'PASSWORD_RESET';

  const handleRequestCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action }),
      });

      if (res.ok) {
        const json = await res.json();
        setActionId(json.id || json.data?.id || '');
        setStep('verify');
        toast.success(t('verification.codeSent'));
        setTimeout(() => tokenInputs.current[0]?.focus(), 100);
      } else {
        const json = await res.json();
        setError(json.message || t('verification.failedToSendCode'));
      }
    } catch {
      setError(t('auth.networkError'));
    }
    setLoading(false);
  };

  const handleTokenChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split('').slice(0, 6);
      const newToken = [...token];
      digits.forEach((d, i) => {
        if (index + i < 6) newToken[index + i] = d;
      });
      setToken(newToken);
      const nextIndex = Math.min(index + digits.length, 5);
      tokenInputs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newToken = [...token];
    newToken[index] = digit;
    setToken(newToken);

    if (digit && index < 5) {
      tokenInputs.current[index + 1]?.focus();
    }
  };

  const handleTokenKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !token[index] && index > 0) {
      tokenInputs.current[index - 1]?.focus();
    }
  };

  const tokenComplete = token.every((d) => d !== '');

  const handleVerifyCode = async () => {
    if (!tokenComplete || !actionId) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verification/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: actionId, token: token.join('') }),
      });

      if (res.ok) {
        if (isPasswordReset) {
          setStep('confirming');
          await handleForgotPasswordConfirm();
        } else {
          setStep('verified');
        }
      } else {
        const json = await res.json();
        setError(json.message || t('verification.verificationFailed'));
      }
    } catch {
      setError(t('auth.networkError'));
    }
    setLoading(false);
  };

  const handleForgotPasswordConfirm = async () => {
    try {
      const res = await fetch('/api/auth/forgot/password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: actionId, device: 'web' }),
      });

      if (res.ok) {
        setStep('new_password');
        toast.success(t('verification.identityVerified'));
      } else {
        const json = await res.json();
        setError(json.message || t('verification.failedToSendCode'));
        setStep('verify');
      }
    } catch {
      setError(t('auth.networkError'));
      setStep('verify');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setError(t('profile.passwordMin'));
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/user/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (res.ok) {
        await fetch('/api/auth/signOut', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device: 'web', user_agent: navigator.userAgent }),
        }).catch(() => {});
        setStep('complete');
      } else {
        const json = await res.json();
        setError(json.message || t('profile.failedChangePassword'));
      }
    } catch {
      setError(t('auth.networkError'));
    }
    setLoading(false);
  };

  if (step === 'verified') {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold">{t('verification.emailVerified')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t('verification.emailVerifiedDesc')}</p>
        <Button asChild className="mt-8">
          <a href="/">{t('verification.goToDashboard')}</a>
        </Button>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold">{t('verification.passwordChanged')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t('verification.passwordChangedDesc')}</p>
        <Button asChild className="mt-8">
          <a href="/signIn">{t('verification.signInWithNewPassword')}</a>
        </Button>
      </div>
    );
  }

  if (step === 'confirming') {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
        <h1 className="mt-6 text-2xl font-bold">{t('verification.confirming')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t('verification.pleaseWait')}</p>
      </div>
    );
  }

  if (step === 'new_password') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <div className="bg-primary mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
            <span className="text-primary-foreground text-xl font-bold">D</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('verification.setNewPassword')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('verification.enterNewPassword')}</p>
        </div>

        <div className="border-border bg-card mt-8 rounded-xl border p-8 shadow-sm">
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="new-password">{t('verification.newPassword')}</label>
              <Input
                id="new-password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || newPassword.length < 4}>
              {loading ? t('verification.changingPassword') : t('verification.changePassword')}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'request') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <div className="bg-primary mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
            <span className="text-primary-foreground text-xl font-bold">D</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {isPasswordReset ? t('verification.resetPassword') : t('verification.verifyEmailTitle')}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isPasswordReset ? t('verification.enterCode') : t('verification.enterCode')}
          </p>
        </div>

        <div className="border-border bg-card mt-8 rounded-xl border p-8 shadow-sm">
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="email">{t('auth.email')}</label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? t('verification.sending') : t('verification.sendCode')}
            </Button>
          </form>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t('verification.rememberPassword')}{' '}
          <a href="/signIn" className="text-primary hover:underline">{t('auth.signIn')}</a>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="text-center">
        <div className="bg-primary mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
          <span className="text-primary-foreground text-xl font-bold">D</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('verification.enterCode')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('verification.enterCode')} <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="border-border bg-card mt-8 rounded-xl border p-8 shadow-sm">
        <div className="space-y-5">
          <div>
            <label className="text-sm leading-none font-medium">{t('verification.codePlaceholder')}</label>
            <div className="mt-3 flex justify-center gap-2">
              {token.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { tokenInputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="border-input bg-background focus-visible:ring-ring h-12 w-10 rounded-md border text-center text-lg font-bold shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                  value={digit}
                  onChange={(e) => handleTokenChange(i, e.target.value)}
                  onKeyDown={(e) => handleTokenKeyDown(i, e)}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <Button
            type="button"
            className="w-full"
            disabled={loading || !tokenComplete}
            onClick={handleVerifyCode}
          >
            {loading ? t('verification.verifying') : t('verification.verifyCode')}
          </Button>
        </div>
      </div>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t('verification.resendCode')}{' '}
          <button
            type="button"
            className="text-primary hover:underline cursor-pointer"
            onClick={handleRequestCode}
          >
            {t('verification.resendCode')}
          </button>
      </p>
    </div>
  );
}
