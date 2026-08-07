import { useState, useEffect } from 'react';
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
import { Badge } from 'diva-ui/components/badge';
import { toast } from 'diva-ui/components/sonner';
import { Avatar, AvatarFallback, AvatarImage } from 'diva-ui/components/avatar';
import AccountSwitcher from './AccountSwitcher';

interface UserMenuContentProps {
  signedIn: boolean;
  lang?: string;
  accounts?: AccountInfo[];
  activeAccountId?: string;
  avatarUrl?: string;
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
  avatarUrl,
}: UserMenuContentProps) {
  const t = useT(lang);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    if (!signedIn) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setSwitcherOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [signedIn]);

  if (!signedIn) {
    return (
      <Button asChild>
        <a href="/signIn">{t('userMenu.signIn')}</a>
      </Button>
    );
  }

  const active = accounts.find((a) => a.userId === activeAccountId);

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

  const handleSignOutAll = async () => {
    try {
      const res = await fetch('/api/auth/signOutAll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        toast.success(t('userMenu.signedOutEverywhere'));
        window.location.href = '/home';
        return;
      }
      const json = await res.json().catch(() => ({}));
      toast.error(json.message || t('userMenu.signOutFailed'));
    } catch {
      toast.error(t('userMenu.signOutFailed'));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={active?.username ?? ''} />
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
                <p className="flex items-center gap-2 text-sm leading-none font-medium">
                  <span className="truncate">{active.username}</span>
                  <Badge variant="outline" className="text-[10px]">{active.role}</Badge>
                </p>
                <p className="text-muted-foreground mt-1 truncate text-xs">{active.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setSwitcherOpen(true)}
              className="cursor-pointer"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {t('userMenu.switchAccount')}
              <span className="text-muted-foreground ml-auto text-[10px] tracking-wider">⌘⇧A</span>
            </DropdownMenuItem>
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
          </DropdownMenuGroup>
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
          {accounts.length > 1 && (
            <DropdownMenuItem onClick={handleSignOutAll} className="cursor-pointer">
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
              {t('userMenu.signOutEverywhere')}
            </DropdownMenuItem>
          )}
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

      <AccountSwitcher
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        accounts={accounts}
        activeAccountId={activeAccountId}
        lang={lang}
      />
    </>
  );
}
