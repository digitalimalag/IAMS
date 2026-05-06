'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, LockKeyhole, Network, ShieldCheck, Tag, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { authenticateUser, createSession } from '@/lib/auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';

const featureList = [
  { icon: Tag, text: 'Asset tagging and lifecycle tracking' },
  { icon: Workflow, text: 'Help desk ticketing and call management' },
  { icon: ShieldCheck, text: 'Role-based access for every company' },
  { icon: Network, text: 'IT operations across one or many tenants' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient();
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError || !data.user || !data.session) {
          setError(signInError?.message || 'Login failed');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id, full_name, email, phone, department, role, is_active')
          .eq('user_id', data.user.id)
          .single();

        if (profileError || !profile) {
          setError(profileError?.message || 'User profile not found');
          return;
        }

        if (!profile.is_active) {
          setError('User account is inactive');
          return;
        }

        const { data: orgRow } = await supabase
          .from('organizations')
          .select('name, plan, settings')
          .eq('id', profile.organization_id)
          .single();

        const plan = normalizePlan(orgRow?.plan);
        const planConfig = getPlanConfig(plan);
        const subscription = orgRow?.settings?.subscription || {};

        const session = {
          userId: data.user.id,
          email: data.user.email || profile.email,
          name: profile.full_name,
          organizationId: profile.organization_id,
          organizationName: orgRow?.name || '',
          role: profile.role,
          department: profile.department || '',
          token: data.session.access_token,
          expiresAt: new Date((data.session.expires_at || 0) * 1000).toISOString(),
          plan,
          assetLimit: Number.isFinite(subscription.assetLimit) ? subscription.assetLimit : planConfig.assetLimit,
          userLimit: Number(subscription.userLimit || planConfig.userLimit),
          billingCycle: subscription.billingCycle || 'monthly',
          subscriptionStatus: subscription.status || 'active',
        };

        localStorage.setItem('session', JSON.stringify(session));
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
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
        return;
      }

      const response = authenticateUser(email, password);
      if (!response.success || !response.user || !response.token) {
        setError(response.error || 'Login failed');
        return;
      }

      const session = createSession(response.user, response.token);
      localStorage.setItem('session', JSON.stringify(session));
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/dashboard');
    } catch {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f6ef] text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(173,216,230,0.5),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(164,196,172,0.35),_transparent_28%),linear-gradient(135deg,#f9faf6_0%,#eef4ed_48%,#edf2f7_100%)]" />

      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-sm backdrop-blur lg:block">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src="/logo.png" alt="Digital IMALAG logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Digital IMALAG</p>
                <h1 className="text-2xl font-semibold text-slate-900">Sign in to your company workspace</h1>
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <h2 className="text-5xl font-semibold leading-tight tracking-tight text-slate-900">
                Manage assets, tickets, and users without spreadsheet chaos.
              </h2>
              <p className="text-lg leading-8 text-slate-600">
                Built for companies that need tagging, issue handling, handovers, and role-based access in one place.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {featureList.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm leading-6 text-slate-700">{item.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['Multi-tenant', 'RLS + org separation'],
                ['IT tickets', 'Track calls and requests'],
                ['Asset control', 'Tag, assign, handover'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-900">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img src="/logo.png" alt="Digital IMALAG logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">Digital IMALAG IT Assets Management SaaS</h1>
            <p className="mt-2 text-sm text-slate-500">Secure access for assets, tickets, and users</p>
          </div>

          <Card className="border-white/80 bg-white/90 shadow-sm backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle className="text-slate-900">Welcome back</CardTitle>
              <CardDescription className="text-slate-600">Sign in to continue to your company workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <FieldGroup>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </FieldGroup>

                {error && (
                  <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-50 p-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button type="submit" className="h-11 w-full gap-2 bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
                  <LockKeyhole className="h-4 w-4" />
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-900">Need access?</p>
                <p className="text-sm leading-6 text-slate-600">
                  Create or invite users in Supabase Auth, then map them to a company profile in <code>profiles</code>.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/">
                    <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                      View Home
                    </Button>
                  </Link>
                  <Link href="/setup?plan=free">
                    <Button variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="mb-2 text-sm font-semibold text-emerald-900">Login note</p>
                <p className="text-sm text-emerald-800">
                  If Supabase login returns <code>400</code>, check that the user exists, the password is correct, and email confirmation is configured.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
