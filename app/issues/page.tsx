'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Plus, Search } from 'lucide-react';
import { mockIssues, mockAssets } from '@/lib/mock-data';
import { IssueTable } from '@/components/tables/issue-table';
import { AddIssueModal } from '@/components/modals/add-issue-modal';
import { ExportButtons } from '@/components/export-buttons';
import { generateAssetIssueFormPDF } from '@/lib/export-utils';
import type { Session } from '@/lib/auth';

export default function IssuesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<any | null>(null);
  const [issues, setIssues] = useState(mockIssues);

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        setSession(JSON.parse(sessionStr));
      } catch {
        setSession(null);
      }
    }
  }, []);

  const visibleAssets = useMemo(() => {
    if (!session) return mockAssets;
    if (session.role === 'employee') return mockAssets.filter(a => a.assignedToUserId === session.userId);
    return mockAssets;
  }, [session]);

  const visibleAssetIds = useMemo(() => new Set(visibleAssets.map(a => a.id)), [visibleAssets]);

  const visibleIssues = useMemo(() => {
    if (!session) return issues;
    if (session.role !== 'employee') return issues;
    return issues.filter(i => (i.createdByUserId && i.createdByUserId === session.userId) || visibleAssetIds.has(i.assetId));
  }, [issues, session, visibleAssetIds]);

  const handleIssueSubmit = (issue: any) => {
    if (editingIssue) {
      setIssues(issues.map(i => i.id === issue.id ? issue : i));
      setEditingIssue(null);
    } else {
      if (session?.role === 'employee' && issue.assetId !== 'none' && !visibleAssetIds.has(issue.assetId)) {
        return;
      }
      const newIssue = {
        ...issue,
        id: `ISS-${Date.now()}`,
        createdByUserId: session?.userId,
      };
      setIssues([...issues, newIssue]);
    }
  };

  const handleDeleteIssue = (id: string) => {
    setIssues(issues.filter(i => i.id !== id));
  };

  // Filter issues
  const filteredIssues = visibleIssues.filter((issue) => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'all' || issue.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  const uniqueStatuses = Array.from(new Set(visibleIssues.map(i => i.status)));
  const uniquePriorities = Array.from(new Set(visibleIssues.map(i => i.priority)));
  const uniqueDepartments = Array.from(new Set(visibleIssues.map(i => i.department)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">IT Help Desk Ticketing</h1>
            <p className="text-muted-foreground mt-2">
              Staff can raise tickets for laptops, desktops, and other IT assets. IT can act, while HR, Admin, and Master Admin can monitor progress.
            </p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
            {session?.role !== 'employee' && (
              <ExportButtons 
                data={filteredIssues} 
                type="issues"
                onGeneratePDF={() => {
                  const firstIssue = filteredIssues[0];
                  if (firstIssue) {
                    const asset = mockAssets.find(a => a.id === firstIssue.assetId);
                    generateAssetIssueFormPDF(firstIssue, asset || null);
                  }
                }}
              />
            )}
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4" />
              {session?.role === 'employee' ? 'Raise Ticket' : 'Create Ticket'}
            </Button>
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Filters */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter help desk tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>

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

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {uniquePriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
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
                {filteredIssues.length} of {issues.length} issues
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>Complete list of support requests, priorities, and IT actions</CardDescription>
          </CardHeader>
          <CardContent>
            <IssueTable 
              issues={filteredIssues}
              onEdit={(issue) => {
                setEditingIssue(issue);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteIssue}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Issue Modal */}
      <AddIssueModal 
        open={isAddModalOpen} 
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingIssue(null);
        }}
        onSubmit={handleIssueSubmit}
        editingIssue={editingIssue}
        assets={visibleAssets}
        isEmployee={session?.role === 'employee'}
        defaultDepartment={session?.department}
      />
    </DashboardLayout>
  );
}
