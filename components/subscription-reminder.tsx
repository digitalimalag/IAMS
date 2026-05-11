'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CalendarClock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Session } from '@/lib/auth';

function getDaysLeft(targetIso?: string | null) {
  if (!targetIso) return null;
  const target = new Date(targetIso);
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function SubscriptionReminder() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [dismissKey, setDismissKey] = useState('');

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (!sessionStr) return;

    try {
      const session = JSON.parse(sessionStr) as Session;
      const expiry = session.subscriptionExpiresAt || session.expiresAt;
      const left = getDaysLeft(expiry);
      if (left === null) return;

      const key = `subscription-reminder-dismissed:${session.organizationId || session.userId}`;
      setDismissKey(key);
      const dismissed = localStorage.getItem(key);
      setDaysLeft(left);

      if (left <= 0) {
        setHeadline('Subscription expired');
        setBody('Your subscription has expired and access will be paused until you renew. Please renew now to keep your company workspace active.');
        setOpen(!dismissed);
        return;
      }

      if (left <= 5) {
        setHeadline('Renew your subscription soon');
        setBody('Your subscription will expire in 5 days or less. Please renew now to avoid service suspension.');
        setOpen(!dismissed);
      }
    } catch {
      return;
    }
  }, []);

  const severity = useMemo(() => {
    if (daysLeft === null) return 'warning';
    return daysLeft <= 0 ? 'danger' : 'warning';
  }, [daysLeft]);

  const handleDismiss = () => {
    if (dismissKey) {
      localStorage.setItem(dismissKey, '1');
    }
    setOpen(false);
  };

  const handleRenew = () => {
    setOpen(false);
    router.push('/billing');
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : handleDismiss())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${severity === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {severity === 'danger' ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle>{headline}</DialogTitle>
              <DialogDescription>{body}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-slate-600" />
            <span>{daysLeft !== null ? `${Math.max(daysLeft, 0)} day(s) left` : 'Subscription status unavailable'}</span>
          </div>
          <p>
            Suggested message: <span className="font-medium">Your subscription will expire soon. Renew now to avoid suspension.</span>
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleDismiss}>
            Later
          </Button>
          <Button onClick={handleRenew}>Renew now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
