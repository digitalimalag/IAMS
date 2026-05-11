import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const authClient = buildAuthClient(token);
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('id, organization_id, role')
      .eq('user_id', userData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    const serviceClient = createSupabaseServiceRoleClient();
    const { data: orgRow, error: orgError } = await serviceClient
      .from('organizations')
      .select('id, name, slug, plan, settings, logo_url, status')
      .eq('id', profile.organization_id)
      .single();

    if (orgError || !orgRow) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { data: payments, error: paymentsError } = await serviceClient
      .from('billing_payments')
      .select('id, plan, billing_cycle, amount, currency, payment_method, provider, provider_session_id, provider_payment_intent_id, status, customer_email, created_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 400 });
    }

    const plan = normalizePlan(orgRow.plan);
    const planConfig = getPlanConfig(plan);
    const subscription = orgRow.settings?.subscription || {};

    return NextResponse.json({
      success: true,
      organization: {
        id: orgRow.id,
        name: orgRow.name,
        slug: orgRow.slug,
        logoUrl: orgRow.logo_url || '',
        status: orgRow.status,
      },
      subscription: {
        plan,
        label: planConfig.label,
        billingCycle: subscription.billingCycle || 'monthly',
        assetLimit: subscription.assetLimit ?? planConfig.assetLimit,
        userLimit: subscription.userLimit ?? planConfig.userLimit,
        status: subscription.status || 'active',
        expiresAt: subscription.expiresAt || null,
        renewalNoticeAt: subscription.renewalNoticeAt || null,
        graceEndsAt: subscription.graceEndsAt || null,
        paymentMethod: subscription.paymentMethod || null,
        provider: subscription.provider || null,
      },
      payments: (payments || []).map((payment) => ({
        ...payment,
        invoiceUrl: `/api/billing/invoice/${payment.id}`,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
