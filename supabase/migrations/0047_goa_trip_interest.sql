-- Shown on the Level Up summary screen when a player genuinely loses both
-- Spin the Wheel and Roll a Dice, and doesn't land any prize tier either —
-- a lightweight "Don't be sad, want to come to Goa with us?" opt-in. No
-- approval/status concept, same shape as the other standalone opt-in
-- tables (promotional_partner_applications, college_campus_partner_
-- applications) — service-role-only, written via an API route and read
-- only from the admin dashboard.
create table public.goa_trip_interest (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('registration', 'partner', 'school', 'individual_free')),
  player_ref_id uuid not null,
  team_ref_id uuid not null,
  player_name text not null,
  team_label text not null,
  phone text,
  created_at timestamptz not null default now(),
  -- One opt-in per code/player — re-losing both levels on their second
  -- chance shouldn't create a duplicate row.
  unique (source, player_ref_id)
);

alter table public.goa_trip_interest enable row level security;
-- No public policies — service-role-only, same as game_plays itself
-- (see migration 0033's comment).

comment on table public.goa_trip_interest is
  'Opt-ins from Level Up players who lost both levels and said yes to "come to Goa with us?" — admin-only, written via /api/games/goa-trip-interest.';
