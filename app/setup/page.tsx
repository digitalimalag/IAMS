import SetupClient from './setup-client';
import { normalizePlan } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default async function SetupPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  const selectedPlan = normalizePlan(resolvedSearchParams.plan);
  return <SetupClient selectedPlan={selectedPlan} />;
}
