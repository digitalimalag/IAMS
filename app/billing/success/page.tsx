import BillingSuccessClient from './success-client';

export const dynamic = 'force-dynamic';

export default function BillingSuccessPage({
  searchParams,
}: {
  searchParams?: { orderId?: string; paymentId?: string; signature?: string };
}) {
  return (
    <BillingSuccessClient
      orderId={searchParams?.orderId || null}
      paymentId={searchParams?.paymentId || null}
      signature={searchParams?.signature || null}
    />
  );
}
