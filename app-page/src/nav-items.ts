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
    section: 'System',
    items: [
      { href: '/', label: 'Dashboard', icon: 'dashboard' },
      { href: '/users', label: 'Users', icon: 'users' },
      { href: '/sessions', label: 'Sessions', icon: 'sessions' },
      { href: '/audit', label: 'Audit Log', icon: 'audit' },
    ],
  },
  {
    section: 'Account',
    items: [
      { href: '/profile', label: 'Profile', icon: 'profile' },
      { href: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
  {
    section: 'Administration',
    items: [
      { href: '/admin/permissions', label: 'Permissions', icon: 'settings' },
      { href: '/admin/api', label: 'API Explorer', icon: 'api' },
    ],
  },
];
