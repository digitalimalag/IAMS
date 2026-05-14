'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { mockVendors } from '@/lib/mock-data';
import { normalizeAssetType } from '@/lib/assets';

export type AssetStorageAddon = {
  capacity: string;
  mediaType: 'HDD' | 'SSD';
  quantity: string;
};

export type AssetRamModule = {
  capacity: string;
  ramType: '' | 'DDR-II' | 'DDR-III' | 'DDR-IV' | 'DDR-V';
  ramMhz: string;
};

export type AssetFormValues = {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  vendor: string;
  designation: string;
  processor: string;
  ram: string;
  ramType: '' | 'DDR-II' | 'DDR-III' | 'DDR-IV' | 'DDR-V';
  ramMhz: string;
  ramModules: AssetRamModule[];
  storage: string;
  osInstalled: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
  location: string;
  owner: string;
  assetTag: string;
  department: string;
  cost: string;
  notes: string;
  storageAddons: AssetStorageAddon[];
};

interface AssetFormProps {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  initialValues?: Partial<AssetFormValues>;
  onSubmit: (values: AssetFormValues) => void;
  error?: string;
}

const ASSET_TYPES = [
  'Desktop', 'Laptop', 'Server', 'Printer', 'Monitor', 'Router', 'Switch',
  'USB HDD/SSD', 'UPS', 'TV', 'Network Rack', 'Power Cable', 'VGA Cable',
  'HDMI Cable', 'D to HDMI Cable', 'USB Keyboard', 'WL Keyboard', 'USB Mouse', 'WL Mouse',
];

const STATUSES: AssetFormValues['status'][] = ['Active', 'Inactive', 'Maintenance', 'Retired'];
const DEPARTMENTS = ['IT Support', 'Infrastructure', 'Design', 'Operations', 'Security'];

const defaultStorageAddon = (): AssetStorageAddon => ({
  capacity: '',
  mediaType: 'SSD',
  quantity: '1',
});

const defaultValues: AssetFormValues = {
  id: '',
  name: '',
  type: '',
  serialNumber: '',
  manufacturer: '',
  model: '',
  vendor: '',
  designation: '',
  processor: '',
  ram: '',
  ramType: '',
  ramMhz: '',
  ramModules: [{ capacity: '', ramType: '', ramMhz: '' }],
  storage: '',
  osInstalled: '',
  purchaseDate: '',
  warrantyExpiry: '',
  status: 'Active',
  location: '',
  owner: '',
  assetTag: '',
  department: '',
  cost: '',
  notes: '',
  storageAddons: [defaultStorageAddon()],
};

function parseStorageSummary(storage: string): AssetStorageAddon[] {
  const normalized = storage
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (normalized.length === 0) return [defaultStorageAddon()];

  return normalized.map((item) => {
    const match = item.match(/(.+?)\s+(\d+)\s*(HDD|SSD)\b/i);
    if (!match) {
      return { capacity: item, mediaType: 'SSD' as const, quantity: '1' };
    }
    return {
      capacity: match[1].trim(),
      quantity: match[2],
      mediaType: match[3].toUpperCase() === 'HDD' ? 'HDD' : 'SSD',
    };
  });
}

function parseRamSummary(ram: string): AssetRamModule[] {
  const normalized = ram
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (normalized.length === 0) return [{ capacity: '', ramType: '', ramMhz: '' }];

  return normalized.map((item) => {
    const match = item.match(/(.+?)\s+(DDR-II|DDR-III|DDR-IV|DDR-V)\s+(\d+)\s*MHz?/i);
    if (match) {
      return {
        capacity: match[1].trim(),
        ramType: match[2].toUpperCase() as AssetRamModule['ramType'],
        ramMhz: match[3],
      };
    }
    return { capacity: item, ramType: '', ramMhz: '' };
  });
}

