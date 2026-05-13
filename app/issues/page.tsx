'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { mockAssets, mockIssues } from '@/lib/mock-data';
import { IssueTable } from '@/components/tables/issue-table';
import { ExportButtons } from '@/components/export-buttons';
import { generateAssetIssueFormPDF } from '@/lib/export-utils';
import type { Session } from '@/lib/auth';

const ISSUE_STORAGE_KEY = 'issues';

export default function IssuesPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
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

    const storedIssues = localStorage.getItem(ISSUE_STORAGE_KEY);
    if (storedIssues) {
      try {
        setIssues(JSON.parse(storedIssues));
      } catch {
        setIssues(mockIssues);
      }
    }
  }, []);

  const persistIssues = (nextIssues: typeof issues) => {
    setIssues(nextIssues);
    localStorage.setItem(ISSUE_STORAGE_KEY, JSON.stringify(nextIssues));
  };

  const visibleAssets = useMemo(() => {
    if (!session) return mockAssets;
    if (session.role === 'employee') return mockAssets.filter((asset) => asset.assignedToUserId === session.userId);
    return mockAssets;
  }, [session]);

  const visibleAssetIds = useMemo(() => new Set(visibleAssets.map((asset) => asset.id)), [visibleAssets]);

  const visibleIssues = useMemo(() => {
    if (!session) return issues;
    if (session.role !== 'employee') return issues;
    return issues.filter((issue) => (issue.createdByUserId && issue.createdByUserId === session.userId) || visibleAssetIds.has(issue.assetId));
  }, [issues, session, visibleAssetIds]);

  const filteredIssues = visibleIssues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'all' || issue.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  const uniqueStatuses = Array.from(new Set(visibleIssues.map((issue) => issue.status)));
  const uniquePriorities = Array.from(new Set(visibleIssues.map((issue) => issue.priority)));
  const uniqueDepartments = Array.from(new Set(visibleIssues.map((issue) => issue.department)));

  const handleDeleteIssue = (id: string) => {
    persistIssues(issues.filter((issue) => issue.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                    const asset = mockAssets.find((item) => item.id === firstIssue.assetId);
                    generateAssetIssueFormPDF(firstIssue, asset || null);
                  }
                }}
              />
            )}
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => router.push('/issues/new')}>
              <Plus className="w-4 h-4" />
              {session?.role === 'employee' ? 'Raise Ticket' : 'Create Ticket'}
            </Button>
          </div>
          <div className="hidden lg:block" />
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter help desk tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-input border-border" />
              </div>
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
              <div className="flex items-center justify-end text-sm text-muted-foreground">
                {filteredIssues.length} of {issues.length} issues
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>Complete list of support requests, priorities, and IT actions</CardDescription>
          </CardHeader>
          <CardContent>
            <IssueTable
              issues={filteredIssues}
              onEdit={(issue) => router.push(`/issues/edit/${issue.id}`)}
              onDelete={handleDeleteIssue}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
