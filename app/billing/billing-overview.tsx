'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeDollarSign, CreditCard, Download, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { PLAN_CONFIGS, type BillingCycle, type SubscriptionPlan } from '@/lib/subscription';
import type { Session } from '@/lib/auth';
import { cn } from '@/lib/utils';

type BillingSummary = {
  organization: {
    name: string;
    logoUrl?: string;
    status?: string;
  };
  subscription: {
    plan: SubscriptionPlan;
    label: string;
    billingCycle: BillingCycle;
    assetLimit: number | null;
    userLimit: number | null;
    status: string;
    expiresAt?: string | null;
    renewalNoticeAt?: string | null;
    graceEndsAt?: string | null;
    paymentMethod?: string | null;
    provider?: string | null;
  };
  payments: Array<{
    id: string;
    plan: SubscriptionPlan;
    billing_cycle: BillingCycle;
    amount: number;
    currency: string;
    payment_method: string;
    provider: string;
    provider_session_id: string | null;
    provider_payment_intent_id: string | null;
    status: string;
    customer_email: string | null;
    created_at: string;
    invoiceUrl: string;
  }>;
};

const planOrder: SubscriptionPlan[] = ['free', 'starter', 'growth', 'enterprise'];

function daysLeft(iso?: string | null) {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function BillingOverview({ initialView = 'billing' }: { initialView?: 'billing' | 'payments' | 'subscription' }) {
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(initialView);
  const [error, setError] = useState('');

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const sessionStr = localStorage.getItem('session');
        if (!sessionStr) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(sessionStr) as Session;
        setSession(parsed);

        if (!isSupabaseConfigured() || !parsed.token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/billing/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${parsed.token}`,
          },
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data.error || 'Unable to load billing summary');
          setLoading(false);
          return;
        }

        setSummary(data as BillingSummary);
      } catch {
        setError('Unable to load billing summary');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const currentPlan = summary?.subscription.plan || session?.plan || 'free';
  const currentPlanConfig = PLAN_CONFIGS[currentPlan];
  const renewalDays = daysLeft(summary?.subscription.renewalNoticeAt || session?.subscriptionRenewalNoticeAt);
  const expiryDays = daysLeft(summary?.subscription.expiresAt || session?.subscriptionExpiresAt);

  const paymentCount = summary?.payments.length || 0;
  const latestPayment = summary?.payments[0];

  const handleDownloadInvoice = async (paymentId: string) => {
    if (!session?.token) return;

    const response = await fetch(`/api/billing/invoice/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (!response.ok) return;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${paymentId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const planCards = useMemo(() => planOrder.filter((plan) => plan !== 'free'), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Billing center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Billing, Payments, and Plans</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Review your active subscription, manage renewals, and download invoices from one clean workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['billing', 'payments', 'subscription'] as const).map((view) => (
            <Button
              key={view}
              variant={activeView === view ? 'default' : 'outline'}
              onClick={() => setActiveView(view)}
              className="capitalize"
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      {renewalDays !== null && renewalDays <= 5 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <p className="font-semibold text-amber-900">Renewal reminder</p>
                <p className="text-sm text-amber-800">
                  Your plan expires in {Math.max(renewalDays, 0)} day(s). Renew now to avoid suspension.
                </p>
              </div>
            </div>
            <Link href="/billing?plan=starter">
              <Button className="bg-amber-600 text-white hover:bg-amber-700">Manage plan</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-6 text-sm text-muted-foreground">Loading billing data...</CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border/50 bg-card">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">Current plan</p>
                  <p className="mt-2 text-2xl font-semibold">{currentPlanConfig.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{summary?.subscription.billingCycle || session?.billingCycle || 'monthly'}</p>
                </div>
                <BadgeDollarSign className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">Subscription status</p>
                  <p className="mt-2 text-2xl font-semibold capitalize">{summary?.subscription.status || 'active'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {expiryDays !== null ? `${Math.max(expiryDays, 0)} day(s) remaining` : 'No expiry set'}
                  </p>
                </div>
                <Shield className="h-5 w-5 text-emerald-600" />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">Payments made</p>
                  <p className="mt-2 text-2xl font-semibold">{paymentCount}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Billing history and receipts</p>
                </div>
                <CreditCard className="h-5 w-5 text-sky-600" />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">Next reminder</p>
                  <p className="mt-2 text-2xl font-semibold">{renewalDays !== null ? `${Math.max(renewalDays, 0)} day(s)` : '-'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">5 days before expiry</p>
                </div>
                <RefreshCw className="h-5 w-5 text-amber-600" />
              </CardContent>
            </Card>
          </div>

          {activeView === 'billing' && (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle>Current subscription</CardTitle>
                  <CardDescription>Active plan and renewal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan</p>
                      <p className="mt-2 text-lg font-semibold">{currentPlanConfig.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{currentPlanConfig.highlight}</p>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Cycle</p>
                      <p className="mt-2 text-lg font-semibold capitalize">{summary?.subscription.billingCycle || 'monthly'}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {summary?.subscription.paymentMethod ? `Paid via ${summary.subscription.paymentMethod}` : 'Manage payment method from checkout'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Users</p>
                      <p className="mt-2 text-xl font-semibold">{summary?.subscription.userLimit ?? currentPlanConfig.userLimit}</p>
                    </div>
                    <div className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Assets</p>
                      <p className="mt-2 text-xl font-semibold">
                        {summary?.subscription.assetLimit === null || summary?.subscription.assetLimit === undefined
                          ? 'Unlimited'
                          : summary.subscription.assetLimit}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Expiry</p>
                      <p className="mt-2 text-xl font-semibold">
                        {summary?.subscription.expiresAt ? new Date(summary.subscription.expiresAt).toLocaleDateString('en-IN') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/billing?plan=starter">
                      <Button variant="outline">Upgrade / manage plan</Button>
                    </Link>
                    <Link href="/onboarding">
                      <Button variant="ghost">Open onboarding</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle>Quick actions</CardTitle>
                  <CardDescription>Plan and workspace shortcuts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm font-medium">Download invoices</p>
                    <p className="mt-1 text-sm text-muted-foreground">Open the Payments tab to download PDF receipts.</p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm font-medium">Renewal window</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We will remind the company before expiry and show renewal prompts inside the app.
                    </p>
                  </div>
                  <Link href="/billing?view=payments">
                    <Button className="w-full">View payment history</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'payments' && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle>Payment history</CardTitle>
                <CardDescription>Download invoices and review completed payments.</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.payments?.length ? (
                  <div className="space-y-3">
                    {summary.payments.map((payment) => (
                      <div key={payment.id} className="flex flex-col gap-3 rounded-2xl border border-border/50 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{PLAN_CONFIGS[payment.plan].label}</p>
                            <Badge variant="secondary" className="capitalize">{payment.billing_cycle}</Badge>
                            <Badge className="capitalize">{payment.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payment.currency} {(Number(payment.amount || 0)).toFixed(2)} • {new Date(payment.created_at).toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm text-muted-foreground">Method: {payment.payment_method}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="ghost" onClick={() => handleDownloadInvoice(payment.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No completed payments yet.</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeView === 'subscription' && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle>Subscription plans</CardTitle>
                <CardDescription>Upgrade or switch plans before checkout.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 xl:grid-cols-3">
                  {planCards.map((planKey) => {
                    const plan = PLAN_CONFIGS[planKey];
                    const active = plan.key === currentPlan;
                    return (
                      <div key={plan.key} className={cn('rounded-3xl border p-5', active ? 'border-slate-900 bg-slate-900 text-white' : 'border-border/50 bg-white')}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={cn('text-lg font-semibold', active ? 'text-white' : 'text-slate-900')}>{plan.label}</p>
                            <p className={cn('mt-1 text-sm', active ? 'text-slate-300' : 'text-muted-foreground')}>{plan.summary}</p>
                          </div>
                          {active && <Badge className="bg-white text-slate-900">Active</Badge>}
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className={cn('text-2xl font-semibold', active ? 'text-white' : 'text-slate-900')}>
                            {plan.monthlyPrice} <span className={cn('text-sm', active ? 'text-slate-300' : 'text-muted-foreground')}>/ {plan.yearlyPrice}</span>
                          </p>
                          <p className={cn('text-sm', active ? 'text-slate-300' : 'text-muted-foreground')}>
                            Save Rs-{plan.yearlySavingsAmount}/year on yearly billing.
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link href={`/billing?plan=${plan.key}`}>
                            <Button className={active ? 'bg-white text-slate-900 hover:bg-slate-100' : ''} variant={active ? 'secondary' : 'default'}>
                              {active ? 'Manage plan' : 'Upgrade now'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {latestPayment && activeView === 'billing' && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle>Latest payment</CardTitle>
                <CardDescription>Quick summary of your most recent transaction.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan</p>
                  <p className="mt-1 font-medium">{PLAN_CONFIGS[latestPayment.plan].label}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount</p>
                  <p className="mt-1 font-medium">{latestPayment.currency} {(Number(latestPayment.amount || 0)).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Paid on</p>
                  <p className="mt-1 font-medium">{new Date(latestPayment.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Invoice</p>
                  <Button variant="link" className="h-auto p-0" onClick={() => handleDownloadInvoice(latestPayment.id)}>
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
