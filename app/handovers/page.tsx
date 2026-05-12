'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Download, Plus, Search } from 'lucide-react';
import { formatDateYMD } from '@/lib/date';
import { mockAssetHandovers, mockAssets, mockDepartments } from '@/lib/mock-data';
import type { AssetHandover } from '@/lib/mock-data';
import type { Session } from '@/lib/auth';
import { downloadHandoverPdf } from '@/lib/handover-pdf';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

function HandoversContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [handovers, setHandovers] = useState<AssetHandover[]>(mockAssetHandovers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeHandoverId, setActiveHandoverId] = useState<string | null>(null);
  const [mode, setMode] = useState<'create' | 'manage' | 'view'>('create');

  const [createForm, setCreateForm] = useState({
    employeeName: '',
    employeeRole: '',
    resignationDate: '',
    department: '',
    notes: '',
    assetIds: [] as string[],
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (!sessionStr) return;
    try {
      setSession(JSON.parse(sessionStr));
    } catch {
      setSession(null);
    }
  }, []);

  const visibleHandovers = useMemo(() => {
    if (!session || session.role !== 'employee') return handovers;
    return handovers.filter((handover) =>
      handover.employeeId === session.userId ||
      handover.employeeName.toLowerCase() === session.name.toLowerCase()
    );
  }, [handovers, session]);

  const filteredHandovers = visibleHandovers.filter(handover => {
    const matchesSearch = handover.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      handover.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || handover.handoverStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeHandover = visibleHandovers.find(h => h.id === activeHandoverId) || null;
  const canManageHandovers = !session || session.role !== 'employee';

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-500',
      'InProgress': 'bg-blue-500',
      'Approved': 'bg-green-500',
      'Completed': 'bg-slate-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const openCreate = () => {
    setMode('create');
    setActiveHandoverId(null);
    setCreateForm({
      employeeName: '',
      employeeRole: '',
      resignationDate: '',
      department: '',
      notes: '',
      assetIds: [],
    });
    setDialogOpen(true);
  };

  const openManage = (id: string) => {
    setMode('manage');
    setActiveHandoverId(id);
    setDialogOpen(true);
  };

  const openView = (id: string) => {
    setMode('view');
    setActiveHandoverId(id);
    setDialogOpen(true);
  };

  const toggleCreateAsset = (id: string) => {
    setCreateForm(prev => ({
      ...prev,
      assetIds: prev.assetIds.includes(id)
        ? prev.assetIds.filter(x => x !== id)
        : [...prev.assetIds, id],
    }));
  };

  const createHandover = () => {
    const today = formatDateYMD(new Date());
    const uuid = globalThis.crypto?.randomUUID?.() || `${Math.random()}`; // only used client-side
    const id = `HND-${uuid.slice(0, 8).toUpperCase()}`;

    const selectedAssets = mockAssets.filter(a => createForm.assetIds.includes(a.id));
    const newHandover: AssetHandover = {
      id,
      employeeId: `EMP-${uuid.slice(9, 13).toUpperCase()}`,
      employeeName: createForm.employeeName.trim(),
      employeeRole: createForm.employeeRole.trim(),
      resignationDate: createForm.resignationDate,
      department: createForm.department,
      assetIds: selectedAssets.map(a => a.id),
      assetDetails: selectedAssets.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        status: 'Pending',
      })),
      handoverStatus: 'Pending',
      notes: createForm.notes.trim() || undefined,
      createdDate: today,
    };

    setHandovers(prev => [newHandover, ...prev]);
    setDialogOpen(false);
  };

  const updateHandover = (id: string, updater: (prev: AssetHandover) => AssetHandover) => {
    setHandovers(prev => prev.map(h => (h.id === id ? updater(h) : h)));
  };

  const setAssetReturned = (assetId: string, returned: boolean) => {
    if (!activeHandover) return;
    updateHandover(activeHandover.id, (h) => {
      const assetDetails: AssetHandover['assetDetails'] = h.assetDetails.map(a =>
        a.id === assetId ? { ...a, status: returned ? 'Returned' : 'Pending' } : a
      );
      const allReturned = assetDetails.every(a => a.status === 'Returned');
      const hasApprovals = Boolean(h.itApproval) && Boolean(h.hrApproval);
      const nextStatus =
        allReturned && hasApprovals ? 'Completed' : allReturned ? 'Approved' : h.handoverStatus;
      return { ...h, assetDetails, handoverStatus: nextStatus };
    });
  };

  const approveIT = () => {
    if (!activeHandover) return;
    updateHandover(activeHandover.id, (h) => {
      const today = formatDateYMD(new Date());
      const assetReturned = h.assetDetails.every(a => a.status === 'Returned');
      const nextStatus =
        assetReturned && h.hrApproval ? 'Completed' : assetReturned ? 'Approved' : 'InProgress';
      return {
        ...h,
        itApproval: { approvedBy: 'IT Admin', approvalDate: today },
        handoverStatus: nextStatus,
      };
    });
  };

  const approveHR = () => {
    if (!activeHandover) return;
    updateHandover(activeHandover.id, (h) => {
      const today = formatDateYMD(new Date());
      const assetReturned = h.assetDetails.every(a => a.status === 'Returned');
      const nextStatus =
        assetReturned && h.itApproval ? 'Completed' : assetReturned ? 'Approved' : 'InProgress';
      return {
        ...h,
        hrApproval: { approvedBy: 'HR Admin', approvalDate: today },
        handoverStatus: nextStatus,
      };
    });
  };

  const markInProgress = () => {
    if (!activeHandover) return;
    updateHandover(activeHandover.id, (h) => ({ ...h, handoverStatus: 'InProgress' }));
  };

  const completeHandover = () => {
    if (!activeHandover) return;
    updateHandover(activeHandover.id, (h) => {
      const allReturned = h.assetDetails.every(a => a.status === 'Returned');
      const hasApprovals = Boolean(h.itApproval) && Boolean(h.hrApproval);
      if (!allReturned || !hasApprovals) return h;
      return { ...h, handoverStatus: 'Completed' };
    });
  };

  const exportHandoverPdf = async (handover: AssetHandover) => {
    let resolvedLogo = session?.organizationLogoUrl || '';
    let resolvedCompanyName = session?.organizationName || 'Digital IMALAG IT Assets Management SaaS';

    if (!resolvedLogo && session?.organizationId && isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('name, logo_url')
          .eq('id', session.organizationId)
          .single();

        resolvedLogo = orgRow?.logo_url || '';
        resolvedCompanyName = orgRow?.name || resolvedCompanyName;
      } catch {
        resolvedLogo = '';
      }
    }

    await downloadHandoverPdf(handover, mockAssets, resolvedCompanyName, resolvedLogo);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Asset Handovers</h1>
            <p className="text-muted-foreground mt-2">Manage employee asset handover during resignation</p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 lg:justify-center">
            {canManageHandovers && (
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 w-fit" onClick={openCreate}>
                <Plus className="w-4 h-4" />
                New Handover
              </Button>
            )}
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Filters */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by employee name or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Handovers List */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Handovers</CardTitle>
            <CardDescription>Showing {filteredHandovers.length} handovers</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHandovers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No handovers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHandovers.map((handover) => (
                  <div key={handover.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{handover.employeeName}</h3>
                          <p className="text-sm text-muted-foreground">{handover.department} • Designation: {handover.employeeRole}</p>
                        </div>
                        <Badge className={`${getStatusColor(handover.handoverStatus)} text-white`}>
                          {handover.handoverStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Resignation Date</p>
                          <p className="font-medium">{handover.resignationDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Assets to Return</p>
                          <p className="font-medium">{handover.assetIds.length} items</p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="text-sm font-medium mb-2">Assets:</p>
                        <div className="space-y-1">
                          {handover.assetDetails.map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between text-sm">
                              <span>{asset.name}</span>
                              <Badge variant={asset.status === 'Returned' ? 'default' : 'outline'}>
                                {asset.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openView(handover.id)}>
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => exportHandoverPdf(handover)}
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </Button>
                        {canManageHandovers && (
                          <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={() => openManage(handover.id)}>
                            Manage Handover
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create New Handover' : mode === 'manage' ? 'Manage Handover' : 'Handover Details'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Create a handover case and assign assets that must be returned.'
                : 'Track asset returns and approvals for this handover.'}
            </DialogDescription>
          </DialogHeader>

          {mode === 'create' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup>
                  <FieldLabel>Employee Name</FieldLabel>
                  <Input
                    value={createForm.employeeName}
                    onChange={(e) => setCreateForm({ ...createForm, employeeName: e.target.value })}
                    placeholder="e.g., Rahul Sharma"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Designation</FieldLabel>
                  <Input
                    value={createForm.employeeRole}
                    onChange={(e) => setCreateForm({ ...createForm, employeeRole: e.target.value })}
                    placeholder="e.g., Senior Designer"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Resignation Date</FieldLabel>
                  <Input
                    type="date"
                    value={createForm.resignationDate}
                    onChange={(e) => setCreateForm({ ...createForm, resignationDate: e.target.value })}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Department</FieldLabel>
                  <Select
                    value={createForm.department}
                    onValueChange={(value) => setCreateForm({ ...createForm, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDepartments.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>

              <FieldGroup>
                <FieldLabel>Assets to Return</FieldLabel>
                <div className="border border-border rounded-lg divide-y">
                  {mockAssets.map((a) => {
                    const checked = createForm.assetIds.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        className="flex items-center justify-between gap-4 p-3 hover:bg-muted/30 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.type} • {a.assetTag}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCreateAsset(a.id)}
                          className="h-4 w-4"
                        />
                      </label>
                    );
                  })}
                </div>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Notes (optional)</FieldLabel>
                <Textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Any special instructions for IT/HR..."
                />
              </FieldGroup>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={createHandover}
                  disabled={
                    !createForm.employeeName.trim() ||
                    !createForm.employeeRole.trim() ||
                    !createForm.resignationDate ||
                    !createForm.department ||
                    createForm.assetIds.length === 0
                  }
                >
                  Create Handover
                </Button>
              </div>
            </div>
          )}

          {(mode === 'manage' || mode === 'view') && activeHandover && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Employee</p>
                  <p className="font-semibold">{activeHandover.employeeName}</p>
                  <p className="text-sm text-muted-foreground">Designation: {activeHandover.employeeRole}</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
                  <p className="font-semibold">{activeHandover.department}</p>
                  <p className="text-sm text-muted-foreground">Resignation: {activeHandover.resignationDate}</p>
                </div>
                <div className="border border-border rounded-lg p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                    <p className="font-semibold">{activeHandover.handoverStatus}</p>
                  </div>
                  <Badge className={`${getStatusColor(activeHandover.handoverStatus)} text-white`}>
                    {activeHandover.handoverStatus}
                  </Badge>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                  <p className="font-medium">Assets</p>
                  <p className="text-sm text-muted-foreground">
                    {activeHandover.assetDetails.filter(a => a.status === 'Returned').length}/{activeHandover.assetDetails.length} returned
                  </p>
                </div>
                <div className="divide-y">
                  {activeHandover.assetDetails.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={asset.status === 'Returned' ? 'default' : 'outline'}>
                          {asset.status}
                        </Badge>
                        {mode === 'manage' && (
                          <input
                            type="checkbox"
                            checked={asset.status === 'Returned'}
                            onChange={(e) => setAssetReturned(asset.id, e.target.checked)}
                            className="h-4 w-4"
                            aria-label={`Mark ${asset.name} returned`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">IT Approval</p>
                  {activeHandover.itApproval ? (
                    <p className="text-sm mt-2">
                      Approved by <span className="font-medium">{activeHandover.itApproval.approvedBy}</span> on{' '}
                      <span className="font-medium">{activeHandover.itApproval.approvalDate}</span>
                    </p>
                  ) : (
                    <p className="text-sm mt-2 text-muted-foreground">Not approved yet</p>
                  )}
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">HR Approval</p>
                  {activeHandover.hrApproval ? (
                    <p className="text-sm mt-2">
                      Approved by <span className="font-medium">{activeHandover.hrApproval.approvedBy}</span> on{' '}
                      <span className="font-medium">{activeHandover.hrApproval.approvalDate}</span>
                    </p>
                  ) : (
                    <p className="text-sm mt-2 text-muted-foreground">Not approved yet</p>
                  )}
                </div>
              </div>

              {mode === 'manage' && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <Button variant="outline" onClick={() => exportHandoverPdf(activeHandover)}>
                    Download PDF
                  </Button>
                  <Button variant="outline" onClick={markInProgress}>
                    Mark In Progress
                  </Button>
                  <Button variant="outline" onClick={approveIT} disabled={Boolean(activeHandover.itApproval)}>
                    Approve (IT)
                  </Button>
                  <Button variant="outline" onClick={approveHR} disabled={Boolean(activeHandover.hrApproval)}>
                    Approve (HR)
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={completeHandover}
                    disabled={
                      !activeHandover.assetDetails.every(a => a.status === 'Returned') ||
                      !activeHandover.itApproval ||
                      !activeHandover.hrApproval
                    }
                  >
                    Complete
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function HandoversPage() {
  return (
    <SessionCheck>
      <HandoversContent />
    </SessionCheck>
  );
}
