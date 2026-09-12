alter table public.events
  add column pay_at_venue boolean not null default false;

comment on column public.events.pay_at_venue is
  'When true, online Cashfree checkout is skipped for this event — registration is confirmed immediately (unique IDs + receipt issued) and the entry fee (fee_paise) is collected in cash at the venue instead.';
