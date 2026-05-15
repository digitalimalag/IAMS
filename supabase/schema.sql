-- IT Asset Management SaaS
-- Tenant-aware Supabase schema with Row Level Security.
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.tenant_role as enum ('master_admin', 'admin', 'it', 'hr', 'employee');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.asset_status as enum ('Active', 'Inactive', 'Maintenance', 'Retired');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.device_status as enum ('Online', 'Offline', 'Error');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.issue_status as enum ('Open', 'In Progress', 'Resolved');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.issue_priority as enum ('Low', 'Medium', 'High');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.request_status as enum ('Pending', 'Approved', 'Rejected', 'Ordered', 'Delivered', 'Installed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.purchase_status as enum ('Draft', 'Submitted', 'Approved', 'Delivered');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.handover_status as enum ('Pending', 'InProgress', 'Approved', 'Completed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subscription_plan as enum ('free', 'starter', 'growth', 'enterprise');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.billing_cycle as enum ('monthly', 'yearly');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  status text not null default 'active',
  plan text not null default 'starter',
  logo_url text,
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  department text,
  title text,
  role public.tenant_role not null default 'employee',
  is_active boolean not null default true,
  custom_permissions jsonb not null default '{}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text,
  department text,
  role public.tenant_role not null default 'employee',
  invited_by uuid references public.profiles(id) on delete set null,
  invite_token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  manager_name text,
  manager_email text,
  phone text,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  website text,
  payment_terms text,
  gst_number text,
  bank_details jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  asset_type text not null,
  serial_number text,
  manufacturer text,
  model text,
  processor text,
  ram text,
  storage text,
  os_installed text,
  purchase_date date,
  warranty_expiry date,
  status public.asset_status not null default 'Active',
  location text,
  owner text,
  assigned_to_profile_id uuid references public.profiles(id) on delete set null,
  ip_address text,
  mac_address text,
  asset_tag text,
  department text,
  cost numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, asset_tag)
);

create table if not exists public.network_devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  device_type text not null,
  ip_address text,
  mac_address text,
  location text,
  status public.device_status not null default 'Online',
  last_seen timestamptz,
  firmware_version text,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null,
  status public.issue_status not null default 'Open',
  priority public.issue_priority not null default 'Medium',
  asset_id uuid references public.assets(id) on delete set null,
  assigned_to_profile_id uuid references public.profiles(id) on delete set null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  due_date date,
  department text,
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null,
  requested_by_profile_id uuid references public.profiles(id) on delete set null,
  department text,
  asset_type text,
  quantity integer not null default 1,
  estimated_cost numeric(12,2) not null default 0,
  status public.request_status not null default 'Pending',
  priority public.issue_priority not null default 'Medium',
  approved_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  approval_date timestamptz,
  due_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  po_number text not null,
  vendor_id uuid references public.vendors(id) on delete set null,
  vendor_name text not null,
  department text,
  department_head text,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  status public.purchase_status not null default 'Draft',
  signatures jsonb not null default '{}'::jsonb,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, po_number)
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_handovers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_profile_id uuid references public.profiles(id) on delete set null,
  employee_name text not null,
  employee_role text,
  resignation_date date,
  department text,
  handover_status public.handover_status not null default 'Pending',
  it_approval jsonb,
  hr_approval jsonb,
  notes text,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_handover_items (
  id uuid primary key default gen_random_uuid(),
  handover_id uuid not null references public.asset_handovers(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  unique (handover_id, asset_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_org on public.profiles (organization_id);
create index if not exists idx_departments_org on public.departments (organization_id);
create index if not exists idx_vendors_org on public.vendors (organization_id);
create index if not exists idx_assets_org on public.assets (organization_id);
create index if not exists idx_network_devices_org on public.network_devices (organization_id);
create index if not exists idx_issues_org on public.issues (organization_id);
create index if not exists idx_asset_requests_org on public.asset_requests (organization_id);
create index if not exists idx_purchase_orders_org on public.purchase_orders (organization_id);
create index if not exists idx_asset_handovers_org on public.asset_handovers (organization_id);
create index if not exists idx_audit_logs_org on public.audit_logs (organization_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at
before update on public.departments
for each row execute function public.set_updated_at();

drop trigger if exists trg_vendors_updated_at on public.vendors;
create trigger trg_vendors_updated_at
before update on public.vendors
for each row execute function public.set_updated_at();

drop trigger if exists trg_assets_updated_at on public.assets;
create trigger trg_assets_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

drop trigger if exists trg_network_devices_updated_at on public.network_devices;
create trigger trg_network_devices_updated_at
before update on public.network_devices
for each row execute function public.set_updated_at();

drop trigger if exists trg_issues_updated_at on public.issues;
create trigger trg_issues_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

drop trigger if exists trg_asset_requests_updated_at on public.asset_requests;
create trigger trg_asset_requests_updated_at
before update on public.asset_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_purchase_orders_updated_at on public.purchase_orders;
create trigger trg_purchase_orders_updated_at
before update on public.purchase_orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_asset_handovers_updated_at on public.asset_handovers;
create trigger trg_asset_handovers_updated_at
before update on public.asset_handovers
for each row execute function public.set_updated_at();

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.organization_id
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.organization_id = target_org
      and p.is_active = true
  )
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.organization_id = target_org
      and p.is_active = true
      and p.role::text = any (allowed_roles)
  )
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org, array['master_admin', 'admin'])
$$;

create or replace function public.is_org_staff(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org, array['master_admin', 'admin', 'it', 'hr'])
$$;

create or replace function public.is_org_master_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org, array['master_admin'])
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_invites enable row level security;
alter table public.departments enable row level security;
alter table public.vendors enable row level security;
alter table public.assets enable row level security;
alter table public.network_devices enable row level security;
alter table public.issues enable row level security;
alter table public.asset_requests enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.asset_handovers enable row level security;
alter table public.asset_handover_items enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "org members can read their organization" on public.organizations;
create policy "org members can read their organization"
on public.organizations
for select
using (id = public.current_organization_id());

