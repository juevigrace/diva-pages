import { useState } from 'react';
import { Button } from 'diva-ui/components/button';
import { Badge } from 'diva-ui/components/badge';
import { toast } from 'diva-ui/components/sonner';
import { Avatar, AvatarFallback } from 'diva-ui/components/avatar';
import { useT } from '@lib/i18n/useT';
import { getUserInitials } from '@lib/ui';
import type { AccountInfo } from 'diva-types/auth/models/account';

interface AccountPickerProps {
  accounts: AccountInfo[];
  activeAccountId?: string;
  lang?: string;
}

export default function AccountPicker({ accounts = [], activeAccountId, lang = 'en' }: AccountPickerProps) {
  const t = useT(lang);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  if (accounts.length === 0) return null;

  const handleSwitch = async (userId: string) => {
    if (userId === activeAccountId) return;
    setSwitchingId(userId);
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        window.location.href = '/';
        return;
      }
      const json = await res.json().catch(() => ({}));
      toast.error(json.message || t('userMenu.switchFailed'));
    } catch {
      toast.error(t('userMenu.switchFailed'));
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{t('auth.signedInAccounts')}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{t('auth.continueAsAccount')}</p>
      <div className="mt-4 space-y-2">
        {accounts.map((account) => {
          const isActive = account.userId === activeAccountId;
          return (
            <div key={account.userId} className="border-border flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getUserInitials(account.username, account.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{account.username}</span>
                  <Badge variant="outline" className="text-[10px]">{account.role}</Badge>
                </p>
                <p className="text-muted-foreground truncate text-xs">{account.email}</p>
              </div>
              {isActive ? (
                <span className="text-primary text-xs font-medium">{t('auth.active')}</span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={switchingId !== null}
                  onClick={() => handleSwitch(account.userId)}
                >
                  {switchingId === account.userId ? t('common.loading') : t('auth.continue')}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
