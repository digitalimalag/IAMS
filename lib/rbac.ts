import { UserRole, permissions, hasPermission } from './auth';

export interface RBACConfig {
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
}

export function checkAccess(userRole: UserRole, config: RBACConfig): boolean {
  if (config.allowedRoles && !config.allowedRoles.includes(userRole)) {
    return false;
  }

  if (config.requiredPermissions) {
    return config.requiredPermissions.every(permission =>
      hasPermission(userRole, permission)
    );
  }

  return true;
}

export const moduleAccess: Record<string, RBACConfig> = {
  '/dashboard': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/assets': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/network-devices': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/issues': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/companies': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/users': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/vendors': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/purchases': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/requests': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/handovers': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/reports': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/audit-logs': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/licenses': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/settings': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/billing': { allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  '/profile': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/onboarding': { allowedRoles: ['master_admin'] },
};

export function canAccessModule(pathname: string, userRole: UserRole): boolean {
  const matchedPath = Object.keys(moduleAccess)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));
  const config = matchedPath ? moduleAccess[matchedPath] : undefined;
  if (!config) return true; // Allow by default if no config

  return checkAccess(userRole, config);
}

export function getRoleLandingRoute(userRole: UserRole): string {
  if (userRole === 'employee') return '/assets';
  return '/dashboard';
}

export function getVisibleMenuItems(userRole: UserRole) {
  const allItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { category: 'Inventory Management' },
    { label: 'Assets', href: '/assets' },
    { label: 'Network Devices', href: '/network-devices' },
    { label: 'Issues', href: '/issues' },
    { category: 'Operations' },
    { label: 'Departments', href: '/companies', adminOnly: true },
    { label: 'Vendors', href: '/vendors', adminOnly: true },
    { label: 'Asset Requests', href: '/requests' },
    { label: 'Purchases', href: '/purchases', adminOnly: true },
    { category: 'Administration' },
    { label: 'Users', href: '/users', adminOnly: true, masterAdminOnly: true },
    { label: 'Reports', href: '/reports', adminOnly: true },
    { label: 'Audit Logs', href: '/audit-logs', adminOnly: true },
    { label: 'Settings', href: '/settings', adminOnly: true },
  ];

  return allItems.filter(item => {
    if ('href' in item) {
      if (item.masterAdminOnly && userRole !== 'master_admin') return false;
      if (item.adminOnly && userRole === 'employee') return false;
    }
    return true;
  });
}
