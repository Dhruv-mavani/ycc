-- Staff self-service onboarding: a staff member's first Google sign-in
-- creates a 'pending' request (instead of silently failing), and an admin
-- approves/rejects it from the admin dashboard. Replaces the old `active`
-- boolean with a tri-state status so pending/rejected/approved are each
-- distinguishable, plus a few audit fields for who reviewed it and when.
alter table staff add column status text not null default 'pending'
  check (status in ('pending', 'approved', 'rejected'));

update staff set status = case when active then 'approved' else 'rejected' end;

alter table staff drop column active;

alter table staff add column requested_at timestamptz not null default now();
alter table staff add column reviewed_at timestamptz;
alter table staff add column reviewed_by uuid references auth.users(id);
