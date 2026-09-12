create table public.game_plays (
  id uuid primary key default gen_random_uuid(),
  game_slug text not null check (game_slug in ('spin-wheel', 'mystry-box')),
  source text not null check (source in ('registration', 'partner')),
  team_ref_id uuid not null,
  player_ref_id uuid not null,
  player_name text not null,
  team_label text not null,
  is_captain boolean not null default false,
  result text not null check (result in ('won', 'lost')),
  detail jsonb,
  created_at timestamptz not null default now()
);

create index game_plays_game_slug_idx on public.game_plays (game_slug);
create index game_plays_team_ref_id_idx on public.game_plays (team_ref_id);
create index game_plays_created_at_idx on public.game_plays (created_at desc);

comment on table public.game_plays is
  'One row per self-serve game round (Spin the Wheel / Mystery Box) played against a real team or partner code — source distinguishes whether team_ref_id/player_ref_id point into registrations+participants or into partner_program_applications. player_name/team_label are denormalized at write time so admin insights don''t need to join across two unrelated hierarchies.';

alter table public.game_plays enable row level security;
