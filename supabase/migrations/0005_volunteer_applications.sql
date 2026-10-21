-- Volunteer / Campus Partner applications — public submission form.
-- Mirrors the RLS shape of `participants`: anon/authenticated can insert,
-- nobody can select — admin reads go through the service-role client.

create table volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  college_id uuid not null references colleges(id),
  stream text not null,
  semester text not null,
  mobile text not null,
  instagram_handle text not null,
  referred_by text,
  agreement_q1 text not null check (agreement_q1 in ('Yes', 'No')),
  agreement_q2 text not null check (agreement_q2 in ('Yes', 'No')),
  agreement_q3 text not null check (agreement_q3 in ('Yes, Absolutely', 'No')),
  created_at timestamptz not null default now()
);

create index volunteer_applications_college_id_idx on volunteer_applications(college_id);
create index volunteer_applications_created_at_idx on volunteer_applications(created_at desc);

alter table volunteer_applications enable row level security;

create policy "anyone can submit a volunteer application"
  on volunteer_applications for insert
  to anon, authenticated
  with check (true);

-- No select policy: admin dashboard reads via createAdminClient() (service role).
