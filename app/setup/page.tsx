import SetupClient from './setup-client';
import { normalizePlan } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default function SetupPage({
  searchParams,
}: {
  searchParams?: { plan?: string };
}) {
  const selectedPlan = normalizePlan(searchParams?.plan);
  return <SetupClient selectedPlan={selectedPlan} />;
}
