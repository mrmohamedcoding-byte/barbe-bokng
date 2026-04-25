-- ============================================
-- THE GENTLEMAN'S CLUB - ADMIN SETTINGS SCHEMA
-- ============================================
-- Run this SQL in Supabase SQL Editor.
-- It adds:
-- - admin profiles + admin role
-- - services, barbers, schedules, shop/booking settings
-- - audit log (who changed what/when)
-- - RLS policies (public read where needed, admin-only writes)

-- Extensions
create extension if not exists pgcrypto;

-- ============================================
-- PROFILES (ADMIN ROLE SOURCE OF TRUTH)
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = uid), false);
$$;

create policy if not exists "profiles: read own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy if not exists "profiles: update own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- ============================================
-- AUDIT LOG
-- ============================================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text,
  action text not null, -- insert/update/delete
  entity text not null, -- table or domain: services, barbers, schedule, settings
  record_id uuid,
  changes jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy if not exists "audit_log: admin read"
on public.audit_log
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy if not exists "audit_log: admin insert"
on public.audit_log
for insert
to authenticated
with check (public.is_admin(auth.uid()));

-- Helper: insert audit row
create or replace function public.insert_audit(
  _action text,
  _entity text,
  _record_id uuid,
  _changes jsonb
)
returns void
language plpgsql
security definer
as $$
declare
  _email text;
begin
  -- Try to derive email from JWT claim (may be null depending on auth provider)
  _email := current_setting('request.jwt.claim.email', true);

  insert into public.audit_log(actor_id, actor_email, action, entity, record_id, changes)
  values (auth.uid(), _email, _action, _entity, _record_id, _changes);
end;
$$;

revoke all on function public.insert_audit(text, text, uuid, jsonb) from public;
grant execute on function public.insert_audit(text, text, uuid, jsonb) to authenticated;

-- ============================================
-- SERVICES
-- ============================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  duration_minutes int not null check (duration_minutes > 0),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_active_sort on public.services(active, sort_order, name);

alter table public.services enable row level security;

create policy if not exists "services: public read active"
on public.services
for select
to anon, authenticated
using (active = true);

create policy if not exists "services: admin read all"
on public.services
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy if not exists "services: admin write"
on public.services
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ============================================
-- WORKING HOURS (PER DAY OF WEEK)
-- ============================================
create table if not exists public.working_hours (
  day_of_week int primary key check (day_of_week >= 0 and day_of_week <= 6),
  is_closed boolean not null default false,
  open_time time,
  close_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (is_closed = true and open_time is null and close_time is null)
    or
    (is_closed = false and open_time is not null and close_time is not null and open_time < close_time)
  )
);

alter table public.working_hours enable row level security;

create policy if not exists "working_hours: public read"
on public.working_hours
for select
to anon, authenticated
using (true);

create policy if not exists "working_hours: admin write"
on public.working_hours
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ============================================
-- BLOCKED DATES (HOLIDAYS / VACATIONS)
-- ============================================
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.blocked_dates enable row level security;

create policy if not exists "blocked_dates: public read"
on public.blocked_dates
for select
to anon, authenticated
using (true);

create policy if not exists "blocked_dates: admin write"
on public.blocked_dates
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ============================================
-- SHOP SETTINGS (SINGLE ROW)
-- ============================================
create table if not exists public.shop_settings (
  id int primary key default 1,
  shop_name text not null default 'The Gentleman''s Club',
  tagline text,
  phone text,
  email text,
  address text,
  instagram text,
  facebook text,
  tiktok text,
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint shop_settings_singleton check (id = 1)
);

insert into public.shop_settings(id)
values (1)
on conflict (id) do nothing;

alter table public.shop_settings enable row level security;

create policy if not exists "shop_settings: public read"
on public.shop_settings
for select
to anon, authenticated
using (true);

create policy if not exists "shop_settings: admin write"
on public.shop_settings
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ============================================
-- BOOKING SETTINGS (SINGLE ROW)
-- ============================================
create table if not exists public.booking_settings (
  id int primary key default 1,
  max_bookings_per_slot int not null default 1 check (max_bookings_per_slot > 0),
  booking_window_days int not null default 14 check (booking_window_days >= 1 and booking_window_days <= 365),
  auto_confirm boolean not null default true,
  cancellation_policy text,
  updated_at timestamptz not null default now(),
  constraint booking_settings_singleton check (id = 1)
);

insert into public.booking_settings(id)
values (1)
on conflict (id) do nothing;

alter table public.booking_settings enable row level security;

create policy if not exists "booking_settings: public read"
on public.booking_settings
for select
to anon, authenticated
using (true);

create policy if not exists "booking_settings: admin write"
on public.booking_settings
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ============================================
-- BARBERS
-- ============================================
create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.barbers enable row level security;

create policy if not exists "barbers: public read active"
on public.barbers
for select
to anon, authenticated
using (active = true);

create policy if not exists "barbers: admin read all"
on public.barbers
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy if not exists "barbers: admin write"
on public.barbers
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ============================================
-- BARBER SERVICES (ASSIGNMENT)
-- ============================================
create table if not exists public.barber_services (
  barber_id uuid references public.barbers(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  primary key (barber_id, service_id)
);

alter table public.barber_services enable row level security;

create policy if not exists "barber_services: public read"
on public.barber_services
for select
to anon, authenticated
using (true);

create policy if not exists "barber_services: admin write"
on public.barber_services
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ============================================
-- OPTIONAL: APPOINTMENTS SAFETY (DOUBLE-BOOKING INDEX)
-- ============================================
-- This doesn't fully prevent races if you allow multiple bookings per slot.
-- For max_bookings_per_slot=1, you can enforce uniqueness at DB level:
-- create unique index if not exists idx_appointments_unique_slot on public.appointments(date, time) where status != 'cancelled';

