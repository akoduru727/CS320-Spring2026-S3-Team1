-- Ensure tenant/landlord display names exist.
-- Run this in the Supabase SQL editor for your project.

alter table public.tenants
  add column if not exists name text;

alter table public.landlords
  add column if not exists name text;

