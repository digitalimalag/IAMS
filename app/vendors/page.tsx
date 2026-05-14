'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockVendors } from '@/lib/mock-data';
import type { Vendor } from '@/lib/mock-data';
import type { Session } from '@/lib/auth';
import { readStoredSession } from '@/lib/licenses';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { writeAuditLog } from '@/lib/audit';

const VENDOR_STORAGE_KEY = 'it_vendors';

function VendorsContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [vendors, setVendors] = useState(mockVendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    paymentTerms: '',
    gstNumber: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },
  });

  useEffect(() => {
    setSession(readStoredSession());
    const storedVendors = localStorage.getItem(VENDOR_STORAGE_KEY);
    if (!storedVendors) return;
    try {
      setVendors(JSON.parse(storedVendors));
    } catch {
      setVendors(mockVendors);
    }
  }, []);

  const persistVendors = (nextVendors: Vendor[]) => {
    setVendors(nextVendors);
    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(nextVendors));
  };

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        website: vendor.website || '',
        paymentTerms: vendor.paymentTerms,
        gstNumber: vendor.gstNumber,
        bankDetails: vendor.bankDetails,
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        paymentTerms: '',
        gstNumber: '',
        bankDetails: {
          accountName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: '',
        },
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSubmit = () => {
    const newVendor: Vendor = {
      id: editingVendor ? editingVendor.id : `VEN-${Date.now()}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      website: formData.website,
      paymentTerms: formData.paymentTerms,
      gstNumber: formData.gstNumber,
      bankDetails: formData.bankDetails,
      isActive: true,
    };

    if (editingVendor) {
      persistVendors(vendors.map(v => v.id === editingVendor.id ? newVendor : v));
    } else {
      persistVendors([...vendors, newVendor]);
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const vendor = vendors.find((item) => item.id === id) || null;
    setDeleteTarget(vendor);
    setDeleteConfirmation('');
    setDeleteReason('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmation.trim().toLowerCase() !== deleteTarget.name.trim().toLowerCase()) {
      setDeleteError('Please type the exact Vendor Name to confirm deletion.');
      return;
    }
    if (!deleteReason.trim()) {
      setDeleteError('Please enter a delete reason before approving.');
      return;
    }

    persistVendors(vendors.filter(v => v.id !== deleteTarget.id));
    await writeAuditLog(session, 'delete_vendor', 'vendor', deleteTarget.id, {
      vendorName: deleteTarget.name,
      contactPerson: deleteTarget.contactPerson,
      email: deleteTarget.email,
      reason: deleteReason.trim(),
    });

    setDeleteTarget(null);
    setDeleteConfirmation('');
    setDeleteReason('');
    setDeleteError('');
  };

  const handleToggleActive = (id: string) => {
    persistVendors(vendors.map(v =>
      v.id === id ? { ...v, isActive: !v.isActive } : v
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
            <p className="text-muted-foreground mt-2">Manage hardware and software vendors</p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
            <Link href="/vendors/new">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 w-fit">
                <Plus className="w-4 h-4" />
                Add Vendor
              </Button>
            </Link>
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Search */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Search Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vendors Table */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Vendors</CardTitle>
            <CardDescription>{filteredVendors.length} vendor(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wide">Vendor Name</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Contact</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Email</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Payment Terms</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">GST</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No vendors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell className="text-sm">{vendor.contactPerson}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{vendor.email}</TableCell>
                        <TableCell className="text-sm">{vendor.paymentTerms}</TableCell>
                        <TableCell className="text-sm">{vendor.gstNumber}</TableCell>
                        <TableCell>
                          <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
                            {vendor.isActive ? 'Active' : 'Inactive'}
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
                              <DropdownMenuItem className="gap-2" onClick={() => handleOpenModal(vendor)}>
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleToggleActive(vendor.id)}>
                                {vendor.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(vendor.id)}>
                                <Trash2 className="w-4 h-4" />
                                Delete
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

      {/* Add/Edit Vendor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
            <DialogDescription>
              {editingVendor ? 'Update vendor information.' : 'Add a new vendor to your system.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">

  {/* Basic Info */}
  <div className="grid grid-cols-2 gap-4">
    <FieldGroup>
      <FieldLabel>Vendor Name</FieldLabel>
      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
    </FieldGroup>

    <FieldGroup>
      <FieldLabel>Contact Person</FieldLabel>
      <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
    </FieldGroup>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <FieldGroup>
      <FieldLabel>Email</FieldLabel>
      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
    </FieldGroup>

    <FieldGroup>
      <FieldLabel>Phone</FieldLabel>
      <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
    </FieldGroup>
  </div>

  {/* Business Info */}
  <div className="grid grid-cols-3 gap-4">
    <FieldGroup>
      <FieldLabel>Website</FieldLabel>
      <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
    </FieldGroup>

    <FieldGroup>
      <FieldLabel>Payment Terms</FieldLabel>
      <Input value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
    </FieldGroup>

    <FieldGroup>
      <FieldLabel>GST Number</FieldLabel>
      <Input value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
    </FieldGroup>
  </div>

  {/* Bank Details */}
  <div>
    <p className="text-sm font-semibold mb-2 text-muted-foreground">Bank Details</p>
    <div className="grid grid-cols-2 gap-4">
      <FieldGroup>
        <FieldLabel>Account Name</FieldLabel>
        <Input
          value={formData.bankDetails.accountName}
          onChange={(e) =>
            setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, accountName: e.target.value },
            })
          }
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Account Number</FieldLabel>
        <Input
          value={formData.bankDetails.accountNumber}
          onChange={(e) =>
            setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
            })
          }
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>IFSC Code</FieldLabel>
        <Input
          value={formData.bankDetails.ifscCode}
          onChange={(e) =>
            setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, ifscCode: e.target.value },
            })
          }
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Bank Name</FieldLabel>
        <Input
          value={formData.bankDetails.bankName}
          onChange={(e) =>
            setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, bankName: e.target.value },
            })
          }
        />
      </FieldGroup>
    </div>
  </div>

  {/* Address */}
  <FieldGroup>
    <FieldLabel>Address</FieldLabel>
    <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
  </FieldGroup>

  {/* Actions */}
  <div className="flex justify-end gap-3 pt-4 border-t">
    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleSubmit}>
      {editingVendor ? 'Update Vendor' : 'Add Vendor'}
    </Button>
  </div>
</div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteConfirmation('');
            setDeleteReason('');
            setDeleteError('');
          }
        }}
        title="Delete Vendor?"
        description={
          <>
            This will permanently remove <strong>{deleteTarget?.name}</strong> from the vendor list.
          </>
        }
        confirmationLabel="Vendor Name"
        confirmationValue={deleteConfirmation}
        onConfirmationValueChange={setDeleteConfirmation}
        reason={deleteReason}
        onReasonChange={setDeleteReason}
        onConfirm={confirmDelete}
        error={deleteError}
        confirmLabel="Delete Vendor"
        confirmDisabled={
          !deleteTarget ||
          deleteConfirmation.trim().toLowerCase() !== deleteTarget.name.trim().toLowerCase() ||
          !deleteReason.trim()
        }
      />
    </DashboardLayout >
  );
}

export default function VendorsPage() {
  return (
    <SessionCheck>
      <VendorsContent />
    </SessionCheck>
  );
}
