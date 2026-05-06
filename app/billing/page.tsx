import BillingClient from './billing-client';
import { normalizePlan, type SubscriptionPlan } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  const initialPlan = normalizePlan(resolvedSearchParams.plan) as SubscriptionPlan;
  return <BillingClient initialPlan={initialPlan} />;
}
