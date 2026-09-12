alter table public.events
  add column hide_receipt_page boolean not null default false;

comment on column public.events.hide_receipt_page is
  'When true, the receipt PDF omits the invoice-style "payment receipt" page (org header, order summary, GST breakdown, roster QR list) — only the invitation letter (if any) and per-participant ID card pages are included. The underlying receipt data is still computed normally; it is just not rendered into this PDF.';
