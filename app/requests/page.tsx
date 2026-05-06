'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockAssetRequests, mockDepartments } from '@/lib/mock-data';
import type { AssetRequest } from '@/lib/mock-data';
import { formatINR } from '@/lib/money';

function RequestsContent() {
  const [requests, setRequests] = useState(mockAssetRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<AssetRequest | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assetType: '',
    quantity: '1',
    estimatedCost: '',
    priority: 'Medium' as AssetRequest['priority'],
    dueDate: '',
    department: '',
  });

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, any> = {
    'Pending': 'secondary',
    'Approved': 'default',
    'Rejected': 'destructive',
    'Ordered': 'outline',
    'Delivered': 'secondary',
    'Installed': 'default',
  };

  const handleOpenModal = (request?: AssetRequest) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        title: request.title,
        description: request.description,
        assetType: request.assetType,
        quantity: request.quantity.toString(),
        estimatedCost: request.estimatedCost.toString(),
        priority: request.priority,
        dueDate: request.dueDate,
        department: request.department,
      });
    } else {
      setEditingRequest(null);
      setFormData({
        title: '',
        description: '',
        assetType: '',
        quantity: '1',
        estimatedCost: '',
        priority: 'Medium',
        dueDate: '',
        department: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingRequest) {
      setRequests(requests.map(r => r.id === editingRequest.id
        ? { ...r, ...formData, quantity: parseInt(formData.quantity), estimatedCost: parseFloat(formData.estimatedCost) }
        : r
      ));
    } else {
      setRequests([...requests, {
        id: `REQ-${Date.now()}`,
        requestedBy: 'Current User',
        status: 'Pending',
        createdDate: new Date().toISOString().split('T')[0],
        ...formData,
        quantity: parseInt(formData.quantity),
        estimatedCost: parseFloat(formData.estimatedCost),
        priority: formData.priority as AssetRequest['priority'],
      }]);
    }
    setIsAddModalOpen(false);
  };

  const handleApprove = (id: string) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: 'Approved' as const, approvedBy: 'Admin User', approvalDate: new Date().toISOString().split('T')[0] } : r
    ));
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: 'Rejected' as const } : r
    ));
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
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 w-fit" onClick={() => handleOpenModal()}>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-input border-border w-fit">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Installed">Installed</SelectItem>
              </SelectContent>
            </Select>
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
                          <Badge variant={statusColors[request.status] || 'default'}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.priority === 'High' ? 'destructive' : 'secondary'}>
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => handleOpenModal(request)}>
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              {request.status === 'Pending' && (
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRequest ? 'Edit Request' : 'Create New Request'}</DialogTitle>
            <DialogDescription>
              {editingRequest ? 'Update request details.' : 'Create a new asset purchase request.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <FieldGroup>
              <FieldLabel>Request Title</FieldLabel>
              <Input
                placeholder="e.g., New Laptops for Design Team"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Description</FieldLabel>
              <Input
                placeholder="Detailed description of the request"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <FieldLabel>Asset Type</FieldLabel>
                <Input
                  placeholder="e.g., Laptop"
                  value={formData.assetType}
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Department</FieldLabel>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FieldGroup>
                <FieldLabel>Quantity</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Est. Cost</FieldLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Priority</FieldLabel>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>

            <FieldGroup>
              <FieldLabel>Due Date</FieldLabel>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit}>
                {editingRequest ? 'Update Request' : 'Create Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
