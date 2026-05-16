'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { IssueForm, type IssueFormValues } from '@/components/forms/issue-form';
import { mockAssets, mockIssues, mockDepartments } from '@/lib/mock-data';
import type { Issue } from '@/lib/mock-data';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { canUseAssetSupabase, getAssetOrganizationId, getAssetSupabaseClient, assetDbRowToRecord } from '@/lib/assets';
import { canUseIssueSupabase, getIssueOrganizationId, issueInputToPayload, issueRowToRecord, ISSUE_STORAGE_KEY } from '@/lib/issues';
import { readStoredSession } from '@/lib/licenses';
import { writeAuditLog } from '@/lib/audit';
import { listAuthUsers } from '@/lib/auth';
import { readTenantJson } from '@/lib/tenant-storage';

export default function EditIssuePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const issueId = params.id;
  const [session, setSession] = useState<any>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [assets, setAssets] = useState(isSupabaseConfigured() ? [] : mockAssets);
  const [departments, setDepartments] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        setSession(JSON.parse(sessionStr));
      } catch {
        setSession(null);
      }
    }

    const loadData = async () => {
      const currentSession = sessionStr ? JSON.parse(sessionStr) : readStoredSession();

      if (canUseAssetSupabase(currentSession)) {
        try {
          const supabase = getAssetSupabaseClient();
          const orgId = getAssetOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('assets')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) {
            setAssets(data.map((row) => assetDbRowToRecord(row)));
            return;
          }
        } catch {
          setAssets([]);
          return;
        }
        setAssets([]);
        return;
      } else {
        if (isSupabaseConfigured()) {
          setAssets([]);
        } else {
          const storedAssets = readTenantJson<any[]>('it_assets', currentSession, []);
          if (storedAssets.length > 0) {
            setAssets(storedAssets);
          } else {
            setAssets(mockAssets);
          }
        }
      }

      if (canUseIssueSupabase(currentSession)) {
        try {
          const supabase = createSupabaseBrowserClient();
          const orgId = getIssueOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('organization_id', orgId)
            .eq('id', issueId)
            .single();
          if (!error && data) {
            setIssue(issueRowToRecord(data as any));
            return;
          }
        } catch {
          setIssue(null);
          return;
        }
        setIssue(null);
        return;
      }

      if (isSupabaseConfigured()) {
        setIssue(null);
      } else {
        const existingIssues: Issue[] = readTenantJson<Issue[]>(ISSUE_STORAGE_KEY, currentSession, mockIssues);
        setIssue(existingIssues.find((item) => item.id === issueId) || null);
      }
    };

    const loadDepartments = async () => {
      const currentSession = sessionStr ? JSON.parse(sessionStr) : readStoredSession();
      const allowedDepartmentsFallback = mockDepartments.map((dept) => dept.name);
      if (canUseIssueSupabase(currentSession)) {
        try {
          const supabase = createSupabaseBrowserClient();
          const orgId = getIssueOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('departments')
            .select('name,is_active')
            .eq('organization_id', orgId)
            .eq('is_active', true)
            .order('name', { ascending: true });
          if (!error && Array.isArray(data)) {
            setDepartments(data.map((row) => String(row.name || '').trim()).filter(Boolean));
            return;
          }
        } catch {
          setDepartments([]);
          return;
        }

        setDepartments([]);
        return;
      }

      if (isSupabaseConfigured()) {
        setDepartments([]);
        return;
      }

      const storedDepartments = readTenantJson<any[]>('it_departments', currentSession, mockDepartments);
      const names = storedDepartments.map((dept) => String(dept.name || '').trim()).filter(Boolean);
      setDepartments(names.length > 0 ? names : allowedDepartmentsFallback);
    };

    const loadAssignees = async () => {
      const currentSession = sessionStr ? JSON.parse(sessionStr) : readStoredSession();
      const allowedRoles = new Set(['master_admin', 'admin', 'it']);
      if (canUseIssueSupabase(currentSession)) {
        try {
          const supabase = createSupabaseBrowserClient();
          const orgId = getIssueOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name,title,role,is_active')
            .eq('organization_id', orgId)
            .eq('is_active', true)
            .in('role', Array.from(allowedRoles));
          if (!error && Array.isArray(data)) {
            setAssignees(
              data
                .map((row) => {
                  const fullName = String(row.full_name || '').trim();
                  if (!fullName) return '';
                  const title = String(row.title || '').trim();
                  return title ? `${fullName} - ${title}` : fullName;
                })
                .filter(Boolean)
            );
            return;
          }
        } catch {
          setAssignees([]);
          return;
        }

        setAssignees([]);
        return;
      }

      if (isSupabaseConfigured()) {
        setAssignees([]);
        return;
      }

      const localUsers = listAuthUsers().filter((user) => allowedRoles.has(user.role) && user.isActive);
      setAssignees(
        localUsers
          .map((user) => (user.designation ? `${user.name} - ${user.designation}` : user.name))
          .filter(Boolean)
      );
    };

    void loadData();
    void loadDepartments();
    void loadAssignees();
  }, [issueId]);

  const initialValues = useMemo<Partial<IssueFormValues> | undefined>(() => {
    if (!issue) return undefined;
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      assetId: issue.assetId || 'none',
      assignedTo: issue.assignedTo,
      designation: issue.designation || '',
      createdDate: issue.createdDate,
      dueDate: issue.dueDate,
      department: issue.department,
    };
  }, [issue]);

  const handleSubmit = (values: IssueFormValues) => {
    setError('');
    if (!issue) {
      setError('Ticket not found.');
      return;
    }

    const currentSession = session || readStoredSession();

    if (canUseIssueSupabase(currentSession)) {
      const supabase = createSupabaseBrowserClient();
      const payload = issueInputToPayload(values, currentSession, issue.createdByUserId || currentSession?.userId || null);
      void supabase
        .from('issues')
        .update(payload)
        .eq('id', issue.id)
        .eq('organization_id', getIssueOrganizationId(currentSession))
        .then(async ({ error }) => {
          if (error) {
            setError(error.message);
            return;
          }
          await writeAuditLog(currentSession, 'update_issue', 'issue', issue.id, {
            title: values.title,
            assignedTo: values.assignedTo,
            designation: values.designation,
            department: values.department,
          });
          router.push('/issues');
        });
      return;
    }

    const stored = localStorage.getItem(ISSUE_STORAGE_KEY);
    const existingIssues: Issue[] = stored ? JSON.parse(stored) : mockIssues;
    const updatedIssue: Issue = {
      ...issue,
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      assetId: values.assetId === 'none' ? '' : values.assetId,
      assignedTo: values.assignedTo,
      designation: values.designation,
      dueDate: values.dueDate,
      department: values.department,
    };

    localStorage.setItem(
      ISSUE_STORAGE_KEY,
      JSON.stringify(existingIssues.map((item) => (item.id === issue.id ? updatedIssue : item)))
    );
    void writeAuditLog(currentSession, 'update_issue', 'issue', issue.id, {
      title: values.title,
      assignedTo: values.assignedTo,
      designation: values.designation,
      department: values.department,
    });
    router.push('/issues');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        {issue ? (
          <IssueForm
            title="Edit Ticket"
            description="Update the ticket details on a full page."
            submitLabel="Update Ticket"
            cancelHref="/issues"
            initialValues={initialValues}
            assets={assets}
            isEmployee={session?.role === 'employee'}
            canAssignTeamMember={session?.role === 'master_admin' || session?.role === 'admin' || session?.role === 'it'}
            assignees={assignees}
            departments={departments}
            defaultDepartment={session?.department}
            error={error}
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-muted-foreground shadow-sm">Loading ticket...</div>
        )}
      </DashboardLayout>
    </SessionCheck>
  );
}
