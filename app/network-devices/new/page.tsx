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
import { NetworkDevice } from '@/lib/mock-data';

const DEVICE_STORAGE_KEY = 'it_network_devices';
const DEVICE_TYPES = ['CCTV', 'Router', 'Switch', 'Access Point'];
const STATUSES = ['Online', 'Offline', 'Error'];
const DEPARTMENTS = ['IT Support', 'Infrastructure', 'Design', 'Operations', 'Security'];

export default function NewNetworkDevicePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    ipAddress: '',
    macAddress: '',
    location: '',
    status: 'Online',
    firmwareVersion: '',
    department: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!stored) return;
    // no-op: page just creates new items, but keeps storage warm if needed
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.type || !formData.ipAddress) {
      setError('Please fill the required fields.');
      return;
    }

    const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
    const existingDevices: NetworkDevice[] = stored ? JSON.parse(stored) : [];

    const newDevice: NetworkDevice = {
      id: `NET-${Date.now()}`,
      name: formData.name,
      type: formData.type as NetworkDevice['type'],
      ipAddress: formData.ipAddress,
      macAddress: formData.macAddress,
      location: formData.location,
      status: formData.status as NetworkDevice['status'],
      lastSeen: new Date().toISOString(),
      firmwareVersion: formData.firmwareVersion,
      department: formData.department,
    };

    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify([...existingDevices, newDevice]));
    router.push('/network-devices');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add New Device</h1>
              <p className="text-muted-foreground mt-2">Create a new network device record and return to the list after saving.</p>
            </div>
            <Link href="/network-devices">
              <Button variant="outline">Back to Devices</Button>
            </Link>
          </div>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Device Details</CardTitle>
              <CardDescription>Enter the information for this network device.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel>Device Name *</FieldLabel>
                    <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Main Router" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Device Type *</FieldLabel>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>{DEVICE_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>IP Address *</FieldLabel>
                    <Input value={formData.ipAddress} onChange={(e) => handleChange('ipAddress', e.target.value)} placeholder="192.168.1.1" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>MAC Address</FieldLabel>
                    <Input value={formData.macAddress} onChange={(e) => handleChange('macAddress', e.target.value)} placeholder="00:1A:2B:3C:4D:5E" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Location</FieldLabel>
                    <Input value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Server Room" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Firmware Version</FieldLabel>
                    <Input value={formData.firmwareVersion} onChange={(e) => handleChange('firmwareVersion', e.target.value)} placeholder="2.1.4" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Department</FieldLabel>
                    <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>{DEPARTMENTS.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldGroup>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end gap-3">
                  <Link href="/network-devices">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Save Device</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
