import { useState, useRef } from 'react';
import { Button } from 'diva-ui/components/button';
import { useT } from '@lib/i18n/useT';

interface InlineVerificationProps {
  action: string;
  email: string;
  onVerified: () => void;
  onCancel: () => void;
  lang?: string;
}

export default function InlineVerification({ action, email, onVerified, onCancel, lang = 'en' }: InlineVerificationProps) {
  const t = useT(lang);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [actionId, setActionId] = useState('');
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tokenInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRequestCode = async () => {
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

  const handleVerify = async () => {
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
        onVerified();
      } else {
        const json = await res.json();
        setError(json.message || t('verification.verificationFailed'));
      }
    } catch {
      setError(t('auth.networkError'));
    }
    setLoading(false);
  };

  if (step === 'request') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('verification.aCodeWillBeSent')} <strong>{email}</strong>.
        </p>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={handleRequestCode} disabled={loading}>
            {loading ? t('verification.sending') : t('verification.sendCode')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('verification.enterCode')} <strong>{email}</strong>.
        </p>
      <div className="flex justify-center gap-2">
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
      {error && <p className="text-destructive text-xs text-center">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={loading || !tokenComplete} onClick={handleVerify}>
          {loading ? t('verification.verifying') : t('verification.verifyCode')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>
      </div>
      <button type="button" className="text-primary hover:underline text-xs cursor-pointer" onClick={handleRequestCode}>
        {t('verification.resendCode')}
      </button>
    </div>
  );
}
