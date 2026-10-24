-- Same gap as college_campus_partner_applications had before migration
-- 0039: this table has no status/approval concept either (every signup
-- gets a code immediately — see promotional-partner-approval.ts), so
-- there's no "approved" filter to gate a policy on. Migration 0045 marked
-- it "service-role-only, same as every other applications table" — but
-- unlike most of those, the public Go Goa Gone / Kismat Ke Khiladi
-- registration form's optional "Enter YCC Promotional Code" dropdown
-- needs to read id/name/code via the anon client (register/[eventSlug]
-- page.tsx), so RLS with zero policies silently returned no rows there —
-- every code looked like "match not found" regardless of whether it
-- actually existed.
create policy "anyone can view promotional partner applications"
  on promotional_partner_applications
  for select
  to anon, authenticated
  using (true);