drop policy if exists "org admins can update their organization" on public.organizations;
create policy "org admins can update their organization"
on public.organizations
for update
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

drop policy if exists "org members can read profiles" on public.profiles;
create policy "org members can read profiles"
on public.profiles
for select
using (public.is_org_member(organization_id));

drop policy if exists "org masters can manage profiles" on public.profiles;
create policy "org masters can manage profiles"
on public.profiles
for all
using (public.is_org_master_admin(organization_id))
with check (public.is_org_master_admin(organization_id));

drop policy if exists "org members can read invites" on public.organization_invites;
create policy "org members can read invites"
on public.organization_invites
for select
using (public.is_org_member(organization_id));

drop policy if exists "org masters can manage invites" on public.organization_invites;
create policy "org masters can manage invites"
on public.organization_invites
for all
using (public.is_org_master_admin(organization_id))
with check (public.is_org_master_admin(organization_id));

drop policy if exists "org members can read departments" on public.departments;
create policy "org members can read departments"
on public.departments
for select
using (public.is_org_member(organization_id));

drop policy if exists "org staff can manage departments" on public.departments;
create policy "org staff can manage departments"
on public.departments
for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

drop policy if exists "org members can read vendors" on public.vendors;
create policy "org members can read vendors"
on public.vendors
for select
using (public.is_org_member(organization_id));

drop policy if exists "org admins can manage vendors" on public.vendors;
create policy "org admins can manage vendors"
on public.vendors
for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

drop policy if exists "org members can read assets" on public.assets;
create policy "org members can read assets"
on public.assets
for select
using (public.is_org_member(organization_id));

drop policy if exists "org admins can manage assets" on public.assets;
create policy "org admins can manage assets"
on public.assets
for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

drop policy if exists "org members can read network devices" on public.network_devices;
create policy "org members can read network devices"
on public.network_devices
for select
using (public.is_org_member(organization_id));

drop policy if exists "org admins can manage network devices" on public.network_devices;
create policy "org admins can manage network devices"
on public.network_devices
for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

drop policy if exists "org members can read issues" on public.issues;
create policy "org members can read issues"
on public.issues
for select
using (public.is_org_member(organization_id));

drop policy if exists "org members can create issues" on public.issues;
create policy "org members can create issues"
on public.issues
for insert
with check (public.is_org_member(organization_id));

drop policy if exists "org admins, it staff, or creators can update issues" on public.issues;
create policy "org admins, it staff, or creators can update issues"
on public.issues
for update
using (
  public.is_org_admin(organization_id)
  or public.has_org_role(organization_id, array['it'])
  or created_by_profile_id = public.current_profile_id()
)
with check (
  public.is_org_admin(organization_id)
  or public.has_org_role(organization_id, array['it'])
  or created_by_profile_id = public.current_profile_id()
);

drop policy if exists "org admins can delete issues" on public.issues;
create policy "org admins can delete issues"
on public.issues
for delete
using (public.is_org_admin(organization_id));

drop policy if exists "org members can read asset requests" on public.asset_requests;
create policy "org members can read asset requests"
on public.asset_requests
for select
using (public.is_org_member(organization_id));

drop policy if exists "org members can create asset requests" on public.asset_requests;
create policy "org members can create asset requests"
on public.asset_requests
for insert
with check (public.is_org_member(organization_id));

