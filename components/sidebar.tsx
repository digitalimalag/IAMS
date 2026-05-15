'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Network,
  AlertCircle,
  Building2,
  Users,
  BarChart3,
  Settings,
  FileText,
  ShoppingCart,
  Clock,
  Briefcase,
  BadgeDollarSign,
  CreditCard,
  ReceiptText,
  LogOut,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface NavItem {
  label?: string;
  href?: string;
  icon?: any;
  category?: string;
  allowedRoles?: UserRole[];
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { category: 'Inventory Management' },
  { label: 'Assets', href: '/assets', icon: Package, allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  { label: 'Network Devices', href: '/network-devices', icon: Network, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'IT Help Desk Ticketing', href: '/issues', icon: AlertCircle, allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  { category: 'Operations' },
  { label: 'Departments', href: '/companies', icon: Building2, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Vendors', href: '/vendors', icon: Briefcase, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Asset Requests', href: '/requests', icon: Clock, allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  { label: 'Purchases', href: '/purchases', icon: ShoppingCart, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Asset Handovers', href: '/handovers', icon: LogOut, allowedRoles: ['master_admin', 'admin', 'it', 'hr', 'employee'] },
  { category: 'Administration' },
  { label: 'Users', href: '/users', icon: Users, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Reports', href: '/reports', icon: BarChart3, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Audit Logs', href: '/audit-logs', icon: FileText, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'License Manager', href: '/licenses', icon: FileText, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Settings', href: '/settings', icon: Settings, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { category: 'Billing & Plans', allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Billing', href: '/billing', icon: BadgeDollarSign, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Payments', href: '/billing?view=payments', icon: CreditCard, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Subscription Plan', href: '/billing?view=subscription', icon: ReceiptText, allowedRoles: ['master_admin', 'admin', 'it', 'hr'] },
  { label: 'Onboarding', href: '/onboarding', icon: FileText, allowedRoles: ['master_admin'] },
];

const employeeNavAllowlist = new Set([
  '/assets',
  '/issues',
  '/requests',
  '/handovers',
]);

function getVisibleNavItems(items: NavItem[], userRole: UserRole) {
  if (userRole !== 'employee') {
    return items.filter((item) => {
      if (!('href' in item)) return true;
      if (item.allowedRoles && !item.allowedRoles.includes(userRole)) return false;
      return true;
    });
  }

  const visible: NavItem[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if ('href' in item) {
      if (item.href && employeeNavAllowlist.has(item.href)) {
        visible.push(item);
      }
      continue;
    }

    const nextCategoryIndex = items.findIndex((candidate, candidateIndex) => candidateIndex > index && 'category' in candidate);
    const sectionItems = items.slice(index + 1, nextCategoryIndex === -1 ? items.length : nextCategoryIndex);
    const sectionHasVisibleItem = sectionItems.some(
      (candidate) => 'href' in candidate && Boolean(candidate.href) && employeeNavAllowlist.has(candidate.href as string)
    );
    if (sectionHasVisibleItem) {
      visible.push(item);
    }
  }

  return visible;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [workspaceName, setWorkspaceName] = useState('Company workspace');
  const [workspaceLogo, setWorkspaceLogo] = useState('/logo.png');

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const sessionStr = localStorage.getItem('session');
        if (!sessionStr) return;
        const session = JSON.parse(sessionStr);
        setUserRole(session.role || 'employee');
        setWorkspaceName(
          session.organizationName?.trim() ||
            session.name?.trim() ||
            'Company workspace'
        );
        if (session.organizationLogoUrl) {
          setWorkspaceLogo(session.organizationLogoUrl);
        }

        if (isSupabaseConfigured() && session.organizationId) {
          const supabase = createSupabaseBrowserClient();
          const { data: orgRow } = await supabase
            .from('organizations')
            .select('name, logo_url')
            .eq('id', session.organizationId)
            .single();

          if (orgRow?.name) {
            setWorkspaceName(orgRow.name);
          }
          if (orgRow?.logo_url) {
            setWorkspaceLogo(orgRow.logo_url);
          }
        }
      } catch {
        setUserRole('employee');
      }
    };

    loadWorkspace();
  }, []);

  const visibleItems = getVisibleNavItems(allNavItems, userRole);

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border/60 bg-background/95 text-foreground shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 min-w-[52px] max-w-[150px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-background px-2 shadow-sm">
              <img
                src={workspaceLogo}
                alt="Company logo"
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">{workspaceName}</p>
              <p className="text-xs text-muted-foreground">Navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {visibleItems.map((item, idx) => {
            if ('category' in item) {
              return (
                <div key={idx} className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.category}
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            if (!item.href) return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
                onClick={onClose}
              >
                <Icon size={19} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 px-5 py-4 text-xs text-muted-foreground">
          <p className="opacity-80">v1.0.0</p>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:block"
          onClick={onClose}
        />
      )}
    </>
  );
}
