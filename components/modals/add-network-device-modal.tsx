'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { useState, useEffect } from 'react';
import { NetworkDevice } from '@/lib/mock-data';

interface AddNetworkDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (device: any) => void;
  editingDevice?: NetworkDevice | null;
}

const DEVICE_TYPES = ['CCTV', 'Router', 'Switch', 'Access Point'];
const STATUSES = ['Online', 'Offline', 'Error'];
const DEPARTMENTS = ['IT Support', 'Infrastructure', 'Design', 'Operations', 'Security'];

export function AddNetworkDeviceModal({ open, onOpenChange, onSubmit, editingDevice }: AddNetworkDeviceModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    ipAddress: '',
    macAddress: '',
    location: '',
    status: 'Online' as any,
    firmwareVersion: '',
    department: '',
  });

  useEffect(() => {
    if (editingDevice) {
      setFormData({
        id: editingDevice.id,
        name: editingDevice.name,
        type: editingDevice.type,
        ipAddress: editingDevice.ipAddress,
        macAddress: editingDevice.macAddress,
        location: editingDevice.location,
        status: editingDevice.status,
        firmwareVersion: editingDevice.firmwareVersion,
        department: editingDevice.department,
      });
    } else {
      setFormData({
        id: '',
        name: '',
        type: '',
        ipAddress: '',
        macAddress: '',
        location: '',
        status: 'Online',
        firmwareVersion: '',
        department: '',
      });
    }
  }, [editingDevice, open]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingDevice ? 'Edit Network Device' : 'Add Network Device'}</DialogTitle>
          <DialogDescription>
            {editingDevice 
              ? 'Update the network device details below.' 
              : 'Register a new network device to your system for monitoring and management.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <FieldGroup>
              <FieldLabel>Device Name</FieldLabel>
              <Input
                placeholder="e.g., Main Router"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </FieldGroup>

            {/* Type */}
            <FieldGroup>
              <FieldLabel>Device Type</FieldLabel>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            {/* IP Address */}
            <FieldGroup>
              <FieldLabel>IP Address</FieldLabel>
              <Input
                placeholder="e.g., 192.168.1.1"
                value={formData.ipAddress}
                onChange={(e) => handleChange('ipAddress', e.target.value)}
                required
              />
            </FieldGroup>

            {/* MAC Address */}
            <FieldGroup>
              <FieldLabel>MAC Address</FieldLabel>
              <Input
                placeholder="e.g., 00:1A:2B:3C:4D:5E"
                value={formData.macAddress}
                onChange={(e) => handleChange('macAddress', e.target.value)}
              />
            </FieldGroup>

            {/* Location */}
            <FieldGroup>
              <FieldLabel>Location</FieldLabel>
              <Input
                placeholder="e.g., Server Room"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </FieldGroup>

            {/* Status */}
            <FieldGroup>
              <FieldLabel>Status</FieldLabel>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            {/* Firmware Version */}
            <FieldGroup>
              <FieldLabel>Firmware Version</FieldLabel>
              <Input
                placeholder="e.g., 2.1.4"
                value={formData.firmwareVersion}
                onChange={(e) => handleChange('firmwareVersion', e.target.value)}
              />
            </FieldGroup>

            {/* Department */}
            <FieldGroup>
              <FieldLabel>Department</FieldLabel>
              <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {editingDevice ? 'Update Device' : 'Add Device'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