drop policy if exists "org admins or creators can update asset requests" on public.asset_requests;
create policy "org admins or creators can update asset requests"
on public.asset_requests
for update
using (
  public.is_org_admin(organization_id)
  or requested_by_profile_id = public.current_profile_id()
)
with check (
  public.is_org_admin(organization_id)
  or requested_by_profile_id = public.current_profile_id()
);

drop policy if exists "org admins can delete asset requests" on public.asset_requests;
create policy "org admins can delete asset requests"
on public.asset_requests
for delete
using (public.is_org_admin(organization_id));

drop policy if exists "org members can read purchase orders" on public.purchase_orders;
create policy "org members can read purchase orders"
on public.purchase_orders
for select
using (public.is_org_member(organization_id));

drop policy if exists "org admins can manage purchase orders" on public.purchase_orders;
create policy "org admins can manage purchase orders"
on public.purchase_orders
for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

drop policy if exists "org members can read purchase order items" on public.purchase_order_items;
create policy "org members can read purchase order items"
on public.purchase_order_items
for select
using (
  exists (
    select 1
    from public.purchase_orders po
    where po.id = purchase_order_id
      and public.is_org_member(po.organization_id)
  )
);

drop policy if exists "org admins can manage purchase order items" on public.purchase_order_items;
create policy "org admins can manage purchase order items"
on public.purchase_order_items
for all
using (
  exists (
    select 1
    from public.purchase_orders po
    where po.id = purchase_order_id
      and public.is_org_admin(po.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.purchase_orders po
    where po.id = purchase_order_id
      and public.is_org_admin(po.organization_id)
  )
);

drop policy if exists "org members can read handovers" on public.asset_handovers;
create policy "org members can read handovers"
on public.asset_handovers
for select
using (public.is_org_member(organization_id));

drop policy if exists "org staff can manage handovers" on public.asset_handovers;
create policy "org staff can manage handovers"
on public.asset_handovers
for all
using (public.is_org_staff(organization_id))
with check (public.is_org_staff(organization_id));

drop policy if exists "org members can read handover items" on public.asset_handover_items;
create policy "org members can read handover items"
on public.asset_handover_items
for select
using (
  exists (
    select 1
    from public.asset_handovers h
    where h.id = handover_id
      and public.is_org_member(h.organization_id)
  )
);

drop policy if exists "org staff can manage handover items" on public.asset_handover_items;
create policy "org staff can manage handover items"
on public.asset_handover_items
for all
using (
  exists (
    select 1
    from public.asset_handovers h
    where h.id = handover_id
      and public.is_org_staff(h.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.asset_handovers h
    where h.id = handover_id
      and public.is_org_staff(h.organization_id)
  )
);

drop policy if exists "org admins can read audit logs" on public.audit_logs;
create policy "org admins can read audit logs"
on public.audit_logs
for select
using (public.is_org_admin(organization_id));

drop policy if exists "org admins can write audit logs" on public.audit_logs;
create policy "org admins can write audit logs"
on public.audit_logs
for insert
with check (public.is_org_admin(organization_id));

create table if not exists public.billing_intents (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  organization_slug text not null,
  full_name text not null,
  email text not null,
  phone text,
  department text not null,
  password text not null,
  plan public.subscription_plan not null,
  billing_cycle public.billing_cycle not null default 'monthly',
  payment_method text not null,
  stripe_checkout_session_id text unique,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  organization_id uuid references public.organizations(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  billing_intent_id uuid references public.billing_intents(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  plan public.subscription_plan not null,
  billing_cycle public.billing_cycle not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'INR',
  payment_method text not null,
  provider text not null default 'stripe',
  provider_session_id text unique,
  provider_payment_intent_id text,
  status text not null default 'paid',
  customer_email text,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_billing_intents_slug on public.billing_intents (organization_slug);
create index if not exists idx_billing_intents_status on public.billing_intents (status);
create index if not exists idx_billing_payments_org on public.billing_payments (organization_id);
create index if not exists idx_billing_payments_provider on public.billing_payments (provider_session_id);

-- Optional helper trigger for Supabase Auth sign-up.
-- If you use Supabase Auth directly, pass these values in user metadata:
-- organization_id, full_name, role, department, phone.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  v_org_id := nullif(new.raw_user_meta_data->>'organization_id', '')::uuid;

  if v_org_id is null then
    select id into v_org_id
    from public.organizations
    order by created_at asc
    limit 1;
  end if;

  if v_org_id is null then
    raise exception 'No organization found. Create an organization first or pass organization_id in user metadata.';
  end if;

  insert into public.profiles (
    user_id,
    organization_id,
    full_name,
    email,
    phone,
    department,
    role
  )
  values (
    new.id,
    v_org_id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'department', ''),
    coalesce(
      nullif(new.raw_user_meta_data->>'role', '')::public.tenant_role,
      'employee'::public.tenant_role
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
