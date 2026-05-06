export type SubscriptionPlan = 'free' | 'starter' | 'growth' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanConfig {
  key: SubscriptionPlan;
  label: string;
  assetLimit: number;
  userLimit: number;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyAmount: number;
  yearlyAmount: number;
  summary: string;
  highlight?: string;
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    key: 'free',
    label: 'Free',
    assetLimit: 5,
    userLimit: 1,
    monthlyPrice: 'Rs-0 M',
    yearlyPrice: 'Rs-0 Y',
    monthlyAmount: 0,
    yearlyAmount: 0,
    summary: 'Best for trying the product with one master admin and five assets.',
    highlight: 'Free forever for single-tenant evaluation',
  },
  starter: {
    key: 'starter',
    label: 'Starter',
    assetLimit: Number.POSITIVE_INFINITY,
    userLimit: 10,
    monthlyPrice: 'Rs-600 M',
    yearlyPrice: 'Rs-6500 Y',
    monthlyAmount: 600,
    yearlyAmount: 6500,
    summary: 'For small teams that need dependable asset and issue workflows.',
    highlight: 'Best for small teams',
  },
  growth: {
    key: 'growth',
    label: 'Growth',
    assetLimit: Number.POSITIVE_INFINITY,
    userLimit: 50,
    monthlyPrice: 'Rs-700 M',
    yearlyPrice: 'Rs-7500 Y',
    monthlyAmount: 700,
    yearlyAmount: 7500,
    summary: 'For growing companies that manage more users, assets, and sites.',
    highlight: 'Best value for scaling companies',
  },
  enterprise: {
    key: 'enterprise',
    label: 'Enterprise',
    assetLimit: Number.POSITIVE_INFINITY,
    userLimit: 250,
    monthlyPrice: 'Rs-1000 M',
    yearlyPrice: 'Rs-10000 Y',
    monthlyAmount: 1000,
    yearlyAmount: 10000,
    summary: 'For large organizations with advanced access control and billing needs.',
    highlight: 'For large operations and multi-site IT',
  },
};

export function normalizePlan(plan?: string | null): SubscriptionPlan {
  const normalized = String(plan || '').trim().toLowerCase();
  if (normalized === 'starter' || normalized === 'growth' || normalized === 'enterprise') {
    return normalized;
  }
  return 'free';
}

export function getPlanConfig(plan?: string | null): PlanConfig {
  return PLAN_CONFIGS[normalizePlan(plan)];
}

export function getBillingLabel(cycle: BillingCycle) {
  return cycle === 'yearly' ? 'Yearly' : 'Monthly';
}

export function getPlanAmount(plan: SubscriptionPlan, cycle: BillingCycle) {
  const config = PLAN_CONFIGS[plan];
  return cycle === 'yearly' ? config.yearlyAmount : config.monthlyAmount;
}
