import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';

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

async function requireMasterAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    throw new Error('Missing authorization token');
  }

  const authClient = buildAuthClient(token);
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) {
    throw new Error('Invalid session');
  }

  const { data: profile, error: profileError } = await authClient
    .from('profiles')
    .select('id, organization_id, role')
    .eq('user_id', userData.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Profile not found');
  }

  if (profile.role !== 'master_admin') {
    throw new Error('Only master admin can manage users');
  }

  return { profile };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireMasterAdmin(request);
    const { id } = await params;
    const body = await request.json();

    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const department = String(body.department || '').trim();
    const role = String(body.role || 'employee');
    const password = String(body.password || '');

    if (!fullName || !email || !department) {
      return NextResponse.json({ error: 'Name, email, and department are required' }, { status: 400 });
    }

    const serviceClient = createSupabaseServiceRoleClient();
    const { data: updatedUser, error: updateError } = await serviceClient.auth.admin.updateUserById(id, {
      email,
      password: password || undefined,
      user_metadata: {
        organization_id: profile.organization_id,
        full_name: fullName,
        phone,
        department,
        role,
      },
    });

    if (updateError || !updatedUser.user) {
      return NextResponse.json({ error: updateError?.message || 'Failed to update auth user' }, { status: 400 });
    }

    const { error: profileError } = await serviceClient.from('profiles').update({
      full_name: fullName,
      email,
      phone: phone || null,
      department,
      title: role,
      role,
    }).eq('user_id', id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { error: auditError } = await serviceClient.from('audit_logs').insert({
      organization_id: profile.organization_id,
      actor_profile_id: profile.id,
      action: 'user.updated',
      entity_type: 'user',
      entity_id: id,
      metadata: {
        email,
        name: fullName,
        phone,
        department,
        role,
      },
    });

    if (auditError) {
      return NextResponse.json({ error: auditError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id,
        email,
        name: fullName,
        phone,
        organizationId: profile.organization_id,
        role,
        department,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireMasterAdmin(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = String(body.reason || '').trim();
    const confirmedBy = String(body.confirmedBy || '').trim();

    if (!reason || !confirmedBy) {
      return NextResponse.json({ error: 'Delete reason and confirmation name are required' }, { status: 400 });
    }

    const serviceClient = createSupabaseServiceRoleClient();
    const { data: targetProfile, error: targetError } = await serviceClient
      .from('profiles')
      .select('id,user_id,full_name,email,organization_id,role')
      .eq('user_id', id)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { error: profileUpdateError } = await serviceClient
      .from('profiles')
      .update({ is_active: false })
      .eq('user_id', id);

    if (profileUpdateError) {
      return NextResponse.json({ error: profileUpdateError.message }, { status: 400 });
    }

    const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(id);
    if (deleteAuthError) {
      return NextResponse.json({ error: deleteAuthError.message }, { status: 400 });
    }

    const { error: auditError } = await serviceClient.from('audit_logs').insert({
      organization_id: profile.organization_id,
      actor_profile_id: profile.id,
      action: 'user.deleted',
      entity_type: 'user',
      entity_id: id,
      metadata: {
        name: targetProfile.full_name,
        email: targetProfile.email,
        role: targetProfile.role,
        reason,
        confirmedBy,
      },
    });

    if (auditError) {
      return NextResponse.json({ error: auditError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
