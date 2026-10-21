-- Unlike partner_program_applications, this table has no status/approval
-- concept (every submission stands on its own — see the doc comment on
-- getCollegeCampusPartnerOverview in admin-stats.ts), so there's no
-- "approved" filter to gate on like the equivalent partner_program_applications
-- policy uses. Needed so the public Go Goa Gone registration form's
-- optional "referred by a College Campus Partner" search dropdown can
-- read id/name/code via the anon client.
create policy "anyone can view college campus partner applications"
  on college_campus_partner_applications
  for select
  to anon, authenticated
  using (true);
