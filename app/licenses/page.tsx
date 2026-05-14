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
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { mockLicenses, type LicenseRecord } from '@/lib/mock-data';
import { formatDateYMD } from '@/lib/date';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Session } from '@/lib/auth';
import { ExportButtons } from '@/components/export-buttons';
import {
  LICENSE_STORAGE_KEY,
  canUseLicenseSupabase,
  getLicenseOrganizationId,
  licenseRowToRecord,
  readStoredSession,
} from '@/lib/licenses';
import { writeAuditLog } from '@/lib/audit';

export default function LicensesPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LicenseRecord | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const currentSession = readStoredSession();
    setSession(currentSession);

    const loadLicenses = async () => {
      setLoading(true);
      try {
        if (canUseLicenseSupabase(currentSession)) {
          const supabase = createSupabaseBrowserClient();
          const orgId = getLicenseOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

          if (!error) {
            setLicenses((data || []).map(licenseRowToRecord));
            return;
          }
        }

        const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
        if (stored) {
          try {
            setLicenses(JSON.parse(stored));
            return;
          } catch {
            // Fall through to seed data
          }
        }

        setLicenses(mockLicenses);
      } finally {
        setLoading(false);
      }
    };

    void loadLicenses();
  }, []);

  const filteredLicenses = useMemo(() => {
    return licenses.filter((license) => {
      const matchesSearch =
        license.licenseOf.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || license.licenseType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [licenses, searchTerm, typeFilter]);

  const handleDelete = (id: string) => {
    setActionError('');
    const deletedLicense = licenses.find((license) => license.id === id) || null;
    setDeleteTarget(deletedLicense);
    setDeleteConfirmation('');
    setDeleteReason('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmation.trim().toLowerCase() !== deleteTarget.serialNumber.trim().toLowerCase()) {
      setDeleteError('Please type the exact Serial Number to confirm deletion.');
      return;
    }
    if (!deleteReason.trim()) {
      setDeleteError('Please enter a delete reason before approving.');
      return;
    }
    setDeleteError('');

    if (canUseLicenseSupabase(session)) {
      try {
        const supabase = createSupabaseBrowserClient();
        const orgId = getLicenseOrganizationId(session);
        const { error } = await supabase.from('licenses').delete().eq('id', deleteTarget.id).eq('organization_id', orgId);
        if (error) {
          setActionError(error.message);
          return;
        }
        await writeAuditLog(session, 'delete_license', 'license', deleteTarget.id, {
          licenseOf: deleteTarget.licenseOf,
          serialNumber: deleteTarget.serialNumber,
          productKey: deleteTarget.productKey,
          licenseType: deleteTarget.licenseType,
          reason: deleteReason.trim(),
        });
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to delete license.');
        return;
      }
    } else {
      const next = licenses.filter((license) => license.id !== deleteTarget.id);
      setLicenses(next);
      localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(next));
      await writeAuditLog(session, 'delete_license', 'license', deleteTarget.id, {
        licenseOf: deleteTarget.licenseOf,
        serialNumber: deleteTarget.serialNumber,
        productKey: deleteTarget.productKey,
        licenseType: deleteTarget.licenseType,
        reason: deleteReason.trim(),
      });
    }

    setLicenses((current) => current.filter((license) => license.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteConfirmation('');
    setDeleteReason('');
    setDeleteError('');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight">License Manager</h1>
              <p className="text-muted-foreground mt-2">Manage OS, software, firewall, and other software licenses.</p>
            </div>
            <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
              <ExportButtons data={filteredLicenses} type="licenses" />
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => router.push('/licenses/new')}>
                <Plus className="w-4 h-4" />
                Add License
              </Button>
            </div>
            <div className="hidden lg:block" />
          </div>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Filter Licenses</CardTitle>
              <CardDescription>Search by license name, serial number, or vendor.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search licenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2">
                <select className="bg-transparent text-sm outline-none" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="OS">OS</option>
                  <option value="Software">Software</option>
                  <option value="Firewall">Firewall</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {actionError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-sm text-red-700">{actionError}</CardContent>
            </Card>
          )}

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>All Licenses</CardTitle>
              <CardDescription>{filteredLicenses.length} license(s) found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                {loading ? (
                  <div className="py-10 text-center text-muted-foreground">Loading licenses...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs uppercase tracking-wide">License Of</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Type</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Serial Number</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Product Key</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Purchased Date</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Expiry Date</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Purchased From</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Contact Person</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Contact Number</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Website</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Address</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLicenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="py-8 text-center text-muted-foreground">
                            No licenses found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLicenses.map((license) => (
                          <TableRow key={license.id} className="border-border/50 hover:bg-muted/30">
                            <TableCell className="font-medium">{license.licenseOf}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{license.licenseType}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{license.serialNumber}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{license.productKey || '-'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDateYMD(license.purchasedDate)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDateYMD(license.expiryDate)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{license.purchasedFrom}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{license.contactPerson}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{license.contactNumber}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{license.website}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{license.address}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2" onClick={() => router.push(`/licenses/edit/${license.id}`)}>
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(license.id)}>
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
                )}
              </div>
            </CardContent>
          </Card>

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
            title="Delete License?"
            description={
              <>
                This will permanently remove <strong>{deleteTarget?.licenseOf}</strong> from the license register.
              </>
            }
            confirmationLabel="Serial Number"
            confirmationValue={deleteConfirmation}
            onConfirmationValueChange={setDeleteConfirmation}
            reason={deleteReason}
            onReasonChange={setDeleteReason}
            onConfirm={confirmDelete}
            error={deleteError}
            confirmLabel="Delete License"
            confirmDisabled={
              !deleteTarget ||
              deleteConfirmation.trim().toLowerCase() !== deleteTarget.serialNumber.trim().toLowerCase() ||
              !deleteReason.trim()
            }
          />
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
