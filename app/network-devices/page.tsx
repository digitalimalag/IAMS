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
import { Plus, Search, RefreshCw } from 'lucide-react';
import { mockNetworkDevices, type NetworkDevice } from '@/lib/mock-data';
import { NetworkDeviceTable } from '@/components/tables/network-device-table';
import { ExportButtons } from '@/components/export-buttons';
import type { Session } from '@/lib/auth';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { writeAuditLog } from '@/lib/audit';
import { readTenantJson, writeTenantJson } from '@/lib/tenant-storage';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { readStoredSession } from '@/lib/licenses';
import {
  canUseNetworkDeviceSupabase,
  getNetworkDeviceOrganizationId,
  getSupabaseNetworkDevicesClient,
  networkDeviceRowToRecord,
  NETWORK_DEVICE_STORAGE_KEY,
} from '@/lib/network-devices';

export default function NetworkDevicesPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [devices, setDevices] = useState<NetworkDevice[]>(isSupabaseConfigured() ? [] : mockNetworkDevices);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const currentSession = readStoredSession();
    setSession(currentSession);

    const loadDevices = async () => {
      if (canUseNetworkDeviceSupabase(currentSession)) {
        try {
          const supabase = getSupabaseNetworkDevicesClient();
          const orgId = getNetworkDeviceOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('network_devices')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            setDevices(data.map((row: any) => networkDeviceRowToRecord(row)));
            return;
          }
        } catch {
          setDevices([]);
          return;
        }

        setDevices([]);
        return;
      }

      if (isSupabaseConfigured()) {
        setDevices([]);
        return;
      }

      const scopedDevices = readTenantJson<any[]>(NETWORK_DEVICE_STORAGE_KEY, currentSession, []);
      if (scopedDevices.length > 0) {
        setDevices(scopedDevices);
        return;
      }

      setDevices(mockNetworkDevices);
    };

    void loadDevices();
  }, []);

  const persistDevices = (nextDevices: any[]) => {
    setDevices(nextDevices);
    if (!isSupabaseConfigured()) {
      writeTenantJson(NETWORK_DEVICE_STORAGE_KEY, session, nextDevices);
    }
  };

  const handleDeleteDevice = (id: string) => {
    const device = devices.find((item) => item.id === id) || null;
    setDeleteTarget(device);
    setDeleteConfirmation('');
    setDeleteReason('');
    setDeleteError('');
  };

  const confirmDeleteDevice = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmation.trim().toLowerCase() !== deleteTarget.name.trim().toLowerCase()) {
      setDeleteError('Please type the exact Device Name to confirm deletion.');
      return;
    }
    if (!deleteReason.trim()) {
      setDeleteError('Please enter a delete reason before approving.');
      return;
    }

    setDeleteError('');
    persistDevices(devices.filter((device) => device.id !== deleteTarget.id));
    await writeAuditLog(session, 'delete_network_device', 'network_device', deleteTarget.id, {
      deviceName: deleteTarget.name,
      deviceModel: deleteTarget.deviceModel || '',
      deviceBrand: deleteTarget.deviceBrand || '',
      reason: deleteReason.trim(),
    });

    if (canUseNetworkDeviceSupabase(session)) {
      try {
        const supabase = createSupabaseBrowserClient();
        const orgId = getNetworkDeviceOrganizationId(session);
        await supabase.from('network_devices').delete().eq('id', deleteTarget.id).eq('organization_id', orgId);
      } catch {
        // local state already updated
      }
    }
    setDeleteTarget(null);
    setDeleteConfirmation('');
    setDeleteReason('');
  };

  const visibleDevices = useMemo(() => {
    if (!session || session.role !== 'employee') return devices;
    return devices.filter((device) => {
      const deptMatch = device.department.toLowerCase() === session.department.toLowerCase();
      const assigneeMatch = device.assignedToUserId === session.userId;
      return deptMatch || assigneeMatch;
    });
  }, [devices, session]);

  // Filter devices
  const filteredDevices = visibleDevices.filter((device) => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ipAddress.includes(searchTerm) ||
      device.macAddress.includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || device.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || device.department === departmentFilter;

    return matchesSearch && matchesType && matchesStatus && matchesDepartment;
  });

  const uniqueTypes = Array.from(new Set(visibleDevices.map(d => d.type)));
  const uniqueStatuses = Array.from(new Set(visibleDevices.map(d => d.status)));
  const uniqueDepartments = Array.from(new Set(visibleDevices.map(d => d.department)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Network Devices</h1>
            <p className="text-muted-foreground mt-2">Manage CCTV, routers, switches, and access points</p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
            <ExportButtons data={filteredDevices} type="devices" />
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Link href="/network-devices/new">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Add Device
              </Button>
            </Link>
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Filters */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter your network devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, IP, or MAC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Device Type" />
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
                {filteredDevices.length} of {visibleDevices.length} devices
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Devices Table */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Network Devices</CardTitle>
            <CardDescription>Complete list of network devices and monitoring systems</CardDescription>
          </CardHeader>
          <CardContent>
            <NetworkDeviceTable 
              devices={filteredDevices}
              onEdit={(device) => router.push(`/network-devices/edit/${device.id}`)}
              onDelete={handleDeleteDevice}
            />
          </CardContent>
        </Card>

        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
              setDeleteConfirmation('');
              setDeleteReason('');
              setDeleteError('');
            }
          }}
          title="Delete Network Device?"
          description={
            <>
              This will permanently remove <strong>{deleteTarget?.name}</strong> from the network device list.
            </>
          }
          confirmationLabel="Device Name"
          confirmationValue={deleteConfirmation}
          onConfirmationValueChange={setDeleteConfirmation}
          reason={deleteReason}
          onReasonChange={setDeleteReason}
          onConfirm={confirmDeleteDevice}
          error={deleteError}
          confirmLabel="Delete Device"
          confirmDisabled={
            !deleteTarget ||
            deleteConfirmation.trim().toLowerCase() !== deleteTarget.name.trim().toLowerCase() ||
            !deleteReason.trim()
          }
        />
      </div>
    </DashboardLayout>
  );
}
