'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertCircle, Zap, Network } from 'lucide-react';
import { AssetDistributionChart } from '@/components/charts/asset-distribution-chart';
import { IssueStatusChart } from '@/components/charts/issue-status-chart';
import { RecentIssuesTable } from '@/components/tables/recent-issues-table';
import type { OverviewData } from '@/lib/overview';
import { loadOverviewData } from '@/lib/overview';
import { readStoredSession } from '@/lib/licenses';
import type { Session } from '@/lib/auth';

function DashboardContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  useEffect(() => {
    const currentSession = readStoredSession();
    setSession(currentSession);
    void loadOverviewData(currentSession).then(setOverview);
  }, []);

  const stats = overview?.stats;
  const assetDistribution = overview?.assetDistribution || [];
  const recentIssues = overview?.recentIssues || [];
  const issueStats = overview?.issueStats || { open: 0, inProgress: 0, resolved: 0 };

  const kpiCards = [
    {
      title: 'Total Assets',
      value: stats?.totalAssets ?? 0,
      description: `${stats?.activeAssets ?? 0} active`,
      icon: Package,
    },
    {
      title: 'Network Devices',
      value: stats?.totalNetworkDevices ?? 0,
      description: `${stats?.onlineDevices ?? 0} online`,
      icon: Network,
    },
    {
      title: 'Open Issues',
      value: stats?.openIssues ?? 0,
      description: `${stats?.inProgressIssues ?? 0} in progress`,
      icon: AlertCircle,
    },
    {
      title: 'Departments',
      value: stats?.totalCompanies ?? 0,
      description: 'Managed accounts',
      icon: Zap,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your IT Asset Management System</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-primary opacity-70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Asset Distribution</CardTitle>
              <CardDescription>Assets by type</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetDistributionChart data={assetDistribution} />
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Issue Status</CardTitle>
              <CardDescription>Current issue distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <IssueStatusChart data={issueStats} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>Latest reported issues across all assets</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentIssuesTable issues={recentIssues} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <SessionCheck>
      <DashboardContent />
    </SessionCheck>
  );
}
