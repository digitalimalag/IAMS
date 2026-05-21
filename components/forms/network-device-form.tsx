'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { mockDepartments } from '@/lib/mock-data';

export type NetworkDeviceFormValues = {
  id: string;
  deviceModel: string;
  deviceBrand: string;
  name: string;
  type: string;
  ipAddress: string;
  macAddress: string;
  location: string;
  vendor: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: 'Online' | 'Offline' | 'Error';
  firmwareVersion: string;
  department: string;
};

interface NetworkDeviceFormProps {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  initialValues?: Partial<NetworkDeviceFormValues>;
  departments?: string[];
  useDefaultDepartmentOptions?: boolean;
  onSubmit: (values: NetworkDeviceFormValues) => void;
  error?: string;
}

const DEVICE_TYPES = ['CCTV', 'Router', 'Switch', 'Access Point'];
const STATUSES: NetworkDeviceFormValues['status'][] = ['Online', 'Offline', 'Error'];
const DEFAULT_DEPARTMENTS = mockDepartments.map((dept) => dept.name);

const defaultValues: NetworkDeviceFormValues = {
  id: '',
  deviceModel: '',
  deviceBrand: '',
  name: '',
  type: '',
  ipAddress: '',
  macAddress: '',
  location: '',
  vendor: '',
  purchaseDate: '',
  warrantyExpiry: '',
  status: 'Online',
  firmwareVersion: '',
  department: '',
};

export function NetworkDeviceForm({
  title,
  description,
  submitLabel,
  cancelHref,
  initialValues,
  departments = [],
  useDefaultDepartmentOptions = true,
  onSubmit,
  error,
}: NetworkDeviceFormProps) {
  const [formData, setFormData] = useState<NetworkDeviceFormValues>(defaultValues);

  useEffect(() => {
    setFormData({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (field: keyof NetworkDeviceFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const departmentOptions = useDefaultDepartmentOptions
    ? (departments.length > 0 ? departments : DEFAULT_DEPARTMENTS)
    : departments;
  const resolvedDepartmentOptions = formData.department && !departmentOptions.includes(formData.department)
    ? [...departmentOptions, formData.department]
    : departmentOptions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldGroup>
              <FieldLabel>Device Model</FieldLabel>
              <Input value={formData.deviceModel} onChange={(e) => handleChange('deviceModel', e.target.value)} placeholder="e.g., RTX-AX3000" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Device Brand</FieldLabel>
              <Input value={formData.deviceBrand} onChange={(e) => handleChange('deviceBrand', e.target.value)} placeholder="e.g., TP-Link" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Device Name *</FieldLabel>
              <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., Main Router" required />
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
              <Input value={formData.ipAddress} onChange={(e) => handleChange('ipAddress', e.target.value)} placeholder="192.168.1.1" required />
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
              <FieldLabel>Vendor</FieldLabel>
              <Input value={formData.vendor} onChange={(e) => handleChange('vendor', e.target.value)} placeholder="e.g., Cisco / Local Vendor" />
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
              <FieldLabel>Firmware Version</FieldLabel>
              <Input value={formData.firmwareVersion} onChange={(e) => handleChange('firmwareVersion', e.target.value)} placeholder="2.1.4" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Department</FieldLabel>
              <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{resolvedDepartmentOptions.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href={cancelHref}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90">{submitLabel}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
