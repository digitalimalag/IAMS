import type { Session } from '@/lib/auth';
import type { Asset, Department, Issue, NetworkDevice } from '@/lib/mock-data';
import { mockAssets, mockDepartments, mockIssues, mockNetworkDevices } from '@/lib/mock-data';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { assetDbRowToRecord } from '@/lib/assets';
import { issueRowToRecord } from '@/lib/issues';
import { readTenantJson } from '@/lib/tenant-storage';

export type OverviewStats = {
  totalAssets: number;
  activeAssets: number;
  assetsNeedingMaintenance: number;
  totalNetworkDevices: number;
  onlineDevices: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  totalDepartments: number;
  totalCompanies: number;
};

export type OverviewData = {
  stats: OverviewStats;
  assetDistribution: { type: string; count: number }[];
  recentIssues: Issue[];
  issueStats: { open: number; inProgress: number; resolved: number };
  departments: Department[];
  assets: Asset[];
  networkDevices: NetworkDevice[];
  issues: Issue[];
};

function buildLocalOverview(session: Session | null): OverviewData {
  const assets = readTenantJson<Asset[]>('it_assets', session, mockAssets);
  const networkDevices = readTenantJson<NetworkDevice[]>('it_network_devices', session, mockNetworkDevices);
  const issues = readTenantJson<Issue[]>('issues', session, mockIssues);
  const departments = readTenantJson<Department[]>('it_departments', session, mockDepartments);

  const stats: OverviewStats = {
    totalAssets: assets.length,
    activeAssets: assets.filter((asset) => asset.status === 'Active').length,
    assetsNeedingMaintenance: assets.filter((asset) => asset.status === 'Maintenance').length,
    totalNetworkDevices: networkDevices.length,
    onlineDevices: networkDevices.filter((device) => device.status === 'Online').length,
    openIssues: issues.filter((issue) => issue.status === 'Open').length,
    inProgressIssues: issues.filter((issue) => issue.status === 'In Progress').length,
    resolvedIssues: issues.filter((issue) => issue.status === 'Resolved').length,
    totalDepartments: departments.length,
    totalCompanies: departments.length,
  };

  const assetDistribution = Array.from(
    assets.reduce((acc, asset) => {
      acc.set(asset.type, (acc.get(asset.type) || 0) + 1);
      return acc;
    }, new Map<string, number>()),
    ([type, count]) => ({ type, count }),
  );

  const issueStats = {
    open: stats.openIssues,
    inProgress: stats.inProgressIssues,
    resolved: stats.resolvedIssues,
  };

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  return { stats, assetDistribution, recentIssues, issueStats, departments, assets, networkDevices, issues };
}

export async function loadOverviewData(session: Session | null): Promise<OverviewData> {
  if (!isSupabaseConfigured() || !session?.organizationId?.trim()) {
    return buildLocalOverview(session);
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const orgId = session.organizationId.trim();

    const [
      assetsRes,
      devicesRes,
      issuesRes,
      departmentsRes,
    ] = await Promise.all([
      supabase.from('assets').select('*').eq('organization_id', orgId),
      supabase.from('network_devices').select('*').eq('organization_id', orgId),
      supabase.from('issues').select('*').eq('organization_id', orgId),
      supabase.from('departments').select('*').eq('organization_id', orgId),
    ]);

    const assets = ((assetsRes.data || []) as any[]).map(assetDbRowToRecord);
    const networkDevices = (devicesRes.data || []) as NetworkDevice[];
    const issues = ((issuesRes.data || []) as any[]).map(issueRowToRecord);
    const departments = (departmentsRes.data || []) as Department[];

    const stats: OverviewStats = {
      totalAssets: assets.length,
      activeAssets: assets.filter((asset) => asset.status === 'Active').length,
      assetsNeedingMaintenance: assets.filter((asset) => asset.status === 'Maintenance').length,
      totalNetworkDevices: networkDevices.length,
      onlineDevices: networkDevices.filter((device) => device.status === 'Online').length,
      openIssues: issues.filter((issue) => issue.status === 'Open').length,
      inProgressIssues: issues.filter((issue) => issue.status === 'In Progress').length,
      resolvedIssues: issues.filter((issue) => issue.status === 'Resolved').length,
      totalDepartments: departments.length,
      totalCompanies: departments.length,
    };

    const assetDistribution = Array.from(
      assets.reduce((acc, asset) => {
        acc.set(asset.type, (acc.get(asset.type) || 0) + 1);
        return acc;
      }, new Map<string, number>()),
      ([type, count]) => ({ type, count }),
    );

    const issueStats = {
      open: stats.openIssues,
      inProgress: stats.inProgressIssues,
      resolved: stats.resolvedIssues,
    };

    const recentIssues = [...issues]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 5);

    return { stats, assetDistribution, recentIssues, issueStats, departments, assets, networkDevices, issues };
  } catch {
    return {
      stats: {
        totalAssets: 0,
        activeAssets: 0,
        assetsNeedingMaintenance: 0,
        totalNetworkDevices: 0,
        onlineDevices: 0,
        openIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        totalDepartments: 0,
        totalCompanies: 0,
      },
      assetDistribution: [],
      recentIssues: [],
      issueStats: { open: 0, inProgress: 0, resolved: 0 },
      departments: [],
      assets: [],
      networkDevices: [],
      issues: [],
    };
  }
}
