create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  role text not null check (role in (
    'Super Admin',
    'Support Admin',
    'Finance/Ops Admin',
    'Risk Admin',
    'Analyst'
  )),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;
alter table public.admin_profiles force row level security;

revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;

create policy "Admins can read their own profile"
  on public.admin_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

comment on table public.admin_profiles is
  'Admin identity and role. Provision and change rows only through trusted Supabase administration; clients may read their own row.';