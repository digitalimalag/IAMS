import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BadgeCheck, Laptop2, Network, Server, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const plans = [
  {
    name: 'Free',
    price: 'Rs-0',
    billing: '1 Master Admin + 5 Assets',
    href: '/setup?plan=free',
    tone: 'border-emerald-500/20 bg-emerald-50 text-emerald-900',
    accent: 'text-emerald-700',
  },
  {
    name: 'Starter',
    price: 'Rs-600/M | 6500/Y',
    billing: '10 Users',
    savings: 'Save Rs-700/year',
    href: '/billing?plan=starter',
    tone: 'border-sky-500/20 bg-sky-50 text-sky-900',
    accent: 'text-sky-700',
  },
  {
    name: 'Growth',
    price: 'Rs-700/M | 7500/Y',
    billing: '50 Users',
    savings: 'Save Rs-900/year',
    href: '/billing?plan=growth',
    tone: 'border-teal-500/20 bg-teal-50 text-teal-900',
    accent: 'text-teal-700',
  },
  {
    name: 'Enterprise',
    price: 'Rs-1000/M | 10000/Y',
    billing: '250 Users',
    savings: 'Save Rs-2000/year',
    href: '/billing?plan=enterprise',
    tone: 'border-slate-500/20 bg-slate-50 text-slate-900',
    accent: 'text-slate-700',
  },
];

const highlights = [
  'Asset tagging and lifecycle tracking',
  'IT issue and ticket management',
  'Role-based access for every company',
  'HR, IT, Admin, and Master Admin workflows',
];

const steps = [
  { title: 'Sign up your company', desc: 'Create a company workspace with a unique slug and master admin.' },
  { title: 'Choose a plan', desc: 'Start free or move to Starter, Growth, or Enterprise billing.' },
  { title: 'Run operations', desc: 'Tag assets, handle issues/Ticketing, manage users, and track reporting.' },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(249,250,246,0.70)_0%,rgba(238,244,237,0.54)_48%,rgba(237,242,247,0.66)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(173,216,230,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(164,196,172,0.22),_transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.88),_transparent_65%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 lg:px-10">
        <header className="flex items-center justify-between rounded-3xl border border-white/70 bg-white/75 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Image src="/logo.png" alt="Digital IMALAG logo" width={44} height={44} className="h-full w-full object-cover" />
              </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Digital IMALAG</p>
              <h1 className="text-base font-semibold text-slate-900">IT Assets Management SaaS</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                Login
              </Button>
            </Link>
            <Link href="/setup?plan=free">
              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                Sign Up
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="space-y-8">
            <Badge className="w-fit border-emerald-500/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              Free plan includes 1 master admin and 5 assets
            </Badge>

            <div className="space-y-5">
              <h2 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Clean, secure IT asset management for companies that want clarity, not chaos.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Organize assets, devices, Issues/Ticketing, handovers, and company roles in one professional workspace.
                Start free for small teams or upgrade when you need more users and billing support.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/setup?plan=free">
                <Button size="lg" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500">
                  Sign Up Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-slate-300 bg-white/80 text-slate-800 hover:bg-slate-50">
                  Login
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <Card key={item} className="border-white/80 bg-white/85 shadow-sm">
                  <CardContent className="flex items-start gap-3 p-4">
                    <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <Card key={step.title} className="border-white/80 bg-white/85 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Step 0{index + 1}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-4 h-28 w-28 rounded-full bg-emerald-200/60 blur-3xl" />
            <div className="absolute right-4 top-16 h-36 w-36 rounded-full bg-sky-200/70 blur-3xl" />

            <Card className="relative overflow-hidden border-white/80 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 bg-gradient-to-r from-white to-slate-50">
                <CardTitle className="text-slate-900">What we do</CardTitle>
                <p className="text-sm text-slate-600">
                  We help IT teams tag assets, manage support, and keep company access structured.
                </p>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-slate-700" />
                        <p className="font-medium text-slate-800">Server Rack</p>
                      </div>
                      <span className="text-xs text-slate-500">Online</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      {['Core switch', 'Backup node', 'File store', 'Monitoring'].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                          <span className="text-sm text-slate-700">{item}</span>
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <Network className="h-5 w-5 text-sky-600" />
                      <p className="mt-3 text-sm font-medium text-slate-900">Network Rack</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Switches, routers, and devices in one place.</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <Laptop2 className="h-5 w-5 text-emerald-600" />
                      <p className="mt-3 text-sm font-medium text-slate-900">Laptop Pool</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Tagging, assignment, warranty, and ownership.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Operations</p>
                      <p className="mt-2 text-xl font-semibold">Dashboard snapshot</p>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-cyan-300" />
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Asset tagging</p>
                      <p className="mt-1 text-lg font-semibold">Clear ownership and traceability</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Issue desk</p>
                      <p className="mt-1 text-lg font-semibold">Track calls from open to resolved</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Role control</p>
                      <p className="mt-1 text-lg font-semibold">Admin, IT, HR, and Master Admin</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="plans" className="pb-10">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Subscriptions</p>
            <h3 className="text-3xl font-semibold text-slate-900">Choose the plan that fits your company</h3>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Free is perfect for one company with one master admin and five assets. Paid plans unlock more users and billing support.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.name} className={`border ${plan.tone} shadow-sm`}>
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">{plan.name}</CardTitle>
                  <p className="text-sm text-slate-600">{plan.billing}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Price</p>
                    <p className={`mt-1 text-xl font-semibold ${plan.accent}`}>{plan.price}</p>
                    {plan.savings && (
                      <div className="mt-3 inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {plan.savings}
                      </div>
                    )}
                  </div>
                  <Link href={plan.href}>
                    <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                      {plan.name === 'Free' ? 'Sign Up Free' : 'Go to Billing'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-slate-200 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Digital IMALAG IT Assets Management SaaS for structured asset control, issue handling, and tenant-safe access.</p>
          <div className="flex gap-4">
            <Link href="/setup?plan=free" className="hover:text-slate-900">
              Sign Up
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Login
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms & Conditions
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
