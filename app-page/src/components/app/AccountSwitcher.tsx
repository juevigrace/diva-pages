import { useState } from 'react';
import { Button } from 'diva-ui/components/button';
import { Badge } from 'diva-ui/components/badge';
import { toast } from 'diva-ui/components/sonner';
import { Avatar, AvatarFallback } from 'diva-ui/components/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from 'diva-ui/components/dialog';
import { useT } from '@lib/i18n/useT';
import { getUserInitials } from '@lib/ui';
import type { AccountInfo } from 'diva-types/auth/models/account';

interface AccountSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: AccountInfo[];
  activeAccountId?: string;
  lang?: string;
}

export default function AccountSwitcher({ open, onOpenChange, accounts = [], activeAccountId, lang = 'en' }: AccountSwitcherProps) {
  const t = useT(lang);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

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
        onOpenChange(false);
        window.location.reload();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('userMenu.switchAccount')}</DialogTitle>
          <DialogDescription>{t('userMenu.switchAccountDesc')}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {accounts.map((account) => {
            const isActive = account.userId === activeAccountId;
            return (
              <button
                type="button"
                key={account.userId}
                disabled={switchingId !== null}
                onClick={() => handleSwitch(account.userId)}
                className="border-border hover:bg-accent flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:opacity-60"
              >
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
                {isActive && <span className="text-primary text-xs font-medium">{t('auth.active')}</span>}
                {!isActive && switchingId === account.userId && (
                  <span className="text-muted-foreground text-xs">{t('common.loading')}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full">
            <a href="/signIn">{t('userMenu.addAccount')}</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
