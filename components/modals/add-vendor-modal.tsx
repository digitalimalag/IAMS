'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { useState, useEffect } from 'react';
import { Vendor } from '@/lib/mock-data';

export function AddVendorModal({ open, onOpenChange, onSubmit, editingVendor }: any) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    address: '',
    gst: '',
    contact: '',
    bankDetails: '',
  });

  useEffect(() => {
    if (editingVendor) {
      setForm(editingVendor);
    }
  }, [editingVendor]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <FieldLabel>Vendor Name</FieldLabel>
            <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Address</FieldLabel>
            <Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>GST</FieldLabel>
            <Input value={form.gst} onChange={(e) => handleChange('gst', e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Contact</FieldLabel>
            <Input value={form.contact} onChange={(e) => handleChange('contact', e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Bank Details</FieldLabel>
            <Input value={form.bankDetails} onChange={(e) => handleChange('bankDetails', e.target.value)} />
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editingVendor ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}