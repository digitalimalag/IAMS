import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getPlanConfig, getSubscriptionTimeline, normalizePlan } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const organizationName = String(body.organizationName || '').trim();
    const slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const department = String(body.department || '').trim();
    const password = String(body.password || '');
    const plan = normalizePlan(body.plan);
    const billingCycle = String(body.billingCycle || 'monthly') === 'yearly' ? 'yearly' : 'monthly';

    if (!organizationName || !slug || !fullName || !email || !department || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();

    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id, name, slug, settings')
      .eq('slug', slug)
      .maybeSingle();

    let organizationId = existingOrg?.id;
    const planConfig = getPlanConfig(plan);
    const subscriptionTimeline = getSubscriptionTimeline(billingCycle);

    if (existingOrg) {
      const { data: existingAdmin } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', existingOrg.id)
        .eq('role', 'master_admin')
        .limit(1);

      if (existingAdmin && existingAdmin.length > 0) {
        return NextResponse.json({ error: 'Organization already exists. Use the login page or choose a different slug.' }, { status: 409 });
      }
    }

    if (!organizationId) {
      const { data: createdOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          slug,
          legal_name: organizationName,
          status: 'active',
          plan,
          settings: {
            subscription: {
              plan,
              billingCycle,
              assetLimit: Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : null,
              userLimit: planConfig.userLimit,
              status: plan === 'free' ? 'active' : 'active',
              ...subscriptionTimeline,
            },
          },
        })
        .select('id')
        .single();

      if (orgError || !createdOrg) {
        return NextResponse.json({ error: orgError?.message || 'Failed to create organization' }, { status: 400 });
      }

      organizationId = createdOrg.id;
    }

    const organizationSettings = existingOrg?.settings && typeof existingOrg.settings === 'object' ? existingOrg.settings : {};
    const subscriptionSettings = {
      plan,
      billingCycle,
      assetLimit: Number.isFinite(planConfig.assetLimit) ? planConfig.assetLimit : null,
      userLimit: planConfig.userLimit,
      status: plan === 'free' ? 'active' : 'active',
      ...subscriptionTimeline,
    };

    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        organization_id: organizationId,
        full_name: fullName,
        phone,
        department,
        role: 'master_admin',
      },
    });

    if (createUserError || !createdUser.user) {
      return NextResponse.json({ error: createUserError?.message || 'Failed to create auth user' }, { status: 400 });
    }

    if (organizationId) {
      const { error: orgUpdateError } = await supabase
        .from('organizations')
        .update({
          plan,
          settings: {
            ...organizationSettings,
            subscription: subscriptionSettings,
          },
        })
        .eq('id', organizationId);

      if (orgUpdateError) {
        return NextResponse.json({ error: orgUpdateError.message }, { status: 400 });
      }
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        user_id: createdUser.user.id,
        organization_id: organizationId,
        full_name: fullName,
        email,
        phone: phone || null,
        department,
        title: 'Master Admin',
        role: 'master_admin',
        is_active: true,
      },
      { onConflict: 'organization_id,email' }
    );

    if (profileError) {
      await supabase.auth.admin.deleteUser(createdUser.user.id).catch(() => {});
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { error: departmentError } = await supabase.from('departments').upsert(
      {
        organization_id: organizationId,
        name: department,
        manager_name: fullName,
        manager_email: email,
        phone: phone || null,
        location: 'Head Office',
        is_active: true,
      },
      { onConflict: 'organization_id,name' }
    );

    if (departmentError) {
      await supabase.auth.admin.deleteUser(createdUser.user.id).catch(() => {});
      await supabase.from('profiles').delete().eq('user_id', createdUser.user.id);
      return NextResponse.json({ error: departmentError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      organizationId,
      userId: createdUser.user.id,
      email,
      plan,
      assetLimit: subscriptionSettings.assetLimit,
      userLimit: subscriptionSettings.userLimit,
      billingCycle,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
