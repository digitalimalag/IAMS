export type UserRole = 'master_admin' | 'admin' | 'hr' | 'it' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  organizationId?: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthUser extends User {
  password: string;
}

const AUTH_USERS_STORAGE_KEY = 'authUsers';

// Mock users for demonstration
const seedUsers: AuthUser[] = [
  {
    id: 'USR-001',
    email: 'admin@company.com',
    password: hashPassword('admin123'),
    name: 'Admin User',
    phone: '+1-555-0001',
    organizationId: 'org-default',
    role: 'master_admin',
    department: 'IT Support',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'USR-002',
    email: 'manager@company.com',
    password: hashPassword('manager123'),
    name: 'Department Manager',
    phone: '+1-555-0002',
    organizationId: 'org-default',
    role: 'admin',
    department: 'Operations',
    isActive: true,
    createdAt: '2024-01-05',
  },
  {
    id: 'USR-003',
    email: 'employee@company.com',
    password: hashPassword('employee123'),
    name: 'John Employee',
    phone: '+1-555-0003',
    organizationId: 'org-default',
    role: 'employee',
    department: 'IT Support',
    isActive: true,
    createdAt: '2024-02-01',
  },
];

// Password hashing utility
export function hashPassword(password: string): string {
  // Simple deterministic hash for demo purposes - NOT for production
  let h = 2166136261;
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// Validate password
export function validatePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Authentication service
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: Omit<AuthUser, 'password'>;
  token?: string;
  error?: string;
}

function safeGetStoredUsers(): AuthUser[] {
  if (typeof window === 'undefined') return seedUsers;
  try {
    const raw = localStorage.getItem(AUTH_USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(seedUsers));
      return seedUsers;
    }
    const parsed = JSON.parse(raw) as AuthUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(seedUsers));
      return seedUsers;
    }
    return parsed;
  } catch {
    return seedUsers;
  }
}

export function listAuthUsers(): Omit<AuthUser, 'password'>[] {
  const users = safeGetStoredUsers();
  return users.map(({ password: _pw, ...rest }) => rest);
}

export function createAuthUser(input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  organizationId?: string;
  role: UserRole;
  department: string;
}): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Client-only operation' };
  const users = safeGetStoredUsers();
  const email = input.email.trim().toLowerCase();
  const organizationId = input.organizationId?.trim() || 'org-default';
  if (!email) return { success: false, error: 'Email is required' };
  if (users.some(u => u.email.toLowerCase() === email && (u.organizationId || 'org-default') === organizationId)) {
    return { success: false, error: 'Email already exists' };
  }
  if (!input.password || input.password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
  if (!input.name.trim()) return { success: false, error: 'Name is required' };
  if (!input.department.trim()) return { success: false, error: 'Department is required' };

  const id = `USR-${String(users.length + 1).padStart(3, '0')}`;
  const createdAt = new Date().toISOString().split('T')[0];
  const newUser: AuthUser = {
    id,
    email,
    password: hashPassword(input.password),
    name: input.name.trim(),
    phone: input.phone?.trim() || undefined,
    organizationId,
    role: input.role,
    department: input.department.trim(),
    isActive: true,
    createdAt,
  };
  localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify([...users, newUser]));
  return { success: true };
}

export function editAuthUser(
  userId: string,
  input: {
    email: string;
    name: string;
    phone?: string;
    organizationId?: string;
    role: UserRole;
    department: string;
    password?: string;
  }
): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Client-only operation' };
  const users = safeGetStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return { success: false, error: 'User not found' };

  const email = input.email.trim().toLowerCase();
  const organizationId = input.organizationId?.trim() || 'org-default';
  if (!email) return { success: false, error: 'Email is required' };
  if (!input.name.trim()) return { success: false, error: 'Name is required' };
  if (!input.department.trim()) return { success: false, error: 'Department is required' };
  if (input.password !== undefined && input.password.length > 0 && input.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  if (users.some(u => u.email.toLowerCase() === email && u.id !== userId && (u.organizationId || 'org-default') === organizationId)) {
    return { success: false, error: 'Email already exists' };
  }

  const current = users[index];
  users[index] = {
    ...current,
    email,
    name: input.name.trim(),
    phone: input.phone?.trim() || undefined,
    organizationId: organizationId || current.organizationId || 'org-default',
    role: input.role,
    department: input.department.trim(),
    password: input.password ? hashPassword(input.password) : current.password,
  };

  localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
  return { success: true };
}

export function deleteAuthUser(userId: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Client-only operation' };
  const users = safeGetStoredUsers();
  const next = users.filter(u => u.id !== userId);
  if (next.length === users.length) return { success: false, error: 'User not found' };
  localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(next));
  return { success: true };
}

export function authenticateUser(email: string, password: string): AuthResponse {
  const users = safeGetStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (!user.isActive) {
    return { success: false, error: 'User account is inactive' };
  }

  if (!validatePassword(password, user.password)) {
    return { success: false, error: 'Invalid password' };
  }

  // Generate simple token (NOT for production)
  const token = globalThis.crypto?.randomUUID?.() || `tok_${Date.now()}`;

  const { password: _, ...userWithoutPassword } = user;

  return {
    success: true,
    user: userWithoutPassword,
    token,
  };
}

// Session management
export interface Session {
  userId: string;
  email: string;
  name: string;
  organizationId?: string;
  organizationName?: string;
  organizationLogoUrl?: string;
  role: UserRole;
  department: string;
  token: string;
  expiresAt: string;
  plan?: 'free' | 'starter' | 'growth' | 'enterprise';
  assetLimit?: number;
  userLimit?: number;
  billingCycle?: 'monthly' | 'yearly';
  subscriptionStatus?: 'active' | 'pending_payment' | 'trial' | 'inactive';
}

export function createSession(user: Omit<AuthUser, 'password'>, token: string): Session {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8); // 8-hour session

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    organizationId: user.organizationId,
    organizationName: undefined,
    organizationLogoUrl: undefined,
    role: user.role,
    department: user.department,
    token,
    expiresAt: expiresAt.toISOString(),
    plan: 'free',
    assetLimit: 5,
    userLimit: 1,
    billingCycle: 'monthly',
    subscriptionStatus: 'active',
  };
}

// Permission management
export const permissions: Record<UserRole, string[]> = {
  master_admin: [
    'view_assets',
    'edit_assets',
    'delete_assets',
    'view_devices',
    'edit_devices',
    'delete_devices',
    'view_issues',
    'edit_issues',
    'delete_issues',
    'manage_users',
    'manage_departments',
    'view_reports',
    'export_data',
    'view_audit_logs',
  ],
  admin: [
    'view_assets',
    'edit_assets',
    'view_devices',
    'edit_devices',
    'view_issues',
    'edit_issues',
    'view_reports',
    'export_data',
  ],
  hr: [
    'view_assets',
    'view_devices',
    'view_issues',
    'create_issues',
    'handle_asset_handover',
  ],
  it: [
    'view_assets',
    'edit_assets',
    'view_devices',
    'edit_devices',
    'view_issues',
    'edit_issues',
    'handle_asset_handover',
  ],
  employee: [
    'view_assets',
    'view_devices',
    'view_issues',
    'create_issues',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return permissions[role]?.includes(permission) || false;
}

export function canManageAssets(role: UserRole): boolean {
  return hasPermission(role, 'edit_assets');
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'manage_users');
}

export function canViewReports(role: UserRole): boolean {
  return hasPermission(role, 'view_reports');
}
