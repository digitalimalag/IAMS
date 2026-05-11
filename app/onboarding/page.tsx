'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { OnboardingChecklist } from '@/components/onboarding-checklist';

export default function OnboardingPage() {
  return (
    <SessionCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
            <p className="mt-2 text-muted-foreground">
              Complete the first setup steps for your company workspace or reopen this checklist anytime.
            </p>
          </div>
          <OnboardingChecklist mode="page" />
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
