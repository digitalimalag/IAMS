'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  readStoredSession,
  resolveCurrentProfileId,
  writeLicenseAuditLog,
} from '@/lib/licenses';

export default function NewLicensePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSession(readStoredSession());
  }, []);

  const handleSubmit = async (values: LicenseFormValues) => {
    setError('');
    if (!values.licenseOf || !values.serialNumber) {
      setError('Please fill the required fields.');
      return;
    }

    const currentSession = session || readStoredSession();
    const orgId = getLicenseOrganizationId(currentSession);

    if (canUseLicenseSupabase(currentSession) && orgId) {
      try {
        const supabase = createSupabaseBrowserClient();
        const createdByProfileId = await resolveCurrentProfileId(currentSession);
        const payload = {
          organization_id: orgId,
          ...licenseInputToPayload(values),
          created_by_profile_id: createdByProfileId,
        };

        const { error: insertError } = await supabase.from('licenses').insert(payload);
        if (insertError) {
          setError(insertError.message);
          return;
        }

        await writeLicenseAuditLog(currentSession, 'create_license', null, {
          licenseOf: values.licenseOf,
          serialNumber: values.serialNumber,
          productKey: values.productKey,
          licenseType: values.licenseType,
          purchasedFrom: values.purchasedFrom,
        });

        router.push('/licenses');
        return;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save license.');
        return;
      }
    }

    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    const existing: LicenseRecord[] = stored ? JSON.parse(stored) : mockLicenses;
    const newLicense: LicenseRecord = {
      id: `LIC-${Date.now()}`,
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

    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify([...existing, newLicense]));
    const auditLogsRaw = localStorage.getItem('audit_logs');
    const existingLogs = auditLogsRaw ? JSON.parse(auditLogsRaw) : [];
    localStorage.setItem(
      'audit_logs',
      JSON.stringify([
        {
          id: `audit-${Date.now()}`,
          created_at: new Date().toISOString(),
          action: 'create_license',
          entity_type: 'license',
          entity_id: newLicense.id,
          metadata: {
            licenseOf: newLicense.licenseOf,
            serialNumber: newLicense.serialNumber,
            productKey: newLicense.productKey,
            licenseType: newLicense.licenseType,
            purchasedFrom: newLicense.purchasedFrom,
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
        <LicenseForm
          title="Add License"
          description="Create a new software, OS, firewall, or other license record."
          submitLabel="Save License"
          cancelHref="/licenses"
          error={error}
          onSubmit={handleSubmit}
        />
      </DashboardLayout>
    </SessionCheck>
  );
}
