'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

type BillingReceipt = {
  organizationName?: string;
  email?: string;
  plan?: string;
  billingCycle?: string;
  assetLimit?: number | null;
  userLimit?: number | null;
  subscriptionExpiresAt?: string;
  subscriptionRenewalNoticeAt?: string;
  amount?: number | null;
  currency?: string;
  orderId?: string;
  paymentId?: string;
};

export default function BillingSuccessClient({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string | null;
  paymentId: string | null;
  signature: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your payment and creating your workspace...');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<BillingReceipt | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const finalize = async () => {
      if (!orderId || !paymentId || !signature) {
        setError('Missing payment verification data.');
        return;
      }

      try {
        const response = await fetch('/api/billing/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paymentId, signature }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data.error || 'Payment verification failed.');
          return;
        }

        if (isSupabaseConfigured()) {
          const supabase = createSupabaseBrowserClient();
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (signInError || !signInData.user || !signInData.session) {
            setMessage('Payment completed. Please sign in to continue.');
            router.replace('/login?created=1');
            return;
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, full_name, email, phone, department, role, is_active')
            .eq('user_id', signInData.user.id)
            .single();

          const session = {
            userId: signInData.user.id,
            email: signInData.user.email || data.email,
            name: profile?.full_name || '',
            organizationId: profile?.organization_id || data.organizationId,
            organizationName: data.organizationName || '',
            role: profile?.role || 'master_admin',
            department: profile?.department || '',
            token: signInData.session.access_token,
            expiresAt: new Date((signInData.session.expires_at || 0) * 1000).toISOString(),
            subscriptionExpiresAt: data.subscriptionExpiresAt,
            subscriptionRenewalNoticeAt: data.subscriptionRenewalNoticeAt,
            subscriptionGraceEndsAt: data.subscriptionGraceEndsAt,
            plan: data.plan,
            assetLimit: data.assetLimit,
            userLimit: data.userLimit,
            billingCycle: data.billingCycle,
            subscriptionStatus: 'active',
          };

          localStorage.setItem('session', JSON.stringify(session));
          localStorage.setItem('user', JSON.stringify({
            id: signInData.user.id,
            email: session.email,
            name: session.name,
            organizationId: session.organizationId,
            role: session.role,
            department: session.department,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0],
          }));

          setReceipt({
            organizationName: data.organizationName,
            email: data.email,
            plan: data.plan,
            billingCycle: data.billingCycle,
            assetLimit: data.assetLimit,
            userLimit: data.userLimit,
            subscriptionExpiresAt: data.subscriptionExpiresAt,
            subscriptionRenewalNoticeAt: data.subscriptionRenewalNoticeAt,
            amount: data.amount,
            currency: 'INR',
            orderId,
            paymentId,
          });
        } else {
          localStorage.setItem('session', JSON.stringify({
            userId: data.userId,
            email: data.email,
            name: 'Master Admin',
            organizationId: data.organizationId,
            organizationName: data.organizationName || '',
            role: 'master_admin',
            department: 'IT Support',
            token: 'billing-complete',
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
            subscriptionExpiresAt: data.subscriptionExpiresAt,
            subscriptionRenewalNoticeAt: data.subscriptionRenewalNoticeAt,
            subscriptionGraceEndsAt: data.subscriptionGraceEndsAt,
            plan: data.plan,
            assetLimit: data.assetLimit,
            userLimit: data.userLimit,
            billingCycle: data.billingCycle,
            subscriptionStatus: 'active',
          }));

          setReceipt({
            organizationName: data.organizationName,
            email: data.email,
            plan: data.plan,
            billingCycle: data.billingCycle,
            assetLimit: data.assetLimit,
            userLimit: data.userLimit,
            subscriptionExpiresAt: data.subscriptionExpiresAt,
            subscriptionRenewalNoticeAt: data.subscriptionRenewalNoticeAt,
            amount: data.amount,
            currency: 'INR',
            orderId,
            paymentId,
          });
        }

        setMessage('Payment verified successfully. You can download the bill or open your dashboard.');
        setIsReady(true);
      } catch {
        setError('Unexpected error while finalizing payment.');
      }
    };

    finalize();
  }, [router, orderId, paymentId, signature]);

  const downloadBill = () => {
    if (!receipt) return;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${receipt.organizationName || 'Workspace'}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; }
    .card { border: 1px solid #dbe4ea; border-radius: 16px; padding: 24px; }
    h1 { margin: 0 0 8px; }
    .muted { color: #64748b; }
    .row { display: flex; justify-content: space-between; gap: 16px; margin-top: 10px; }
    .label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
    .value { font-size: 16px; font-weight: 600; }
    .total { margin-top: 22px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 18px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Payment Receipt</h1>
    <p class="muted">Digital IMALAG IT Assets Management SaaS</p>
    <div class="row"><div><div class="label">Company</div><div class="value">${receipt.organizationName || '-'}</div></div><div><div class="label">Email</div><div class="value">${receipt.email || '-'}</div></div></div>
    <div class="row"><div><div class="label">Plan</div><div class="value">${String(receipt.plan || '-').toUpperCase()}</div></div><div><div class="label">Billing Cycle</div><div class="value">${String(receipt.billingCycle || '-').toUpperCase()}</div></div></div>
    <div class="row"><div><div class="label">Order ID</div><div class="value">${receipt.orderId || '-'}</div></div><div><div class="label">Payment ID</div><div class="value">${receipt.paymentId || '-'}</div></div></div>
    <div class="row"><div><div class="label">User Limit</div><div class="value">${receipt.userLimit ?? '-'}</div></div><div><div class="label">Asset Limit</div><div class="value">${receipt.assetLimit ?? '-'}</div></div></div>
    <div class="total">Amount Paid: ${receipt.currency || 'INR'} ${receipt.amount ? (receipt.amount / 100).toFixed(2) : '0.00'}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${receipt.organizationName?.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'payment'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="relative min-h-screen bg-transparent px-5 py-10 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(249,250,246,0.72)_0%,rgba(238,244,237,0.56)_48%,rgba(237,242,247,0.68)_100%)]" />
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center">
        <Card className="w-full border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Payment Success</CardTitle>
            <CardDescription>We are setting up your workspace now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">{message}</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {receipt && (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="grid gap-2 sm:grid-cols-2">
                  <p><span className="font-semibold">Company:</span> {receipt.organizationName || '-'}</p>
                  <p><span className="font-semibold">Email:</span> {receipt.email || '-'}</p>
                  <p><span className="font-semibold">Plan:</span> {String(receipt.plan || '-').toUpperCase()}</p>
                  <p><span className="font-semibold">Cycle:</span> {String(receipt.billingCycle || '-').toUpperCase()}</p>
                  <p><span className="font-semibold">Order:</span> {receipt.orderId || '-'}</p>
                  <p><span className="font-semibold">Payment:</span> {receipt.paymentId || '-'}</p>
                  <p><span className="font-semibold">Users:</span> {receipt.userLimit ?? '-'}</p>
                  <p><span className="font-semibold">Assets:</span> {receipt.assetLimit ?? '-'}</p>
                </div>
                <p className="text-base font-semibold text-slate-900">
                  Amount Paid: {receipt.currency || 'INR'} {(Number(receipt.amount || 0) / 100).toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={downloadBill} disabled={!receipt}>
                Download Bill
              </Button>
              <Link href="/dashboard">
                <Button disabled={!isReady}>Open Dashboard</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
