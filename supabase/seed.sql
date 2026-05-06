-- Minimal seed data for first-time setup.
-- Run Part A first to inspect your organization slug.
-- Then replace YOUR_ORG_SLUG with the actual slug from the organizations table.

select id, name, slug
from public.organizations
order by created_at asc;

-- Replace YOUR_ORG_SLUG below with the real slug from the query above.
with org as (
  select id
  from public.organizations
  where slug = 'YOUR_ORG_SLUG'
  limit 1
)
insert into public.profiles (
  user_id,
  organization_id,
  full_name,
  email,
  phone,
  department,
  title,
  role,
  is_active
)
select
  (select id from auth.users where email = 'admin@yourcompany.com' limit 1),
  org.id,
  'Master Admin',
  'admin@yourcompany.com',
  '+91XXXXXXXXXX',
  'IT Support',
  'Master Admin',
  'master_admin',
  true
from org;

with org as (
  select id
  from public.organizations
  where slug = 'YOUR_ORG_SLUG'
  limit 1
)
insert into public.departments (
  organization_id,
  name,
  manager_name,
  manager_email,
  phone,
  location,
  is_active
)
select
  org.id,
  'IT Support',
  'Master Admin',
  'admin@yourcompany.com',
  '+91XXXXXXXXXX',
  'Head Office',
  true
from org
on conflict (organization_id, name) do nothing;
