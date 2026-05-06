'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { mockDepartments } from '@/lib/mock-data';
import { CompanyTable } from '@/components/tables/company-table';
import { AddCompanyModal } from '@/components/modals/add-company-modal';

const DEPARTMENT_STORAGE_KEY = 'it_departments';

function CompaniesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null);
  const [departments, setDepartments] = useState(mockDepartments);

  useEffect(() => {
    const storedDepartments = localStorage.getItem(DEPARTMENT_STORAGE_KEY);
    if (!storedDepartments) return;
    try {
      setDepartments(JSON.parse(storedDepartments));
    } catch {
      setDepartments(mockDepartments);
    }
  }, []);

  const persistDepartments = (nextDepartments: any[]) => {
    setDepartments(nextDepartments);
    localStorage.setItem(DEPARTMENT_STORAGE_KEY, JSON.stringify(nextDepartments));
  };

  const handleDepartmentSubmit = (dept: any) => {
    if (editingDepartment) {
      persistDepartments(departments.map(d => d.id === dept.id ? dept : d));
      setEditingDepartment(null);
    } else {
      const newDept = {
        ...dept,
        id: `DEPT-${Date.now()}`,
        assetCount: 0,
        deviceCount: 0,
        issueCount: 0,
      };
      persistDepartments([...departments, newDept]);
    }
  };

  const handleDeleteDepartment = (id: string) => {
    persistDepartments(departments.filter(d => d.id !== id));
  };

  // Filter departments
  const filteredDepartments = departments.filter((dept) => {
    return (
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground mt-2">Manage departments and their IT assets</p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
            <Link href="/companies/new">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 w-fit">
                <Plus className="w-4 h-4" />
                Add Department
              </Button>
            </Link>
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Search */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Find departments by name, manager, or email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Departments Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filteredDepartments.length} of {departments.length} departments
            </h2>
          </div>

          {filteredDepartments.length === 0 ? (
            <Card className="bg-card border-border/50">
              <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                No departments found matching your search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredDepartments.map((dept) => (
                <Card key={dept.id} className="bg-card border-border/50 hover:border-border transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{dept.name}</CardTitle>
                    <CardDescription>{dept.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Manager</p>
                        <p className="font-medium">{dept.manager}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                        <p className="font-medium text-sm break-all">{dept.email}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                        <p className="font-medium">{dept.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">ID</p>
                        <p className="font-mono text-sm text-muted-foreground">{dept.id}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="border-t border-border pt-4 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{dept.assetCount}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Assets</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{dept.deviceCount}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Devices</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{dept.issueCount}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Issues</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setEditingDepartment(dept);
                          setIsAddModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-destructive"
                        onClick={() => handleDeleteDepartment(dept.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Department Modal */}
      <AddCompanyModal 
        open={isAddModalOpen} 
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingDepartment(null);
        }}
        onSubmit={handleDepartmentSubmit}
        editingDepartment={editingDepartment}
      />
    </DashboardLayout>
  );
}

export default function CompaniesPage() {
  return (
    <SessionCheck>
      <CompaniesContent />
    </SessionCheck>
  );
}
