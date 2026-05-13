'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Asset } from '@/lib/mock-data';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';

const ASSET_STORAGE_KEY = 'it_assets';
const ASSET_TYPES = [
  'Desktop', 'Laptop', 'Server', 'Printer', 'Monitor', 'Router', 'Switch',
  'USB HDD/SSD', 'UPS', 'TV', 'Network Rack', 'Power Cable', 'VGA Cable',
  'HDMI Cable', 'D to HDMI Cable', 'USB Keyboard', 'WL Keyboard', 'USB Mouse', 'WL Mouse',
];
const STATUSES = ['Active', 'Inactive', 'Maintenance', 'Retired'];
const DEPARTMENTS = ['IT Support', 'Infrastructure', 'Design', 'Operations', 'Security'];

export default function NewAssetPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');
  const plan = normalizePlan(session?.plan);
  const planConfig = getPlanConfig(plan);
  const assetLimit = Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : Number.POSITIVE_INFINITY;
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    designation: '',
    processor: '',
    ram: '',
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
  });
  const showComputerSpecs = ['Desktop', 'Laptop', 'Server'].includes(formData.type);
  const showStorageField = formData.type === 'USB HDD/SSD';

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        setSession(JSON.parse(sessionStr));
      } catch {
        setSession(null);
      }
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.type || !formData.serialNumber || !formData.assetTag) {
      setError('Please fill the required fields.');
      return;
    }

    const storedAssets = localStorage.getItem(ASSET_STORAGE_KEY);
    const existingAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : [];

    if (existingAssets.length >= assetLimit) {
      setError('Free plan allows only 5 assets. Please upgrade your plan to add more.');
      return;
    }

    const newAsset: Asset = {
      id: `AST-${Date.now()}`,
      name: formData.name,
      type: formData.type as Asset['type'],
      serialNumber: formData.serialNumber,
      manufacturer: formData.manufacturer,
      model: formData.model,
      designation: formData.designation,
      processor: showComputerSpecs ? formData.processor || undefined : undefined,
      ram: showComputerSpecs ? formData.ram || undefined : undefined,
      storage: showComputerSpecs || showStorageField ? formData.storage || undefined : undefined,
      osInstalled: showComputerSpecs ? formData.osInstalled || undefined : undefined,
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      warrantyExpiry: formData.warrantyExpiry || new Date().toISOString().split('T')[0],
      status: formData.status as Asset['status'],
      location: formData.location,
      owner: formData.owner,
      assetTag: formData.assetTag,
      department: formData.department,
      cost: parseFloat(formData.cost) || 0,
      notes: formData.notes || '',
      assignedToUserId: session?.userId,
    };

    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify([...existingAssets, newAsset]));
    router.push('/assets');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add New Asset</h1>
              <p className="text-muted-foreground mt-2">Create a new asset record and return to the inventory list after saving.</p>
            </div>
            <Link href="/assets">
              <Button variant="outline">Back to Assets</Button>
            </Link>
          </div>

          {Number.isFinite(assetLimit) && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <p className="font-medium text-emerald-900">Current plan limit</p>
                <p className="text-sm text-emerald-700">You can add up to {assetLimit} assets on the current plan.</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
              <CardDescription>Enter the information for this asset.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel>Asset Tag *</FieldLabel>
                    <Input value={formData.assetTag} onChange={(e) => handleChange('assetTag', e.target.value)} placeholder="IT-2024-001" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Asset Name *</FieldLabel>
                    <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="John's Laptop" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Type *</FieldLabel>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>{ASSET_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Serial Number *</FieldLabel>
                    <Input value={formData.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} placeholder="SN-12345-001" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Manufacturer</FieldLabel>
                    <Input value={formData.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)} placeholder="Dell" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Model</FieldLabel>
                    <Input value={formData.model} onChange={(e) => handleChange('model', e.target.value)} placeholder="XPS 15" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Designation</FieldLabel>
                    <Input value={formData.designation} onChange={(e) => handleChange('designation', e.target.value)} placeholder="e.g., Senior Designer" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Purchase Date</FieldLabel>
                    <Input type="date" value={formData.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Warranty Expiry</FieldLabel>
                    <Input type="date" value={formData.warrantyExpiry} onChange={(e) => handleChange('warrantyExpiry', e.target.value)} />
                  </FieldGroup>
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
                    <FieldLabel>Owner</FieldLabel>
                    <Input value={formData.owner} onChange={(e) => handleChange('owner', e.target.value)} placeholder="John Doe" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Department</FieldLabel>
                    <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>{DEPARTMENTS.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Cost</FieldLabel>
                    <Input type="number" value={formData.cost} onChange={(e) => handleChange('cost', e.target.value)} placeholder="1500" />
                  </FieldGroup>
                </div>

                {showComputerSpecs && (
                  <>
                    <FieldGroup>
                      <FieldLabel>Processor</FieldLabel>
                      <Input value={formData.processor} onChange={(e) => handleChange('processor', e.target.value)} placeholder="Intel Core i7" />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>RAM / Storage / OS</FieldLabel>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input value={formData.ram} onChange={(e) => handleChange('ram', e.target.value)} placeholder="16 GB" />
                        <Input value={formData.storage} onChange={(e) => handleChange('storage', e.target.value)} placeholder="512 GB SSD" />
                        <Input value={formData.osInstalled} onChange={(e) => handleChange('osInstalled', e.target.value)} placeholder="Windows 11 Pro" />
                      </div>
                    </FieldGroup>
                  </>
                )}

                {!showComputerSpecs && showStorageField && (
                  <FieldGroup>
                    <FieldLabel>HDD/SSD</FieldLabel>
                    <Input value={formData.storage} onChange={(e) => handleChange('storage', e.target.value)} placeholder="512 GB SSD" />
                  </FieldGroup>
                )}

                <FieldGroup>
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Special instructions or remarks..." />
                </FieldGroup>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end gap-3">
                  <Link href="/assets">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Save Asset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
