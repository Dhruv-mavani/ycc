-- Mirrors whatsapp_joined_at (0013) — tracks whether an applicant clicked
-- "Join Instagram" before submitting, now required alongside WhatsApp.
alter table partner_program_applications
  add column instagram_joined_at timestamptz;
