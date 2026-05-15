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
    { label: 'Dashboard', href: '/dashboard', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
    { category: 'Inventory Management' },
    { label: 'Assets', href: '/assets', allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] as UserRole[] },
    { label: 'Network Devices', href: '/network-devices', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
    { label: 'Issues', href: '/issues', allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] as UserRole[] },
    { category: 'Operations' },
    { label: 'Departments', href: '/companies', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
    { label: 'Vendors', href: '/vendors', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
    { label: 'Asset Requests', href: '/requests', allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] as UserRole[] },
    { label: 'Purchases', href: '/purchases', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
    { category: 'Administration' },
    { label: 'Users', href: '/users', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
    { label: 'Reports', href: '/reports', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
    { label: 'Audit Logs', href: '/audit-logs', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
    { label: 'Settings', href: '/settings', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] as UserRole[] },
  ];

  return allItems.filter(item => {
    if ('href' in item) {
      if (item.allowedRoles && !item.allowedRoles.includes(userRole)) return false;
    }
    return true;
  });
}
