'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';

export type LicenseFormValues = {
  id: string;
  licenseType: 'OS' | 'Software' | 'Firewall' | 'Other';
  licenseOf: string;
  serialNumber: string;
  productKey: string;
  purchasedDate: string;
  expiryDate: string;
  purchasedFrom: 'Vendor' | 'Online';
  contactPerson: string;
  contactNumber: string;
  website: string;
  address: string;
  vendorName: string;
  notes: string;
};

interface LicenseFormProps {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  initialValues?: Partial<LicenseFormValues>;
  onSubmit: (values: LicenseFormValues) => void | Promise<void>;
  error?: string;
}

const defaultValues: LicenseFormValues = {
  id: '',
  licenseType: 'Software',
  licenseOf: '',
  serialNumber: '',
  productKey: '',
  purchasedDate: '',
  expiryDate: '',
  purchasedFrom: 'Vendor',
  contactPerson: '',
  contactNumber: '',
  website: '',
  address: '',
  vendorName: '',
  notes: '',
};

export function LicenseForm({ title, description, submitLabel, cancelHref, initialValues, onSubmit, error }: LicenseFormProps) {
  const [formData, setFormData] = useState<LicenseFormValues>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (field: keyof LicenseFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <FieldLabel>License Type</FieldLabel>
              <Select value={formData.licenseType} onValueChange={(value) => handleChange('licenseType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OS">OS</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Firewall">Firewall</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>License Of *</FieldLabel>
              <Input value={formData.licenseOf} onChange={(e) => handleChange('licenseOf', e.target.value)} placeholder="Windows 11 Pro / Adobe / Fortinet..." required />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Serial Number *</FieldLabel>
              <Input value={formData.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} placeholder="LIC-2024-001" required />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Product Key</FieldLabel>
              <Input value={formData.productKey} onChange={(e) => handleChange('productKey', e.target.value)} placeholder="XXXXX-XXXXX-XXXXX-XXXXX" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Purchased From</FieldLabel>
              <Select value={formData.purchasedFrom} onValueChange={(value) => handleChange('purchasedFrom', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Purchased Date</FieldLabel>
              <Input type="date" value={formData.purchasedDate} onChange={(e) => handleChange('purchasedDate', e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Expiry Date</FieldLabel>
              <Input type="date" value={formData.expiryDate} onChange={(e) => handleChange('expiryDate', e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Contact Person</FieldLabel>
              <Input value={formData.contactPerson} onChange={(e) => handleChange('contactPerson', e.target.value)} placeholder="Name of contact person" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Contact Number</FieldLabel>
              <Input value={formData.contactNumber} onChange={(e) => handleChange('contactNumber', e.target.value)} placeholder="+91..." />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Website</FieldLabel>
              <Input value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="www.vendor.com" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Vendor Name</FieldLabel>
              <Input value={formData.vendorName} onChange={(e) => handleChange('vendorName', e.target.value)} placeholder="Vendor / Online Store name" />
            </FieldGroup>
            <FieldGroup className="md:col-span-2">
              <FieldLabel>Address</FieldLabel>
              <Input value={formData.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Full address" />
            </FieldGroup>
            <FieldGroup className="md:col-span-2">
              <FieldLabel>Notes</FieldLabel>
              <Input value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Optional remarks" />
            </FieldGroup>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href={cancelHref}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
