-- Pivots partner-program login to a real Supabase Auth account created at
-- application time (consistent with how staff/admin sessions already work),
-- replacing the self-managed password hash from the previous migration.
-- Also adds the admin approve/reject workflow (mirrors 0004's staff status
-- pattern) and a real `partner_type` column so the Campus/Class/Classmate
-- toggle can actually filter instead of being cosmetic-only.

alter table partner_program_applications drop column password_hash;

alter table partner_program_applications
  add column user_id uuid references auth.users(id),
  add column partner_type text not null default 'campus'
    check (partner_type in ('campus', 'class', 'classmate')),
  add column status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references auth.users(id);

-- Allows multiple NULLs (legacy rows from before accounts existed) while
-- still preventing two applications from sharing one auth account.
create unique index partner_program_applications_user_id_idx
  on partner_program_applications (user_id);

create policy "partners can view their own application"
  on partner_program_applications for select
  to authenticated
  using (auth.uid() = user_id);
