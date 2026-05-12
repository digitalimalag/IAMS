import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getPlanConfig, normalizePlan } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
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

    if (profile.role !== 'master_admin') {
      return NextResponse.json({ error: 'Only master admin can create users' }, { status: 403 });
    }

    const { data: orgRow, error: orgError } = await authClient
      .from('organizations')
      .select('plan, settings')
      .eq('id', profile.organization_id)
      .single();

    if (orgError || !orgRow) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 403 });
    }

    const plan = normalizePlan(orgRow.plan);
    const planConfig = getPlanConfig(plan);
    const subscription = orgRow.settings?.subscription || {};
    const userLimit = Number(subscription.userLimit || planConfig.userLimit);

    const { count: existingUsersCount } = await authClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id);

    if ((existingUsersCount || 0) >= userLimit) {
      return NextResponse.json({
        error: plan === 'free'
          ? 'Free plan allows only 1 master admin. Upgrade to add more users.'
          : `This plan allows up to ${userLimit} users. Upgrade your plan to add more.`,
      }, { status: 402 });
    }

    const body = await request.json();
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const phone = String(body.phone || '').trim();
    const designation = String(body.designation || '').trim();
    const department = String(body.department || '').trim();
    const role = String(body.role || 'employee');

    if (!fullName || !email || !password || !designation || !department) {
      return NextResponse.json({ error: 'Name, email, designation, password, and department are required' }, { status: 400 });
    }

    const serviceClient = createSupabaseServiceRoleClient();
    const { data: createdUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
        user_metadata: {
          organization_id: profile.organization_id,
          full_name: fullName,
          phone,
          designation,
          department,
          role,
        },
    });

    if (createError || !createdUser.user) {
      return NextResponse.json({ error: createError?.message || 'Failed to create auth user' }, { status: 400 });
    }

    const createdAt = new Date().toISOString().split('T')[0];

    const { error: profileInsertError } = await serviceClient.from('profiles').upsert(
      {
        user_id: createdUser.user.id,
        organization_id: profile.organization_id,
        full_name: fullName,
        email,
        phone: phone || null,
        title: designation,
        department,
        role,
        is_active: true,
      },
      { onConflict: 'organization_id,email' }
    );

    if (profileInsertError) {
      await serviceClient.auth.admin.deleteUser(createdUser.user.id).catch(() => {});
      return NextResponse.json({ error: profileInsertError.message }, { status: 400 });
    }

    const { error: departmentError } = await serviceClient.from('departments').upsert(
      {
        organization_id: profile.organization_id,
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
      await serviceClient.auth.admin.deleteUser(createdUser.user.id).catch(() => {});
      return NextResponse.json({ error: departmentError.message }, { status: 400 });
    }

    const { error: auditError } = await serviceClient.from('audit_logs').insert({
      organization_id: profile.organization_id,
      actor_profile_id: profile.id,
      action: 'user.created',
      entity_type: 'user',
      entity_id: createdUser.user.id,
        metadata: {
          email,
          name: fullName,
          designation,
          role,
          department,
        },
    });

    if (auditError) {
      await serviceClient.auth.admin.deleteUser(createdUser.user.id).catch(() => {});
      await serviceClient.from('profiles').delete().eq('user_id', createdUser.user.id);
      return NextResponse.json({ error: auditError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: createdUser.user.id,
        email,
        name: fullName,
        phone,
        designation,
        organizationId: profile.organization_id,
        role,
        department,
        isActive: true,
        createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
