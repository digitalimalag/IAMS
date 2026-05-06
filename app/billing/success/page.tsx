'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const signature = searchParams.get('signature');
  const [message, setMessage] = useState('Verifying your payment and creating your workspace...');
  const [error, setError] = useState('');

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
            plan: data.plan,
            assetLimit: data.assetLimit,
            userLimit: data.userLimit,
            billingCycle: data.billingCycle,
            subscriptionStatus: 'active',
          }));
        }

        setMessage('Payment verified. Redirecting to dashboard...');
        router.replace('/dashboard');
      } catch {
        setError('Unexpected error while finalizing payment.');
      }
    };

    finalize();
  }, [router, orderId, paymentId, signature]);

  return (
    <main className="min-h-screen bg-[#f5f6ef] px-5 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center">
        <Card className="w-full border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Payment Success</CardTitle>
            <CardDescription>We are setting up your workspace now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">{message}</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Open Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
