'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { NetworkDeviceForm, type NetworkDeviceFormValues } from '@/components/forms/network-device-form';
import { mockNetworkDevices, mockDepartments } from '@/lib/mock-data';
import type { NetworkDevice } from '@/lib/mock-data';
import type { Session } from '@/lib/auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { readStoredSession } from '@/lib/licenses';
import { readTenantJson } from '@/lib/tenant-storage';
import {
  canUseNetworkDeviceSupabase,
  getSupabaseNetworkDevicesClient,
  networkDeviceInputToPayload,
  NETWORK_DEVICE_STORAGE_KEY,
} from '@/lib/network-devices';

export default function NewNetworkDevicePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const currentSession = readStoredSession();
    setSession(currentSession);

    const loadDepartments = async () => {
      if (isSupabaseConfigured() && currentSession?.organizationId) {
        try {
          const supabase = createSupabaseBrowserClient();
          const { data, error } = await supabase
            .from('departments')
            .select('name,is_active')
            .eq('organization_id', currentSession.organizationId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            setDepartments(data.map((row: any) => String(row.name || '').trim()).filter(Boolean));
            return;
          }
        } catch {
          setDepartments([]);
          return;
        }

        setDepartments([]);
        return;
      }

      if (isSupabaseConfigured()) {
        setDepartments([]);
        return;
      }

      const storedDepartments = readTenantJson<any[]>('it_departments', currentSession, mockDepartments);
      setDepartments(storedDepartments.map((dept) => String(dept.name || '').trim()).filter(Boolean));
    };

    void loadDepartments();
  }, []);

  const handleSubmit = (values: NetworkDeviceFormValues) => {
    setError('');

    if (!values.name || !values.type || !values.ipAddress) {
      setError('Please fill the required fields.');
      return;
    }

    const newDevice: NetworkDevice = {
      id: isSupabaseConfigured() ? crypto.randomUUID() : `NET-${Date.now()}`,
      deviceModel: values.deviceModel,
      deviceBrand: values.deviceBrand,
      vendor: values.vendor,
      name: values.name,
      type: values.type as NetworkDevice['type'],
      ipAddress: values.ipAddress,
      macAddress: values.macAddress,
      location: values.location,
      purchaseDate: values.purchaseDate || '',
      warrantyExpiry: values.warrantyExpiry || '',
      status: values.status as NetworkDevice['status'],
      lastSeen: new Date().toISOString(),
      firmwareVersion: values.firmwareVersion,
      department: values.department,
    };

    if (canUseNetworkDeviceSupabase(session)) {
      const supabase = getSupabaseNetworkDevicesClient();
      void supabase.from('network_devices').insert(networkDeviceInputToPayload(values, session)).then(({ error }) => {
        if (error) {
          setError(error.message);
          return;
        }
        router.push('/network-devices');
      });
      return;
    }

    const stored = localStorage.getItem(NETWORK_DEVICE_STORAGE_KEY);
    const existingDevices: NetworkDevice[] = stored ? JSON.parse(stored) : mockNetworkDevices;
    localStorage.setItem(NETWORK_DEVICE_STORAGE_KEY, JSON.stringify([...existingDevices, newDevice]));
    router.push('/network-devices');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <NetworkDeviceForm
          title="Add New Device"
          description="Create a new network device record and return to the list after saving."
          submitLabel="Save Device"
          cancelHref="/network-devices"
          departments={departments}
          useDefaultDepartmentOptions={!isSupabaseConfigured()}
          error={error}
          onSubmit={handleSubmit}
        />
      </DashboardLayout>
    </SessionCheck>
  );
}
