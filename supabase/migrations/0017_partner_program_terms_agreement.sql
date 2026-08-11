-- Replaces the 3 separate Yes/No "agreement" questions on the Partner
-- Program application with a single T&C acceptance checkbox.

alter table partner_program_applications
  add column agreed_to_terms boolean not null default true;

alter table partner_program_applications
  alter column agreed_to_terms drop default;

alter table partner_program_applications
  drop column agreement_q1,
  drop column agreement_q2,
  drop column agreement_q3;
