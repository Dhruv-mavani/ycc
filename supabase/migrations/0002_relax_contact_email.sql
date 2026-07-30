-- 01-spec.md's registration modal format is name + college + mobile only
-- (no email, no roll number). captain_email is no longer collected, so it
-- must be nullable; roll_number is dropped entirely since it's never
-- collected or displayed anymore.
alter table registrations alter column captain_email drop not null;
alter table participants drop column roll_number;

-- Fixed college list from 01-spec.md. Initials are picked explicitly rather
-- than auto-derived so "CK Pithawala" matches the CKG1001 example in spec.
insert into colleges (name, initials) values
  ('D.C. Patel', 'DCP'),
  ('Sascma College', 'SC'),
  ('Udhna Citizen', 'UC'),
  ('CK Pithawala', 'CK'),
  ('Bhagwan Mahavir University', 'BMU'),
  ('SCET', 'SCET'),
  ('Ambaba College', 'AC')
on conflict (initials) do nothing;
