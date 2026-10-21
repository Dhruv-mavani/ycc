-- Age + Gender for Partner Program applications and quiz individual
-- registrations. Nullable at the DB level since existing rows (and Box
-- Cricket team members, who don't collect these) have neither — required-ness
-- is enforced at the Zod/form layer for the specific flows that ask for them.
alter table partner_program_applications
  add column age integer check (age > 0 and age < 120),
  add column gender text check (gender in ('male', 'female', 'other'));

alter table participants
  add column age integer check (age > 0 and age < 120),
  add column gender text check (gender in ('male', 'female', 'other'));
