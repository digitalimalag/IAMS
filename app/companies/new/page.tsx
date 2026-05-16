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
import { Department } from '@/lib/mock-data';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { readStoredSession } from '@/lib/licenses';
import { writeTenantJson } from '@/lib/tenant-storage';

const DEPARTMENT_STORAGE_KEY = 'it_departments';

export default function NewCompanyPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    email: '',
    phone: '',
    location: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email) {
      setError('Department name and email are required.');
      return;
    }

    const newDepartment: Department = {
      id: isSupabaseConfigured() ? crypto.randomUUID() : `DEPT-${Date.now()}`,
      name: formData.name,
      manager: formData.manager,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      assetCount: 0,
      deviceCount: 0,
      issueCount: 0,
    };

    const currentSession = readStoredSession();

    if (isSupabaseConfigured() && currentSession?.organizationId) {
      void (async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase.from('departments').upsert(
            {
              id: newDepartment.id,
              organization_id: currentSession.organizationId,
              name: newDepartment.name,
              manager_name: newDepartment.manager || null,
              manager_email: newDepartment.email || null,
              phone: newDepartment.phone || null,
              location: newDepartment.location || null,
              is_active: true,
            },
            { onConflict: 'organization_id,name' }
          );

          if (error) {
            setError(error.message);
            return;
          }

          writeTenantJson(DEPARTMENT_STORAGE_KEY, currentSession, [newDepartment]);
          router.push('/companies');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to save department.');
        }
      })();
      return;
    }

    const stored = localStorage.getItem(DEPARTMENT_STORAGE_KEY);
    const existingDepartments: Department[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem(DEPARTMENT_STORAGE_KEY, JSON.stringify([...existingDepartments, newDepartment]));
    router.push('/companies');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add Department</h1>
              <p className="text-muted-foreground mt-2">Create a department record and return to the department list after saving.</p>
            </div>
            <Link href="/companies">
              <Button variant="outline">Back to Departments</Button>
            </Link>
          </div>

          <Card className="bg-card border-border/50 max-w-3xl">
            <CardHeader>
              <CardTitle>Department Details</CardTitle>
              <CardDescription>Enter the information for this department.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel>Department Name *</FieldLabel>
                    <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="IT Support" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Manager</FieldLabel>
                    <Input value={formData.manager} onChange={(e) => handleChange('manager', e.target.value)} placeholder="John Doe" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Email *</FieldLabel>
                    <Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="manager@company.com" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Phone</FieldLabel>
                    <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+1-555-0100" />
                  </FieldGroup>
                  <FieldGroup className="md:col-span-2">
                    <FieldLabel>Location</FieldLabel>
                    <Input value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Head Office" />
                  </FieldGroup>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end gap-3">
                  <Link href="/companies">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Save Department</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
