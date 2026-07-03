export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const navItems: NavSection[] = [
  {
    section: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { href: '/users', label: 'Users', icon: 'users' },
      { href: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
  {
    section: 'Account',
    items: [{ href: '/profile', label: 'Profile', icon: 'profile' }],
  },
];
