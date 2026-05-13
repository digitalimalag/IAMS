'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { IssueForm, type IssueFormValues } from '@/components/forms/issue-form';
import { mockAssets, mockIssues } from '@/lib/mock-data';
import type { Issue } from '@/lib/mock-data';

const ISSUE_STORAGE_KEY = 'issues';

export default function NewIssuePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState(mockAssets);

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
  }, []);

  const handleSubmit = (values: IssueFormValues) => {
    setError('');
    if (!values.title || !values.description) {
      setError('Please fill the required fields.');
      return;
    }

    const stored = localStorage.getItem(ISSUE_STORAGE_KEY);
    const existingIssues: Issue[] = stored ? JSON.parse(stored) : mockIssues;

    const newIssue: Issue = {
      id: `ISS-${Date.now()}`,
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      assetId: values.assetId === 'none' ? '' : values.assetId,
      assignedTo: values.assignedTo,
      designation: values.designation,
      createdByUserId: session?.userId,
      createdDate: values.createdDate,
      dueDate: values.dueDate,
      department: values.department,
    };

    localStorage.setItem(ISSUE_STORAGE_KEY, JSON.stringify([...existingIssues, newIssue]));
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
          defaultDepartment={session?.department}
          error={error}
          onSubmit={handleSubmit}
        />
      </DashboardLayout>
    </SessionCheck>
  );
}
