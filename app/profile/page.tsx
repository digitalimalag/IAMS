'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const sessionStr = localStorage.getItem('session');
      if (!sessionStr) return;

      try {
        const parsed = JSON.parse(sessionStr) as Session;
        setSession(parsed);
        if (parsed.organizationName) {
          setOrganizationName(parsed.organizationName);
        }

        if (!isSupabaseConfigured() || !parsed.organizationId) {
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', parsed.organizationId)
          .single();

        if (orgRow?.name) {
          setOrganizationName(orgRow.name);
        }
      } catch {
        setSession(null);
      }
    };

    loadProfile();
  }, []);

  return (
    <SessionCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="mt-2 text-muted-foreground">View your account, role, and company details.</p>
          </div>

          <Card className="max-w-2xl border-border/50 bg-card">
            <CardHeader>
              <CardTitle>{session?.name || 'User'}</CardTitle>
              <CardDescription>{session?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                  <Badge className="mt-2">{session?.role || 'employee'}</Badge>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
                  <p className="mt-2 font-medium">{session?.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Organization</p>
                  <p className="mt-2 font-medium break-words">{organizationName || session?.organizationId || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Session</p>
                  <p className="mt-2 font-medium">Active</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href="/settings">
                  <Button>Open Settings</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </SessionCheck>
  );
}
