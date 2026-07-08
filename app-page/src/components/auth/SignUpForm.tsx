import { useState, useEffect } from 'react';
import { Button } from 'diva-ui/components/button';
import { toast } from 'diva-ui/components/sonner';
import { Input } from 'diva-ui/components/input';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { signUpInputSchema } from '@lib/schemas/auth';

interface AvailabilityState {
  status: 'idle' | 'checking' | 'available' | 'taken';
  message: string;
}

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [usernameAvail, setUsernameAvail] = useState<AvailabilityState>({ status: 'idle', message: '' });
  const [emailAvail, setEmailAvail] = useState<AvailabilityState>({ status: 'idle', message: '' });

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvail({ status: 'idle', message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameAvail({ status: 'checking', message: '' });
      try {
        const res = await fetch(`/api/user/check/username/${encodeURIComponent(username)}`);
        const json = await res.json();
        if (res.ok) {
          setUsernameAvail({ status: 'available', message: '' });
        } else {
          setUsernameAvail({ status: 'taken', message: json.message || 'Username is taken' });
        }
      } catch {
        setUsernameAvail({ status: 'idle', message: '' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    if (!email.includes('@')) {
      setEmailAvail({ status: 'idle', message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setEmailAvail({ status: 'checking', message: '' });
      try {
        const res = await fetch(`/api/user/check/email/${encodeURIComponent(email)}`);
        const json = await res.json();
        if (res.ok) {
          setEmailAvail({ status: 'available', message: '' });
        } else {
          setEmailAvail({ status: 'taken', message: json.message || 'Email is taken' });
        }
      } catch {
        setEmailAvail({ status: 'idle', message: '' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = signUpInputSchema.safeParse({ username, email, password });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(fields)) {
        if (msgs && msgs.length > 0) errors[key] = msgs[0];
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        window.location.href = '/';
        return;
      }

      const json = await res.json();

      if (res.status === 400 && json.fields) {
        const errors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(json.fields)) {
          if (Array.isArray(msgs) && msgs.length > 0) errors[key] = msgs[0];
        }
        setFieldErrors(errors);
        return;
      }

      const msg = (json.message || '').toLowerCase();
      if (res.status === 409) {
        if (msg.includes('username')) {
          setFieldErrors({ username: json.message });
          return;
        }
        if (msg.includes('email')) {
          setFieldErrors({ email: json.message });
          return;
        }
      }

      toast.error(json.message || 'An error occurred');
    } catch {
      toast.error('Network error. Please try again.');
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
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground mt-2 text-sm">Get started with your free account</p>
      </div>

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="username">Username</label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                className="pr-8"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
              />
              {!fieldErrors.username && usernameAvail.status !== 'idle' && (
                usernameAvail.status === 'checking' ? (
                  <Loader2 className="text-muted-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                ) : usernameAvail.status === 'available' ? (
                  <CheckCircle2 className="text-emerald-500 absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                ) : (
                  <AlertCircle className="text-destructive absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                )
              )}
            </div>
            {fieldErrors.username ? (
              <p className="text-destructive text-sm">{fieldErrors.username}</p>
            ) : usernameAvail.status === 'taken' ? (
              <p className="text-destructive text-sm">{usernameAvail.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="email">Email</label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pr-8"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
              />
              {!fieldErrors.email && emailAvail.status !== 'idle' && (
                emailAvail.status === 'checking' ? (
                  <Loader2 className="text-muted-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                ) : emailAvail.status === 'available' ? (
                  <CheckCircle2 className="text-emerald-500 absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                ) : (
                  <AlertCircle className="text-destructive absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                )
              )}
            </div>
            {fieldErrors.email ? (
              <p className="text-destructive text-sm">{fieldErrors.email}</p>
            ) : emailAvail.status === 'taken' ? (
              <p className="text-destructive text-sm">{emailAvail.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
            />
            {fieldErrors.password && (
              <p className="text-destructive text-sm">{fieldErrors.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <a href="/signIn" className="text-primary hover:underline">Sign in</a>
      </p>
    </div>
  );
}
