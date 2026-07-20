import { useState } from 'react';
import { z } from 'zod';
import { Button } from 'diva-ui/components/button';
import { getUserInitials, showStatus } from '../../nav-items';
import InlineVerification from '../auth/InlineVerification';
import { useT } from '@lib/i18n/useT';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(255),
  last_name: z.string().min(1, 'Last name is required').max(255),
  alias: z.string().min(1, 'Alias is required').max(255),
  birth_date: z.string().min(1, 'Birth date is required'),
  bio: z.string().max(255).optional(),
});

const emailSchema = z.object({
  email: z.email().max(100),
});

const phoneSchema = z.object({
  phone_number: z.string().min(1, 'Phone number is required').max(30),
});

const usernameSchema = z.object({
  username: z.string().min(3).max(50),
});

const passwordSchema = z.object({
  new_password: z.string().min(4).max(255),
});

interface ProfileFormsProps {
  uid: string;
  user: Record<string, any> | null;
  profile: Record<string, any> | null;
  isVerified?: boolean;
  lang?: string;
}

export default function ProfileForms({ uid, user, profile, isVerified = true, lang = 'en' }: ProfileFormsProps) {
  const t = useT(lang);
  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user?.username || 'User'
    : user?.username || 'User';
  const initials = getUserInitials(user?.username, user?.email, displayName);

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [alias, setAlias] = useState(profile?.alias || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [birthDate, setBirthDate] = useState(
    profile?.birth_date ? new Date(profile.birth_date * 1000).toISOString().split('T')[0] : ''
  );
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileError, setProfileError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const [emailStatus, setEmailStatus] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [verifyingField, setVerifyingField] = useState<'email' | 'phone' | 'username' | 'password' | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = profileSchema.safeParse({ first_name: firstName, last_name: lastName, alias, birth_date: birthDate, bio: bio || undefined });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const body: Record<string, any> = {
      first_name: firstName,
      last_name: lastName,
      alias,
      bio,
      birth_date: Math.floor(new Date(birthDate).getTime() / 1000),
    };
    const method = profile ? 'PUT' : 'POST';
    const res = await fetch(`/api/user/${uid}/profile`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      showStatus(setProfileStatus, setProfileError, profile ? t('profile.profileUpdated') : t('profile.profileCreated'), false);
    } else {
      const json = await res.json();
      showStatus(setProfileStatus, setProfileError, json.message || t('profile.failedUpdateProfile'), true);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      showStatus(setEmailStatus, setEmailError, parsed.error.issues[0].message, true);
      return;
    }
    setVerifyingField('email');
  };

  const handleEmailVerified = async () => {
    setVerifyingField(null);
    const res = await fetch(`/api/user/${uid}/email`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      showStatus(setEmailStatus, setEmailError, t('profile.emailUpdated'), false);
    } else {
      const json = await res.json();
      showStatus(setEmailStatus, setEmailError, json.message || t('profile.failedUpdateEmail'), true);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = phoneSchema.safeParse({ phone_number: phone });
    if (!parsed.success) {
      showStatus(setPhoneStatus, setPhoneError, parsed.error.issues[0].message, true);
      return;
    }
    setVerifyingField('phone');
  };

  const handlePhoneVerified = async () => {
    setVerifyingField(null);
    const res = await fetch(`/api/user/${uid}/phone`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone }),
    });
    if (res.ok) {
      showStatus(setPhoneStatus, setPhoneError, t('profile.phoneUpdated'), false);
    } else {
      const json = await res.json();
      showStatus(setPhoneStatus, setPhoneError, json.message || t('profile.failedUpdatePhone'), true);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = usernameSchema.safeParse({ username });
    if (!parsed.success) {
      showStatus(setUsernameStatus, setUsernameError, parsed.error.issues[0].message, true);
      return;
    }
    setVerifyingField('username');
  };

  const handleUsernameVerified = async () => {
    setVerifyingField(null);
    const res = await fetch(`/api/user/${uid}/username`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (res.ok) {
      showStatus(setUsernameStatus, setUsernameError, t('profile.usernameUpdated'), false);
    } else {
      const json = await res.json();
      showStatus(setUsernameStatus, setUsernameError, json.message || t('profile.failedUpdateUsername'), true);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse({ new_password: newPassword });
    if (!parsed.success) {
      showStatus(setPasswordStatus, setPasswordError, parsed.error.issues[0].message, true);
      return;
    }
    setVerifyingField('password');
  };

  const handlePasswordVerified = async () => {
    setVerifyingField(null);
    const res = await fetch(`/api/user/${uid}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_password: newPassword }),
    });
    if (res.ok) {
      showStatus(setPasswordStatus, setPasswordError, t('profile.passwordChanged'), false);
      setNewPassword('');
    } else {
      const json = await res.json();
      showStatus(setPasswordStatus, setPasswordError, json.message || t('profile.failedChangePassword'), true);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`/api/user/${uid}/profile/avatar`, {
      method: 'PATCH',
      body: formData,
    });
    if (res.ok) {
      showStatus(setProfileStatus, setProfileError, t('profile.photoUpdated'), false);
    } else {
      const json = await res.json();
      showStatus(setProfileStatus, setProfileError, json.message || t('profile.failedUpdatePhoto'), true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {!isVerified && (
        <div className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-xl border p-4 text-center text-sm text-amber-800 dark:text-amber-200">
          {t('profile.verifyToEdit')} <a href="/verify" class="underline font-medium">{t('nav.verifyNow')}</a>
        </div>
      )}

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold">
            {initials}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{displayName}</h3>
            <p className="text-muted-foreground text-sm">{user?.email || ''}</p>
            {user?.role && (
              <p className="bg-primary/10 text-primary mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                {user.role}
              </p>
            )}
          </div>
          <label>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <Button type="button" variant="outline" size="sm" disabled={!isVerified} onClick={() => {
              const input = document.querySelector<HTMLInputElement>('input[accept="image/*"]');
              input?.click();
            }}>
              {t('profile.changePhoto')}
            </Button>
          </label>
        </div>
      </div>

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-lg font-semibold">{t('profile.personalInfo')}</h3>
        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="first-name">{t('profile.firstName')}</label>
              <input
                id="first-name"
                readOnly={!isVerified}
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearFieldError('first_name'); }}
              />
              {fieldErrors.first_name && <p className="text-destructive text-xs">{fieldErrors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium" htmlFor="last-name">{t('profile.lastName')}</label>
              <input
                id="last-name"
                readOnly={!isVerified}
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); clearFieldError('last_name'); }}
              />
              {fieldErrors.last_name && <p className="text-destructive text-xs">{fieldErrors.last_name}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="alias">{t('profile.displayAlias')}</label>
              <input
                id="alias"
                readOnly={!isVerified}
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={alias}
                onChange={(e) => { setAlias(e.target.value); clearFieldError('alias'); }}
              />
              {fieldErrors.alias && <p className="text-destructive text-xs">{fieldErrors.alias}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="bio">{t('profile.bio')}</label>
            <textarea
              id="bio"
              rows={3}
              readOnly={!isVerified}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              value={bio}
              onChange={(e) => { setBio(e.target.value); clearFieldError('bio'); }}
            />
            {fieldErrors.bio && <p className="text-destructive text-xs">{fieldErrors.bio}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="birth-date">{t('profile.birthDate')}</label>
              <input
                id="birth-date"
                type="date"
                readOnly={!isVerified}
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={birthDate}
                onChange={(e) => { setBirthDate(e.target.value); clearFieldError('birth_date'); }}
              />
              {fieldErrors.birth_date && <p className="text-destructive text-xs">{fieldErrors.birth_date}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!isVerified}>{profile ? t('profile.saveChanges') : t('profile.createProfile')}</Button>
            <span className={`text-xs ${profileError ? 'text-destructive' : 'text-muted-foreground'}`}>
              {profileStatus}
            </span>
          </div>
        </form>
      </div>

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-lg font-semibold">{t('profile.contactInfo')}</h3>
        <div className="mt-6 space-y-5">
          <form onSubmit={handleEmailSubmit} className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="email">{t('profile.email')}</label>
            <div className="flex gap-3">
              <input
                id="email"
                type="email"
                readOnly={!isVerified || verifyingField !== null}
                className="border-input bg-background focus-visible:ring-ring flex h-10 flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {verifyingField !== 'email' && (
                <Button type="submit" size="sm" disabled={!isVerified || verifyingField !== null}>{t('common.update')}</Button>
              )}
            </div>
            {verifyingField === 'email' ? (
              <InlineVerification
                action="EMAIL_UPDATE"
                email={user?.email || ''}
                onVerified={handleEmailVerified}
                onCancel={() => setVerifyingField(null)}
                lang={lang}
              />
            ) : (
              <span className={`text-xs ${emailError ? 'text-destructive' : 'text-muted-foreground'}`}>{emailStatus}</span>
            )}
          </form>
          <form onSubmit={handlePhoneSubmit} className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="phone">{t('profile.phoneNumber')}</label>
            <div className="flex gap-3">
              <input
                id="phone"
                type="tel"
                readOnly={!isVerified || verifyingField !== null}
                className="border-input bg-background focus-visible:ring-ring flex h-10 flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {verifyingField !== 'phone' && (
                <Button type="submit" size="sm" disabled={!isVerified || verifyingField !== null}>{t('common.update')}</Button>
              )}
            </div>
            {verifyingField === 'phone' ? (
              <InlineVerification
                action="PHONE_UPDATE"
                email={user?.email || ''}
                onVerified={handlePhoneVerified}
                onCancel={() => setVerifyingField(null)}
                lang={lang}
              />
            ) : (
              <span className={`text-xs ${phoneError ? 'text-destructive' : 'text-muted-foreground'}`}>{phoneStatus}</span>
            )}
          </form>
        </div>
      </div>

      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <h3 className="text-lg font-semibold">{t('profile.account')}</h3>
        <div className="mt-6 space-y-5">
          <form onSubmit={handleUsernameSubmit} className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="username">{t('profile.username')}</label>
            <div className="flex gap-3">
              <input
                id="username"
                readOnly={!isVerified || verifyingField !== null}
                className="border-input bg-background focus-visible:ring-ring flex h-10 flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {verifyingField !== 'username' && (
                <Button type="submit" size="sm" disabled={!isVerified || verifyingField !== null}>{t('common.update')}</Button>
              )}
            </div>
            {verifyingField === 'username' ? (
              <InlineVerification
                action="USERNAME_UPDATE"
                email={user?.email || ''}
                onVerified={handleUsernameVerified}
                onCancel={() => setVerifyingField(null)}
                lang={lang}
              />
            ) : (
              <span className={`text-xs ${usernameError ? 'text-destructive' : 'text-muted-foreground'}`}>{usernameStatus}</span>
            )}
          </form>
          <form onSubmit={handlePasswordSubmit} className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="new-password">{t('profile.newPassword')}</label>
            <div className="flex gap-3">
              <input
                id="new-password"
                type="password"
                placeholder="New password"
                readOnly={!isVerified || verifyingField !== null}
                className="border-input bg-background focus-visible:ring-ring flex h-10 flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {verifyingField !== 'password' && (
                <Button type="submit" size="sm" disabled={!isVerified || verifyingField !== null}>{t('common.change')}</Button>
              )}
            </div>
            {verifyingField === 'password' ? (
              <InlineVerification
                action="PASSWORD_RESET"
                email={user?.email || ''}
                onVerified={handlePasswordVerified}
                onCancel={() => setVerifyingField(null)}
                lang={lang}
              />
            ) : (
              <span className={`text-xs ${passwordError ? 'text-destructive' : 'text-muted-foreground'}`}>{passwordStatus}</span>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
