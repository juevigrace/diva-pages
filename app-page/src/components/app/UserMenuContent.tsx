import { Button } from 'diva-ui/components/button';

interface UserMenuContentProps {
  signedIn: boolean;
}

export default function UserMenuContent({ signedIn }: UserMenuContentProps) {
  if (!signedIn) {
    return (
      <Button asChild>
        <a href="/signIn">Sign in</a>
      </Button>
    );
  }

  const handleSignOut = async () => {
    const res = await fetch('/api/auth/signOut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok || res.status === 401) {
      window.location.href = '/home';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium">User</p>
        <p className="text-muted-foreground text-xs">Online</p>
      </div>
      <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
        U
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        title="Sign out"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </Button>
    </div>
  );
}
