-- id_counters must be scoped per COLLEGE ONLY, shared across all events —
-- 01-spec.md describes a single running counter per college ("group 1 from
-- that college which consists of 150 people"), not one counter per
-- (college, event). Scoping by event let two different events for the same
-- college independently generate the identical unique_id (e.g. both
-- producing "CPG1001" as their first participant), which collided on
-- participants' global unique_id constraint and silently broke allocation
-- for the second event.

drop function if exists allocate_unique_ids(uuid);

alter table id_counters drop constraint id_counters_pkey;

-- Consolidate any existing per-event rows for the same college into the
-- single highest counter seen (dev/test data only — safe to be coarse).
delete from id_counters a using id_counters b
  where a.college_id = b.college_id
    and (a.group_number, a.serial) < (b.group_number, b.serial);

alter table id_counters drop column event_id;
alter table id_counters add primary key (college_id);

create or replace function allocate_unique_ids(p_registration_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_college_id uuid;
  v_capacity integer;
  v_college_initials text;
  v_group integer;
  v_serial integer;
  v_participant record;
begin
  select r.college_id, e.group_capacity, c.initials
    into v_college_id, v_capacity, v_college_initials
  from registrations r
  join events e on e.id = r.event_id
  join colleges c on c.id = r.college_id
  where r.id = p_registration_id;

  if v_college_id is null then
    raise exception 'registration % not found', p_registration_id;
  end if;

  insert into id_counters (college_id, group_number, serial)
  values (v_college_id, 1, 0)
  on conflict (college_id) do nothing;

  for v_participant in
    select id from participants
    where registration_id = p_registration_id and unique_id is null
    order by created_at
  loop
    select group_number, serial into v_group, v_serial
    from id_counters
    where college_id = v_college_id
    for update;

    v_serial := v_serial + 1;
    if v_serial > v_capacity then
      v_serial := 1;
      v_group := v_group + 1;
    end if;

    update id_counters
      set group_number = v_group, serial = v_serial
      where college_id = v_college_id;

    update participants
      set unique_id = v_college_initials || 'G' || v_group || lpad(v_serial::text, 3, '0')
      where id = v_participant.id;
  end loop;
end;
$$;
