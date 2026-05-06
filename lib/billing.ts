import { getPlanAmount, normalizePlan, type BillingCycle, type SubscriptionPlan } from '@/lib/subscription';

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

  if (!keyId || !keySecret || !appUrl) {
    return null;
  }

  return {
    keyId,
    keySecret,
    appUrl: appUrl.replace(/\/$/, ''),
  };
}

export function getBillingAmount(plan: string, cycle: string) {
  const normalizedPlan = normalizePlan(plan) as SubscriptionPlan;
  const normalizedCycle: BillingCycle = cycle === 'yearly' ? 'yearly' : 'monthly';
  return getPlanAmount(normalizedPlan, normalizedCycle);
}

export function centsToRupees(amount: number) {
  return Math.max(0, Math.round(amount)) * 100;
}
