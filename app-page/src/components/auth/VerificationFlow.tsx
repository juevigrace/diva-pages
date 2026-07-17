import { useState, useRef, type FormEvent } from 'react';
import { Button } from 'diva-ui/components/button';
import { Input } from 'diva-ui/components/input';
import { toast } from 'diva-ui/components/sonner';
import { Loader2 } from 'lucide-react';

interface VerificationFlowProps {
  action: string;
  email?: string;
}

export default function VerificationFlow({ action, email: initialEmail = '' }: VerificationFlowProps) {
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
        toast.success('Verification code sent to your email');
        setTimeout(() => tokenInputs.current[0]?.focus(), 100);
      } else {
        const json = await res.json();
        setError(json.message || 'Failed to send verification code');
      }
    } catch {
      setError('Network error. Please try again.');
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
        setError(json.message || 'Verification failed. The code may be expired or invalid.');
      }
    } catch {
      setError('Network error. Please try again.');
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
        toast.success('Identity verified. Please set a new password.');
      } else {
        const json = await res.json();
        setError(json.message || 'Failed to confirm password reset');
        setStep('verify');
      }
    } catch {
      setError('Network error. Please try again.');
      setStep('verify');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters');
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
        setError(json.message || 'Failed to change password');
      }
    } catch {
      setError('Network error. Please try again.');
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
        <h1 className="mt-6 text-2xl font-bold">Email verified</h1>
        <p className="text-muted-foreground mt-2 text-sm">Your email has been verified successfully.</p>
        <Button asChild className="mt-8">
          <a href="/">Go to dashboard</a>
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
        <h1 className="mt-6 text-2xl font-bold">Password changed</h1>
        <p className="text-muted-foreground mt-2 text-sm">Your password has been updated successfully.</p>
        <Button asChild className="mt-8">
          <a href="/signIn">Sign in with new password</a>
        </Button>
      </div>
    );
  }

  if (step === 'confirming') {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
        <h1 className="mt-6 text-2xl font-bold">Confirming...</h1>
        <p className="text-muted-foreground mt-2 text-sm">Please wait while we confirm your identity.</p>
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
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your new password below.</p>
        </div>

        <div className="border-border bg-card mt-8 rounded-xl border p-8 shadow-sm">
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="new-password">New password</label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || newPassword.length < 4}>
              {loading ? 'Changing password...' : 'Change password'}
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
            {isPasswordReset ? 'Reset your password' : 'Verify your email'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isPasswordReset
              ? 'Enter your email address and we\'ll send you a verification code.'
              : 'Enter your email address to receive a verification code.'}
          </p>
        </div>

        <div className="border-border bg-card mt-8 rounded-xl border p-8 shadow-sm">
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send verification code'}
            </Button>
          </form>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Remember your password?{' '}
          <a href="/signIn" className="text-primary hover:underline">Sign in</a>
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
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Enter verification code</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="border-border bg-card mt-8 rounded-xl border p-8 shadow-sm">
        <div className="space-y-5">
          <div>
            <label className="text-sm leading-none font-medium">Verification code</label>
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
            {loading ? 'Verifying...' : 'Verify code'}
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Didn't receive the code?{' '}
        <button
          type="button"
          className="text-primary hover:underline cursor-pointer"
          onClick={handleRequestCode}
        >
          Resend
        </button>
      </p>
    </div>
  );
}
