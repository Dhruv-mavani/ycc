-- Prevent the same mobile number from submitting the Partner Program apply
-- form more than once. The apply route (src/app/api/partner-program/route.ts)
-- never checked for an existing application before inserting, and there was
-- no DB-level constraint either, so the same person could end up with
-- multiple rows (as a Co-Partner under different Partners, or applying
-- twice under the same one) — inflating the "X Co-Partners"/"Squad" counts
-- shown in the admin dashboard. This is the actual safety net against races;
-- the API route also checks up front for a friendlier error message.
alter table public.partner_program_applications
  add constraint partner_program_applications_mobile_key unique (mobile);
