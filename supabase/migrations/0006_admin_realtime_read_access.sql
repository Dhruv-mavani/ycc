-- Admin-only SELECT access so the admin dashboard can subscribe to
-- Postgres Changes via Supabase Realtime (RLS-aware: a client only
-- receives rows it could SELECT). Service-role reads (createAdminClient)
-- are unaffected — this only grants the *authenticated* role, and only
-- for rows visible when the caller is themselves in the admins table.

create policy "admins can view staff"
  on staff for select
  to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "admins can view volunteer applications"
  on volunteer_applications for select
  to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

alter publication supabase_realtime add table staff;
alter publication supabase_realtime add table volunteer_applications;
