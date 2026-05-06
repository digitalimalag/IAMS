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
  '/assets': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/network-devices': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/issues': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/companies': { allowedRoles: ['master_admin', 'admin'] },
  '/users': { allowedRoles: ['master_admin'] },
  '/vendors': { allowedRoles: ['master_admin', 'admin'] },
  '/purchases': { allowedRoles: ['master_admin', 'admin'] },
  '/requests': { allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  '/reports': { allowedRoles: ['master_admin', 'admin'] },
  '/audit-logs': { allowedRoles: ['master_admin', 'admin'] },
  '/settings': { allowedRoles: ['master_admin', 'admin'] },
};

export function canAccessModule(pathname: string, userRole: UserRole): boolean {
  const config = moduleAccess[pathname];
  if (!config) return true; // Allow by default if no config

  return checkAccess(userRole, config);
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
