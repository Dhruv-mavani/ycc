alter table public.game_plays
  drop constraint game_plays_game_slug_check;

alter table public.game_plays
  add constraint game_plays_game_slug_check
  check (game_slug in ('spin-wheel', 'mystry-box', 'roll-a-dice'));
