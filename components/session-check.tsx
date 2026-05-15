'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Session } from '@/lib/auth';
import { canAccessModule, getRoleLandingRoute } from '@/lib/rbac';

interface SessionCheckProps {
  children: React.ReactNode;
}

export function SessionCheck({ children }: SessionCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const sessionStr = localStorage.getItem('session');
      
      if (!sessionStr) {
        router.replace('/login');
        setIsReady(true);
        return;
      }

      try {
        const session: Session = JSON.parse(sessionStr);
        const subscriptionExpiresAt = session.subscriptionExpiresAt ? new Date(session.subscriptionExpiresAt) : null;
        const expiresAt = subscriptionExpiresAt || new Date(session.expiresAt);
        const now = new Date();
        
        if (now > expiresAt) {
          localStorage.removeItem('session');
          router.replace('/billing?renew=1');
          setIsReady(true);
          return;
        }

        if (!canAccessModule(pathname, session.role)) {
          router.replace(getRoleLandingRoute(session.role));
          setIsReady(true);
          return;
        }

        setIsReady(true);
      } catch {
        localStorage.removeItem('session');
        router.replace('/login');
        setIsReady(true);
      }
    };

    checkSession();
  }, [pathname, router]);

  if (!isReady) return null;
  return <>{children}</>;
}
