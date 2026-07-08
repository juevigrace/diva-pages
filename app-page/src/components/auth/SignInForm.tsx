import { useState } from 'react';
import { Button } from 'diva-ui/components/button';
import { toast } from 'diva-ui/components/sonner';
import { Input } from 'diva-ui/components/input';
import { signInInputSchema } from '@lib/schemas/auth';

export default function SignInForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = signInInputSchema.safeParse({ username, password });
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
      const res = await fetch('/api/auth/signIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
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
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-2 text-sm">Sign in to your account to continue</p>
      </div>

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="username">Email or username</label>
            <Input
              id="username"
              type="text"
              placeholder="you@example.com"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
            />
            {fieldErrors.username && (
              <p className="text-destructive text-sm">{fieldErrors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm leading-none font-medium" htmlFor="password">Password</label>
              <a href="#" className="text-primary text-xs hover:underline">Forgot password?</a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
            />
            {fieldErrors.password && (
              <p className="text-destructive text-sm">{fieldErrors.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        Don't have an account?{' '}
        <a href="/signUp" className="text-primary hover:underline">Sign up</a>
      </p>
    </div>
  );
}
