-- Box Cricket online (UPI QR) payment submissions — captain submits a
-- transaction id + UPI note + screenshot via the public payment-link page;
-- an admin manually verifies against the real bank statement before this
-- flips the registration to "paid" (same payments table every other flow
-- already uses), which is what the staff Collect Payments panel reads.
create table box_cricket_payment_submissions (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  transaction_id text not null,
  upi_note text not null,
  screenshot_path text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references admins(user_id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index box_cricket_payment_submissions_registration_id_idx
  on box_cricket_payment_submissions (registration_id);
create index box_cricket_payment_submissions_status_idx
  on box_cricket_payment_submissions (status);

-- Stops the same transaction id being used for two different teams while
-- it's still "live" (pending review or already verified) — a rejected
-- submission frees the id up again in case it was rejected for an
-- unrelated reason (e.g. wrong team selected) and needs resubmitting.
create unique index box_cricket_payment_submissions_txn_live_unique
  on box_cricket_payment_submissions (transaction_id)
  where status in ('pending', 'verified');

alter table box_cricket_payment_submissions enable row level security;
-- No public/authenticated policies — every access path goes through a
-- server-only API route using the service-role client (same model as the
-- payments/registrations tables), so RLS is intentionally all-deny here.

-- A simple running log of bank-statement files the admin uploads for their
-- own manual cross-referencing while reviewing submissions above — not
-- parsed or matched automatically.
create table bank_statement_uploads (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  file_name text not null,
  uploaded_by uuid not null references admins(user_id),
  uploaded_at timestamptz not null default now()
);
alter table bank_statement_uploads enable row level security;

-- Private buckets — never publicly listable/readable. Every read/write
-- goes through the service-role client from a server-only API route that
-- independently checks the caller's session first.
insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('bank-statements', 'bank-statements', false)
on conflict (id) do nothing;
