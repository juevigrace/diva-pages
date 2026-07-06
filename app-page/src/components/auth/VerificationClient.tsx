import { useEffect, useState } from 'react';

interface VerificationClientProps {
  actionId: string;
  token: string;
}

export default function VerificationClient({ actionId, token }: VerificationClientProps) {
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
        setMessage('Your email has been verified successfully.');
      } else {
        const json = await res.json();
        setStatus('error');
        setMessage(json.message || 'Verification failed. The link may be expired or invalid.');
      }
    })();
  }, []);

  return (
    <>
      {status === 'loading' && (
        <>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Verifying your email...</h1>
          <p className="text-muted-foreground mt-3">Please wait while we verify your email address.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Email verified</h1>
          <p className="text-muted-foreground mt-3">{message}</p>
          <a
            href="/signIn"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium shadow transition-colors"
          >
            Sign in
          </a>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Verification failed</h1>
          <p className="text-muted-foreground mt-3">{message}</p>
          <a
            href="/signIn"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium shadow transition-colors"
          >
            Back to sign in
          </a>
        </>
      )}
    </>
  );
}
