'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { RequestForm, type RequestFormValues } from '@/components/forms/request-form';
import { mockAssetRequests } from '@/lib/mock-data';
import type { AssetRequest } from '@/lib/mock-data';

const REQUEST_STORAGE_KEY = 'asset_requests';

export default function EditRequestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const requestId = params.id;
  const [request, setRequest] = useState<AssetRequest | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(REQUEST_STORAGE_KEY);
    const existingRequests: AssetRequest[] = stored ? JSON.parse(stored) : mockAssetRequests;
    setRequest(existingRequests.find((item) => item.id === requestId) || null);
  }, [requestId]);

  const initialValues = useMemo<Partial<RequestFormValues> | undefined>(() => {
    if (!request) return undefined;
    return {
      title: request.title,
      description: request.description,
      assetType: request.assetType,
      quantity: String(request.quantity),
      estimatedCost: String(request.estimatedCost),
      priority: request.priority,
      dueDate: request.dueDate,
      department: request.department,
    };
  }, [request]);

  const handleSubmit = (values: RequestFormValues) => {
    setError('');
    if (!request) {
      setError('Request not found.');
      return;
    }

    const stored = localStorage.getItem(REQUEST_STORAGE_KEY);
    const existingRequests: AssetRequest[] = stored ? JSON.parse(stored) : mockAssetRequests;

    const updatedRequest: AssetRequest = {
      ...request,
      title: values.title,
      description: values.description,
      assetType: values.assetType,
      quantity: Number(values.quantity) || 1,
      estimatedCost: Number(values.estimatedCost) || 0,
      priority: values.priority,
      dueDate: values.dueDate,
      department: values.department,
    };

    localStorage.setItem(
      REQUEST_STORAGE_KEY,
      JSON.stringify(existingRequests.map((item) => (item.id === request.id ? updatedRequest : item)))
    );
    router.push('/requests');
  };

  return (
    <SessionCheck>
      <DashboardLayout>
        {request ? (
          <RequestForm
            title="Edit Request"
            description="Update the request details on a full page."
            submitLabel="Update Request"
            cancelHref="/requests"
            initialValues={initialValues}
            error={error}
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-muted-foreground shadow-sm">Loading request...</div>
        )}
      </DashboardLayout>
    </SessionCheck>
  );
}
