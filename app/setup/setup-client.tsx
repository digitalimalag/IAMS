'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { type SubscriptionPlan } from '@/lib/subscription';

export default function SetupClient({ selectedPlan }: { selectedPlan: SubscriptionPlan }) {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState('');
  const [slug, setSlug] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('IT Support');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/bootstrap', {
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
          plan: selectedPlan,
          billingCycle: 'monthly',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to create initial admin');
        return;
      }

      if (!isSupabaseConfigured()) {
        router.push('/login');
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.user || !signInData.session) {
        setError(signInError?.message || 'Admin created, but auto-login failed. Please sign in manually.');
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, full_name, email, phone, department, role, is_active')
        .eq('user_id', signInData.user.id)
        .single();

      if (profileError || !profile) {
        setError(profileError?.message || 'Admin created, but profile lookup failed.');
        router.push('/login');
        return;
      }

      const session = {
        userId: signInData.user.id,
        email: signInData.user.email || profile.email,
        name: profile.full_name,
        organizationId: profile.organization_id,
        organizationName: organizationName,
        role: profile.role,
        department: profile.department || '',
        token: signInData.session.access_token,
        expiresAt: new Date((signInData.session.expires_at || 0) * 1000).toISOString(),
        plan: data.plan || selectedPlan,
        assetLimit: data.assetLimit,
        userLimit: data.userLimit,
        billingCycle: data.billingCycle || 'monthly',
        subscriptionStatus: 'active',
      };

      localStorage.setItem('session', JSON.stringify(session));
      localStorage.setItem('user', JSON.stringify({
        id: signInData.user.id,
        email: session.email,
        name: session.name,
        organizationId: session.organizationId,
        organizationName: session.organizationName,
        role: session.role,
        department: session.department,
        isActive: profile.is_active,
        createdAt: new Date().toISOString().split('T')[0],
      }));

      router.push('/dashboard');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6ef] text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(173,216,230,0.45),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(164,196,172,0.35),_transparent_28%),linear-gradient(135deg,#f9faf6_0%,#eef4ed_48%,#edf2f7_100%)]" />
      <div className="mx-auto grid min-h-screen max-w-6xl items-center px-4 py-8 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden lg:block">
          <div className="space-y-6 rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <img src="/logo.png" alt="Digital IMALAG logo" className="h-full w-full rounded-2xl object-cover" />
            </div>
            <h1 className="text-5xl font-semibold leading-tight text-slate-900">
              Create your master admin and launch your tenant workspace.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              This one-time setup creates your first organization, master admin, and initial department in Supabase.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">What to fill here</p>
              <p className="mt-2 leading-6">
                Organization Name is your company name. Company Slug is a short unique ID like <span className="text-slate-900 font-medium">digital-atharva</span>. Full Name is the first Master Admin account, and Department is usually <span className="text-slate-900 font-medium">IT Support</span>.
              </p>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Auth user + profile + department created together</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <span>Auto-login after successful setup</span>
              </div>
              <div className="flex items-center gap-3">
                <ArrowRight className="h-4 w-4 text-emerald-700" />
                <span>Ready for multi-company SaaS expansion</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <Card className="border-white/80 bg-white/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-slate-900">First-time setup</CardTitle>
              <CardDescription className="text-slate-600">
                Create your free company workspace and initial Master Admin account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Free plan includes 1 Master Admin and 5 assets. For paid plans, use Billing.
              </div>
              <form onSubmit={handleBootstrap} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel>Organization Name</FieldLabel>
                    <Input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Your company name" className="border-slate-200 bg-white text-slate-900" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Company Slug</FieldLabel>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="your-company" className="border-slate-200 bg-white text-slate-900" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Master admin name" className="border-slate-200 bg-white text-slate-900" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Email</FieldLabel>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" className="border-slate-200 bg-white text-slate-900" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Phone</FieldLabel>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." className="border-slate-200 bg-white text-slate-900" />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Department</FieldLabel>
                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="IT Support" className="border-slate-200 bg-white text-slate-900" />
                  </FieldGroup>
                </div>

                <FieldGroup>
                  <FieldLabel>Temporary Password</FieldLabel>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a secure password" className="border-slate-200 bg-white text-slate-900" />
                </FieldGroup>

                {error && (
                  <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-50 p-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Master Admin'}
                  </Button>
                  <Link href="/login">
                    <Button type="button" variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
                      Sign In
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
