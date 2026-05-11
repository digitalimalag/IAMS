import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-14">
        <h1 className="text-4xl font-bold tracking-tight">Terms & Conditions</h1>
        <p className="mt-4 text-muted-foreground">
          This page can be expanded with your final legal policy. For now, it serves as a visible footer link
          and a placeholder for your approved business terms.
        </p>

        <div className="mt-8 space-y-4 rounded-3xl border border-border/50 bg-card p-6">
          <div>
            <h2 className="text-lg font-semibold">Use of Service</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The platform is provided for authorized company users to manage assets, users, tickets, and billing.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Accounts</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Company administrators are responsible for access control, user provisioning, and workspace usage.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Billing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscription fees, renewals, and invoice history are maintained inside the billing module.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
