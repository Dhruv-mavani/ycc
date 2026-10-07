-- UPI note field was removed from the submission form — stop requiring
-- it at the DB level too. Column kept (not dropped) since it's harmless
-- unused state, cheaper than a destructive drop.
alter table box_cricket_payment_submissions alter column upi_note drop not null;
