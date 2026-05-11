'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';
import { SubscriptionReminder } from './subscription-reminder';
import { OnboardingChecklist } from './onboarding-checklist';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground flex-col">
      <TopNav onMenuToggle={() => setSidebarOpen((open) => !open)} />
      <SubscriptionReminder />
      <OnboardingChecklist />
      <div className="flex flex-1 min-h-0">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 w-full min-h-0 overflow-y-auto">
          <div className="p-4 lg:p-8 min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
