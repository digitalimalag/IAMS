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
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockPurchases, mockVendors, mockDepartments } from '@/lib/mock-data';
import type { Purchase } from '@/lib/mock-data';
import { formatINR } from '@/lib/money';

function PurchasesContent() {
  const [purchases, setPurchases] = useState(mockPurchases);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    vendor: '',
    department: '',
    totalAmount: '',
  });

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, any> = {
    'Requested': 'secondary',
    'Ordered': 'outline',
    'Delivered': 'secondary',
    'Installed': 'default',
  };

  const handleOpenModal = (purchase?: Purchase) => {
    if (purchase) {
      setEditingPurchase(purchase);
      setFormData({
        title: purchase.title,
        vendor: purchase.vendor,
        department: purchase.department,
        totalAmount: purchase.totalAmount.toString(),
      });
    } else {
      setEditingPurchase(null);
      setFormData({
        title: '',
        vendor: '',
        department: '',
        totalAmount: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingPurchase) {
      setPurchases(purchases.map(p => p.id === editingPurchase.id
        ? { ...p, ...formData, totalAmount: parseFloat(formData.totalAmount) }
        : p
      ));
    } else {
      setPurchases([...purchases, {
        id: `PUR-${Date.now()}`,
        orderedBy: 'Current User',
        status: 'Requested',
        createdDate: new Date().toISOString().split('T')[0],
        ...formData,
        totalAmount: parseFloat(formData.totalAmount),
      }]);
    }
    setIsAddModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: 'Requested' | 'Ordered' | 'Delivered' | 'Installed') => {
    setPurchases(purchases.map(p => {
      if (p.id === id) {
        const updated: Purchase = { ...p, status: newStatus };
        if (newStatus === 'Ordered' && !p.orderDate) {
          updated.orderDate = new Date().toISOString().split('T')[0];
        } else if (newStatus === 'Delivered' && !p.deliveryDate) {
          updated.deliveryDate = new Date().toISOString().split('T')[0];
        } else if (newStatus === 'Installed' && !p.installedDate) {
          updated.installedDate = new Date().toISOString().split('T')[0];
        }
        return updated;
      }
      return p;
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
            <p className="text-muted-foreground mt-2">Track purchase orders and procurement lifecycle</p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 w-fit" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4" />
              New Purchase
            </Button>
          </div>
          <div className="hidden lg:block" />
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Filter Purchases</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or vendor..."
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
                <SelectItem value="Requested">Requested</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Installed">Installed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Purchases</CardTitle>
            <CardDescription>{filteredPurchases.length} purchase order(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wide">Title</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Vendor</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Department</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Amount</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No purchases found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="font-medium">{purchase.title}</TableCell>
                        <TableCell className="text-sm">{purchase.vendor}</TableCell>
                        <TableCell className="text-sm">{purchase.department}</TableCell>
                        <TableCell className="text-sm font-semibold">{formatINR(purchase.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[purchase.status] || 'default'}>
                            {purchase.status}
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
                              <DropdownMenuItem className="gap-2" onClick={() => handleOpenModal(purchase)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(purchase.id, 'Ordered')}>
                                Mark Ordered
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(purchase.id, 'Delivered')}>
                                Mark Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(purchase.id, 'Installed')}>
                                Mark Installed
                              </DropdownMenuItem>
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
            <DialogTitle>{editingPurchase ? 'Edit Purchase' : 'Create New Purchase Order'}</DialogTitle>
            <DialogDescription>
              {editingPurchase ? 'Update purchase details.' : 'Create a new purchase order.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <FieldGroup>
              <FieldLabel>Purchase Title</FieldLabel>
              <Input
                placeholder="e.g., Laptop Purchase - Design Team"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <FieldLabel>Vendor</FieldLabel>
                <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.name}>{vendor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <FieldGroup>
              <FieldLabel>Total Amount</FieldLabel>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              />
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit}>
                {editingPurchase ? 'Update Purchase' : 'Create Purchase'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function PurchasesPage() {
  return (
    <SessionCheck>
      <PurchasesContent />
    </SessionCheck>
  );
}
