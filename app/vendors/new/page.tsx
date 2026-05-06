'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Vendor } from '@/lib/mock-data';

const VENDOR_STORAGE_KEY = 'it_vendors';

export default function NewVendorPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    paymentTerms: '',
    gstNumber: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.contactPerson || !formData.email) {
      setError('Vendor name, contact person, and email are required.');
      return;
    }

    const stored = localStorage.getItem(VENDOR_STORAGE_KEY);
    const existingVendors: Vendor[] = stored ? JSON.parse(stored) : [];

    const newVendor: Vendor = {
      id: `VEN-${Date.now()}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      website: formData.website || undefined,
      paymentTerms: formData.paymentTerms,
      gstNumber: formData.gstNumber,
      bankDetails: {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName,
      },
      isActive: true,
    };

    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify([...existingVendors, newVendor]));
    router.push('/vendors');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add Vendor</h1>
              <p className="text-muted-foreground mt-2">Create a vendor record and return to the list after saving.</p>
            </div>
            <Link href="/vendors">
              <Button variant="outline">Back to Vendors</Button>
            </Link>
          </div>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Vendor Details</CardTitle>
              <CardDescription>Enter vendor and banking information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel>Vendor Name *</FieldLabel>
                    <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="ABC Technologies" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Contact Person *</FieldLabel>
                    <Input value={formData.contactPerson} onChange={(e) => handleChange('contactPerson', e.target.value)} placeholder="Rahul Sharma" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Email *</FieldLabel>
                    <Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="sales@vendor.com" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Phone</FieldLabel>
                    <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91-99999-99999" />
                  </FieldGroup>
                  <FieldGroup className="md:col-span-2">
                    <FieldLabel>Address</FieldLabel>
                    <Textarea value={formData.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Vendor office address" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Website</FieldLabel>
                    <Input value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://vendor.com" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Payment Terms</FieldLabel>
                    <Input value={formData.paymentTerms} onChange={(e) => handleChange('paymentTerms', e.target.value)} placeholder="Net 30" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>GST Number</FieldLabel>
                    <Input value={formData.gstNumber} onChange={(e) => handleChange('gstNumber', e.target.value)} placeholder="27ABCDE1234F1Z5" />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel>Account Name</FieldLabel>
                    <Input value={formData.accountName} onChange={(e) => handleChange('accountName', e.target.value)} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Account Number</FieldLabel>
                    <Input value={formData.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>IFSC Code</FieldLabel>
                    <Input value={formData.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value)} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Bank Name</FieldLabel>
                    <Input value={formData.bankName} onChange={(e) => handleChange('bankName', e.target.value)} />
                  </FieldGroup>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end gap-3">
                  <Link href="/vendors">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Save Vendor</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
