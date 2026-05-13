'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { RequestForm, type RequestFormValues } from '@/components/forms/request-form';
import { mockAssetRequests } from '@/lib/mock-data';
import type { AssetRequest } from '@/lib/mock-data';

const REQUEST_STORAGE_KEY = 'asset_requests';

export default function NewRequestPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
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

    const stored = localStorage.getItem(REQUEST_STORAGE_KEY);
    if (!stored) return;
    // no-op: page just creates new items
  }, []);

  const handleSubmit = (values: RequestFormValues) => {
    setError('');
    if (!values.title || !values.description || !values.assetType) {
      setError('Please fill the required fields.');
      return;
    }

    const stored = localStorage.getItem(REQUEST_STORAGE_KEY);
    const existingRequests: AssetRequest[] = stored ? JSON.parse(stored) : mockAssetRequests;

    const newRequest: AssetRequest = {
      id: `REQ-${Date.now()}`,
      requestedBy: session?.name || 'Current User',
      requestedByUserId: session?.userId,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0],
      title: values.title,
      description: values.description,
      assetType: values.assetType,
      quantity: Number(values.quantity) || 1,
      estimatedCost: Number(values.estimatedCost) || 0,
      priority: values.priority,
      dueDate: values.dueDate,
      department: values.department,
    };

    localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify([...existingRequests, newRequest]));
    router.push('/requests');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        <RequestForm
          title="Create New Request"
          description="Fill in the request details to submit a new asset request."
          submitLabel="Create Request"
          cancelHref="/requests"
          error={error}
          onSubmit={handleSubmit}
        />
      </DashboardLayout>
    </SessionCheck>
  );
}
