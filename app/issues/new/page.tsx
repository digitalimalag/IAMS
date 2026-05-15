'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { IssueForm, type IssueFormValues } from '@/components/forms/issue-form';
import { mockAssets } from '@/lib/mock-data';
import type { Issue } from '@/lib/mock-data';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { canUseAssetSupabase, getAssetOrganizationId, getAssetSupabaseClient, assetDbRowToRecord } from '@/lib/assets';
import { canUseIssueSupabase, getIssueOrganizationId, generateIssueTicketNumber, issueInputToPayload, issueRowToRecord, getSupabaseIssuesClient, ISSUE_STORAGE_KEY } from '@/lib/issues';
import { readStoredSession } from '@/lib/licenses';
import { writeAuditLog } from '@/lib/audit';
import { listAuthUsers } from '@/lib/auth';

export default function NewIssuePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState(mockAssets);
  const [existingIssues, setExistingIssues] = useState<Issue[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        setSession(JSON.parse(sessionStr));
      } catch {
        setSession(null);
      }
    }

    const loadAssets = async () => {
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
          // fallback below
        }
      }

      const storedAssets = localStorage.getItem('it_assets');
      if (storedAssets) {
        try {
          setAssets(JSON.parse(storedAssets));
        } catch {
          setAssets(mockAssets);
        }
      }
    };

    const loadIssues = async () => {
      const currentSession = sessionStr ? JSON.parse(sessionStr) : readStoredSession();
      if (canUseIssueSupabase(currentSession)) {
        try {
          const supabase = getSupabaseIssuesClient();
          const orgId = getIssueOrganizationId(currentSession);
          const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) {
            setExistingIssues(data.map((row) => issueRowToRecord(row as any)));
            return;
          }
        } catch {
          // fallback below
        }
      }

      const storedIssues = localStorage.getItem(ISSUE_STORAGE_KEY);
      if (storedIssues) {
        try {
          setExistingIssues(JSON.parse(storedIssues));
        } catch {
          setExistingIssues([]);
        }
      }
    };

    const loadAssignees = async () => {
      const currentSession = sessionStr ? JSON.parse(sessionStr) : readStoredSession();
      const allowedRoles = new Set(['master_admin', 'admin', 'it']);
      if (canUseIssueSupabase(currentSession)) {
        try {
          const supabase = getSupabaseIssuesClient();
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
          // fallback below
        }
      }

      const localUsers = listAuthUsers().filter((user) => allowedRoles.has(user.role) && user.isActive);
      setAssignees(
        localUsers
          .map((user) => (user.designation ? `${user.name} - ${user.designation}` : user.name))
          .filter(Boolean)
      );
    };

    void loadAssets();
    void loadIssues();
    void loadAssignees();
  }, []);

  const handleSubmit = (values: IssueFormValues) => {
    setError('');
    if (!values.title || !values.description) {
      setError('Please fill the required fields.');
      return;
    }

    const currentSession = session || readStoredSession();
    const ticketNumber = generateIssueTicketNumber(existingIssues);

    if (canUseIssueSupabase(currentSession)) {
      const supabase = createSupabaseBrowserClient();
      const payload = issueInputToPayload(values, currentSession, currentSession?.userId || null, ticketNumber);
      void supabase.from('issues').insert(payload).then(async ({ error, data }) => {
        if (error) {
          setError(error.message);
          return;
        }

        await writeAuditLog(currentSession, 'create_issue', 'issue', null, {
          ticketNumber,
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
    const storedIssues: Issue[] = stored ? JSON.parse(stored) : [];
    const newIssue: Issue = {
      id: ticketNumber,
      ticketNumber,
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      assetId: values.assetId === 'none' ? '' : values.assetId,
      assignedTo: values.assignedTo,
      designation: values.designation,
      createdByUserId: currentSession?.userId,
      createdDate: values.createdDate,
      dueDate: values.dueDate,
      department: values.department,
    };

    localStorage.setItem(ISSUE_STORAGE_KEY, JSON.stringify([...storedIssues, newIssue]));
    void writeAuditLog(currentSession, 'create_issue', 'issue', newIssue.id, {
      ticketNumber: newIssue.ticketNumber || newIssue.id,
      title: newIssue.title,
      assignedTo: newIssue.assignedTo,
      designation: newIssue.designation || '',
      department: newIssue.department,
    });
    router.push('/issues');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <IssueForm
          title="Create New Ticket"
          description="Report a new IT help desk ticket for an IT asset or service request."
          submitLabel="Create Ticket"
          cancelHref="/issues"
          assets={assets}
          isEmployee={session?.role === 'employee'}
          canAssignTeamMember={session?.role === 'master_admin' || session?.role === 'admin' || session?.role === 'it'}
          assignees={assignees}
          defaultDepartment={session?.department}
          error={error}
          onSubmit={handleSubmit}
        />
      </DashboardLayout>
    </SessionCheck>
  );
}
