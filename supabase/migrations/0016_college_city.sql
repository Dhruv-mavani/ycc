-- City is shown on the ID card below the college name. Nullable since
-- there's no admin UI to backfill it for existing colleges yet — the ID
-- card templates omit the city line gracefully when unset.
alter table colleges add column city text;
