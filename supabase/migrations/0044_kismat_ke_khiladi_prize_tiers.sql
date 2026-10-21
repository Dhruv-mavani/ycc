-- Reusable per-event prize-tier config — null/0 for every event except
-- Kismat Ke Khiladi, so this has no effect anywhere else. See
-- rollAndRecordLevelUpPlay (src/lib/game-plays.ts) for how these drive a
-- separate, independently-calibrated draw after Level 2 (Roll a Dice)
-- finishes, decoupled from the wheel/dice's own real win/lose outcome.
alter table public.events
  add column top_tier_chance numeric,
  add column mid_tier_chance numeric,
  add column mid_tier_prize_label text;

comment on column public.events.top_tier_chance is
  'Probability (0-1) that a Level Up run at this event lands the top prize tier (choose-a-numbered-prize). Independent of the real wheel/dice outcome. Null = tier system not used for this event.';
comment on column public.events.mid_tier_chance is
  'Probability (0-1) that a Level Up run at this event lands the mid prize tier (mid_tier_prize_label, unlimited supply). Independent of the real wheel/dice outcome. Null = tier system not used for this event.';
comment on column public.events.mid_tier_prize_label is
  'Display name for the mid-tier prize, e.g. "Standup Comedy Pass".';

-- One real, finite, uniquely-claimable prize per numbered slot (1-10 for
-- Kismat Ke Khiladi) for an event's top prize tier. claimed_by_registration_id
-- being null is the "still available" state; claiming is an atomic
-- UPDATE ... WHERE claimed_by_registration_id IS NULL from the app, so a
-- race between two simultaneous top-tier winners can never double-claim
-- the same slot.
create table public.event_prize_slots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  slot_number int not null,
  prize_name text not null,
  claimed_by_registration_id uuid references public.registrations(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, slot_number)
);

create index event_prize_slots_event_id_idx on public.event_prize_slots (event_id);

comment on table public.event_prize_slots is
  'Finite, uniquely-claimable prizes behind an event''s numbered top-tier picker (see events.top_tier_chance). One row per number; claimed_by_registration_id null = still available.';

alter table public.event_prize_slots enable row level security;
-- No public policies — service-role-only access, same as game_plays and
-- every other table the game endpoints write through the admin client.

update public.events
set top_tier_chance = 0.001,   -- 10 per 10,000
    mid_tier_chance = 0.009,   -- 90 per 10,000
    mid_tier_prize_label = 'Standup Comedy Pass'
where slug = 'kismat-ke-khiladi';

insert into public.event_prize_slots (event_id, slot_number, prize_name)
select id, n, 'Prize ' || n || ' (placeholder — to be announced)'
from public.events, generate_series(1, 10) as n
where slug = 'kismat-ke-khiladi';
