-- Shared placeholder college for quiz registrants who aren't affiliated
-- with any of the fixed colleges — the admin dashboard groups them under
-- one "Individual" bucket instead of a real college.
insert into colleges (name, initials)
values ('Individual', 'IND')
on conflict (initials) do nothing;
