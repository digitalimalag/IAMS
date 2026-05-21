'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  getNetworkDeviceOrganizationId,
  getSupabaseNetworkDevicesClient,
  networkDeviceInputToPayload,
  networkDeviceRowToRecord,
  NETWORK_DEVICE_STORAGE_KEY,
} from '@/lib/network-devices';

export default function EditNetworkDevicePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const deviceId = params.id;
  const [session, setSession] = useState<Session | null>(null);
  const [device, setDevice] = useState<NetworkDevice | null>(null);
  const [error, setError] = useState('');
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

    const loadDevice = async () => {
      if (canUseNetworkDeviceSupabase(currentSession)) {
        try {
          const supabase = getSupabaseNetworkDevicesClient();
          const orgId = getNetworkDeviceOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('network_devices')
            .select('*')
            .eq('id', deviceId)
            .eq('organization_id', orgId)
            .maybeSingle();

          if (!error && data) {
            setDevice(networkDeviceRowToRecord(data as any));
            return;
          }
        } catch {
          setDevice(null);
          return;
        }

        setDevice(null);
        return;
      }

      const stored = localStorage.getItem(NETWORK_DEVICE_STORAGE_KEY);
      const existingDevices: NetworkDevice[] = stored ? JSON.parse(stored) : mockNetworkDevices;
      setDevice(existingDevices.find((item) => item.id === deviceId) || null);
    };

    void loadDepartments();
    void loadDevice();
  }, [deviceId]);

  const initialValues = useMemo<Partial<NetworkDeviceFormValues> | undefined>(() => {
    if (!device) return undefined;
    return {
      id: device.id,
      deviceModel: device.deviceModel || '',
      deviceBrand: device.deviceBrand || '',
      name: device.name,
      type: device.type,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      location: device.location,
      vendor: device.vendor || '',
      purchaseDate: device.purchaseDate || '',
      warrantyExpiry: device.warrantyExpiry || '',
      status: device.status,
      firmwareVersion: device.firmwareVersion,
      department: device.department,
    };
  }, [device]);

  const handleSubmit = (values: NetworkDeviceFormValues) => {
    setError('');
    if (!device) {
      setError('Network device not found.');
      return;
    }

    const updatedDevice: NetworkDevice = {
      ...device,
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
      firmwareVersion: values.firmwareVersion,
      department: values.department,
    };

    if (canUseNetworkDeviceSupabase(session)) {
      const supabase = getSupabaseNetworkDevicesClient();
      void supabase
        .from('network_devices')
        .update(networkDeviceInputToPayload(values, session, device.lastSeen))
        .eq('id', device.id)
        .eq('organization_id', getNetworkDeviceOrganizationId(session))
        .then(({ error }) => {
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
    localStorage.setItem(
      NETWORK_DEVICE_STORAGE_KEY,
      JSON.stringify(existingDevices.map((item) => (item.id === device.id ? updatedDevice : item)))
    );
    router.push('/network-devices');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <NetworkDeviceForm
          title="Edit Network Device"
          description="Update the network device details on a full page."
          submitLabel="Update Device"
          cancelHref="/network-devices"
          initialValues={initialValues}
          departments={departments}
          useDefaultDepartmentOptions={!isSupabaseConfigured()}
          error={error}
          onSubmit={handleSubmit}
        />
      </DashboardLayout>
    </SessionCheck>
  );
}
