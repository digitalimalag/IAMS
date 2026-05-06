import BillingClient from './billing-client';
import { normalizePlan, type SubscriptionPlan } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default function BillingPage({
  searchParams,
}: {
  searchParams?: { plan?: string };
}) {
  const initialPlan = normalizePlan(searchParams?.plan) as SubscriptionPlan;
  return <BillingClient initialPlan={initialPlan} />;
}
