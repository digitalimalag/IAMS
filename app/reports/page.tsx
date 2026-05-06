'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getAssetDistribution, getDashboardStats, mockAssets, mockNetworkDevices, mockIssues } from '@/lib/mock-data';

function ReportsContent() {
  const stats = getDashboardStats();
  const assetDistribution = getAssetDistribution();

  // Prepare data for lifecycle chart
  const lifecycleData = [
    { status: 'Active', value: stats.activeAssets },
    { status: 'Maintenance', value: stats.assetsNeedingMaintenance },
    { status: 'Inactive', value: mockAssets.filter(a => a.status === 'Inactive').length },
    { status: 'Retired', value: mockAssets.filter(a => a.status === 'Retired').length },
  ];

  // Issues by status
  const issuesData = [
    { status: 'Open', count: stats.openIssues },
    { status: 'In Progress', count: stats.inProgressIssues },
    { status: 'Resolved', count: stats.resolvedIssues },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const ISSUE_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">Dashboard analytics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAssets}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.activeAssets} active</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Network Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalNetworkDevices}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.onlineDevices} online</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.openIssues}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground mt-1">Managed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Distribution */}
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

          {/* Asset Lifecycle */}
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

          {/* Issues by Status */}
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

          {/* Top Departments */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Assets by Department</CardTitle>
              <CardDescription>Asset distribution per department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mockAssets.reduce((acc: Record<string, number>, asset) => {
                  acc[asset.department] = (acc[asset.department] || 0) + 1;
                  return acc;
                }, {})).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dept}</span>
                    <Badge variant="secondary">{count} assets</Badge>
                  </div>
                ))}
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
