'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { LicenseForm, type LicenseFormValues } from '@/components/forms/license-form';
import { mockLicenses, type LicenseRecord } from '@/lib/mock-data';

const LICENSE_STORAGE_KEY = 'it_licenses';

export default function EditLicensePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const licenseId = params.id;
  const [license, setLicense] = useState<LicenseRecord | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    const existing: LicenseRecord[] = stored ? JSON.parse(stored) : mockLicenses;
    setLicense(existing.find((item) => item.id === licenseId) || null);
  }, [licenseId]);

  const initialValues = useMemo<Partial<LicenseFormValues> | undefined>(() => {
    if (!license) return undefined;
    return {
      id: license.id,
      licenseType: license.licenseType,
      licenseOf: license.licenseOf,
      serialNumber: license.serialNumber,
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

  const handleSubmit = (values: LicenseFormValues) => {
    setError('');
    if (!license) {
      setError('License not found.');
      return;
    }

    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    const existing: LicenseRecord[] = stored ? JSON.parse(stored) : mockLicenses;
    const updated: LicenseRecord = {
      ...license,
      licenseType: values.licenseType,
      licenseOf: values.licenseOf,
      serialNumber: values.serialNumber,
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
    router.push('/licenses');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        {license ? (
          <LicenseForm
            title="Edit License"
            description="Update the license details on a full page."
            submitLabel="Update License"
            cancelHref="/licenses"
            initialValues={initialValues}
            error={error}
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-muted-foreground shadow-sm">Loading license...</div>
        )}
      </DashboardLayout>
    </SessionCheck>
  );
}
