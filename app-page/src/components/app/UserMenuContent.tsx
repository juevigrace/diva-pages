import { useState } from 'react';
import { useT } from '@lib/i18n/useT';
import type { AccountInfo } from 'diva-types/auth/models/account';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from 'diva-ui/components/dropdown-menu';
import { Button } from 'diva-ui/components/button';
import { toast } from 'diva-ui/components/sonner';
import { Avatar, AvatarFallback } from 'diva-ui/components/avatar';

interface UserMenuContentProps {
  signedIn: boolean;
  lang?: string;
  accounts?: AccountInfo[];
  activeAccountId?: string;
}

function initials(name: string): string {
  const value = name.trim().split(/\s+/);
  const first = value[0]?.charAt(0) ?? '';
  const last = value.length > 1 ? value[value.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

export default function UserMenuContent({
  signedIn,
  lang = 'en',
  accounts = [],
  activeAccountId,
}: UserMenuContentProps) {
  const t = useT(lang);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <Button asChild>
        <a href="/signIn">{t('userMenu.signIn')}</a>
      </Button>
    );
  }

  const active = accounts.find((a) => a.userId === activeAccountId);

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

  const handleSignOut = async () => {
    const res = await fetch('/api/auth/signOut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok || res.status === 401) {
      const json = await res.json().catch(() => ({ remaining: 0 }));
      const remaining = json?.remaining ?? 0;
      window.location.href = remaining > 0 ? window.location.pathname : '/home';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials(active?.username ?? 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {active && (
          <>
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm leading-none font-medium">{active.username}</p>
              <p className="text-muted-foreground text-xs">{active.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {accounts.length > 1 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {t('userMenu.switchAccount')}
            </DropdownMenuLabel>
            {accounts.map((account) => {
              const isActive = account.userId === activeAccountId;
              return (
                <DropdownMenuItem
                  key={account.userId}
                  disabled={isActive || switchingId !== null}
                  onSelect={() => handleSwitch(account.userId)}
                  className="cursor-pointer"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                      {initials(account.username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 flex-1 truncate text-sm">{account.username}</span>
                  {isActive && (
                    <svg
                      className="text-primary ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {!isActive && switchingId === account.userId && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      {t('common.loading')}
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href="/signIn" className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t('userMenu.addAccount')}
          </a>
        </DropdownMenuItem>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href="/profile" className="flex cursor-pointer items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {t('userMenu.profile')}
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/settings" className="flex cursor-pointer items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {t('userMenu.settings')}
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {t('userMenu.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
