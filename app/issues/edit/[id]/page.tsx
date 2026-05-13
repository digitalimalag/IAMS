'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { IssueForm, type IssueFormValues } from '@/components/forms/issue-form';
import { mockAssets, mockIssues } from '@/lib/mock-data';
import type { Issue } from '@/lib/mock-data';

const ISSUE_STORAGE_KEY = 'issues';

export default function EditIssuePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const issueId = params.id;
  const [session, setSession] = useState<any>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [assets, setAssets] = useState(mockAssets);
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

    const storedAssets = localStorage.getItem('it_assets');
    if (storedAssets) {
      try {
        setAssets(JSON.parse(storedAssets));
      } catch {
        setAssets(mockAssets);
      }
    }

    const storedIssues = localStorage.getItem(ISSUE_STORAGE_KEY);
    const existingIssues: Issue[] = storedIssues ? JSON.parse(storedIssues) : mockIssues;
    setIssue(existingIssues.find((item) => item.id === issueId) || null);
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
