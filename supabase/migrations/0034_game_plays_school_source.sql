alter table public.game_plays
  drop constraint game_plays_source_check;

alter table public.game_plays
  add constraint game_plays_source_check
  check (source in ('registration', 'partner', 'school'));

comment on column public.game_plays.source is
  'registration = Box Cricket-style team registration; partner = YCC Partner/Co-Partner (and their Squad); school = a Super Champs individual registration.';
