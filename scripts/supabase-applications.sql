-- Applications table for tenant -> landlord approval flow.
-- Run this in the Supabase SQL editor for your project.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  listing uuid not null references public.listings (id) on delete cascade,
  tenant uuid not null references public.tenants (id) on delete cascade,
  landlord uuid not null references public.landlords (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  message text,
  created_at timestamptz not null default now()
);

create index if not exists applications_tenant_idx on public.applications (tenant);
create index if not exists applications_landlord_idx on public.applications (landlord);
create index if not exists applications_listing_idx on public.applications (listing);

alter table public.applications enable row level security;

drop policy if exists "tenant can insert applications" on public.applications;
create policy "tenant can insert applications"
on public.applications
for insert
to authenticated
with check (auth.uid() = tenant);

drop policy if exists "tenant can view own applications" on public.applications;
create policy "tenant can view own applications"
on public.applications
for select
to authenticated
using (auth.uid() = tenant);

drop policy if exists "landlord can view applications for own listings" on public.applications;
create policy "landlord can view applications for own listings"
on public.applications
for select
to authenticated
using (auth.uid() = landlord);

drop policy if exists "landlord can update application status" on public.applications;
create policy "landlord can update application status"
on public.applications
for update
to authenticated
using (auth.uid() = landlord)
with check (auth.uid() = landlord);

