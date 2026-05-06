'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { useState, useEffect } from 'react';
import { Department } from '@/lib/mock-data';

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (department: any) => void;
  editingDepartment?: Department | null;
}

export function AddCompanyModal({ open, onOpenChange, onSubmit, editingDepartment }: AddCompanyModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    manager: '',
    email: '',
    phone: '',
    location: '',
  });

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        id: editingDepartment.id,
        name: editingDepartment.name,
        manager: editingDepartment.manager,
        email: editingDepartment.email,
        phone: editingDepartment.phone,
        location: editingDepartment.location,
      });
    } else {
      setFormData({
        id: '',
        name: '',
        manager: '',
        email: '',
        phone: '',
        location: '',
      });
    }
  }, [editingDepartment, open]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
          <DialogDescription>
            {editingDepartment 
              ? 'Update the department details below.' 
              : 'Create a new department to manage IT assets and devices.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Department Name */}
            <FieldGroup>
              <FieldLabel>Department Name</FieldLabel>
              <Input
                placeholder="e.g., IT Support"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </FieldGroup>

            {/* Location */}
            <FieldGroup>
              <FieldLabel>Location</FieldLabel>
              <Input
                placeholder="Building A, Floor 3"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Manager */}
            <FieldGroup>
              <FieldLabel>Manager</FieldLabel>
              <Input
                placeholder="e.g., John Doe"
                value={formData.manager}
                onChange={(e) => handleChange('manager', e.target.value)}
              />
            </FieldGroup>

            {/* Email */}
            <FieldGroup>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                placeholder="manager@company.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </FieldGroup>

            {/* Phone */}
            <FieldGroup>
              <FieldLabel>Phone</FieldLabel>
              <Input
                placeholder="+1-555-0100"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </FieldGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {editingDepartment ? 'Update Department' : 'Add Department'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
