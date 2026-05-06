'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@/lib/auth';

interface SessionCheckProps {
  children: React.ReactNode;
}

export function SessionCheck({ children }: SessionCheckProps) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = () => {
      const sessionStr = localStorage.getItem('session');
      
      if (!sessionStr) {
        router.push('/login');
        return;
      }

      try {
        const session: Session = JSON.parse(sessionStr);
        const expiresAt = new Date(session.expiresAt);
        
        if (new Date() > expiresAt) {
          localStorage.removeItem('session');
          router.push('/login');
        }
      } catch {
        localStorage.removeItem('session');
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  return <>{children}</>;
}
