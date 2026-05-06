import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertCircle, Zap, Network } from 'lucide-react';
import { getDashboardStats, getAssetDistribution, getRecentIssues, mockIssues } from '@/lib/mock-data';
import { AssetDistributionChart } from '@/components/charts/asset-distribution-chart';
import { IssueStatusChart } from '@/components/charts/issue-status-chart';
import { RecentIssuesTable } from '@/components/tables/recent-issues-table';

function DashboardContent() {
  const stats = getDashboardStats();
  const assetDistribution = getAssetDistribution();
  const recentIssues = getRecentIssues();
  
  const issueStats = {
    open: mockIssues.filter(i => i.status === 'Open').length,
    inProgress: mockIssues.filter(i => i.status === 'In Progress').length,
    resolved: mockIssues.filter(i => i.status === 'Resolved').length,
  };

  const kpiCards = [
    {
      title: 'Total Assets',
      value: stats.totalAssets,
      description: `${stats.activeAssets} active`,
      icon: Package,
    },
    {
      title: 'Network Devices',
      value: stats.totalNetworkDevices,
      description: `${stats.onlineDevices} online`,
      icon: Network,
    },
    {
      title: 'Open Issues',
      value: stats.openIssues,
      description: `${stats.inProgressIssues} in progress`,
      icon: AlertCircle,
    },
    {
      title: 'Companies',
      value: stats.totalCompanies,
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
