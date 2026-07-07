import { useEffect, useState } from 'react';
import { Button } from 'diva-ui/components/button';

interface VerificationResultProps {
  actionId: string;
  token: string;
}

export default function VerificationResult({ actionId, token }: VerificationResultProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/verification/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: actionId, token }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const json = await res.json();
        setStatus('error');
        setMessage(json.message || 'Verification failed. The link may be expired or invalid.');
      }
    })();
  }, []);

  if (status === 'loading') {
    return (
      <>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Verifying your email...</h1>
        <p className="text-muted-foreground mt-3">Please wait while we verify your email address.</p>
      </>
    );
  }

  if (status === 'success') {
    return (
      <>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Email verified</h1>
        <p className="text-muted-foreground mt-3">Your email has been verified successfully. You can now sign in to your account.</p>
        <Button asChild className="mt-8">
          <a href="/signIn">Sign in</a>
        </Button>
      </>
    );
  }

  return (
    <>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Verification failed</h1>
      <p className="text-muted-foreground mt-3">{message}</p>
      <Button asChild className="mt-8">
        <a href="/signIn">Back to sign in</a>
      </Button>
    </>
  );
}
