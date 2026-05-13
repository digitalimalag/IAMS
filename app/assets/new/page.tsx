'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent } from '@/components/ui/card';
import { AssetForm, type AssetFormValues } from '@/components/forms/asset-form';
import { mockAssets } from '@/lib/mock-data';
import type { Asset } from '@/lib/mock-data';
import type { Session } from '@/lib/auth';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';

const ASSET_STORAGE_KEY = 'it_assets';

export default function NewAssetPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const plan = normalizePlan(session?.plan);
  const planConfig = getPlanConfig(plan);
  const assetLimit = Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : Number.POSITIVE_INFINITY;

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

  const handleSubmit = (values: AssetFormValues) => {
    setError('');

    if (!values.name || !values.type || !values.serialNumber || !values.assetTag) {
      setError('Please fill the required fields.');
      return;
    }

    const storedAssets = localStorage.getItem(ASSET_STORAGE_KEY);
    const existingAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : mockAssets;

    if (existingAssets.length >= assetLimit) {
      setError('Free plan allows only 5 assets. Please upgrade your plan to add more.');
      return;
    }

    const newAsset: Asset = {
      id: `AST-${Date.now()}`,
      name: values.name,
      type: values.type as Asset['type'],
      serialNumber: values.serialNumber,
      manufacturer: values.manufacturer,
      model: values.model,
      vendor: values.vendor || '',
      designation: values.designation,
      processor: values.processor || undefined,
      ram: values.ram || undefined,
      ramType: values.ramType || undefined,
      ramMhz: values.ramMhz || undefined,
      ramModules: values.ramModules
        .map((module) => ({
          capacity: module.capacity.trim(),
          ramType: module.ramType || 'DDR-IV',
          ramMhz: module.ramMhz.trim(),
        }))
        .filter((module) => module.capacity),
      storage: values.storage || undefined,
      storageAddons: values.storageAddons
        .map((addon) => ({
          capacity: addon.capacity.trim(),
          mediaType: addon.mediaType,
          quantity: Number(addon.quantity || '1') || 1,
        }))
        .filter((addon) => addon.capacity),
      osInstalled: values.osInstalled || undefined,
      purchaseDate: values.purchaseDate || new Date().toISOString().split('T')[0],
      warrantyExpiry: values.warrantyExpiry || new Date().toISOString().split('T')[0],
      status: values.status as Asset['status'],
      location: values.location,
      owner: values.owner,
      assetTag: values.assetTag,
      department: values.department,
      cost: Number(values.cost) || 0,
      notes: values.notes || '',
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
          </div>

          {Number.isFinite(assetLimit) && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <p className="font-medium text-emerald-900">Current plan limit</p>
                <p className="text-sm text-emerald-700">You can add up to {assetLimit} assets on the current plan.</p>
              </CardContent>
            </Card>
          )}

          <AssetForm
            title="Asset Details"
            description="Enter the information for this asset."
            submitLabel="Save Asset"
            cancelHref="/assets"
            error={error}
            onSubmit={handleSubmit}
          />
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
