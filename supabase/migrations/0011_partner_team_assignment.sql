-- Lets a Class Partner sort their approved Classmate Partners into two
-- teams. Only meaningful for partner_type = 'classmate' rows; enforced at
-- the application layer (the API route only lets a Class Partner set this
-- on their own approved classmate reportees), not by a DB constraint tied
-- to partner_type, since that would need a trigger for little benefit.
alter table partner_program_applications
  add column team text check (team in ('A', 'B'));
