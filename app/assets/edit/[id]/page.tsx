'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent } from '@/components/ui/card';
import { AssetForm, type AssetFormValues } from '@/components/forms/asset-form';
import { mockAssets } from '@/lib/mock-data';
import type { Asset } from '@/lib/mock-data';
import type { Session } from '@/lib/auth';

const ASSET_STORAGE_KEY = 'it_assets';

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const assetId = params.id;
  const [session, setSession] = useState<Session | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        setSession(JSON.parse(sessionStr));
      } catch {
        setSession(null);
      }
    }

    const storedAssets = localStorage.getItem(ASSET_STORAGE_KEY);
    const existingAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : mockAssets;
    setAsset(existingAssets.find((item) => item.id === assetId) || null);
  }, [assetId]);

  const initialValues = useMemo<Partial<AssetFormValues> | undefined>(() => {
    if (!asset) return undefined;
    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      serialNumber: asset.serialNumber,
      manufacturer: asset.manufacturer,
      model: asset.model,
      designation: asset.designation || '',
      processor: asset.processor || '',
      ram: asset.ram || '',
      ramType: asset.ramType || '',
      ramMhz: asset.ramMhz || '',
      ramModules: Array.isArray(asset.ramModules) && asset.ramModules.length > 0
        ? asset.ramModules.map((module) => ({
            capacity: module.capacity,
            ramType: module.ramType,
            ramMhz: module.ramMhz,
          }))
        : undefined,
      storage: asset.storage || '',
      storageAddons: Array.isArray(asset.storageAddons) && asset.storageAddons.length > 0
        ? asset.storageAddons.map((addon) => ({
            capacity: addon.capacity,
            mediaType: addon.mediaType,
            quantity: String(addon.quantity),
          }))
        : undefined,
      osInstalled: asset.osInstalled || '',
      purchaseDate: asset.purchaseDate,
      warrantyExpiry: asset.warrantyExpiry,
      status: asset.status,
      location: asset.location,
      owner: asset.owner,
      assetTag: asset.assetTag,
      department: asset.department,
      cost: String(asset.cost),
      notes: asset.notes,
    };
  }, [asset]);

  const handleSubmit = (values: AssetFormValues) => {
    setError('');
    if (!asset) {
      setError('Asset not found.');
      return;
    }

    const storedAssets = localStorage.getItem(ASSET_STORAGE_KEY);
    const existingAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : mockAssets;

    const updatedAsset: Asset = {
      ...asset,
      name: values.name,
      type: values.type as Asset['type'],
      serialNumber: values.serialNumber,
      manufacturer: values.manufacturer,
      model: values.model,
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
      purchaseDate: values.purchaseDate,
      warrantyExpiry: values.warrantyExpiry,
      status: values.status as Asset['status'],
      location: values.location,
      owner: values.owner,
      assetTag: values.assetTag,
      department: values.department,
      cost: Number(values.cost) || 0,
      notes: values.notes || '',
    };

    localStorage.setItem(
      ASSET_STORAGE_KEY,
      JSON.stringify(existingAssets.map((item) => (item.id === asset.id ? updatedAsset : item)))
    );
    router.push('/assets');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Asset</h1>
              <p className="text-muted-foreground mt-2">Update asset details on a full page so all storage and specs stay visible.</p>
            </div>
          </div>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <p className="font-medium text-amber-900">Tip</p>
              <p className="text-sm text-amber-700">First select your assets type then Use the storage add-ons section for entries like 1 TB 2 HDD or 512 GB 1 SSD.</p>
            </CardContent>
          </Card>

          {asset ? (
            <AssetForm
              title="Asset Details"
              description="Update the asset information below."
              submitLabel="Update Asset"
              cancelHref="/assets"
              initialValues={initialValues}
              error={error}
              onSubmit={handleSubmit}
            />
          ) : (
            <Card className="bg-card border-border/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Loading asset...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
