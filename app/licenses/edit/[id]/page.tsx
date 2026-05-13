'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { LicenseForm, type LicenseFormValues } from '@/components/forms/license-form';
import { mockLicenses, type LicenseRecord } from '@/lib/mock-data';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Session } from '@/lib/auth';
import {
  LICENSE_STORAGE_KEY,
  canUseLicenseSupabase,
  getLicenseOrganizationId,
  licenseInputToPayload,
  licenseRowToRecord,
  readStoredSession,
  resolveCurrentProfileId,
  writeLicenseAuditLog,
} from '@/lib/licenses';

export default function EditLicensePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const licenseId = params.id;
  const [session, setSession] = useState<Session | null>(null);
  const [license, setLicense] = useState<LicenseRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = readStoredSession();
    setSession(currentSession);

    const loadLicense = async () => {
      setLoading(true);
      try {
        const orgId = getLicenseOrganizationId(currentSession);

        if (canUseLicenseSupabase(currentSession) && orgId) {
          const supabase = createSupabaseBrowserClient();
          const { data, error: fetchError } = await supabase
            .from('licenses')
            .select('*')
            .eq('id', licenseId)
            .eq('organization_id', orgId)
            .maybeSingle();

          if (data) {
            setLicense(licenseRowToRecord(data));
            return;
          }

          if (fetchError && fetchError.code !== 'PGRST116') {
            setError(fetchError.message);
            setLicense(null);
            return;
          }
        }

        const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
        const existing: LicenseRecord[] = stored ? JSON.parse(stored) : mockLicenses;
        setLicense(existing.find((item) => item.id === licenseId) || null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load license.');
        setLicense(null);
      } finally {
        setLoading(false);
      }
    };

    void loadLicense();
  }, [licenseId]);

  const initialValues = useMemo<Partial<LicenseFormValues> | undefined>(() => {
    if (!license) return undefined;
    return {
      id: license.id,
      licenseType: license.licenseType,
      licenseOf: license.licenseOf,
      serialNumber: license.serialNumber,
      productKey: license.productKey,
      purchasedDate: license.purchasedDate,
      expiryDate: license.expiryDate,
      purchasedFrom: license.purchasedFrom,
      contactPerson: license.contactPerson,
      contactNumber: license.contactNumber,
      website: license.website,
      address: license.address,
      vendorName: license.vendorName,
      notes: license.notes || '',
    };
  }, [license]);

  const handleSubmit = async (values: LicenseFormValues) => {
    setError('');
    if (!license) {
      setError('License not found.');
      return;
    }

    const currentSession = session || readStoredSession();
    const orgId = getLicenseOrganizationId(currentSession);

    if (canUseLicenseSupabase(currentSession) && orgId) {
      try {
        const supabase = createSupabaseBrowserClient();
        const createdByProfileId = await resolveCurrentProfileId(currentSession);
        const { error: updateError } = await supabase
          .from('licenses')
          .update({
            ...licenseInputToPayload(values),
            created_by_profile_id: createdByProfileId,
          })
          .eq('id', license.id)
          .eq('organization_id', orgId);

        if (updateError) {
          setError(updateError.message);
          return;
        }

        await writeLicenseAuditLog(currentSession, 'update_license', license.id, {
          licenseOf: values.licenseOf,
          serialNumber: values.serialNumber,
          productKey: values.productKey,
          licenseType: values.licenseType,
          purchasedFrom: values.purchasedFrom,
        });

        router.push('/licenses');
        return;
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Failed to update license.');
        return;
      }
    }

    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    const existing: LicenseRecord[] = stored ? JSON.parse(stored) : mockLicenses;
    const updated: LicenseRecord = {
      ...license,
      licenseType: values.licenseType,
      licenseOf: values.licenseOf,
      serialNumber: values.serialNumber,
      productKey: values.productKey,
      purchasedDate: values.purchasedDate,
      expiryDate: values.expiryDate,
      purchasedFrom: values.purchasedFrom,
      contactPerson: values.contactPerson,
      contactNumber: values.contactNumber,
      website: values.website,
      address: values.address,
      vendorName: values.vendorName,
      notes: values.notes,
    };

    localStorage.setItem(
      LICENSE_STORAGE_KEY,
      JSON.stringify(existing.map((item) => (item.id === license.id ? updated : item)))
    );
    const auditLogsRaw = localStorage.getItem('audit_logs');
    const existingLogs = auditLogsRaw ? JSON.parse(auditLogsRaw) : [];
    localStorage.setItem(
      'audit_logs',
      JSON.stringify([
        {
          id: `audit-${Date.now()}`,
          created_at: new Date().toISOString(),
          action: 'update_license',
          entity_type: 'license',
          entity_id: license.id,
          metadata: {
            licenseOf: updated.licenseOf,
            serialNumber: updated.serialNumber,
            productKey: updated.productKey,
            licenseType: updated.licenseType,
            purchasedFrom: updated.purchasedFrom,
          },
        },
        ...existingLogs,
      ])
    );
    router.push('/licenses');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        {!loading && !license ? (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-muted-foreground shadow-sm">License not found.</div>
        ) : loading ? (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-muted-foreground shadow-sm">Loading license...</div>
        ) : (
          <LicenseForm
            title="Edit License"
            description="Update the license details on a full page."
            submitLabel="Update License"
            cancelHref="/licenses"
            initialValues={initialValues}
            error={error}
            onSubmit={handleSubmit}
          />
        )}
      </DashboardLayout>
    </SessionCheck>
  );
}
