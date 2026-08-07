-- Renames the volunteer/campus-partner applications table to match the
-- "Partner Program" naming used throughout the app.

alter table volunteer_applications rename to partner_program_applications;

alter index volunteer_applications_college_id_idx rename to partner_program_applications_college_id_idx;
alter index volunteer_applications_created_at_idx rename to partner_program_applications_created_at_idx;

alter policy "anyone can submit a volunteer application" on partner_program_applications rename to "anyone can submit a partner program application";
alter policy "admins can view volunteer applications" on partner_program_applications rename to "admins can view partner program applications";
