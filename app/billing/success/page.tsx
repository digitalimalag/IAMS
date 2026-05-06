import BillingSuccessClient from './success-client';

export const dynamic = 'force-dynamic';

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderId?: string; paymentId?: string; signature?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  return (
    <BillingSuccessClient
      orderId={resolvedSearchParams.orderId || null}
      paymentId={resolvedSearchParams.paymentId || null}
      signature={resolvedSearchParams.signature || null}
    />
  );
}
