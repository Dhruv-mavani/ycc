-- Swaps the payments table's Razorpay identifier columns for Cashfree
-- equivalents. Confirmed zero existing rows referenced the Razorpay
-- columns at the time of this migration, so this is a straight drop/add
-- rather than a data-preserving rename.
alter table payments
  drop column razorpay_order_id,
  drop column razorpay_payment_link_id,
  drop column razorpay_payment_id,
  drop column razorpay_signature,
  add column cashfree_link_id text,
  add column cashfree_order_id text,
  add column cashfree_payment_id text;
