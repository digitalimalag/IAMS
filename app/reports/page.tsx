'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { OverviewData } from '@/lib/overview';
import { loadOverviewData } from '@/lib/overview';
import { readStoredSession } from '@/lib/licenses';

function ReportsContent() {
  const [overview, setOverview] = useState<OverviewData | null>(null);

  useEffect(() => {
    void loadOverviewData(readStoredSession()).then(setOverview);
  }, []);

  const stats = overview?.stats;
  const assetDistribution = overview?.assetDistribution || [];
  const issueStats = overview?.issueStats || { open: 0, inProgress: 0, resolved: 0 };
  const departments = overview?.departments || [];
  const assets = overview?.assets || [];

  const lifecycleData = [
    { status: 'Active', value: stats?.activeAssets ?? 0 },
    { status: 'Maintenance', value: stats?.assetsNeedingMaintenance ?? 0 },
    { status: 'Inactive', value: assets.filter((asset) => asset.status === 'Inactive').length },
    { status: 'Retired', value: assets.filter((asset) => asset.status === 'Retired').length },
  ];

  const issuesData = [
    { status: 'Open', count: issueStats.open },
    { status: 'In Progress', count: issueStats.inProgress },
    { status: 'Resolved', count: issueStats.resolved },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">Dashboard analytics and insights</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalAssets ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats?.activeAssets ?? 0} active</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Network Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalNetworkDevices ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats?.onlineDevices ?? 0} online</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.openIssues ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalDepartments ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Managed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Asset Distribution by Type</CardTitle>
              <CardDescription>Count of assets grouped by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="type" stroke="#8b949e" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#8b949e" />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Asset Lifecycle Status</CardTitle>
              <CardDescription>Distribution across lifecycle stages</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lifecycleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, value }) => `${status}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {lifecycleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Issues by Status</CardTitle>
              <CardDescription>Support ticket status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={issuesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="status" stroke="#8b949e" />
                  <YAxis stroke="#8b949e" />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Assets by Department</CardTitle>
              <CardDescription>Asset distribution per department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No departments found.</p>
                ) : (
                  departments.map((dept) => {
                    const count = assets.filter((asset) => asset.department === dept.name).length;
                    return (
                      <div key={dept.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept.name}</span>
                        <Badge variant="secondary">{count} assets</Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ReportsPage() {
  return (
    <SessionCheck>
      <ReportsContent />
    </SessionCheck>
  );
}
