-- Optional "who referred you" tracking on registrations — lets a quiz
-- entrant (or team registration) credit a YCC Partner/Co-Partner, purely
-- so we can see how many entries a given partner brought in. Nullable
-- since most registrants won't pick one.
alter table registrations
  add column referred_by_partner_id uuid references partner_program_applications(id);
