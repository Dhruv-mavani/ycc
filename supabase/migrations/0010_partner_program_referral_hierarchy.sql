-- Delegated approval hierarchy: admin approves Campus Partners; an approved
-- Campus Partner approves the Class Partners who named them as referrer;
-- an approved Class Partner approves their Classmate Partners (admin can
-- still override at any tier). Requires a real foreign key for "who
-- referred you" so each partner's approval queue can be found reliably —
-- the existing free-text `referred_by` column stays for the top-level
-- Campus Partner form, where the field is just an optional note.
alter table partner_program_applications
  add column referred_by_id uuid references partner_program_applications(id);

create index partner_program_applications_referred_by_id_idx
  on partner_program_applications (referred_by_id);

-- Powers the referral dropdown (Class Partner applicants pick their Campus
-- Partner from a list of approved partners, and likewise Classmate ->
-- Class). App code only ever selects minimal, non-sensitive columns
-- (id, name) under this policy.
create policy "anyone can view approved partners"
  on partner_program_applications for select
  to anon, authenticated
  using (status = 'approved');
