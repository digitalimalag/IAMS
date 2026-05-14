'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import type { Asset } from '@/lib/mock-data';
import { AssetTable } from '@/components/tables/asset-table';
import { TransferAssetModal, type AssetTransferRecord } from '@/components/modals/transfer-asset-modal';
import { ExportButtons } from '@/components/export-buttons';
import type { Session } from '@/lib/auth';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';
import { 
  ASSET_STORAGE_KEY,
  assetDbRowToRecord,
  canUseAssetSupabase,
  getAssetOrganizationId,
  getAssetSupabaseClient,
  normalizeAssetRecord,
} from '@/lib/assets';

const ASSET_TRANSFER_HISTORY_KEY = 'asset_transfer_history';

export default function AssetsPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [transferAsset, setTransferAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState(mockAssets);
  const [transferHistory, setTransferHistory] = useState<AssetTransferRecord[]>([]);
  const plan = normalizePlan(session?.plan);
  const planConfig = getPlanConfig(plan);
  const assetLimit = Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : Number.POSITIVE_INFINITY;
  const canAddMoreAssets = assets.length < assetLimit;

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    const currentSession = sessionStr ? (() => {
      try {
        return JSON.parse(sessionStr) as Session;
      } catch {
        return null;
      }
    })() : null;
    setSession(currentSession);

    const loadAssets = async () => {
      if (canUseAssetSupabase(currentSession)) {
        try {
          const supabase = getAssetSupabaseClient();
          const orgId = getAssetOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('assets')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data) && data.length > 0) {
            setAssets(data.map((row) => assetDbRowToRecord(row)));
            return;
          }
        } catch {
          // Fallback below
        }
      }

      const storedAssets = localStorage.getItem(ASSET_STORAGE_KEY);
      if (storedAssets) {
        try {
          setAssets((JSON.parse(storedAssets) as Asset[]).map((asset) => normalizeAssetRecord(asset)));
          return;
        } catch {
          setAssets(mockAssets.map((asset) => normalizeAssetRecord(asset)));
          return;
        }
      }

      setAssets(mockAssets.map((asset) => normalizeAssetRecord(asset)));
    };

    void loadAssets();

    const storedHistory = localStorage.getItem(ASSET_TRANSFER_HISTORY_KEY);
    if (storedHistory) {
      try {
        setTransferHistory(JSON.parse(storedHistory));
      } catch {
        setTransferHistory([]);
      }
    }
  }, []);

  const persistAssets = (nextAssets: any[]) => {
    setAssets(nextAssets);
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(nextAssets));
  };

  const persistTransferHistory = (nextHistory: AssetTransferRecord[]) => {
    setTransferHistory(nextHistory);
    localStorage.setItem(ASSET_TRANSFER_HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const visibleAssets = useMemo(() => {
    if (!session) return assets;
    if (session.role === 'employee') {
      return assets.filter(a => a.assignedToUserId === session.userId);
    }
    return assets;
  }, [assets, session]);

  const handleDeleteAsset = async (id: string) => {
    if (canUseAssetSupabase(session)) {
      try {
        const supabase = getAssetSupabaseClient();
        const orgId = getAssetOrganizationId(session);
        const { error } = await supabase.from('assets').delete().eq('id', id).eq('organization_id', orgId);
        if (error) return;
      } catch {
        // Fallback below
      }
    }
    persistAssets(assets.filter(a => a.id !== id));
  };

  const handleTransferAsset = async (record: AssetTransferRecord) => {
    const asset = assets.find((a) => a.id === record.assetId);
    if (!asset) return;

    const nextAsset = {
      ...asset,
      owner: record.toValue,
      department: record.toType === 'department' ? record.toValue : asset.department,
      assignedToUserId: record.toType === 'employee' ? undefined : asset.assignedToUserId,
    };

    if (canUseAssetSupabase(session)) {
      try {
        const supabase = getAssetSupabaseClient();
        const orgId = getAssetOrganizationId(session);
        await supabase
          .from('assets')
          .update({
            owner: nextAsset.owner,
            department: nextAsset.department,
            assigned_to_profile_id: nextAsset.assignedToUserId || null,
          })
          .eq('id', asset.id)
          .eq('organization_id', orgId);
      } catch {
        // Keep local fallback below.
      }
    }

    persistAssets(assets.map((a) => (a.id === asset.id ? nextAsset : a)));
    persistTransferHistory([record, ...transferHistory]);
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
              onEdit={(asset) => router.push(`/assets/edit/${asset.id}`)}
              onTransfer={(asset) => setTransferAsset(asset)}
              onDelete={handleDeleteAsset}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Asset Transfer Chain</CardTitle>
            <CardDescription>Track where each asset tag moved over time with dates and reasons.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transferHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transfer records yet.</p>
              ) : (
                transferHistory.slice(0, 8).map((record) => (
                  <div key={record.id} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">{record.assetTag} - {record.assetName}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.fromType === 'employee' ? 'Employee' : 'Department'}: {record.fromValue}
                          {' '}→{' '}
                          {record.toType === 'employee' ? 'Employee' : 'Department'}: {record.toValue}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.transferDate}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Reason: {record.reason}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {session?.role !== 'employee' && (
        <TransferAssetModal
          open={Boolean(transferAsset)}
          onOpenChange={(open) => {
            if (!open) setTransferAsset(null);
          }}
          asset={transferAsset}
          onSubmit={handleTransferAsset}
        />
      )}
    </DashboardLayout>
  );
}
