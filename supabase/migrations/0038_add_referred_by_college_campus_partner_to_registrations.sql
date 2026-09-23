alter table registrations
  add column referred_by_college_campus_partner_id uuid
    references college_campus_partner_applications(id);

comment on column registrations.referred_by_college_campus_partner_id is
  'Optional: which YCC College Campus Partner referred this team, entered as an optional code/search field at registration. Separate from referred_by_partner_id, which points at partner_program_applications (YCC Partner/Co-Partner) instead.';
