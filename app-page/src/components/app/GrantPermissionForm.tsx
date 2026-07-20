import { useState } from 'react';
import { z } from 'zod';
import { Button } from 'diva-ui/components/button';
import { showStatus } from '../../nav-items';
import { useT } from '@lib/i18n/useT';

const grantSchema = z.object({
  permission_action: z.string().min(1, 'Select a permission').max(255),
});

interface GrantPermissionFormProps {
  uid: string;
  allPermissions: Record<string, any>[];
  onGranted: (perm: any) => void;
  lang?: string;
}

export default function GrantPermissionForm({ uid, allPermissions, onGranted, lang = 'en' }: GrantPermissionFormProps) {
  const t = useT(lang);
  const [showGrant, setShowGrant] = useState(false);
  const [grantAction, setGrantAction] = useState('');
  const [permStatus, setPermStatus] = useState('');
  const [permStatusError, setPermStatusError] = useState(false);

  const grantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = grantSchema.safeParse({ permission_action: grantAction });
    if (!parsed.success) {
      showStatus(setPermStatus, setPermStatusError, parsed.error.issues[0].message, true);
      return;
    }
    const res = await fetch(`/api/user/${uid}/permissions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permission_action: grantAction, granted: true }),
    });
    if (res.ok) {
      const json = await res.json();
      onGranted(json);
      showStatus(setPermStatus, setPermStatusError, t('users.permissionGranted'), false);
      setGrantAction('');
      setShowGrant(false);
    } else {
      const json = await res.json();
      showStatus(setPermStatus, setPermStatusError, json.message || t('users.failedGrantPermission'), true);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
          <Button type="button" size="sm" onClick={() => setShowGrant(!showGrant)}>
            {t('users.grantPermission')}
          </Button>
      </div>
      {showGrant && (
        <form onSubmit={grantPermission} className="border-border mb-4 flex gap-3 rounded-lg border p-4">
          <select
            className="border-input bg-background focus-visible:ring-ring flex h-9 flex-1 rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            value={grantAction}
            onChange={(e) => setGrantAction(e.target.value)}
          >
            <option value="">{t('users.selectPermission')}...</option>
            {allPermissions.map((p: any) => (
              <option key={p.id} value={p.action}>{p.name} ({p.action})</option>
            ))}
          </select>
          <Button type="submit" size="sm">{t('common.confirm')}</Button>
        </form>
      )}
      <span className={`text-xs ${permStatusError ? 'text-destructive' : 'text-muted-foreground'}`}>{permStatus}</span>
    </div>
  );
}
