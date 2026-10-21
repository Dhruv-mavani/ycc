-- No partner application type collects a college/stream/semester anymore
-- (YCC Partner, YCC Co-Partner, and Classmate Partner all link up via a
-- referral code instead). allocate_partner_unique_id used to resolve its
-- per-college counter from the applicant's own college_id — since that's
-- going away, every partner now shares one counter under the "YCC Partner
-- Program" placeholder college (initials YCCP) instead.
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
  select id, initials into v_college_id, v_initials
  from colleges
  where initials = 'YCCP';

  if v_college_id is null then
    raise exception 'YCC Partner Program placeholder college not found';
  end if;

  insert into partner_id_counters (college_id, serial)
  values (v_college_id, 0)
  on conflict (college_id) do nothing;

  update partner_id_counters
    set serial = serial + 1
    where college_id = v_college_id
    returning serial into v_serial;

  v_unique_id := v_initials || 'P' || lpad(v_serial::text, 3, '0');

  update partner_program_applications
    set unique_id = v_unique_id
    where id = p_application_id;

  return v_unique_id;
end;
$$;

alter table partner_program_applications
  drop column college_id,
  drop column stream,
  drop column semester;
