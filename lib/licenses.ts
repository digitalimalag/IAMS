import type { Session } from '@/lib/auth';
import type { LicenseRecord } from '@/lib/mock-data';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const LICENSE_STORAGE_KEY = 'it_licenses';

export type LicenseFormInput = {
  licenseType: LicenseRecord['licenseType'];
  licenseOf: string;
  serialNumber: string;
  productKey: string;
  purchasedDate: string;
  expiryDate: string;
  purchasedFrom: LicenseRecord['purchasedFrom'];
  contactPerson: string;
  contactNumber: string;
  website: string;
  address: string;
  vendorName: string;
  notes: string;
};

export type LicenseDbRow = {
  id: string;
  organization_id: string;
  license_of: string;
  license_type: LicenseRecord['licenseType'];
  serial_number: string;
  product_key: string | null;
  purchased_date: string | null;
  expiry_date: string | null;
  purchased_from: LicenseRecord['purchasedFrom'];
  contact_person: string | null;
  contact_number: string | null;
  website: string | null;
  address: string | null;
  vendor_name: string | null;
  notes: string | null;
  created_by_profile_id: string | null;
  created_at: string;
  updated_at: string;
};

export function readStoredSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('session');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function getLicenseOrganizationId(session: Session | null) {
  return session?.organizationId?.trim() || '';
}

export function canUseLicenseSupabase(session: Session | null) {
  return isSupabaseConfigured() && Boolean(getLicenseOrganizationId(session));
}

export function licenseRowToRecord(row: LicenseDbRow): LicenseRecord {
  return {
    id: row.id,
    licenseType: row.license_type,
    licenseOf: row.license_of,
    serialNumber: row.serial_number,
    productKey: row.product_key || '',
    purchasedDate: row.purchased_date || '',
    expiryDate: row.expiry_date || '',
    purchasedFrom: row.purchased_from,
    contactPerson: row.contact_person || '',
    contactNumber: row.contact_number || '',
    website: row.website || '',
    address: row.address || '',
    vendorName: row.vendor_name || '',
    notes: row.notes || '',
  };
}

export function licenseInputToPayload(input: LicenseFormInput) {
  return {
    license_of: input.licenseOf.trim(),
    license_type: input.licenseType,
    serial_number: input.serialNumber.trim(),
    product_key: input.productKey.trim() || null,
    purchased_date: input.purchasedDate || null,
    expiry_date: input.expiryDate || null,
    purchased_from: input.purchasedFrom,
    contact_person: input.contactPerson.trim() || null,
    contact_number: input.contactNumber.trim() || null,
    website: input.website.trim() || null,
    address: input.address.trim() || null,
    vendor_name: input.vendorName.trim() || null,
    notes: input.notes.trim() || null,
  };
}

export async function resolveCurrentProfileId(session: Session | null): Promise<string | null> {
  if (!session?.userId || !canUseLicenseSupabase(session)) return null;

  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', session.userId)
    .maybeSingle();

  return data?.id || null;
}

export async function writeLicenseAuditLog(
  session: Session | null,
  action: string,
  entityId: string | null,
  metadata: Record<string, unknown>,
) {
  if (!canUseLicenseSupabase(session)) return;

  const orgId = getLicenseOrganizationId(session);
  if (!orgId) return;

  try {
    const supabase = createSupabaseBrowserClient();
    const actorProfileId = await resolveCurrentProfileId(session);
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      actor_profile_id: actorProfileId,
      action,
      entity_type: 'license',
      entity_id: entityId,
      metadata,
    });
  } catch {
    // Audit logging should never block the main save flow.
  }
}
