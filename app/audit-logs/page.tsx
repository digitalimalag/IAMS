'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Session } from '@/lib/auth';

type AuditLogRow = {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, any>;
};

function AuditLogsContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [logs, setLogs] = useState<AuditLogRow[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      const sessionStr = localStorage.getItem('session');
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          setSession(parsed);
        } catch {
          setSession(null);
        }
      }

      if (!isSupabaseConfigured()) {
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const orgId = sessionStr ? JSON.parse(sessionStr).organizationId : null;
      if (!orgId) return;

      const { data } = await supabase
        .from('audit_logs')
        .select('id, created_at, action, entity_type, entity_id, metadata')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(200);

      setLogs((data || []) as AuditLogRow[]);
    };

    void loadLogs();
  }, []);

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const searchBlob = `${log.action} ${log.entity_type} ${log.metadata?.name || ''} ${log.metadata?.email || ''} ${log.metadata?.reason || ''}`.toLowerCase();
    const matchesSearch = searchBlob.includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  }), [actionFilter, entityFilter, logs, searchTerm]);

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));
  const uniqueEntities = Array.from(new Set(logs.map((l) => l.entity_type)));

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="mt-2 text-muted-foreground">System activity history for users, roles, approvals, and deletions.</p>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Filter Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by action, user, email, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="bg-input border-border w-fit">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="bg-input border-border w-fit">
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {uniqueEntities.map((entity) => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>{filteredLogs.length} log entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wide">Timestamp</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Action</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Resource</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Details</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="text-sm text-muted-foreground">{formatTime(log.created_at)}</TableCell>
                        <TableCell className="text-sm font-medium">{log.action}</TableCell>
                        <TableCell className="text-sm">{log.entity_type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.metadata?.name || log.metadata?.email || log.metadata?.reason || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Success</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function AuditLogsPage() {
  return (
    <SessionCheck>
      <AuditLogsContent />
    </SessionCheck>
  );
}
