import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BillingCancelPage() {
  return (
    <main className="relative min-h-screen bg-transparent px-5 py-10 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(249,250,246,0.72)_0%,rgba(238,244,237,0.56)_48%,rgba(237,242,247,0.68)_100%)]" />
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
