-- YCC Promotional Partner: a new, separate referral-code system for
-- Kismat Ke Khiladi, parallel to (not replacing) College Campus Partner.
-- Same shape as college_campus_partner_applications, except `code` is
-- generated sequentially (YCCPP01, YCCPP02, ...) instead of from the
-- applicant's name + mobile digits — see
-- src/lib/promotional-partner-approval.ts.
create table public.promotional_partner_applications (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id),
  stream text not null,
  year int not null,
  semester int not null,
  name text not null,
  mobile text not null,
  email text,
  instagram_handle text,
  age int not null,
  gender text not null,
  agreed_to_terms boolean not null default false,
  whatsapp_joined_at timestamptz,
  instagram_joined_at timestamptz,
  code text,
  created_at timestamptz not null default now()
);

alter table public.promotional_partner_applications enable row level security;
-- No public policies — service-role-only access, same as
-- college_campus_partner_applications and every other applications table.

comment on table public.promotional_partner_applications is
  'YCC Promotional Partner applications. Standalone signup form, no referral/approval hierarchy, same as college_campus_partner_applications — only the code format differs (sequential YCCPP## vs name+mobile).';

-- Additive — the existing referred_by_college_campus_partner_id column and
-- its historical data (incl. 103 real Go Goa Gone registrations) are
-- untouched. Kismat Ke Khiladi's registration form now uses this new
-- column going forward instead.
alter table public.registrations
  add column referred_by_promotional_partner_id uuid references public.promotional_partner_applications(id);

comment on column public.registrations.referred_by_promotional_partner_id is
  'Optional YCC Promotional Partner whose code this registrant entered. See referred_by_college_campus_partner_id for the separate, older partner-code system.';
