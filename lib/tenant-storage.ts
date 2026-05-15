import type { Session } from '@/lib/auth';

function getTenantSuffix(session: Session | null) {
  const orgId = session?.organizationId?.trim();
  return orgId ? `:${orgId}` : '';
}

export function getTenantStorageKey(baseKey: string, session: Session | null) {
  return `${baseKey}${getTenantSuffix(session)}`;
}

export function readTenantJson<T>(baseKey: string, session: Session | null, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const key = getTenantStorageKey(baseKey, session);
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeTenantJson<T>(baseKey: string, session: Session | null, value: T) {
  if (typeof window === 'undefined') return;
  const key = getTenantStorageKey(baseKey, session);
  localStorage.setItem(key, JSON.stringify(value));
}
