'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Download } from 'lucide-react';
import { mockAssets } from '@/lib/mock-data';
import { AssetTable } from '@/components/tables/asset-table';
import { AddAssetModal } from '@/components/modals/add-asset-modal';
import { ExportButtons } from '@/components/export-buttons';
import type { Session } from '@/lib/auth';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';

const ASSET_STORAGE_KEY = 'it_assets';

export default function AssetsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [assets, setAssets] = useState(mockAssets);
  const plan = normalizePlan(session?.plan);
  const planConfig = getPlanConfig(plan);
  const assetLimit = Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : Number.POSITIVE_INFINITY;
  const canAddMoreAssets = assets.length < assetLimit;

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
    if (storedAssets) {
      try {
        setAssets(JSON.parse(storedAssets));
      } catch {
        setAssets(mockAssets);
      }
    }
  }, []);

  const persistAssets = (nextAssets: any[]) => {
    setAssets(nextAssets);
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(nextAssets));
  };

  const visibleAssets = useMemo(() => {
    if (!session) return assets;
    if (session.role === 'employee') {
      return assets.filter(a => a.assignedToUserId === session.userId);
    }
    return assets;
  }, [assets, session]);

  const handleAssetSubmit = (asset: any) => {
    if (editingAsset) {
      // Update existing asset
      persistAssets(assets.map(a => a.id === asset.id ? asset : a));
      setEditingAsset(null);
    } else {
      // Add new asset
      const newAsset = {
        ...asset,
        id: `AST-${Date.now()}`,
      };
      persistAssets([...assets, newAsset]);
    }
  };

  const handleDeleteAsset = (id: string) => {
    persistAssets(assets.filter(a => a.id !== id));
  };

  // Filter assets based on current filters
  const filteredAssets = visibleAssets.filter((asset) => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || asset.department === departmentFilter;

    return matchesSearch && matchesType && matchesStatus && matchesDepartment;
  });

  const uniqueTypes = Array.from(new Set(visibleAssets.map(a => a.type)));
  const uniqueStatuses = Array.from(new Set(visibleAssets.map(a => a.status)));
  const uniqueDepartments = Array.from(new Set(visibleAssets.map(a => a.department)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
            <p className="text-muted-foreground mt-2">Manage your complete IT asset inventory</p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
            {session?.role !== 'employee' && (
              <>
                <ExportButtons data={filteredAssets} type="assets" />
                <Link href={canAddMoreAssets ? '/assets/new' : '/billing'}>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    {canAddMoreAssets ? 'Add Asset' : 'Upgrade Plan'}
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="hidden lg:block" />
        </div>

        {!canAddMoreAssets && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-emerald-900">Free plan limit reached</p>
                <p className="text-sm text-emerald-700">
                  Free plan allows only 5 assets. Upgrade to add more devices and unlock paid billing.
                </p>
              </div>
              <Link href="/billing">
                <Button className="bg-slate-900 text-white hover:bg-slate-800">Go to Billing</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter your assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, tag, or serial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Results */}
              <div className="flex items-center justify-end text-sm text-muted-foreground">
                {filteredAssets.length} of {visibleAssets.length} assets
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Assets</CardTitle>
            <CardDescription>Complete inventory of all managed assets</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetTable 
              assets={filteredAssets} 
              onEdit={(asset) => {
                setEditingAsset(asset);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteAsset}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Asset Modal */}
      {session?.role !== 'employee' && (
        <AddAssetModal 
          open={isAddModalOpen} 
          onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) setEditingAsset(null);
          }}
          onSubmit={handleAssetSubmit}
          editingAsset={editingAsset}
        />
      )}
    </DashboardLayout>
  );
}
