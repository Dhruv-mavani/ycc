-- Sample data for local development only. Replace with real events/fees before launch.

insert into events (slug, name, type, description, rules, fee_paise, group_capacity, min_team_size, max_team_size)
values
  (
    'cricket-championship-2026',
    'Ycc Box Cricket Championship 2026',
    'cricket',
    'Inter-college box cricket championship for university teams.',
    'Box cricket format. Squad of exactly 6 players per team.',
    300000,
    150,
    6,
    6
  ),
  (
    'quiz-competition-2026',
    'YCC Quiz Competition 2026',
    'quiz',
    'General knowledge and sports quiz, individual entries.',
    'Individual participation only. Multiple rounds, top scorers advance.',
    1000,
    150,
    null,
    null
  );

insert into events (slug, name, type, description, rules, fee_paise, group_capacity, min_team_size, max_team_size, registration_open, is_partner_only)
values
  (
    'ycc-partners-box-cricket-championship-2026',
    'Ycc Partners Box Cricket Championship 2026',
    'cricket',
    'Open to everyone — not limited to college students. Play for the team your YCC Co-Partner captains, alongside fellow YCC Partners.',
    'Box cricket format. Squad of exactly 6 players per team (YCC Co-Partner as captain + 5 approved Classmate Partners). Registration is exclusively through your YCC Co-Partner — join their team using the team code they share with you.',
    300000,
    150,
    6,
    6,
    true,
    true
  );
