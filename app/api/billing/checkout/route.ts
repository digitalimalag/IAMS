import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getBillingAmount, getRazorpayConfig } from '@/lib/billing';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';

function cleanSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function toBase64(value: string) {
  return Buffer.from(value).toString('base64');
}

async function createRazorpayOrder(keyId: string, keySecret: string, payload: Record<string, unknown>) {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${toBase64(`${keyId}:${keySecret}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || 'Failed to create Razorpay order');
  }

  return JSON.parse(text) as {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const razorpayConfig = getRazorpayConfig();
    if (!razorpayConfig) {
      return NextResponse.json(
        { error: 'Missing payment gateway configuration. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_APP_URL.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const organizationName = String(body.organizationName || '').trim();
    const slug = cleanSlug(String(body.slug || ''));
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const department = String(body.department || '').trim();
    const password = String(body.password || '');
    const paymentMethod = String(body.paymentMethod || 'upi').trim();
    const billingCycle = String(body.billingCycle || 'monthly') === 'yearly' ? 'yearly' : 'monthly';
    const selectedPlan = normalizePlan(body.plan);
    const companyWebsite = String(body.companyWebsite || '').trim();
    const companyAddress = String(body.companyAddress || '').trim();

    if (selectedPlan === 'free') {
      return NextResponse.json({ error: 'Free plan should use the setup page.' }, { status: 400 });
    }

    if (!organizationName || !slug || !fullName || !email || !department || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingOrg) {
      return NextResponse.json({ error: 'This company slug is already registered. Please log in instead.' }, { status: 409 });
    }

    const planConfig = getPlanConfig(selectedPlan);
    const amountInRupees = getBillingAmount(selectedPlan, billingCycle);
    const amountInPaise = amountInRupees * 100;

    const { data: billingIntent, error: intentError } = await supabase
      .from('billing_intents')
      .insert({
        organization_name: organizationName,
        organization_slug: slug,
        full_name: fullName,
        email,
        phone: phone || null,
        department,
        password,
        plan: selectedPlan,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        status: 'pending',
        metadata: {
          amount: amountInRupees,
          userLimit: planConfig.userLimit,
          assetLimit: Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : null,
          companyWebsite,
          companyAddress,
        },
      })
      .select('id')
      .single();

    if (intentError || !billingIntent) {
      return NextResponse.json({ error: intentError?.message || 'Unable to create billing record' }, { status: 400 });
    }

    const receipt = `intent_${billingIntent.id.slice(0, 12)}`;
    const razorpayOrder = await createRazorpayOrder(razorpayConfig.keyId, razorpayConfig.keySecret, {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        billing_intent_id: billingIntent.id,
        organization_slug: slug,
        plan: selectedPlan,
        billing_cycle: billingCycle,
      },
    });

    await supabase
      .from('billing_intents')
      .update({ stripe_checkout_session_id: razorpayOrder.id, updated_at: new Date().toISOString() })
      .eq('id', billingIntent.id);

    return NextResponse.json({
      success: true,
      provider: 'razorpay',
      keyId: razorpayConfig.keyId,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      billingIntentId: billingIntent.id,
      plan: selectedPlan,
      billingCycle,
      organizationName,
      companyWebsite,
      companyAddress,
      fullName,
      email,
      phone,
      department,
      paymentMethod,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
