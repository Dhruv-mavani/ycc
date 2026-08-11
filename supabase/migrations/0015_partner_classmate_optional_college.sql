-- Classmate Partners now represent tournament participants open to
-- everyone, not just college students (see the new
-- ycc-partners-box-cricket-championship-2026 event) — college/stream/
-- semester are no longer relevant to that application type, since a
-- Class Partner's team code is what actually links a classmate to a
-- team, not their college. Stays required for campus/class rows, which
-- the app-level schema (partnerProgramApplicationSchema) still enforces.
alter table partner_program_applications
  alter column college_id drop not null,
  alter column stream drop not null,
  alter column semester drop not null;
