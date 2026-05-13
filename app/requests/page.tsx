'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockAssetRequests } from '@/lib/mock-data';
import type { AssetRequest } from '@/lib/mock-data';
import { formatINR } from '@/lib/money';
import type { Session } from '@/lib/auth';

function RequestsContent() {
  const router = useRouter();
  const [requests, setRequests] = useState(mockAssetRequests);
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        setSession(JSON.parse(sessionStr));
      } catch {
        setSession(null);
      }
    }

    const storedRequests = localStorage.getItem('asset_requests');
    if (storedRequests) {
      try {
        setRequests(JSON.parse(storedRequests));
      } catch {
        setRequests(mockAssetRequests);
      }
    }
  }, []);

  const persistRequests = (nextRequests: AssetRequest[]) => {
    setRequests(nextRequests);
    localStorage.setItem('asset_requests', JSON.stringify(nextRequests));
  };

  const visibleRequests = useMemo(() => {
    if (!session || session.role !== 'employee') return requests;
    return requests.filter((request) =>
      request.requestedByUserId === session.userId || request.requestedBy === session.name
    );
  }, [requests, session]);

  const filteredRequests = visibleRequests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    Pending: 'secondary',
    Approved: 'default',
    Rejected: 'destructive',
    Ordered: 'outline',
    Delivered: 'secondary',
    Installed: 'default',
  };

  const handleApprove = (id: string) => {
    persistRequests(
      requests.map((request) =>
        request.id === id
          ? { ...request, status: 'Approved' as const, approvedBy: 'Admin User', approvalDate: new Date().toISOString().split('T')[0] }
          : request
      )
    );
  };

  const handleReject = (id: string) => {
    persistRequests(requests.map((request) => (request.id === id ? { ...request, status: 'Rejected' as const } : request)));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Asset Requests</h1>
            <p className="text-muted-foreground mt-2">Track and manage asset purchase requests</p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 w-fit" onClick={() => router.push('/requests/new')}>
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </div>
          <div className="hidden lg:block" />
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Filter Requests</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2">
              <select
                className="bg-transparent text-sm outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Ordered">Ordered</option>
                <option value="Delivered">Delivered</option>
                <option value="Installed">Installed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>{filteredRequests.length} request(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wide">Title</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Type</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Qty</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Est. Cost</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Priority</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell className="text-sm">{request.assetType}</TableCell>
                        <TableCell className="text-sm">{request.quantity}</TableCell>
                        <TableCell className="text-sm">{formatINR(request.estimatedCost)}</TableCell>
                        <TableCell>
                          <Badge variant={(statusColors[request.status] as any) || 'default'}>{request.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.priority === 'High' ? 'destructive' : 'secondary'}>{request.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => router.push(`/requests/edit/${request.id}`)}>
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              {session?.role !== 'employee' && request.status === 'Pending' && (
                                <>
                                  <DropdownMenuItem className="gap-2" onClick={() => handleApprove(request.id)}>
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleReject(request.id)}>
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function RequestsPage() {
  return (
    <SessionCheck>
      <RequestsContent />
    </SessionCheck>
  );
}
