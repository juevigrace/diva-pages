import { useState, useEffect } from 'react';
import { useT } from '@lib/i18n/useT';

interface VerifyBannerProps {
  lang?: string;
}

export default function VerifyBanner({ lang = 'en' }: VerifyBannerProps) {
  const t = useT(lang);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const json = await res.json();
          const verified = json?.state?.verified ?? true;
          setShow(!verified);
        }
      } catch {
        // Ignore errors — don't show banner if we can't check
      }
      setLoading(false);
    })();
  }, []);

  if (loading || !show || dismissed) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <svg className="text-amber-600 dark:text-amber-400 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-amber-800 dark:text-amber-200">
            {t('verifyBanner.unverified')}{' '}
            <a href="/verify" className="font-medium underline underline-offset-2 hover:no-underline">
              {t('verifyBanner.verifyNow')}
            </a>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 shrink-0"
          aria-label={t('verifyBanner.dismiss')}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
