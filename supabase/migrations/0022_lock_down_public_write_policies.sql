-- Security hardening: the app never writes to Supabase from the browser —
-- every insert/update goes through an API route using the service-role
-- client (createAdminClient), which bypasses RLS entirely. Several tables
-- still carried early-days "anon/authenticated can insert" policies from
-- before that architecture settled, leaving them writable directly via the
-- public REST API using nothing but the public anon key. Dropping those
-- policies matches the already-correct pattern used by `attendance`,
-- `id_counters`, and `payments` (RLS enabled, zero policies — service-role
-- only). No application code path is affected.

drop policy if exists "anyone can add participants to a registration" on participants;
drop policy if exists "anyone can submit a partner program application" on partner_program_applications;
drop policy if exists "anyone can create a pending registration" on registrations;

-- `partner_id_counters` (added in 0012) never had RLS enabled at all,
-- leaving it fully readable and writable — this is an internal serial
-- counter only ever touched by the security-definer
-- allocate_partner_unique_id() function, same shape as `id_counters`.
alter table partner_id_counters enable row level security;
