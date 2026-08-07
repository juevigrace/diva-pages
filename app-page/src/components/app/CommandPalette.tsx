import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from 'diva-ui/components/command';
import { useT } from '@lib/i18n/useT';
import { itemKey } from '@lib/i18n/nav-keys';
import { getVisibleNavItems } from '../../nav-items';

interface CommandPaletteProps {
  isAdmin?: boolean;
  signedIn?: boolean;
  lang?: string;
}

export default function CommandPalette({ isAdmin = false, signedIn = false, lang = 'en' }: CommandPaletteProps) {
  const t = useT(lang);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const sections = getVisibleNavItems(isAdmin);

  const handleSignOut = async () => {
    setOpen(false);
    await fetch('/api/auth/signOut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {});
    window.location.href = '/home';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-input hover:bg-accent hover:text-accent-foreground text-muted-foreground hidden h-9 items-center gap-2 rounded-md border bg-transparent px-3 text-sm shadow-sm lg:flex"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {t('commandPalette.search')}
        <kbd className="text-muted-foreground bg-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t('commandPalette.placeholder')} />
        <CommandList>
          <CommandEmpty>{t('commandPalette.noResults')}</CommandEmpty>
          {sections.map((section) => (
            <CommandGroup key={section.section} heading={t(`nav.${section.section.toLowerCase()}`)}>
              {section.items.map((item) => {
                const ik = itemKey[item.label] || item.label.toLowerCase().replace(/\s+/g, '');
                return (
                  <CommandItem
                    key={item.href}
                    value={`${item.label} ${item.href}`}
                    onSelect={() => {
                      setOpen(false);
                      window.location.href = item.href;
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M7 7l5 5-5 5" />
                    </svg>
                    {t(`nav.${ik}`)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
          {signedIn && (
            <CommandGroup heading={t('commandPalette.actions')}>
              <CommandItem
                value={t('userMenu.addAccount')}
                onSelect={() => {
                  setOpen(false);
                  window.location.href = '/signIn';
                }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t('userMenu.addAccount')}
              </CommandItem>
              <CommandItem value={t('userMenu.signOut')} onSelect={handleSignOut}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('userMenu.signOut')}
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
