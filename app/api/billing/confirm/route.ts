import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getRazorpayConfig } from '@/lib/billing';
import { getPlanConfig, getSubscriptionTimeline, normalizePlan } from '@/lib/subscription';

function verifySignature(orderId: string, paymentId: string, signature: string, keySecret: string) {
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const razorpayConfig = getRazorpayConfig();
    if (!razorpayConfig) {
      return NextResponse.json({ error: 'Missing payment gateway configuration' }, { status: 500 });
    }

    const body = await request.json();
    const orderId = String(body.orderId || '').trim();
    const paymentId = String(body.paymentId || '').trim();
    const signature = String(body.signature || '').trim();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    if (!verifySignature(orderId, paymentId, signature, razorpayConfig.keySecret)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 401 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: billingIntent, error: billingIntentError } = await supabase
      .from('billing_intents')
      .select('*')
      .eq('stripe_checkout_session_id', orderId)
      .single();

    if (billingIntentError || !billingIntent) {
      return NextResponse.json({ error: billingIntentError?.message || 'Billing intent not found' }, { status: 404 });
    }

    if (billingIntent.status === 'completed' && billingIntent.organization_id) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        organizationId: billingIntent.organization_id,
        organizationName: billingIntent.organization_name,
        email: billingIntent.email,
        password: billingIntent.password,
        plan: billingIntent.plan,
        billingCycle: billingIntent.billing_cycle,
      });
    }

    const selectedPlan = normalizePlan(billingIntent.plan);
    const planConfig = getPlanConfig(selectedPlan);
    const subscriptionTimeline = getSubscriptionTimeline(billingIntent.billing_cycle);
    const organizationSettings = {
      company: {
        email: billingIntent.email,
        phone: billingIntent.phone || '',
        department: billingIntent.department,
        website: billingIntent.metadata?.companyWebsite || '',
        address: billingIntent.metadata?.companyAddress || '',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
      },
      subscription: {
        plan: selectedPlan,
        billingCycle: billingIntent.billing_cycle,
        assetLimit: Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : null,
        userLimit: planConfig.userLimit,
        status: 'active',
        paymentMethod: billingIntent.payment_method,
        provider: 'razorpay',
        razorpayOrderId: orderId,
        ...subscriptionTimeline,
      },
    };

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: billingIntent.organization_name,
        slug: billingIntent.organization_slug,
        legal_name: billingIntent.organization_name,
        status: 'active',
        plan: selectedPlan,
        settings: organizationSettings,
      })
      .select('id')
      .single();

    if (orgError || !organization) {
      return NextResponse.json({ error: orgError?.message || 'Failed to create organization' }, { status: 400 });
    }

    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: billingIntent.email,
      password: billingIntent.password,
      email_confirm: true,
      user_metadata: {
        organization_id: organization.id,
        full_name: billingIntent.full_name,
        phone: billingIntent.phone || '',
        department: billingIntent.department,
        role: 'master_admin',
      },
    });

    if (createUserError || !createdUser.user) {
      return NextResponse.json({ error: createUserError?.message || 'Failed to create auth user' }, { status: 400 });
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        user_id: createdUser.user.id,
        organization_id: organization.id,
        full_name: billingIntent.full_name,
        email: billingIntent.email,
        phone: billingIntent.phone || null,
        department: billingIntent.department,
        title: 'Master Admin',
        role: 'master_admin',
        is_active: true,
      },
      { onConflict: 'organization_id,email' }
    );

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { error: departmentError } = await supabase.from('departments').upsert(
      {
        organization_id: organization.id,
        name: billingIntent.department,
        manager_name: billingIntent.full_name,
        manager_email: billingIntent.email,
        phone: billingIntent.phone || null,
        location: 'Head Office',
        is_active: true,
      },
      { onConflict: 'organization_id,name' }
    );

    if (departmentError) {
      return NextResponse.json({ error: departmentError.message }, { status: 400 });
    }

    const paymentPayload = {
      billing_intent_id: billingIntent.id,
      organization_id: organization.id,
      plan: selectedPlan,
      billing_cycle: billingIntent.billing_cycle,
      amount: Number(billingIntent.metadata?.amount || planConfig.monthlyAmount),
      currency: 'INR',
      payment_method: billingIntent.payment_method,
      provider: 'razorpay',
      provider_session_id: orderId,
      provider_payment_intent_id: paymentId,
      status: 'paid',
      customer_email: billingIntent.email,
      raw_response: {
        orderId,
        paymentId,
        signature,
      },
    };

    const { error: paymentError } = await supabase.from('billing_payments').insert(paymentPayload);
    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 400 });
    }

    const { error: intentUpdateError } = await supabase
      .from('billing_intents')
      .update({
        organization_id: organization.id,
        auth_user_id: createdUser.user.id,
        status: 'completed',
        paid_at: new Date().toISOString(),
        metadata: {
          ...billingIntent.metadata,
          completedAt: new Date().toISOString(),
          paymentId,
          signature,
        },
      })
      .eq('id', billingIntent.id);

    if (intentUpdateError) {
      return NextResponse.json({ error: intentUpdateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      organizationId: organization.id,
      organizationName: billingIntent.organization_name,
      userId: createdUser.user.id,
      email: billingIntent.email,
      password: billingIntent.password,
      plan: selectedPlan,
      billingCycle: billingIntent.billing_cycle,
      amount: Number(billingIntent.metadata?.amount || planConfig.monthlyAmount) * 100,
      assetLimit: Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : null,
      userLimit: planConfig.userLimit,
      subscriptionExpiresAt: subscriptionTimeline.expiresAt,
      subscriptionRenewalNoticeAt: subscriptionTimeline.renewalNoticeAt,
      subscriptionGraceEndsAt: subscriptionTimeline.graceEndsAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
