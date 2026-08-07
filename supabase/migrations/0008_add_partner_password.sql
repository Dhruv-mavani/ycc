-- Stores a hashed password captured at application time so that partners
-- approved by an admin can later log in with the email + password they set.
alter table partner_program_applications
  add column password_hash text;
