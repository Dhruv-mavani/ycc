-- YCC (Yuva Champions Cricket) initial schema
-- Design notes:
--  * Amounts are stored in paise (integer) to match Razorpay's smallest-unit convention.
--  * Unique participant IDs (e.g. CKG1001) are assigned only once payment is confirmed,
--    via allocate_unique_ids(), so abandoned/failed payments never burn a serial number.
--  * RLS defaults to deny-all. Public (anon) can only INSERT registrations/participants
--    (pre-payment) and SELECT active events/colleges. Every other read/write (payments,
--    attendance, aggregate reporting) goes through server-side API routes using the
--    service-role key, which independently verify the caller against `staff`/`admins`.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Colleges
-- ---------------------------------------------------------------------------
create table colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null unique,
  created_at timestamptz not null default now()
);

alter table colleges enable row level security;

create policy "colleges are publicly readable"
  on colleges for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Events (cricket championship / quiz competition)
-- ---------------------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  type text not null check (type in ('cricket', 'quiz')),
  description text,
  rules text,
  fee_paise integer not null check (fee_paise >= 0),
  group_capacity integer not null default 150 check (group_capacity > 0),
  min_team_size integer,
  max_team_size integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table events enable row level security;

create policy "active events are publicly readable"
  on events for select
  to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- Registrations (one row per team, or per individual quiz entrant)
-- ---------------------------------------------------------------------------
create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  college_id uuid not null references colleges(id),
  type text not null check (type in ('team', 'individual')),
  team_name text,
  captain_name text,
  captain_phone text not null,
  captain_email text not null,
  amount_paise integer not null check (amount_paise >= 0),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'failed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index registrations_event_id_idx on registrations(event_id);
create index registrations_college_id_idx on registrations(college_id);
create index registrations_status_idx on registrations(status);

alter table registrations enable row level security;

create policy "anyone can create a pending registration"
  on registrations for insert
  to anon, authenticated
  with check (status = 'pending_payment');

-- ---------------------------------------------------------------------------
-- Participants (players on a cricket team, or a single quiz entrant)
-- ---------------------------------------------------------------------------
create table participants (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  name text not null,
  roll_number text,
  phone text,
  email text,
  is_captain boolean not null default false,
  unique_id text unique,
  created_at timestamptz not null default now()
);

create index participants_registration_id_idx on participants(registration_id);
create index participants_unique_id_idx on participants(unique_id);

alter table participants enable row level security;

create policy "anyone can add participants to a registration"
  on participants for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Payments (Razorpay orders/payments — service-role only)
-- ---------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id),
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  razorpay_signature text,
  amount_paise integer not null,
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_registration_id_idx on payments(registration_id);

alter table payments enable row level security;
-- No policies: only the service-role key (which bypasses RLS) may touch this table.

-- ---------------------------------------------------------------------------
-- ID counters — one row per (college, event), tracking the current group
-- number and serial. allocate_unique_ids() advances this atomically.
-- ---------------------------------------------------------------------------
create table id_counters (
  college_id uuid not null references colleges(id),
  event_id uuid not null references events(id),
  group_number integer not null default 1,
  serial integer not null default 0,
  primary key (college_id, event_id)
);

alter table id_counters enable row level security;
-- No public policies: allocation only happens server-side via allocate_unique_ids().

-- ---------------------------------------------------------------------------
-- Attendance
-- ---------------------------------------------------------------------------
create table attendance (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null unique references participants(id) on delete cascade,
  status text not null default 'absent' check (status in ('present', 'absent')),
  marked_by uuid references auth.users(id),
  marked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table attendance enable row level security;
-- No public policies: staff/admin access goes through server-side API routes.

-- ---------------------------------------------------------------------------
-- Staff & admin allow-lists (keyed by Supabase auth user id)
-- ---------------------------------------------------------------------------
create table staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null,
  created_at timestamptz not null default now()
);

alter table staff enable row level security;
alter table admins enable row level security;

create policy "a user can check their own staff row"
  on staff for select
  to authenticated
  using (auth.uid() = user_id);

create policy "a user can check their own admin row"
  on admins for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Unique ID allocation
--
-- Format: <college initials><G><group_number><serial>, e.g. CKG1001.
-- Serial resets to 1 and group_number increments once the group's capacity
-- (event.group_capacity, default 150) is exceeded. Runs as SECURITY DEFINER
-- with a row lock on id_counters so concurrent payment confirmations for the
-- same college/event never collide or skip a number.
-- ---------------------------------------------------------------------------
create or replace function allocate_unique_ids(p_registration_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_college_id uuid;
  v_event_id uuid;
  v_capacity integer;
  v_college_initials text;
  v_group integer;
  v_serial integer;
  v_participant record;
begin
  select r.college_id, r.event_id, e.group_capacity, c.initials
    into v_college_id, v_event_id, v_capacity, v_college_initials
  from registrations r
  join events e on e.id = r.event_id
  join colleges c on c.id = r.college_id
  where r.id = p_registration_id;

  if v_college_id is null then
    raise exception 'registration % not found', p_registration_id;
  end if;

  insert into id_counters (college_id, event_id, group_number, serial)
  values (v_college_id, v_event_id, 1, 0)
  on conflict (college_id, event_id) do nothing;

  for v_participant in
    select id from participants
    where registration_id = p_registration_id and unique_id is null
    order by created_at
  loop
    select group_number, serial into v_group, v_serial
    from id_counters
    where college_id = v_college_id and event_id = v_event_id
    for update;

    v_serial := v_serial + 1;
    if v_serial > v_capacity then
      v_serial := 1;
      v_group := v_group + 1;
    end if;

    update id_counters
      set group_number = v_group, serial = v_serial
      where college_id = v_college_id and event_id = v_event_id;

    update participants
      set unique_id = v_college_initials || 'G' || v_group || lpad(v_serial::text, 3, '0')
      where id = v_participant.id;
  end loop;
end;
$$;
