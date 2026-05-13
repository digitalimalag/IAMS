'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { LicenseForm, type LicenseFormValues } from '@/components/forms/license-form';
import { mockLicenses, type LicenseRecord } from '@/lib/mock-data';

const LICENSE_STORAGE_KEY = 'it_licenses';

export default function NewLicensePage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!stored) return;
  }, []);

  const handleSubmit = (values: LicenseFormValues) => {
    setError('');
    if (!values.licenseOf || !values.serialNumber) {
      setError('Please fill the required fields.');
      return;
    }

    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    const existing: LicenseRecord[] = stored ? JSON.parse(stored) : mockLicenses;
    const newLicense: LicenseRecord = {
      id: `LIC-${Date.now()}`,
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

    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify([...existing, newLicense]));
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
