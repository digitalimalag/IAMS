import BillingClient from './billing-client';
import { BillingOverview } from './billing-overview';
import { normalizePlan, type SubscriptionPlan } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string; view?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  if (resolvedSearchParams.plan) {
    const initialPlan = normalizePlan(resolvedSearchParams.plan) as SubscriptionPlan;
    return <BillingClient initialPlan={initialPlan} />;
  }

  const view = resolvedSearchParams.view === 'payments' || resolvedSearchParams.view === 'subscription'
    ? resolvedSearchParams.view
    : 'billing';

  return <BillingOverview initialView={view} />;
}
