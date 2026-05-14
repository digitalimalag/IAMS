import type { Session } from '@/lib/auth';
import type { Asset } from '@/lib/mock-data';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const ASSET_STORAGE_KEY = 'it_assets';

export type AssetDbRow = {
  id: string;
  organization_id: string;
  name: string;
  asset_type: string;
  serial_number: string | null;
  manufacturer: string | null;
  model: string | null;
  vendor: string | null;
  designation: string | null;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  os_installed: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  status: Asset['status'];
  location: string | null;
  owner: string | null;
  assigned_to_profile_id: string | null;
  ip_address: string | null;
  mac_address: string | null;
  asset_tag: string | null;
  department: string | null;
  cost: number | string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetInputLike = {
  name: string;
  type: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  vendor: string;
  designation: string;
  processor: string;
  ram: string;
  storage: string;
  osInstalled: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: Asset['status'];
  location: string;
  owner: string;
  assetTag: string;
  department: string;
  cost: string;
  notes: string;
};

const CANONICAL_TYPES: Record<string, Asset['type']> = {
  desktop: 'Desktop',
  laptop: 'Laptop',
  server: 'Server',
  printer: 'Printer',
  monitor: 'Monitor',
  router: 'Router',
  switch: 'Switch',
  'usb hdd/ssd': 'USB HDD/SSD',
  ups: 'UPS',
  tv: 'TV',
  'network rack': 'Network Rack',
  'power cable': 'Power Cable',
  'vga cable': 'VGA Cable',
  'hdmi cable': 'HDMI Cable',
  'd to hdmi cable': 'D to HDMI Cable',
  'usb keyboard': 'USB Keyboard',
  'wl keyboard': 'WL Keyboard',
  'usb mouse': 'USB Mouse',
  'wl mouse': 'WL Mouse',
};

export function canUseAssetSupabase(session: Session | null) {
  return isSupabaseConfigured() && Boolean(session?.organizationId?.trim());
}

export function getAssetOrganizationId(session: Session | null) {
  return session?.organizationId?.trim() || '';
}

export function normalizeAssetType(rawType: unknown): Asset['type'] | string {
  const value = typeof rawType === 'string' ? rawType.trim() : '';
  if (!value) return '';
  return CANONICAL_TYPES[value.toLowerCase()] || value;
}

export function normalizeAssetRecord(raw: Partial<Asset> & Record<string, any>): Asset {
  return {
    id: raw.id || `AST-${Date.now()}`,
    name: raw.name || '',
    type: normalizeAssetType(raw.type || raw.asset_type || raw.assetType) as Asset['type'],
    serialNumber: raw.serialNumber || raw.serial_number || '',
    manufacturer: raw.manufacturer || '',
    model: raw.model || '',
    vendor: raw.vendor || raw.vendor_name || '',
    designation: raw.designation || '',
    processor: raw.processor || '',
    ram: raw.ram || '',
    ramType: raw.ramType || undefined,
    ramMhz: raw.ramMhz || '',
    ramModules: Array.isArray(raw.ramModules) ? raw.ramModules : undefined,
    storage: raw.storage || '',
    storageAddons: Array.isArray(raw.storageAddons) ? raw.storageAddons : undefined,
    osInstalled: raw.osInstalled || raw.os_installed || '',
    purchaseDate: raw.purchaseDate || raw.purchase_date || '',
    warrantyExpiry: raw.warrantyExpiry || raw.warranty_expiry || '',
    status: raw.status || 'Active',
    location: raw.location || '',
    owner: raw.owner || '',
    assignedToUserId: raw.assignedToUserId || raw.assigned_to_profile_id || undefined,
    ipAddress: raw.ipAddress || raw.ip_address || '',
    macAddress: raw.macAddress || raw.mac_address || '',
    assetTag: raw.assetTag || raw.asset_tag || '',
    department: raw.department || '',
    cost: Number(raw.cost || 0),
    notes: raw.notes || '',
  };
}

export function assetDbRowToRecord(row: AssetDbRow): Asset {
  return normalizeAssetRecord({
    id: row.id,
    name: row.name,
    type: normalizeAssetType(row.asset_type) as Asset['type'],
    serialNumber: row.serial_number || '',
    manufacturer: row.manufacturer || '',
    model: row.model || '',
    vendor: row.vendor || '',
    designation: row.designation || '',
    processor: row.processor || '',
    ram: row.ram || '',
    storage: row.storage || '',
    osInstalled: row.os_installed || '',
    purchaseDate: row.purchase_date || '',
    warrantyExpiry: row.warranty_expiry || '',
    status: row.status,
    location: row.location || '',
    owner: row.owner || '',
    assignedToUserId: row.assigned_to_profile_id || '',
    ipAddress: row.ip_address || '',
    macAddress: row.mac_address || '',
    assetTag: row.asset_tag || '',
    department: row.department || '',
    cost: Number(row.cost || 0),
    notes: row.notes || '',
  });
}

function summarizeRamModules(values: AssetInputLike) {
  return values.ram || '';
}

function summarizeStorage(values: AssetInputLike) {
  return values.storage || '';
}

export function assetInputToPayload(values: AssetInputLike, session: Session | null) {
  return {
    organization_id: getAssetOrganizationId(session),
    name: values.name.trim(),
    asset_type: normalizeAssetType(values.type),
    serial_number: values.serialNumber.trim() || null,
    manufacturer: values.manufacturer.trim() || null,
    model: values.model.trim() || null,
    vendor: values.vendor.trim() || null,
    designation: values.designation.trim() || null,
    processor: values.processor.trim() || null,
    ram: summarizeRamModules(values).trim() || null,
    storage: summarizeStorage(values).trim() || null,
    os_installed: values.osInstalled.trim() || null,
    purchase_date: values.purchaseDate || null,
    warranty_expiry: values.warrantyExpiry || null,
    status: values.status,
    location: values.location.trim() || null,
    owner: values.owner.trim() || null,
    asset_tag: values.assetTag.trim(),
    department: values.department.trim() || null,
    cost: Number(values.cost) || 0,
    notes: values.notes.trim() || null,
  };
}

export function getAssetSupabaseClient() {
  return createSupabaseBrowserClient();
}
