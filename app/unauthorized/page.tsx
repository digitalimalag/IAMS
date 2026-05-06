import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-destructive" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this resource. Please contact your administrator if you believe this is a mistake.
          </p>
        </div>

        <div className="space-y-2">
          <Link href="/" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Return to Dashboard
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Sign In with Different Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
