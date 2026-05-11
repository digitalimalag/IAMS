'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { PLAN_CONFIGS, getBillingLabel, getPlanConfig, type BillingCycle, type SubscriptionPlan } from '@/lib/subscription';

const paymentMethods = [
  { key: 'upi', label: 'UPI', icon: Smartphone },
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'netbanking', label: 'Net Banking', icon: Landmark },
  { key: 'wallet', label: 'Wallet / Other', icon: Wallet },
];

export default function BillingClient({ initialPlan }: { initialPlan: SubscriptionPlan }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan);
  const planConfig = useMemo(() => getPlanConfig(selectedPlan), [selectedPlan]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [organizationName, setOrganizationName] = useState('');
  const [slug, setSlug] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('IT Support');
  const [password, setPassword] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = async () => {
    if (typeof window === 'undefined') return false;
    if ((window as typeof window & { Razorpay?: unknown }).Razorpay) {
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (selectedPlan === 'free') {
        router.push('/setup?plan=free');
        return;
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName,
          slug,
          fullName,
          email,
          phone,
          department,
          password,
          paymentMethod,
          billingCycle,
          plan: selectedPlan,
          companyWebsite,
          companyAddress,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.orderId || !data.keyId) {
        setError(data.error || 'Unable to start checkout');
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay checkout');
        return;
      }

      const Razorpay = (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
      const razorpay = new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: data.organizationName || 'Digital IMALAG IT Assets Management SaaS',
        description: `${planConfig.label} subscription`,
        order_id: data.orderId,
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          billing_intent_id: data.billingIntentId,
          organization_slug: slug,
          plan: selectedPlan,
          billing_cycle: billingCycle,
        },
        theme: {
          color: '#0f172a',
        },
        handler: (responseData: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const params = new URLSearchParams({
            orderId: responseData.razorpay_order_id,
            paymentId: responseData.razorpay_payment_id,
            signature: responseData.razorpay_signature,
          });
          router.push(`/billing/success?${params.toString()}`);
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      });

      razorpay.open();
    } catch {
      setError('An unexpected billing error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6ef] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <section className="space-y-6 rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Billing</p>
            <h1 className="mt-2 text-4xl font-semibold">Choose your plan and pay securely online.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Start with the subscription that fits your team. After payment, your company workspace and Master Admin account are created automatically.
            </p>
          </div>

          <div className="grid gap-3">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle>Choose your plan</CardTitle>
                <CardDescription>You can switch plans before checkout.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(PLAN_CONFIGS) as SubscriptionPlan[]).map((planKey) => {
                  const plan = PLAN_CONFIGS[planKey];
                  const active = selectedPlan === planKey;
                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => setSelectedPlan(planKey)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <p className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-900'}`}>{plan.label}</p>
                      <p className={`mt-1 text-xs leading-5 ${active ? 'text-slate-300' : 'text-slate-500'}`}>{plan.summary}</p>
                      {plan.yearlySavingsAmount > 0 && (
                        <div className="mt-3 inline-flex rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                          Save Rs-{plan.yearlySavingsAmount}/year
                        </div>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-emerald-900">Selected plan</p>
                <p className="mt-1 text-lg font-semibold text-emerald-800">{planConfig.label}</p>
                <p className="mt-1 text-sm text-emerald-700">{planConfig.summary}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium text-slate-900">Included</p>
                <p className="text-sm text-slate-600">
                  {planConfig.userLimit === 1 ? '1 Master Admin' : `${planConfig.userLimit} Users`}
                </p>
                <p className="text-sm text-slate-600">
                  {Number.isFinite(planConfig.assetLimit) ? `${planConfig.assetLimit} Assets` : 'Unlimited Assets'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-slate-900">Pricing</p>
                <p className="mt-2 text-sm text-slate-600">
                  {billingCycle === 'yearly' ? planConfig.yearlyPrice : planConfig.monthlyPrice} for {getBillingLabel(billingCycle).toLowerCase()} billing
                </p>
                {billingCycle === 'yearly' && planConfig.yearlySavingsAmount > 0 && (
                  <div className="mt-3 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Yearly savings: Rs-{planConfig.yearlySavingsAmount}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const active = paymentMethod === method.key;
              return (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => setPaymentMethod(method.key)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-cyan-300' : 'text-slate-700'}`} />
                  <p className="mt-3 text-sm font-medium">{method.label}</p>
                  <p className={`mt-1 text-xs leading-5 ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                    Secure payment route for plan purchase.
                  </p>
                </button>
              );
            })}
          </div>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Billing cycle</CardTitle>
              <CardDescription>Switch between monthly and yearly options.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button type="button" variant={billingCycle === 'monthly' ? 'default' : 'outline'} onClick={() => setBillingCycle('monthly')}>
                Monthly
              </Button>
              <Button type="button" variant={billingCycle === 'yearly' ? 'default' : 'outline'} onClick={() => setBillingCycle('yearly')}>
                Yearly
              </Button>
              <div className="ml-auto text-sm text-slate-500">
                {getBillingLabel(billingCycle)} billing selected
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card className="border-white/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Complete your company setup</CardTitle>
              <CardDescription>Enter your company and admin details before checkout.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel>Organization Name</FieldLabel>
                    <Input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Your company name" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Company Slug</FieldLabel>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="your-company" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Master admin name" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Email</FieldLabel>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Phone</FieldLabel>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Department</FieldLabel>
                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="IT Support" />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel>Temporary Password</FieldLabel>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a secure password" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Website</FieldLabel>
                    <Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://company.com" />
                  </FieldGroup>
                </div>

                <FieldGroup>
                  <FieldLabel>Address</FieldLabel>
                  <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Office address" />
                </FieldGroup>

                {error && (
                  <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-50 p-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" className="gap-2 bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
                    {isLoading ? 'Redirecting...' : 'Proceed to Payment'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Link href="/login">
                    <Button type="button" variant="outline">
                      Login
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
