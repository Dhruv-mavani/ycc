-- `colleges` now doubles as a registration-grouping bucket for rows that
-- aren't real academic colleges: the shared "YCC Partner Program"
-- sentinel, and one row per YCC Partner/Co-Partner squad (created by
-- squad-source/route.ts, keyed by team_code). Both leaked into the public
-- Quiz registration form's college picker. is_public marks which rows a
-- public-facing dropdown should show — internal lookups (admin, staff,
-- receipts) are unaffected since they query by id/initials, not this flag.
alter table colleges add column is_public boolean not null default true;

update colleges
set is_public = false
where initials = 'YCCP'
   or initials in (
     select team_code from partner_program_applications where team_code is not null
   );
