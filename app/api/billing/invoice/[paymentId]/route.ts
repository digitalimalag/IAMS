import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { createSimplePdf } from '@/lib/pdf';

function buildAuthClient(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const { paymentId } = await params;
    const authClient = buildAuthClient(token);
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('id, organization_id, role, full_name, email')
      .eq('user_id', userData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    const serviceClient = createSupabaseServiceRoleClient();
    const { data: payment, error: paymentError } = await serviceClient
      .from('billing_payments')
      .select('id, billing_intent_id, organization_id, plan, billing_cycle, amount, currency, payment_method, provider, provider_session_id, provider_payment_intent_id, status, customer_email, created_at')
      .eq('id', paymentId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: paymentError?.message || 'Payment not found' }, { status: 404 });
    }

    const pdf = createSimplePdf('Payment Receipt', [
      'Digital IMALAG IT Assets Management SaaS',
      `Company: ${profile.full_name || payment.customer_email || '-'}`,
      `Email: ${payment.customer_email || profile.email || '-'}`,
      `Plan: ${String(payment.plan || '-').toUpperCase()}`,
      `Billing Cycle: ${String(payment.billing_cycle || '-').toUpperCase()}`,
      `Payment Method: ${String(payment.payment_method || '-').toUpperCase()}`,
      `Status: ${String(payment.status || '-').toUpperCase()}`,
      `Order ID: ${payment.provider_session_id || '-'}`,
      `Payment ID: ${payment.provider_payment_intent_id || '-'}`,
      `Amount Paid: ${payment.currency || 'INR'} ${(Number(payment.amount || 0)).toFixed(2)}`,
      `Paid On: ${new Date(payment.created_at).toLocaleString('en-IN')}`,
    ]);

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${paymentId}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
