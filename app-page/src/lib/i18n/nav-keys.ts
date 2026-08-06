export const sectionKey: Record<string, string> = {
  System: 'system',
  Account: 'account',
  Administration: 'administration',
};

export const itemKey: Record<string, string> = {
  Dashboard: 'dashboard',
  Users: 'users',
  Sessions: 'sessions',
  'Audit Log': 'auditLog',
  Profile: 'profile',
  Settings: 'settings',
  Permissions: 'permissions',
  'Endpoint Permissions': 'endpointPermissions',
  'Session Admin': 'sessionAdmin',
  Health: 'health',
  'API Explorer': 'apiExplorer',
};

export const docSectionKey: Record<string, string> = {
  'Getting Started': 'gettingStarted',
  Components: 'components',
  'API Reference': 'api',
};

export const pathKey: Record<string, string> = {
  '/': 'dashboard',
  '/users': 'users',
  '/sessions': 'sessions',
  '/devices': 'devices',
  '/audit': 'auditLog',
  '/profile': 'profile',
  '/settings': 'settings',
  '/admin/permissions': 'permissions',
  '/admin/endpoint-permissions': 'endpointPermissions',
  '/admin/sessions': 'sessionAdmin',
  '/admin/health': 'health',
  '/admin/api': 'apiExplorer',
};
