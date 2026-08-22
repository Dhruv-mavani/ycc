// Question bank for the KBC-style (Kaun Banega Crorepati) host-driven quiz
// game. This is NOT the paid "YCC Quiz Competition" registration event —
// it's a standalone party-game display that one volunteer/host controls
// live in front of a seated group, reading questions aloud and manually
// deciding correctness/winners. There is no scoring backend, auth, or
// anti-cheat here on purpose: the host is the authority, this page is just
// the on-screen prompter + lifeline effects.
//
// No prize/money ladder — the host decides real-world prizes offline. Every
// question's correctIndex is the genuine correct answer; the host's manual
// Correct/Wrong call is just the final word, not a substitute for accuracy.
//
// 50 questions across 5 difficulty tiers (10 per tier), mixing cricket
// trivia, general knowledge, and riddles. A single game only plays 10
// questions (2 randomly drawn per tier, escalating tier by tier) so the
// same playthrough never repeats a question, and across many plays the
// pool is large enough that people won't recognize questions often.

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface QuestionTier {
  tier: number; // 1-5, escalating difficulty
  questions: QuizQuestion[]; // ~10 candidates per tier
}

export const LEVELS_PER_TIER = 2;
export const TOTAL_LEVELS = 10;

export const QUESTION_TIERS: QuestionTier[] = [
  {
    tier: 1,
    questions: [
      {
        question: "How many players are there in a cricket team on the field at one time?",
        options: ["9", "10", "11", "12"],
        correctIndex: 2,
      },
      {
        question: "Riddle: What has hands but cannot clap?",
        options: ["A clock", "A glove", "A statue", "A tree"],
        correctIndex: 0,
      },
      {
        question: "What does YCC stand for?",
        options: ["Yuva Champions Cricket", "Young Cricket Club", "Youth Cricket Council", "Yuva Cricket Circuit"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has a neck but no head?",
        options: ["A bottle", "A shirt", "A guitar", "A road"],
        correctIndex: 0,
      },
      {
        question: "How many balls make up one over in cricket?",
        options: ["4", "5", "6", "8"],
        correctIndex: 2,
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What can you catch but not throw?",
        options: ["A ball", "A cold", "A fish", "A wave"],
        correctIndex: 1,
      },
      {
        question: "How many days are there in a week?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
      },
      {
        question: "What is the standard colour of a cricket ball used in Test matches?",
        options: ["White", "Red", "Pink", "Yellow"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What gets wetter as it dries?",
        options: ["A sponge", "A towel", "Rain", "The sea"],
        correctIndex: 1,
      },
    ],
  },
  {
    tier: 2,
    questions: [
      {
        question: "In a T20 innings, what is the maximum number of overs one bowler can bowl?",
        options: ["2", "3", "4", "5"],
        correctIndex: 2,
      },
      {
        question: "Riddle: The more you take, the more you leave behind. What am I?",
        options: ["Time", "Footsteps", "Memories", "Money"],
        correctIndex: 1,
      },
      {
        question: "Which is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctIndex: 3,
      },
      {
        question:
          "Riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        options: ["A ghost", "An echo", "A shadow", "A whisper"],
        correctIndex: 1,
      },
      {
        question: "What is it called when a bowler takes three wickets on three consecutive deliveries?",
        options: ["Triple Strike", "Hat-trick", "Trio", "Triplet"],
        correctIndex: 1,
      },
      {
        question: "What does 'www' stand for in a website address?",
        options: ["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has many keys but can't open a single lock?",
        options: ["A piano", "A map", "A keyboard", "A vault"],
        correctIndex: 0,
      },
      {
        question: "Which is the fastest land animal in the world?",
        options: ["Lion", "Cheetah", "Horse", "Antelope"],
        correctIndex: 1,
      },
      {
        question: "What is the term for a batsman scoring zero runs and getting out?",
        options: ["Golden Duck", "Duck", "Blank", "Nil"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What month of the year has 28 days?",
        options: ["Only February", "All of them", "February in leap years", "None of them"],
        correctIndex: 1,
      },
    ],
  },
  {
    tier: 3,
    questions: [
      {
        question: "Which cricket ground is known as the 'Home of Cricket'?",
        options: ["Eden Gardens", "Lord's Cricket Ground", "MCG", "The Oval"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has to be broken before you can use it?",
        options: ["A promise", "A record", "An egg", "A seal"],
        correctIndex: 2,
      },
      {
        question: "Which country gifted the Statue of Liberty to the USA?",
        options: ["England", "France", "Spain", "Italy"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has a face and two hands but no arms or legs?",
        options: ["A clock", "A doll", "A mask", "A statue"],
        correctIndex: 0,
      },
      {
        question: "A 'googly' is a deceptive delivery bowled by which type of bowler?",
        options: ["Fast bowler", "Left-arm pacer", "Leg-spinner", "Off-spinner"],
        correctIndex: 2,
      },
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctIndex: 2,
      },
      {
        question: "Riddle: I'm tall when I'm young, and short when I'm old. What am I?",
        options: ["A tree", "A candle", "A person", "A shadow"],
        correctIndex: 1,
      },
      {
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correctIndex: 2,
      },
      {
        question: "What is the length of a cricket pitch, from stump to stump?",
        options: ["18 yards", "20 yards", "22 yards", "24 yards"],
        correctIndex: 2,
      },
      {
        question: "Riddle: What can travel around the world while staying in a corner?",
        options: ["A stamp", "A map", "A coin", "A clock"],
        correctIndex: 0,
      },
      {
        question: 'Riddle: Listen carefully as the host reads it aloud — "Two Zero Two Four." What number is being said?',
        options: ["2024", "0044", "0024", "2044"],
        correctIndex: 0,
      },
    ],
  },
  {
    tier: 4,
    questions: [
      {
        question: "Which country won the first-ever T20 World Cup in 2007?",
        options: ["Australia", "India", "Pakistan", "South Africa"],
        correctIndex: 1,
      },
      {
        question:
          "Riddle: I'm light as a feather, yet the strongest person can't hold me for much longer than a minute. What am I?",
        options: ["A secret", "A breath", "A thought", "A shadow"],
        correctIndex: 1,
      },
      {
        question: "Which country has won the most men's Cricket World Cup titles?",
        options: ["India", "West Indies", "Australia", "England"],
        correctIndex: 2,
      },
      {
        question: "Riddle: What has one eye but can't see?",
        options: ["A needle", "A storm", "A potato", "A camera"],
        correctIndex: 0,
      },
      {
        question: "The dramatic 'boundary countback' rule decided the 2019 ODI World Cup final between which two teams?",
        options: ["India vs Australia", "England vs New Zealand", "Australia vs England", "Pakistan vs India"],
        correctIndex: 1,
      },
      {
        question: "What is the chemical formula for water?",
        options: ["CO2", "H2O", "O2", "NaCl"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What kind of building has the most stories?",
        options: ["A school", "A library", "A skyscraper", "A museum"],
        correctIndex: 1,
      },
      {
        question: "Which bird is considered the fastest animal on Earth during a hunting dive?",
        options: ["Eagle", "Ostrich", "Peregrine Falcon", "Hawk"],
        correctIndex: 2,
      },
      {
        question: "What is it called when a batsman is out without facing a single ball?",
        options: ["Golden Duck", "Diamond Duck", "Silver Duck", "Platinum Duck"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What runs but never walks, has a mouth but never talks?",
        options: ["A river", "The wind", "A clock", "A car"],
        correctIndex: 0,
      },
    ],
  },
  {
    tier: 5,
    questions: [
      {
        question: "Which cricketer, nicknamed 'The Don', holds the highest Test batting average of all time (99.94)?",
        options: ["Sachin Tendulkar", "Don Bradman", "Brian Lara", "Viv Richards"],
        correctIndex: 1,
      },
      {
        question:
          "Riddle: The one who makes it sells it. The one who buys it never uses it. The one who uses it never knows they're using it. What is it?",
        options: ["A coffin", "A candle", "A ticket", "A key"],
        correctIndex: 0,
      },
      {
        question: "What is the highest individual score by a batsman in Test cricket history?",
        options: ["375 by Brian Lara", "400* by Brian Lara", "334 by Don Bradman", "365* by Garfield Sobers"],
        correctIndex: 1,
      },
      {
        question:
          "Riddle: What comes once in a minute, twice in a moment, but never in a thousand years?",
        options: ["The letter M", "A heartbeat", "A second", "A wish"],
        correctIndex: 0,
      },
      {
        question: "Which bowlers share the record for best bowling figures in a Test innings (all 10 wickets)?",
        options: ["Muttiah Muralitharan", "Jim Laker", "Anil Kumble", "Both Jim Laker and Anil Kumble"],
        correctIndex: 3,
      },
      {
        question: "In what year did cricket make its only appearance as an Olympic sport?",
        options: ["1896", "1900", "1908", "1912"],
        correctIndex: 1,
      },
      {
        question: "Which country was the first to win the Cricket World Cup twice in a row?",
        options: ["West Indies", "Australia", "India", "Pakistan"],
        correctIndex: 0,
      },
      {
        question:
          "Riddle: I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?",
        options: ["Fire", "A plant", "A virus", "Rust"],
        correctIndex: 0,
      },
      {
        question: "Which team won the inaugural IPL season in 2008?",
        options: ["Chennai Super Kings", "Mumbai Indians", "Rajasthan Royals", "Kolkata Knight Riders"],
        correctIndex: 2,
      },
      {
        question: "Riddle: Poor people have it. Rich people need it. If you eat it, you die. What is it?",
        options: ["Nothing", "Debt", "Time", "Salt"],
        correctIndex: 0,
      },
    ],
  },
];