export function AssetForm({ title, description, submitLabel, cancelHref, initialValues, onSubmit, error }: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormValues>(defaultValues);
  const [customType, setCustomType] = useState('');
  const [vendorOptions, setVendorOptions] = useState<string[]>(mockVendors.map((vendor) => vendor.name));

  useEffect(() => {
    const merged = { ...defaultValues, ...initialValues };
    setFormData({
      ...merged,
      type: normalizeAssetType((initialValues?.type || (initialValues as Record<string, unknown> | undefined)?.assetType || merged.type) as string) as string,
      storageAddons: Array.isArray(initialValues?.storageAddons) && initialValues.storageAddons.length > 0
        ? initialValues.storageAddons
        : initialValues?.storage
          ? parseStorageSummary(initialValues.storage)
          : [defaultStorageAddon()],
      ramModules: Array.isArray(initialValues?.ramModules) && initialValues.ramModules.length > 0
        ? initialValues.ramModules
        : initialValues?.ram
          ? parseRamSummary(`${initialValues.ram}${initialValues.ramType ? ` ${initialValues.ramType}` : ''}${initialValues.ramMhz ? ` ${initialValues.ramMhz} MHz` : ''}`)
          : [{ capacity: '', ramType: '', ramMhz: '' }],
    });
    setCustomType('');
  }, [initialValues]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('it_vendors');
      if (!stored) {
        setVendorOptions(Array.from(new Set(mockVendors.map((vendor) => vendor.name))));
        return;
      }

      const parsed = JSON.parse(stored) as Array<{ name?: string }>;
      const names = parsed
        .map((vendor) => vendor.name?.trim())
        .filter((name): name is string => Boolean(name));
      setVendorOptions(Array.from(new Set(names.length > 0 ? names : mockVendors.map((vendor) => vendor.name))));
    } catch {
      setVendorOptions(Array.from(new Set(mockVendors.map((vendor) => vendor.name))));
    }
  }, []);

  const effectiveType = useMemo(() => {
    const normalized = normalizeAssetType(formData.type);
    if (normalized === '__manual__') return customType.trim();
    return normalized;
  }, [customType, formData.type]);
  const resolvedVendorOptions = useMemo(() => {
    const currentVendor = formData.vendor.trim();
    if (currentVendor && !vendorOptions.includes(currentVendor)) {
      return [...vendorOptions, currentVendor];
    }
    return vendorOptions;
  }, [formData.vendor, vendorOptions]);

  const showComputerSpecs = ['Desktop', 'Laptop', 'Server'].includes(effectiveType);
  const showStorageAddonField = ['Desktop', 'Laptop', 'Server', 'USB HDD/SSD'].includes(effectiveType);
  const showMiscStorage = ['Printer', 'Monitor', 'Router', 'Switch', 'UPS', 'TV', 'Network Rack'].includes(effectiveType);

  const handleChange = (field: keyof AssetFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addStorageAddon = () => {
    setFormData((prev) => ({
      ...prev,
      storageAddons: [...prev.storageAddons, defaultStorageAddon()],
    }));
  };

  const addRamModule = () => {
    setFormData((prev) => ({
      ...prev,
      ramModules: [...prev.ramModules, { capacity: '', ramType: '', ramMhz: '' }],
    }));
  };

  const updateRamModule = (index: number, field: keyof AssetRamModule, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ramModules: prev.ramModules.map((module, idx) => (idx === index ? { ...module, [field]: value } : module)),
    }));
  };

  const removeRamModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ramModules: prev.ramModules.length > 1 ? prev.ramModules.filter((_, idx) => idx !== index) : prev.ramModules,
    }));
  };

  const updateStorageAddon = (index: number, field: keyof AssetStorageAddon, value: string) => {
    setFormData((prev) => ({
      ...prev,
      storageAddons: prev.storageAddons.map((addon, idx) => (idx === index ? { ...addon, [field]: value } : addon)),
    }));
  };

  const removeStorageAddon = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      storageAddons: prev.storageAddons.length > 1 ? prev.storageAddons.filter((_, idx) => idx !== index) : prev.storageAddons,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      type: effectiveType,
      designation: formData.designation.trim(),
      processor: showComputerSpecs ? formData.processor : '',
      ram: showComputerSpecs ? formData.ramModules
        .map((module) => {
          const capacity = module.capacity.trim();
          const ramType = module.ramType;
          const ramMhz = module.ramMhz.trim();
          if (!capacity) return '';
          return [capacity, ramType, ramMhz ? `${ramMhz} MHz` : ''].filter(Boolean).join(' ');
        })
        .filter(Boolean)
        .join(', ') : '',
      ramType: showComputerSpecs ? formData.ramModules.find((module) => module.ramType)?.ramType || '' : '',
      ramMhz: showComputerSpecs ? formData.ramModules.find((module) => module.ramMhz)?.ramMhz || '' : '',
      ramModules: showComputerSpecs
        ? formData.ramModules
            .map((module) => ({
              capacity: module.capacity.trim(),
              ramType: module.ramType,
              ramMhz: module.ramMhz.trim(),
            }))
            .filter((module) => module.capacity)
        : [],
      storage: showStorageAddonField ? formData.storageAddons
        .map((addon) => {
          const capacity = addon.capacity.trim();
          const qty = Number(addon.quantity || '1') || 1;
          if (!capacity) return '';
          return `${capacity} ${qty} ${addon.mediaType}`;
        })
        .filter(Boolean)
        .join(', ') : (showMiscStorage ? formData.storage : ''),
      storageAddons: showStorageAddonField
        ? formData.storageAddons
            .map((addon) => ({
              capacity: addon.capacity.trim(),
              mediaType: addon.mediaType,
              quantity: addon.quantity,
            }))
            .filter((addon) => addon.capacity)
        : [],
      osInstalled: showComputerSpecs ? formData.osInstalled : '',
      cost: formData.cost,
    });
  };

  return (
    <CardShell>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup>
            <FieldLabel>Asset Tag *</FieldLabel>
            <Input value={formData.assetTag} onChange={(e) => handleChange('assetTag', e.target.value)} placeholder="IT-2024-001" required />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Asset Name *</FieldLabel>
            <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="John's Laptop" required />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Type *</FieldLabel>
            <Select value={formData.type} onValueChange={(value) => {
              handleChange('type', value);
              if (value !== '__manual__') setCustomType('');
            }}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                <SelectItem value="__manual__">Other (manual)</SelectItem>
              </SelectContent>
            </Select>
            {formData.type === '__manual__' && (
              <Input className="mt-2" placeholder="Enter asset type" value={customType} onChange={(e) => setCustomType(e.target.value)} required />
            )}
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Serial Number *</FieldLabel>
            <Input value={formData.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} placeholder="SN-12345-001" required />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Manufacturer</FieldLabel>
            <Input value={formData.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)} placeholder="Dell" />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Model</FieldLabel>
            <Input value={formData.model} onChange={(e) => handleChange('model', e.target.value)} placeholder="XPS 15" />
          </FieldGroup>
          {showComputerSpecs && (
            <FieldGroup>
              <FieldLabel>Processor</FieldLabel>
              <Input
                value={formData.processor}
                onChange={(e) => handleChange('processor', e.target.value)}
                placeholder="Intel Core i7-13700H"
              />
            </FieldGroup>
          )}
          <FieldGroup>
            <FieldLabel>Status</FieldLabel>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Location</FieldLabel>
            <Input value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Office A - Desk 1" />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Cost</FieldLabel>
            <Input type="number" value={formData.cost} onChange={(e) => handleChange('cost', e.target.value)} placeholder="1500" />
          </FieldGroup>
        </div>

        {showComputerSpecs && (
          <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">RAM Slots / Modules</p>
                <p className="text-sm text-muted-foreground">Add one or more RAM sticks with capacity, DDR type, and MHz.</p>
              </div>
              <span className="text-xs rounded-full bg-primary/10 px-3 py-1 text-primary">Examples: 8 GB DDR-IV 3200 MHz</span>
            </div>
            <div className="space-y-3">
              {formData.ramModules.map((module, index) => (
                <div key={`${index}-${module.ramType}`} className="grid gap-3 rounded-xl border border-border bg-background/70 p-3 md:grid-cols-[1.2fr_0.8fr_0.5fr_auto]">
                  <FieldGroup>
                    <FieldLabel className="text-xs uppercase tracking-wide text-muted-foreground">Capacity</FieldLabel>
                    <Input value={module.capacity} onChange={(e) => updateRamModule(index, 'capacity', e.target.value)} placeholder="8 GB" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel className="text-xs uppercase tracking-wide text-muted-foreground">Type</FieldLabel>
                    <Select value={module.ramType} onValueChange={(value) => updateRamModule(index, 'ramType', value)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DDR-II">DDR-II</SelectItem>
                        <SelectItem value="DDR-III">DDR-III</SelectItem>
                        <SelectItem value="DDR-IV">DDR-IV</SelectItem>
                        <SelectItem value="DDR-V">DDR-V</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel className="text-xs uppercase tracking-wide text-muted-foreground">MHz</FieldLabel>
                    <Input value={module.ramMhz} onChange={(e) => updateRamModule(index, 'ramMhz', e.target.value)} placeholder="3200" />
                  </FieldGroup>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" className="w-full gap-2" onClick={() => removeRamModule(index)} disabled={formData.ramModules.length === 1}>
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" className="gap-2" onClick={addRamModule}>
              <Plus className="h-4 w-4" />
              Add RAM Module
            </Button>
          </div>
        )}

        {showStorageAddonField && (
          <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">HDD / SSD Add-ons</p>
                <p className="text-sm text-muted-foreground">Add one or more storage units with capacity and quantity.</p>
              </div>
              <span className="text-xs rounded-full bg-primary/10 px-3 py-1 text-primary">Examples: 1 TB 2 HDD, 512 GB 1 SSD</span>
            </div>
            <div className="space-y-3">
              {formData.storageAddons.map((addon, index) => (
                <div key={`${index}-${addon.mediaType}`} className="grid gap-3 rounded-xl border border-border bg-background/70 p-3 md:grid-cols-[1.2fr_0.8fr_0.5fr_auto]">
                  <FieldGroup>
                    <FieldLabel className="text-xs uppercase tracking-wide text-muted-foreground">Capacity</FieldLabel>
                    <Input value={addon.capacity} onChange={(e) => updateStorageAddon(index, 'capacity', e.target.value)} placeholder="1 TB" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel className="text-xs uppercase tracking-wide text-muted-foreground">Type</FieldLabel>
                    <Select value={addon.mediaType} onValueChange={(value) => updateStorageAddon(index, 'mediaType', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HDD">HDD</SelectItem>
                        <SelectItem value="SSD">SSD</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel className="text-xs uppercase tracking-wide text-muted-foreground">Qty</FieldLabel>
                    <Input type="number" min="1" value={addon.quantity} onChange={(e) => updateStorageAddon(index, 'quantity', e.target.value)} placeholder="1" />
                  </FieldGroup>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" className="w-full gap-2" onClick={() => removeStorageAddon(index)} disabled={formData.storageAddons.length === 1}>
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" className="gap-2" onClick={addStorageAddon}>
              <Plus className="h-4 w-4" />
              Add Storage Add-on
            </Button>
          </div>
        )}

        {showMiscStorage && (
          <FieldGroup>
            <FieldLabel>Storage / Capacity</FieldLabel>
            <Input value={formData.storage} onChange={(e) => handleChange('storage', e.target.value)} placeholder="2 TB, 8 GB, 24-Port" />
          </FieldGroup>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup>
            <FieldLabel>Owner</FieldLabel>
            <Input value={formData.owner} onChange={(e) => handleChange('owner', e.target.value)} placeholder="John Doe" />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Designation</FieldLabel>
            <Input value={formData.designation} onChange={(e) => handleChange('designation', e.target.value)} placeholder="e.g., Senior Designer" />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Department</FieldLabel>
            <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Vendor</FieldLabel>
            <Select value={formData.vendor} onValueChange={(value) => handleChange('vendor', value === '__blank__' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__blank__">Unknown / Blank</SelectItem>
                {resolvedVendorOptions.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Purchase Date</FieldLabel>
            <Input type="date" value={formData.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Warranty Expiry</FieldLabel>
            <Input type="date" value={formData.warrantyExpiry} onChange={(e) => handleChange('warrantyExpiry', e.target.value)} />
          </FieldGroup>
        </div>

        <FieldGroup>
          <FieldLabel>OS Installed</FieldLabel>
          <Input value={formData.osInstalled} onChange={(e) => handleChange('osInstalled', e.target.value)} placeholder="Windows 11 Pro" />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Notes</FieldLabel>
          <Textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Special instructions or remarks..." />
        </FieldGroup>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link href={cancelHref}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-primary hover:bg-primary/90">{submitLabel}</Button>
        </div>
      </form>
    </CardShell>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
      {children}
    </div>
  );
}
