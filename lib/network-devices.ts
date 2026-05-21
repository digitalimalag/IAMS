import type { Session } from '@/lib/auth';
import type { NetworkDevice } from '@/lib/mock-data';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const NETWORK_DEVICE_STORAGE_KEY = 'it_network_devices';

export type NetworkDeviceDbRow = {
  id: string;
  organization_id: string;
  device_model: string | null;
  device_brand: string | null;
  name: string;
  device_type: NetworkDevice['type'];
  ip_address: string | null;
  mac_address: string | null;
  location: string | null;
  status: NetworkDevice['status'];
  last_seen: string | null;
  firmware_version: string | null;
  department: string | null;
  vendor: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  created_at: string;
  updated_at: string;
};

export type NetworkDeviceInputLike = {
  deviceModel: string;
  deviceBrand: string;
  name: string;
  type: string;
  ipAddress: string;
  macAddress: string;
  location: string;
  status: NetworkDevice['status'];
  firmwareVersion: string;
  department: string;
  vendor: string;
  purchaseDate: string;
  warrantyExpiry: string;
};

export function getNetworkDeviceOrganizationId(session: Session | null) {
  return session?.organizationId?.trim() || '';
}

export function canUseNetworkDeviceSupabase(session: Session | null) {
  return isSupabaseConfigured() && Boolean(getNetworkDeviceOrganizationId(session));
}

export function networkDeviceRowToRecord(row: NetworkDeviceDbRow): NetworkDevice {
  return {
    id: row.id,
    deviceModel: row.device_model || '',
    deviceBrand: row.device_brand || '',
    name: row.name,
    type: row.device_type,
    ipAddress: row.ip_address || '',
    macAddress: row.mac_address || '',
    location: row.location || '',
    status: row.status,
    lastSeen: row.last_seen || '',
    firmwareVersion: row.firmware_version || '',
    department: row.department || '',
    vendor: row.vendor || '',
    purchaseDate: row.purchase_date || '',
    warrantyExpiry: row.warranty_expiry || '',
  };
}

export function networkDeviceInputToPayload(values: NetworkDeviceInputLike, session: Session | null, lastSeen?: string | null) {
  return {
    organization_id: getNetworkDeviceOrganizationId(session),
    device_model: values.deviceModel.trim() || null,
    device_brand: values.deviceBrand.trim() || null,
    name: values.name.trim(),
    device_type: values.type,
    ip_address: values.ipAddress.trim() || null,
    mac_address: values.macAddress.trim() || null,
    location: values.location.trim() || null,
    status: values.status,
    last_seen: lastSeen || new Date().toISOString(),
    firmware_version: values.firmwareVersion.trim() || null,
    department: values.department.trim() || null,
    vendor: values.vendor.trim() || null,
    purchase_date: values.purchaseDate || null,
    warranty_expiry: values.warrantyExpiry || null,
  } as Record<string, unknown>;
}

export function getSupabaseNetworkDevicesClient() {
  return createSupabaseBrowserClient();
}
