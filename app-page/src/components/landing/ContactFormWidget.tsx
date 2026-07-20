import { useState } from 'react';
import { Button } from 'diva-ui/components/button';
import { useT } from '@lib/i18n/useT';

interface ContactFormProps {
  lang?: string;
}

export default function ContactForm({ lang = 'en' }: ContactFormProps) {
  const t = useT(lang);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(t('landing.messageSent'));
    setTimeout(() => setStatus(''), 5000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm leading-none font-medium" htmlFor="cf-first-name">{t('contactForm.firstName')}</label>
          <input
            id="cf-first-name"
            placeholder={t('contactForm.firstNamePlaceholder')}
            className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm leading-none font-medium" htmlFor="cf-last-name">{t('contactForm.lastName')}</label>
          <input
            id="cf-last-name"
            placeholder={t('contactForm.lastNamePlaceholder')}
            className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm leading-none font-medium" htmlFor="cf-email">{t('landing.email')}</label>
        <input
          id="cf-email"
          type="email"
          placeholder={t('contactForm.emailPlaceholder')}
          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm leading-none font-medium" htmlFor="cf-subject">{t('contactForm.subject')}</label>
        <input
          id="cf-subject"
          placeholder={t('contactForm.subjectPlaceholder')}
          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm leading-none font-medium" htmlFor="cf-message">{t('landing.message')}</label>
        <textarea
          id="cf-message"
          rows={4}
          placeholder={t('contactForm.messagePlaceholder')}
          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {status && (
        <p className="text-primary text-sm">{status}</p>
      )}
      <Button type="submit" className="w-full">{t('landing.sendMessage')}</Button>
    </form>
  );
}
