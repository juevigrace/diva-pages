export interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
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
      { href: '/devices', label: 'Devices', icon: 'devices', adminOnly: true },
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
      { href: '/admin/permissions', label: 'Permissions', icon: 'settings', adminOnly: true },
      { href: '/admin/endpoint-permissions', label: 'Endpoint Permissions', icon: 'api', adminOnly: true },
      { href: '/admin/sessions', label: 'Session Admin', icon: 'sessions', adminOnly: true },
      { href: '/admin/health', label: 'Health', icon: 'health', adminOnly: true },
      { href: '/admin/api', label: 'API Explorer', icon: 'api', adminOnly: true },
    ],
  },
];

export function getVisibleNavItems(isAdmin: boolean): NavSection[] {
  return navItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((section) => section.items.length > 0);
}
