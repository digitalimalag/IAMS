'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, Settings, User } from 'lucide-react';
import { Session } from '@/lib/auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface TopNavProps {
  onMenuToggle?: () => void;
}

export function TopNav({ onMenuToggle }: TopNavProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('Digital IMALAG IT Assets Management SaaS');
  const [workspaceLogo, setWorkspaceLogo] = useState('/logo.png');

  useEffect(() => {
    const loadSession = async () => {
      const storedSession = localStorage.getItem('session');
      if (!storedSession) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(storedSession) as Session;
        setSession(parsed);
        setWorkspaceName(
          parsed.organizationName?.trim() ||
            parsed.name?.trim() ||
            'Digital IMALAG IT Assets Management SaaS'
        );
        if (parsed.organizationLogoUrl) {
          setWorkspaceLogo(parsed.organizationLogoUrl);
        }

        if (isSupabaseConfigured() && parsed.organizationId) {
          const supabase = createSupabaseBrowserClient();
          const { data: orgRow } = await supabase
            .from('organizations')
            .select('name, logo_url')
            .eq('id', parsed.organizationId)
            .single();

          if (orgRow?.name) {
            setWorkspaceName(orgRow.name);
          }
          if (orgRow?.logo_url) {
            setWorkspaceLogo(orgRow.logo_url);
          }
        }
      } catch (err) {
        console.error('Failed to parse session');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const openProfile = () => {
    router.push('/profile');
  };

  const openSettings = () => {
    router.push('/settings');
  };

  if (isLoading) {
    return (
      <div className="bg-card border-b border-border h-16 flex items-center px-6">
        <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
      </div>
    );
  }

  const userInitials = session?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const roleLabel = {
    master_admin: 'Master Admin',
    admin: 'Administrator',
    hr: 'HR',
    it: 'IT',
    employee: 'Employee',
  }[session?.role || 'employee'];
  const canOpenSettings = session?.role === 'master_admin' || session?.role === 'admin' || session?.role === 'it' || session?.role === 'hr';

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={onMenuToggle}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-11 min-w-[52px] max-w-[150px] items-center justify-center overflow-hidden rounded-xl border border-border bg-background px-2 shadow-sm">
              <img
                src={workspaceLogo}
                alt="Company logo"
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{workspaceName}</h1>
              <p className="text-xs text-muted-foreground">Company workspace</p>
            </div>
          </div>
        </div>

        {/* Right side - User profile */}
        {session && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-medium text-foreground">{session.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium text-foreground">{session.name}</p>
                  <p className="text-xs text-muted-foreground">{session.email}</p>
                  <p className="text-xs text-muted-foreground">{session.department}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={openProfile}>
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {canOpenSettings && (
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={openSettings}>
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
