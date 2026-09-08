-- New free, individual, no-payment registration path for school-targeted
-- events (starting with YCC Super Champs) — deliberately separate from
-- registrations/participants/payments, since the shape genuinely differs
-- (no team, no college, no payment, a school instead, and a personalized
-- certificate code rather than a check-in unique_id).

alter table events drop constraint events_type_check;
alter table events add constraint events_type_check
  check (type = any (array['cricket'::text, 'quiz'::text, 'school'::text]));

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
alter table schools enable row level security;
create policy "schools are publicly readable" on schools
  for select to anon, authenticated using (true);

create table school_tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  name text not null,
  email text,
  whatsapp text not null,
  instagram_handle text,
  age integer not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  school_id uuid references schools(id),
  code text not null,
  created_at timestamptz not null default now()
);
alter table school_tournament_registrations enable row level security;
-- No public policies — all access goes through the admin (service role)
-- client from server routes only, same as registrations/participants.

insert into schools (name) values
  ('School 1'), ('School 2'), ('School 3'), ('School 4'), ('School 5');

insert into events (
  slug, name, type, description, rules, fee_paise, group_capacity,
  min_team_size, max_team_size, is_active, registration_open,
  is_partner_only, requires_referral
) values (
  'ycc-super-champs-box-cricket-tournament-2026',
  'YCC Super Champs Box Cricket Tournament 2026',
  'school',
  'Free individual registration for school students — no team, no entry fee. Register solo and get your personalized certificate instantly.',
  null,
  0,
  500,
  null,
  null,
  true,
  true,
  false,
  false
);
