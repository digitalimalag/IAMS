'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionCheck } from '@/components/session-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { Upload } from 'lucide-react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Session } from '@/lib/auth';

type CompanySettingsState = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  gstin: string;
  pan: string;
  cin: string;
  registeredCountry: string;
  registeredState: string;
  timezone: string;
  currency: string;
};

function SettingsContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [organizationId, setOrganizationId] = useState('');
  const [companySettings, setCompanySettings] = useState<CompanySettingsState>({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    gstin: '',
    pan: '',
    cin: '',
    registeredCountry: 'India',
    registeredState: 'Maharashtra',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnAssetChange: true,
    emailOnIssueCreation: true,
    emailOnRequestApproval: true,
    emailOnPurchaseUpdate: true,
    dailyDigest: false,
    notifyOffline: true,
  });
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoError, setLogoError] = useState('');
  const [logoTouched, setLogoTouched] = useState(false);
  const [logoFileName, setLogoFileName] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const sessionStr = localStorage.getItem('session');
        const storedSession = sessionStr ? (JSON.parse(sessionStr) as Session) : null;
        if (sessionStr) {
          setSession(storedSession);
        }

        if (!isSupabaseConfigured()) {
          setCompanySettings((prev) => ({ ...prev, companyName: storedSession?.organizationName || 'Digital IMALAG IT Assets Management SaaS' }));
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const orgId = storedSession?.organizationId;
        if (!orgId) {
          setCompanySettings((prev) => ({
            ...prev,
            companyName: storedSession?.organizationName || storedSession?.name || '',
          }));
          return;
        }

        setOrganizationId(orgId);
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('name, settings, logo_url')
          .eq('id', orgId)
          .single();

        if (!orgRow) return;

        const settings = orgRow.settings || {};
        const company = settings.company || {};
        setLogoPreview(orgRow.logo_url || storedSession?.organizationLogoUrl || '');
        setCompanySettings({
          companyName: orgRow.name || storedSession?.organizationName || '',
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || '',
          website: company.website || '',
          gstin: company.gstin || '',
          pan: company.pan || '',
          cin: company.cin || '',
          registeredCountry: company.registeredCountry || 'India',
          registeredState: company.registeredState || 'Maharashtra',
          timezone: company.timezone || 'Asia/Kolkata',
          currency: company.currency || 'INR',
        });

        setNotificationSettings({
          emailOnAssetChange: settings.notifications?.emailOnAssetChange ?? true,
          emailOnIssueCreation: settings.notifications?.emailOnIssueCreation ?? true,
          emailOnRequestApproval: settings.notifications?.emailOnRequestApproval ?? true,
          emailOnPurchaseUpdate: settings.notifications?.emailOnPurchaseUpdate ?? true,
          dailyDigest: settings.notifications?.dailyDigest ?? false,
          notifyOffline: settings.notifications?.notifyOffline ?? true,
        });
      } catch {
        setSaved('Unable to load settings.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const persistSettings = async (nextSettings: Partial<CompanySettingsState> | null = null, nextNotifications = notificationSettings) => {
    if (!organizationId || !isSupabaseConfigured()) {
      return;
    }

    setSaving(true);
    setSaved('');
    try {
      const supabase = createSupabaseBrowserClient();
      const mergedCompany = {
        ...companySettings,
        ...(nextSettings || {}),
      };

      const updatePayload = {
        name: mergedCompany.companyName,
        legal_name: mergedCompany.companyName,
        settings: {
          company: {
            email: mergedCompany.email,
            phone: mergedCompany.phone,
            address: mergedCompany.address,
            website: mergedCompany.website,
            gstin: mergedCompany.gstin,
            pan: mergedCompany.pan,
            cin: mergedCompany.cin,
            registeredCountry: mergedCompany.registeredCountry,
            registeredState: mergedCompany.registeredState,
            timezone: mergedCompany.timezone,
            currency: mergedCompany.currency,
          },
          notifications: nextNotifications,
        },
        ...(logoTouched ? { logo_url: logoPreview || null } : {}),
      };

      const { error } = await supabase
        .from('organizations')
        .update(updatePayload)
        .eq('id', organizationId);

      if (error) {
        setSaved(error.message);
        return;
      }

      const nextSession = session
        ? {
            ...session,
            organizationName: mergedCompany.companyName,
            organizationLogoUrl: logoTouched ? logoPreview || '' : session.organizationLogoUrl,
          }
        : null;

      if (nextSession) {
        localStorage.setItem('session', JSON.stringify(nextSession));
        localStorage.setItem('user', JSON.stringify({
          id: nextSession.userId,
          email: nextSession.email,
          name: nextSession.name,
          organizationId: nextSession.organizationId,
          organizationName: nextSession.organizationName,
          organizationLogoUrl: nextSession.organizationLogoUrl,
          role: nextSession.role,
          department: nextSession.department,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
        }));
      }

      setCompanySettings(mergedCompany);
      setNotificationSettings(nextNotifications);
      setLogoTouched(false);
      setSaved('Changes saved successfully');
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(''), 2500);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">Update your company profile, contact details, and notifications.</p>
        </div>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="mb-4 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-4 space-y-6">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>These details are shown across the workspace and profile pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading company details...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FieldGroup>
                        <FieldLabel>Company Name</FieldLabel>
                        <Input value={companySettings.companyName} onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })} />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel>Company Email</FieldLabel>
                        <Input type="email" value={companySettings.email} onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })} />
                      </FieldGroup>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FieldGroup>
                        <FieldLabel>Phone</FieldLabel>
                        <Input value={companySettings.phone} onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })} />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel>Website</FieldLabel>
                        <Input value={companySettings.website} onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })} />
                      </FieldGroup>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
                      <FieldGroup>
                        <FieldLabel>Company Logo</FieldLabel>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <input
                            id="company-logo-upload"
                            type="file"
                            accept="image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              setLogoError('');
                              setLogoTouched(true);
                              if (!file) {
                                setLogoPreview('');
                                setLogoFileName('');
                                return;
                              }
                              if (file.type !== 'image/png') {
                                setLogoError('Please upload only a PNG file.');
                                return;
                              }
                              if (file.size > 100 * 1024) {
                                setLogoError('Logo must be 100KB or smaller.');
                                return;
                              }

                              setLogoFileName(file.name);
                              const reader = new FileReader();
                              reader.onload = () => {
                                setLogoPreview(String(reader.result || ''));
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <label htmlFor="company-logo-upload">
                            <Button type="button" variant="outline" className="gap-2">
                              <Upload className="h-4 w-4" />
                              Browse Logo
                            </Button>
                          </label>
                          <div className="text-sm text-muted-foreground">
                            {logoFileName || 'PNG only, max 100KB.'}
                          </div>
                        </div>
                      </FieldGroup>
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Company logo preview" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-muted-foreground">No logo</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          PNG only, max 100KB. Stored as <code>logo.png</code> for the company workspace.
                        </div>
                      </div>
                    </div>

                    {logoError && <p className="text-sm text-destructive">{logoError}</p>}

                    <FieldGroup>
                      <FieldLabel>Address</FieldLabel>
                      <Input value={companySettings.address} onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })} />
                    </FieldGroup>

                    <div className="pt-2 border-t border-border">
                      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FieldGroup>
                          <FieldLabel>GSTIN</FieldLabel>
                          <Input value={companySettings.gstin} onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel>PAN</FieldLabel>
                          <Input value={companySettings.pan} onChange={(e) => setCompanySettings({ ...companySettings, pan: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel>CIN</FieldLabel>
                          <Input value={companySettings.cin} onChange={(e) => setCompanySettings({ ...companySettings, cin: e.target.value })} />
                        </FieldGroup>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FieldGroup>
                          <FieldLabel>Registered Country</FieldLabel>
                          <Input value={companySettings.registeredCountry} onChange={(e) => setCompanySettings({ ...companySettings, registeredCountry: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel>Registered State</FieldLabel>
                          <Input value={companySettings.registeredState} onChange={(e) => setCompanySettings({ ...companySettings, registeredState: e.target.value })} />
                        </FieldGroup>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FieldGroup>
                          <FieldLabel>Timezone</FieldLabel>
                          <Input value={companySettings.timezone} onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel>Default Currency</FieldLabel>
                          <Input value={companySettings.currency} onChange={(e) => setCompanySettings({ ...companySettings, currency: e.target.value })} />
                        </FieldGroup>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                      <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => persistSettings()}>
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      {saved && <div className="flex items-center text-sm text-green-600">{saved}</div>}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4 space-y-6">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    ['emailOnAssetChange', 'Asset Changes', 'Get notified when assets are updated'],
                    ['emailOnIssueCreation', 'Issue Creation', 'Get notified when new tickets are created'],
                    ['emailOnRequestApproval', 'Request Approvals', 'Get notified when requests are approved'],
                    ['emailOnPurchaseUpdate', 'Purchase Updates', 'Get notified when purchases are updated'],
                    ['dailyDigest', 'Daily Digest', 'Receive a daily summary of all activities'],
                    ['notifyOffline', 'Offline Devices', 'Get notified when a device goes offline'],
                  ].map(([key, title, description]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      <Switch
                        checked={notificationSettings[key as keyof typeof notificationSettings]}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, [key]: checked } as typeof notificationSettings)
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => persistSettings(undefined, notificationSettings)}>
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                  {saved && <div className="flex items-center text-sm text-green-600">{saved}</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <SessionCheck>
      <SettingsContent />
    </SessionCheck>
  );
}
