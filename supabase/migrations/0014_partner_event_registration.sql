-- "Ycc Partners Box Cricket Championship 2026": a real tournament event
-- registered exclusively through the Partner Program — a Class Partner
-- registers their own squad (themselves as captain + 5 approved Classmate
-- Partners sorted into Team A/B), not the public registration form. Open
-- to everyone, not just college students, since anyone can become a
-- Classmate Partner and join a Class Partner's team via their team_code.
--
-- registration_open/is_partner_only are per-event flags rather than
-- reusing is_active (which already gates which events are queried at all)
-- so the existing events keep their current "Coming Soon" homepage state
-- unchanged (both default to false) while this new event can be live.
alter table events
  add column registration_open boolean not null default false,
  add column is_partner_only boolean not null default false;

-- Tracks which registrations (if any) a Class Partner has submitted for
-- their Team A / Team B — lets the dashboard show "already registered,
-- here's your receipt" instead of allowing duplicate paid entries.
-- dues_paid is unrelated bookkeeping: lets a Class Partner mark which of
-- their Classmate Partners have paid them their share of the team fee (a
-- checklist for the captain's own use, independent of the actual Razorpay
-- payment which the captain makes as one lump sum for the whole team).
alter table partner_program_applications
  add column team_a_registration_id uuid references registrations(id),
  add column team_b_registration_id uuid references registrations(id),
  add column dues_paid boolean not null default false;

insert into events (
  slug, name, type, description, rules,
  fee_paise, group_capacity, min_team_size, max_team_size,
  is_active, registration_open, is_partner_only
) values (
  'ycc-partners-box-cricket-championship-2026',
  'Ycc Partners Box Cricket Championship 2026',
  'cricket',
  'Open to everyone — not limited to college students. Play for the team your Class Partner captains, alongside fellow YCC Partners.',
  'Box cricket format. Squad of exactly 6 players per team (Class Partner as captain + 5 approved Classmate Partners). Registration is exclusively through your Class Partner — join their team using the team code they share with you.',
  300000,
  150,
  6,
  6,
  true,
  true,
  true
);
