'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Settings, Users, Building2, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Session } from '@/lib/auth';

type StepItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: typeof Settings;
};

const steps: StepItem[] = [
  {
    id: 'company',
    title: 'Complete company details',
    description: 'Open Settings and fill your company name, contact details, logo, and branding fields.',
    href: '/settings',
    cta: 'Open Settings',
    icon: Settings,
  },
  {
    id: 'departments',
    title: 'Create departments',
    description: 'Set up IT, HR, Admin, Support, and any other departments used in your company.',
    href: '/companies',
    cta: 'Manage Departments',
    icon: Building2,
  },
  {
    id: 'users',
    title: 'Create users and permissions',
    description: 'Add users, assign roles, and give the right access to IT, HR, Admin, and staff.',
    href: '/users',
    cta: 'Manage Users',
    icon: Users,
  },
];

function loadSession() {
  if (typeof window === 'undefined') return null;
  const sessionStr = localStorage.getItem('session');
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr) as Session;
  } catch {
    return null;
  }
}

function getStorageKey(orgId?: string) {
  return `onboarding:${orgId || 'default'}`;
}

type OnboardingState = {
  completed: string[];
  dismissed: boolean;
};

function readOnboardingState(orgId?: string): OnboardingState {
  if (typeof window === 'undefined') {
    return { completed: [], dismissed: false };
  }
  const raw = localStorage.getItem(getStorageKey(orgId));
  if (!raw) return { completed: [], dismissed: false };
  try {
    const parsed = JSON.parse(raw) as OnboardingState;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      dismissed: Boolean(parsed.dismissed),
    };
  } catch {
    return { completed: [], dismissed: false };
  }
}

function writeOnboardingState(orgId: string | undefined, state: OnboardingState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(orgId), JSON.stringify(state));
}

type OnboardingChecklistProps = {
  mode?: 'dialog' | 'page';
};

export function OnboardingChecklist({ mode = 'dialog' }: OnboardingChecklistProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const currentSession = loadSession();
    setSession(currentSession);
    const state = readOnboardingState(currentSession?.organizationId);
    setCompleted(state.completed);
    setDismissed(state.dismissed);

    if (mode === 'dialog' && currentSession?.role === 'master_admin' && !state.dismissed && state.completed.length < steps.length) {
      setOpen(true);
    }
  }, [mode]);

  const orgId = session?.organizationId;
  const progress = useMemo(() => {
    return Math.round((completed.length / steps.length) * 100);
  }, [completed.length]);

  const toggleStep = (stepId: string) => {
    setCompleted((current) => {
      const next = current.includes(stepId) ? current.filter((id) => id !== stepId) : [...current, stepId];
      writeOnboardingState(orgId, { completed: next, dismissed });
      return next;
    });
  };

  const completeAll = () => {
    const next = steps.map((step) => step.id);
    setCompleted(next);
    writeOnboardingState(orgId, { completed: next, dismissed: false });
    if (mode === 'dialog') setOpen(false);
  };

  const skipForNow = () => {
    setDismissed(true);
    writeOnboardingState(orgId, { completed, dismissed: true });
    if (mode === 'dialog') setOpen(false);
  };

  const content = (
    <Card className="border-white/80 bg-white/90 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-slate-900">Master Admin Onboarding</CardTitle>
            <CardDescription className="text-slate-600">Complete these steps to finish workspace setup.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
            <span>{completed.length} of {steps.length} steps completed</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = completed.includes(step.id);
            return (
              <div key={step.id} className={cn('rounded-2xl border p-4 transition', isDone ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white')}>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className="mt-0.5"
                    aria-label={`Toggle ${step.title}`}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-400" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-500" />
                      <p className="font-medium text-slate-900">{step.title}</p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                    <div className="mt-3">
                      <Link href={step.href}>
                        <Button variant="outline" size="sm" className="gap-2">
                          {step.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={completeAll} className="bg-slate-900 text-white hover:bg-slate-800">
            Mark all complete
          </Button>
          <Button variant="outline" onClick={skipForNow}>
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (mode === 'page') {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : skipForNow())}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Welcome to your workspace</DialogTitle>
          <DialogDescription>Use this quick checklist to complete the first setup.</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
