-- Razorpay replaces Cashfree as the live gateway. Cashfree's columns stay
-- (any historical rows keep their audit trail), these are added alongside.
alter table payments
  add column razorpay_order_id text,
  add column razorpay_payment_link_id text,
  add column razorpay_payment_id text,
  add column razorpay_signature text;

-- Generic key-value settings table — the kill switch lives here (not an
-- env var) specifically so it can be flipped instantly from the admin
-- dashboard with no deploy, matching the actual use case: a Razorpay
-- outage needs an immediate fallback to the cash flow, not a 1-2 minute
-- build-and-deploy cycle.
create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references admins(user_id)
);
alter table app_settings enable row level security;
-- No public/authenticated policies — read/write only via the service-role
-- client from server-only code (same model as every other settings-like
-- table in this app).

-- Starts OFF on purpose — Razorpay shouldn't take live traffic until the
-- integration has actually been verified end-to-end and an admin
-- deliberately turns it on.
insert into app_settings (key, value) values ('razorpay_enabled', 'false'::jsonb);
