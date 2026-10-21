-- Class Partner certificate + event-day team check-in.
--
-- Two distinct identifiers, both generated once a Class Partner is
-- approved (never for campus/classmate rows):
--   * team_code    — deterministic (first name + last 4 mobile digits,
--                     e.g. ABHI9864), no counter needed. This is what's
--                     printed as the certificate's QR payload, and what a
--                     Classmate Partner types on their application form to
--                     join that captain's team.
--   * unique_id    — this Class Partner's own personal check-in code,
--                     same visual family as participant unique IDs
--                     ({college initials}{letter}{serial}) but with a
--                     distinct "P" letter (participants use "G") so the
--                     two ID spaces can never collide or be ambiguous to
--                     staff scanning a code — see partner_id_counters
--                     below. Deliberately has no "group" rollover (that
--                     exists for participants purely for event-day batch
--                     capacity, via events.group_capacity — Class Partner
--                     counts per college won't need it).
--
-- attendance_status/marked_by/marked_at apply to both class and classmate
-- rows: staff scans a Class Partner's QR (team_code) to see the whole team
-- (captain + their approved classmates) and mark each present/absent.
alter table partner_program_applications
  add column team_code text,
  add column unique_id text,
  add column attendance_status text check (attendance_status in ('present', 'absent')),
  add column attendance_marked_by uuid references auth.users(id),
  add column attendance_marked_at timestamptz;

create unique index partner_program_applications_team_code_idx
  on partner_program_applications (team_code) where team_code is not null;
create unique index partner_program_applications_unique_id_idx
  on partner_program_applications (unique_id) where unique_id is not null;

create table partner_id_counters (
  college_id uuid primary key references colleges(id),
  serial integer not null default 0
);

create or replace function allocate_partner_unique_id(p_application_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_college_id uuid;
  v_initials text;
  v_serial integer;
  v_unique_id text;
begin
  select college_id into v_college_id
  from partner_program_applications
  where id = p_application_id;

  if v_college_id is null then
    raise exception 'partner application % not found', p_application_id;
  end if;

  insert into partner_id_counters (college_id, serial)
  values (v_college_id, 0)
  on conflict (college_id) do nothing;

  update partner_id_counters
    set serial = serial + 1
    where college_id = v_college_id
    returning serial into v_serial;

  select initials into v_initials from colleges where id = v_college_id;

  v_unique_id := v_initials || 'P' || lpad(v_serial::text, 3, '0');

  update partner_program_applications
    set unique_id = v_unique_id
    where id = p_application_id;

  return v_unique_id;
end;
$$;
