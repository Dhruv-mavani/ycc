-- The YCC Partners Box Cricket Championship now registers through the
-- same public Partner/Co-Partner squad-builder flow as the general Box
-- Cricket Championship (see TeamRegistrationForm), replacing the old
-- Co-Partner-dashboard Team A/B self-registration panel. is_partner_only
-- only ever gated the "Register now" button on the event details page —
-- the /register/[eventSlug] URL itself was never actually restricted.
update events
set is_partner_only = false,
    group_capacity = 30
where slug = 'ycc-partners-box-cricket-championship-2026';
