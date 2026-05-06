import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BillingCancelPage() {
  return (
    <main className="min-h-screen bg-[#f5f6ef] px-5 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center">
        <Card className="w-full border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Checkout cancelled</CardTitle>
            <CardDescription>No payment was captured. You can resume whenever you are ready.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/billing">
              <Button>Try Billing Again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
