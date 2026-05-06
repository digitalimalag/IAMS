'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Mail, Phone, Calendar } from 'lucide-react';
import type { Session, UserRole } from '@/lib/auth';
import { createAuthUser, deleteAuthUser, editAuthUser, listAuthUsers } from '@/lib/auth';
import type { User } from '@/lib/auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';

type UserFormState = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  password: string;
};

const emptyUserForm: UserFormState = {
  name: '',
  email: '',
  phone: '',
  role: 'employee',
  department: '',
  password: '',
};

function UsersContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<UserFormState>(emptyUserForm);
  const [editUser, setEditUser] = useState<UserFormState>(emptyUserForm);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteApprovalName, setDeleteApprovalName] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const sessionStr = localStorage.getItem('session');
      let parsedSession: Session | null = null;
      if (sessionStr) {
        try {
          parsedSession = JSON.parse(sessionStr);
          setSession(parsedSession);
        } catch {
          parsedSession = null;
          setSession(null);
        }
      }

      if (isSupabaseConfigured() && parsedSession?.token && parsedSession.organizationId) {
        const supabase = createSupabaseBrowserClient();
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id,user_id,organization_id,full_name,email,phone,department,role,is_active,created_at,last_login_at')
          .eq('organization_id', parsedSession.organizationId)
          .order('created_at', { ascending: false });

        const mappedUsers = (profiles || []).map((profile) => ({
          id: profile.user_id || profile.id,
          email: profile.email,
          name: profile.full_name,
          phone: profile.phone || undefined,
          organizationId: profile.organization_id,
          role: profile.role,
          department: profile.department || '',
          isActive: profile.is_active,
          createdAt: profile.created_at || new Date().toISOString(),
          lastLogin: profile.last_login_at || undefined,
        })) as User[];

        setUsers(mappedUsers);
        return;
      }

      setUsers(listAuthUsers() as User[]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  }), [roleFilter, searchTerm, statusFilter, users]);

  const plan = normalizePlan(session?.plan);
  const planConfig = getPlanConfig(plan);
  const userLimit = Number(planConfig.userLimit || 1);
  const currentOrgUsers = users.filter((user) => {
    const orgId = session?.organizationId || 'org-default';
    return (user.organizationId || 'org-default') === orgId && user.isActive;
  });
  const canCreateMoreUsers = currentOrgUsers.length < userLimit;

  const handleDeleteUser = (id: string) => {
    deleteAuthUser(id);
    setUsers(listAuthUsers());
  };

  const roleColors = {
    master_admin: 'bg-red-500/20 text-red-700',
    admin: 'bg-blue-500/20 text-blue-700',
    employee: 'bg-green-500/20 text-green-700',
    hr: 'bg-purple-500/20 text-purple-700',
    it: 'bg-indigo-500/20 text-indigo-700',
  };

  const roleLabels = {
    master_admin: 'Master Admin',
    admin: 'Administrator',
    employee: 'Employee',
    hr: 'HR',
    it: 'IT',
  };

  const canCreateUsers = session?.role === 'master_admin';

  const openCreate = () => {
    setCreateError('');
    setNewUser(emptyUserForm);
    setIsAddOpen(true);
  };

  const openDelete = (user: User) => {
    setDeleteTarget(user);
    setDeleteReason('');
    setDeleteApprovalName('');
    setDeleteError('');
  };

  const openEdit = (user: (typeof users)[number]) => {
    setEditError('');
    setEditingUserId(user.id);
    setEditUser({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department,
      password: '',
    });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    setCreateError('');
    if (!canCreateMoreUsers) {
      setCreateError('Free plan allows only 1 master admin. Please upgrade to add more users.');
      return;
    }
    const useSupabase = isSupabaseConfigured() && Boolean(session?.token);

    if (useSupabase) {
      try {
        setIsCreating(true);
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.token}`,
          },
          body: JSON.stringify({
            fullName: newUser.name,
            email: newUser.email,
            password: newUser.password,
            phone: newUser.phone,
            department: newUser.department,
            role: newUser.role,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success || !data.user) {
          setCreateError(data.error || 'Failed to create user');
          return;
        }

        await loadUsers();
        setIsAddOpen(false);
        setNewUser(emptyUserForm);
        return;
      } catch {
        setCreateError('Failed to create user');
      } finally {
        setIsCreating(false);
      }
      return;
    }

    const res = createAuthUser({
      email: newUser.email,
      password: newUser.password,
      name: newUser.name,
      phone: newUser.phone,
      organizationId: session?.organizationId,
      role: newUser.role,
      department: newUser.department,
    });
    if (!res.success) {
      setCreateError(res.error || 'Failed to create user');
      return;
    }
    setUsers(listAuthUsers() as User[]);
    setIsAddOpen(false);
  };

  const handleEdit = async () => {
    if (!editingUserId) return;
    setEditError('');

    const useSupabase = isSupabaseConfigured() && Boolean(session?.token);
    if (useSupabase) {
      try {
        const response = await fetch(`/api/admin/users/${editingUserId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.token}`,
          },
          body: JSON.stringify({
            fullName: editUser.name,
            email: editUser.email,
            phone: editUser.phone,
            role: editUser.role,
            department: editUser.department,
            password: editUser.password || undefined,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          setEditError(data.error || 'Failed to update user');
          return;
        }

        await loadUsers();
        setIsEditOpen(false);
        setEditingUserId(null);
        return;
      } catch {
        setEditError('Failed to update user');
        return;
      }
    }

    const res = editAuthUser(editingUserId, {
      email: editUser.email,
      name: editUser.name,
      phone: editUser.phone,
      organizationId: session?.organizationId,
      role: editUser.role,
      department: editUser.department,
      password: editUser.password || undefined,
    });

    if (!res.success) {
      setEditError(res.error || 'Failed to update user');
      return;
    }

    setUsers(listAuthUsers());
    setIsEditOpen(false);
    setEditingUserId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteApprovalName.trim() !== deleteTarget.name.trim()) {
      setDeleteError('Please type the exact user name to confirm deletion.');
      return;
    }

    if (!deleteReason.trim()) {
      setDeleteError('Please enter a delete reason before approving.');
      return;
    }

    const useSupabase = isSupabaseConfigured() && Boolean(session?.token);
    if (useSupabase) {
      try {
        const response = await fetch(`/api/admin/users/${deleteTarget.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.token}`,
          },
          body: JSON.stringify({
            reason: deleteReason,
            confirmedBy: deleteApprovalName,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          setDeleteError(data.error || 'Failed to delete user');
          return;
        }

        await loadUsers();
      } catch {
        setDeleteError('Failed to delete user');
      } finally {
        setDeleteTarget(null);
      }
      return;
    }

    handleDeleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground mt-2">Manage user accounts and roles</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {canCreateUsers && (
              canCreateMoreUsers ? (
                <Button
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90 w-fit"
                  onClick={openCreate}
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              ) : (
                <Link href="/billing" className="w-fit">
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 w-fit">
                    <Plus className="w-4 h-4" />
                    Choose Plan
                  </Button>
                </Link>
              )
            )}
            {!canCreateMoreUsers && (
              <Link href="/billing" className="text-sm text-emerald-700 hover:text-emerald-800">
                Free plan allows only 1 master admin. Choose a plan to add more users.
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="master_admin">Master Admin</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Results */}
              <div className="flex items-center justify-end text-sm text-muted-foreground">
                {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Complete list of system users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wide">Name</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Email</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Phone</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Role</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Department</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Last Login</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-muted/50">
                      <TableCell className="text-sm font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {user.phone || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.department}</TableCell>
                      <TableCell className="text-sm">
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {user.lastLogin || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(user)}>
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive cursor-pointer"
                              onClick={() => openDelete(user)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) setCreateError('');
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Create a new user account and set a temporary password.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Name</p>
                <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Phone</p>
                <Input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Department</p>
                <Input value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Role</p>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="master_admin">Master Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Temporary Password</p>
                <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              </div>
            </div>

            {createError && (
              <div className="text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-md p-3">
                {createError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          setEditError('');
          setEditingUserId(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile, role, and access details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Name</p>
                <Input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <Input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Phone</p>
                <Input value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Department</p>
                <Input value={editUser.department} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Role</p>
                <Select value={editUser.role} onValueChange={(value: any) => setEditUser({ ...editUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="master_admin">Master Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">New Password</p>
                <Input
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>

            {editError && (
              <div className="text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-md p-3">
                {editError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => {
        if (!open) {
          setDeleteTarget(null);
          setDeleteReason('');
          setDeleteApprovalName('');
          setDeleteError('');
        }
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Delete User?</DialogTitle>
            <DialogDescription>
              This will deactivate the user, remove login access, and keep an audit trail for future reports.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Deleting <strong>{deleteTarget?.name}</strong> requires a reason and exact name confirmation.
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Reason for deletion</p>
              <Input
                placeholder="Example: Left company / duplicate account / policy issue"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Type full name to confirm</p>
              <Input
                placeholder={deleteTarget?.name || ''}
                value={deleteApprovalName}
                onChange={(e) => setDeleteApprovalName(e.target.value)}
              />
            </div>

            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmDelete}>
                Approve Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function UsersPage() {
  return (
    <SessionCheck>
      <UsersContent />
    </SessionCheck>
  );
}
