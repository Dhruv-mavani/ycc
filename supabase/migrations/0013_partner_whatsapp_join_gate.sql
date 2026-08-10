-- Compulsory WhatsApp community gate: an approved partner (any of the
-- three tiers) must confirm they've followed the YCC Partners Group
-- WhatsApp channel before their dashboard shows real content. Nullable
-- timestamp doubles as a boolean + audit trail, matching the
-- reviewed_at/attendance_marked_at pattern already used on this table.
alter table partner_program_applications
  add column whatsapp_joined_at timestamptz;
