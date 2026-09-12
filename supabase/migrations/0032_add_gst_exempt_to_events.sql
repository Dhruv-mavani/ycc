alter table public.events
  add column gst_exempt boolean not null default false;

comment on column public.events.gst_exempt is
  'When true, no GST is added on top of fee_paise — fee_paise IS the flat total charged, and receipts/breakdowns show no CGST/SGST/IGST split for this event.';
