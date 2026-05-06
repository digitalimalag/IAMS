'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { mockNetworkDevices } from '@/lib/mock-data';
import { NetworkDeviceTable } from '@/components/tables/network-device-table';
import { AddNetworkDeviceModal } from '@/components/modals/add-network-device-modal';
import { ExportButtons } from '@/components/export-buttons';

const DEVICE_STORAGE_KEY = 'it_network_devices';

export default function NetworkDevicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [devices, setDevices] = useState(mockNetworkDevices);

  useEffect(() => {
    const storedDevices = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!storedDevices) return;
    try {
      setDevices(JSON.parse(storedDevices));
    } catch {
      setDevices(mockNetworkDevices);
    }
  }, []);

  const persistDevices = (nextDevices: any[]) => {
    setDevices(nextDevices);
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(nextDevices));
  };

  const handleDeviceSubmit = (device: any) => {
    if (editingDevice) {
      persistDevices(devices.map(d => d.id === device.id ? device : d));
      setEditingDevice(null);
    } else {
      const newDevice = {
        ...device,
        id: `NET-${Date.now()}`,
        lastSeen: new Date().toISOString(),
      };
      persistDevices([...devices, newDevice]);
    }
  };

  const handleDeleteDevice = (id: string) => {
    persistDevices(devices.filter(d => d.id !== id));
  };

  // Filter devices
  const filteredDevices = devices.filter((device) => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ipAddress.includes(searchTerm) ||
      device.macAddress.includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || device.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || device.department === departmentFilter;

    return matchesSearch && matchesType && matchesStatus && matchesDepartment;
  });

  const uniqueTypes = Array.from(new Set(devices.map(d => d.type)));
  const uniqueStatuses = Array.from(new Set(devices.map(d => d.status)));
  const uniqueDepartments = Array.from(new Set(devices.map(d => d.department)));

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
                {filteredDevices.length} of {devices.length} devices
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
              onEdit={(device) => {
                setEditingDevice(device);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteDevice}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Device Modal */}
      <AddNetworkDeviceModal 
        open={isAddModalOpen} 
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingDevice(null);
        }}
        onSubmit={handleDeviceSubmit}
        editingDevice={editingDevice}
      />
    </DashboardLayout>
  );
}
