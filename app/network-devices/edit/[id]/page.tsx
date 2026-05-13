'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { NetworkDeviceForm, type NetworkDeviceFormValues } from '@/components/forms/network-device-form';
import { mockNetworkDevices } from '@/lib/mock-data';
import type { NetworkDevice } from '@/lib/mock-data';

const DEVICE_STORAGE_KEY = 'it_network_devices';

export default function EditNetworkDevicePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const deviceId = params.id;
  const [device, setDevice] = useState<NetworkDevice | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
    const existingDevices: NetworkDevice[] = stored ? JSON.parse(stored) : mockNetworkDevices;
    setDevice(existingDevices.find((item) => item.id === deviceId) || null);
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

    const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
    const existingDevices: NetworkDevice[] = stored ? JSON.parse(stored) : mockNetworkDevices;
    const updatedDevice: NetworkDevice = {
      ...device,
      deviceModel: values.deviceModel,
      deviceBrand: values.deviceBrand,
      name: values.name,
      type: values.type as NetworkDevice['type'],
      ipAddress: values.ipAddress,
      macAddress: values.macAddress,
      location: values.location,
      status: values.status as NetworkDevice['status'],
      firmwareVersion: values.firmwareVersion,
      department: values.department,
    };

    localStorage.setItem(
      DEVICE_STORAGE_KEY,
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
          error={error}
          onSubmit={handleSubmit}
        />
      </DashboardLayout>
    </SessionCheck>
  );
}
