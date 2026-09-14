-- Free, individual (no team, no payment) registration flow for events like
-- YCC Money Heist — same spirit as school_tournament_registrations (free,
-- personalized code + certificate) but for the general public: a college
-- dropdown instead of a school one, and genuine staff QR check-in via
-- attendance_status/marked_by/marked_at (school registrations don't have
-- this — Super Champs certificates are never scanned at the venue; this
-- event's are).
alter table public.events
  drop constraint events_type_check;

alter table public.events
  add constraint events_type_check
  check (type in ('cricket', 'quiz', 'school', 'individual_free'));

create table public.individual_free_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  college_id uuid references public.colleges(id),
  name text not null,
  whatsapp text not null,
  email text not null,
  code text not null,
  attendance_status text not null default 'absent' check (attendance_status in ('present', 'absent')),
  attendance_marked_by uuid references auth.users(id),
  attendance_marked_at timestamptz,
  created_at timestamptz not null default now()
);

create index individual_free_registrations_event_id_idx on public.individual_free_registrations (event_id);
create index individual_free_registrations_code_idx on public.individual_free_registrations (code);

comment on table public.individual_free_registrations is
  'Free, individual, no-team registrations for events of type individual_free (e.g. YCC Money Heist) — a personalized code + certificate like school_tournament_registrations, but with real staff QR check-in.';

alter table public.individual_free_registrations enable row level security;
