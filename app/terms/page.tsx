import Link from 'next/link';
import { ArrowLeft, BadgeInfo, CreditCard, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const clauses = [
  {
    title: 'Service Usage',
    icon: ShieldCheck,
    body: 'The platform is provided only for authorized company users to manage assets, users, issues, departments, billing, and related operational records.',
  },
  {
    title: 'Plans and Billing',
    icon: CreditCard,
    body: 'Subscription plans are billed according to the selected monthly or yearly cycle. Taxes, payment gateway charges, and invoice details are shown in the billing module where applicable.',
  },
  {
    title: 'Upgrades and Changes',
    icon: Sparkles,
    body: 'If a customer upgrades a plan during an active billing cycle, the existing paid period continues until the end of that cycle. Mid-cycle upgrades do not create a refund for the unused portion of the previous plan.',
  },
  {
    title: 'Renewals and Non-Refunds',
    icon: TriangleAlert,
    body: 'Once a payment has been successfully processed, the amount is non-refundable for that billing period. The subscribed plan remains active for the full month or year already purchased, after which renewal is required to continue service.',
  },
  {
    title: 'Account Responsibility',
    icon: BadgeInfo,
    body: 'Company administrators are responsible for user access, role assignments, workspace content, and any actions performed from their organization account.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-12 lg:py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Legal</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">Terms & Conditions</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              These terms are written to give your company workspace a clear and professional operating policy.
              They cover account access, billing, renewal, and subscription usage expectations.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {clauses.map((clause) => {
            const Icon = clause.icon;
            return (
              <Card key={clause.title} className="border-border/60 bg-card/95 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{clause.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">{clause.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Payment and refund summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>• Starter, Growth, and Enterprise subscriptions are billed in advance for the selected cycle.</p>
              <p>• If a customer upgrades during an active cycle, the upgraded plan becomes effective after the current paid term is completed or at the time the new billing policy requires.</p>
              <p>• No refund is issued for a successfully processed payment once the billing period has started.</p>
              <p>• Customers may renew, upgrade, or manage plans from the billing area before expiry.</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Operational notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>• The service is intended for lawful business use by the subscribing company.</p>
              <p>• Workspace data, assets, users, and tickets should be kept accurate and maintained by authorized staff.</p>
              <p>• Subscription access may be suspended if required for security, abuse prevention, or payment failures.</p>
              <p>• These terms can be updated as the platform grows.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
