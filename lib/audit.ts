import type { Session } from '@/lib/auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

type AuditMetadata = Record<string, unknown>;

function getOrganizationId(session: Session | null) {
  return session?.organizationId?.trim() || '';
}

export function canUseAuditSupabase(session: Session | null) {
  return isSupabaseConfigured() && Boolean(getOrganizationId(session));
}

export async function resolveCurrentProfileId(session: Session | null): Promise<string | null> {
  if (!session?.userId || !canUseAuditSupabase(session)) return null;

  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', session.userId)
    .maybeSingle();

  return data?.id || null;
}

function appendLocalAuditLog(
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: AuditMetadata,
  session: Session | null,
) {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem('audit_logs');
    const existing = raw ? JSON.parse(raw) : [];
    const nextLog = {
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString(),
      organization_id: getOrganizationId(session) || undefined,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    };
    localStorage.setItem('audit_logs', JSON.stringify([nextLog, ...existing]));
  } catch {
    // Audit logging should never block the primary action.
  }
}

export async function writeAuditLog(
  session: Session | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: AuditMetadata,
) {
  if (canUseAuditSupabase(session)) {
    try {
      const supabase = createSupabaseBrowserClient();
      const orgId = getOrganizationId(session);
      const actorProfileId = await resolveCurrentProfileId(session);
      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        actor_profile_id: actorProfileId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
      });
      return;
    } catch {
      // Fall through to local audit log.
    }
  }

  appendLocalAuditLog(action, entityType, entityId, metadata, session);
}
