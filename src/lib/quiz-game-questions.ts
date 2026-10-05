import "server-only";

// Question bank for Quiz Champion (/quiz-game2), a solo KBC-style quiz.
// server-only on purpose: this file (including every correctIndex) must
// never reach the browser bundle — it's imported exclusively by
// src/lib/games/quiz-session.ts, which picks/shuffles/checks questions
// entirely server-side and only ever sends the client a question's text
// and its 4 options in display order, never which one is correct. See
// quiz-session.ts's own header comment for the full flow and why (a
// client-side-only version of this used to ship the whole answer key in
// the JS bundle, trivially readable via devtools, regardless of whether
// any request was ever forged).
//
// No prize/money ladder — YCC decides real-world prizes offline. Every
// question's correctIndex is the genuine correct answer, individually
// fact-checked, not just "whatever reads plausible." Deliberately avoids
// "current record holder" style questions (e.g. "who holds the record
// for X as of today") in favor of permanently-settled historical facts,
// so nothing in here goes stale as real-world records change.
//
// 203 questions across 5 difficulty tiers (30-59 per tier), mixing cricket
// trivia, general knowledge, and riddles, escalating in difficulty tier by
// tier. A single game only plays 10 questions (2 randomly drawn per tier)
// so the same playthrough never repeats a question — and with 5000+
// people expected to play this pool, a bigger bank directly reduces (but,
// by the math, can never fully eliminate) how often the same question
// gets asked to enough different people that answers could spread by word
// of mouth. See the conversation this was built from for the full math on
// why pool size alone can't solve that at this scale.

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface QuestionTier {
  tier: number; // 1-5, escalating difficulty
  questions: QuizQuestion[]; // 30-59 candidates per tier
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
      {
        question: "What do you call the three wooden poles the bowler aims to hit?",
        options: ["Bails", "Stumps", "Pads", "Creases"],
        correctIndex: 1,
      },
      {
        question: "What is the name of the small piece of wood that sits on top of the stumps?",
        options: ["Bail", "Peg", "Cap", "Notch"],
        correctIndex: 0,
      },
      {
        question: "What is the term for the player who bowls the ball in cricket?",
        options: ["Batsman", "Bowler", "Fielder", "Umpire"],
        correctIndex: 1,
      },
      {
        question: "Who stands behind the stumps to catch the ball and attempt stumpings?",
        options: ["Captain", "Wicketkeeper", "Umpire", "Coach"],
        correctIndex: 1,
      },
      {
        question: "How many runs are scored when the ball crosses the boundary without bouncing?",
        options: ["4", "5", "6", "8"],
        correctIndex: 2,
      },
      {
        question: "How many runs are scored when the ball crosses the boundary after bouncing at least once?",
        options: ["2", "3", "4", "6"],
        correctIndex: 2,
      },
      {
        question: "What do you call it when a bowler hits the stumps directly to dismiss a batsman?",
        options: ["Caught", "Bowled", "Run out", "Stumped"],
        correctIndex: 1,
      },
      {
        question: "What is the longest format of international cricket, played over 5 days, called?",
        options: ["One Day International", "T20", "Test Match", "T10"],
        correctIndex: 2,
      },
      {
        question: "What does the cricket abbreviation 'ODI' stand for?",
        options: ["One Day International", "Over Day Innings", "Official Day Innings", "One Direct Innings"],
        correctIndex: 0,
      },
      {
        question: "What is the central playing strip where the bowler and batsman stand called?",
        options: ["The pitch", "The crease", "The outfield", "The square"],
        correctIndex: 0,
      },
      {
        question: "What do you call it when a batsman is out for blocking the ball with their leg in front of the stumps?",
        options: ["Run out", "Caught", "LBW", "Stumped"],
        correctIndex: 2,
      },
      {
        question: "How many wickets must the bowling side take to dismiss the entire batting side?",
        options: ["9", "10", "11", "12"],
        correctIndex: 1,
      },
      {
        question: "What is the cricket term for a delivery bowled too far from the batsman to fairly play, costing an extra run?",
        options: ["No ball", "Wide", "Bye", "Leg bye"],
        correctIndex: 1,
      },
      {
        question: "What is the name of the historic urn contested between England and Australia in Test cricket?",
        options: ["The Ashes", "The Crown", "The Trophy", "The Shield"],
        correctIndex: 0,
      },
      {
        question: "What protective equipment does a batsman wear on their head?",
        options: ["Pads", "Gloves", "Helmet", "Guard"],
        correctIndex: 2,
      },
      {
        question: "What is it called when the wicketkeeper dismisses a batsman who has stepped out of their crease?",
        options: ["Run out", "Stumped", "Caught", "Bowled"],
        correctIndex: 1,
      },
      {
        question: "How many continents are there on Earth?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
      },
      {
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Saturn", "Jupiter", "Mars"],
        correctIndex: 2,
      },
      {
        question: "What sweet substance do bees produce?",
        options: ["Milk", "Honey", "Syrup", "Nectar"],
        correctIndex: 1,
      },
      {
        question: "What is the capital city of India?",
        options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
        correctIndex: 1,
      },
      {
        question: "Which animal is commonly called the 'King of the Jungle'?",
        options: ["Tiger", "Elephant", "Lion", "Bear"],
        correctIndex: 2,
      },
      {
        question: "How many colours are there in a rainbow?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
      },
      {
        question: "Which is the largest mammal in the world?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        correctIndex: 1,
      },
      {
        question: "Which gas do humans need to breathe in order to survive?",
        options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
        correctIndex: 2,
      },
      {
        question: "At what temperature does water freeze, in Celsius?",
        options: ["-10°C", "0°C", "10°C", "100°C"],
        correctIndex: 1,
      },
      {
        question: "Which organ in the human body is responsible for pumping blood?",
        options: ["Lungs", "Liver", "Heart", "Kidney"],
        correctIndex: 2,
      },
      {
        question: "How many legs does a spider have?",
        options: ["6", "8", "10", "12"],
        correctIndex: 1,
      },
      {
        question: "What is the official currency of India?",
        options: ["Dollar", "Rupee", "Pound", "Yen"],
        correctIndex: 1,
      },
      {
        question: "What do you call a baby dog?",
        options: ["Kitten", "Cub", "Puppy", "Calf"],
        correctIndex: 2,
      },
      {
        question: "What is the tallest mountain in the world?",
        options: ["K2", "Mount Everest", "Kangchenjunga", "Makalu"],
        correctIndex: 1,
      },
      {
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Earth", "Mercury", "Mars"],
        correctIndex: 2,
      },
      {
        question: "What is the national animal of India?",
        options: ["Lion", "Elephant", "Tiger", "Peacock"],
        correctIndex: 2,
      },
      {
        question: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has a thumb and four fingers but is not alive?",
        options: ["A glove", "A hand", "A statue", "A puppet"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has teeth but cannot bite?",
        options: ["A comb", "A saw", "A zipper", "A shark"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has a bed but never sleeps?",
        options: ["A hotel", "A river", "A hospital", "A garden"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has legs but cannot walk?",
        options: ["A table", "A chair", "A compass", "All of these"],
        correctIndex: 3,
      },
      {
        question: "Riddle: What can you keep even after giving it away?",
        options: ["Your word", "Your time", "Money", "A gift"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What goes up but never comes down?",
        options: ["A balloon", "Your age", "A kite", "Smoke"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has a head and a tail but no body?",
        options: ["A coin", "A snake", "A comet", "A kite"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has many ears but cannot hear a single thing?",
        options: ["A cornfield", "A wall", "A clock", "A mountain"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What can fill a whole room but takes up no space?",
        options: ["Light", "Air", "Smoke", "Sound"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has one head, one foot, and four legs?",
        options: ["A table", "A bed", "A chair", "A horse"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What invention lets you look straight through a wall?",
        options: ["A mirror", "A window", "A telescope", "A painting"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What kind of room has no doors and no windows?",
        options: ["A tent", "A mushroom", "A cave", "A box"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What gets bigger the more you take away from it?",
        options: ["A hole", "A shadow", "A debt", "A balloon"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What runs all the way around a yard without ever moving?",
        options: ["A fence", "A dog", "A swing", "A tree"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has a ring but no finger to wear it on?",
        options: ["A telephone", "A bell", "A circus", "A tree trunk"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What word becomes shorter when you add two letters to it?",
        options: ["Short", "Long", "Small", "Tiny"],
        correctIndex: 0,
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
      {
        question: "How many players from each side are on the field at once during a cricket match, including the fielding side?",
        options: ["20", "22", "24", "26"],
        correctIndex: 1,
      },
      {
        question: "What is the maximum number of fielders (excluding the bowler and wicketkeeper) allowed outside the inner circle in ODIs during non-powerplay overs?",
        options: ["3", "4", "5", "6"],
        correctIndex: 2,
      },
      {
        question: "What is the name given to a bowler's analysis showing overs, maidens, runs and wickets?",
        options: ["Scorecard", "Figures", "Tally", "Ledger"],
        correctIndex: 1,
      },
      {
        question: "What is an over with no runs scored off the bat called?",
        options: ["A blank over", "A maiden over", "A dry over", "A clean over"],
        correctIndex: 1,
      },
      {
        question: "What do you call the imaginary line a bowler must not overstep when delivering the ball?",
        options: ["The popping crease", "The return crease", "The boundary line", "The pitch line"],
        correctIndex: 0,
      },
      {
        question: "In cricket scoring, what does 'DNB' next to a batsman's name mean?",
        options: ["Did Not Bowl", "Did Not Bat", "Did Not Bounce", "Declared Not Batting"],
        correctIndex: 1,
      },
      {
        question: "What is the cricketing term for the number of runs a team needs to win, shown during a chase?",
        options: ["Target", "Goal", "Par score", "Limit"],
        correctIndex: 0,
      },
      {
        question: "Which cricket shot is played with a horizontal bat, hitting the ball square on the leg side while kneeling?",
        options: ["The pull shot", "The sweep shot", "The cut shot", "The drive"],
        correctIndex: 1,
      },
      {
        question: "What is the cricketing term for a ball that spins away from a right-handed batsman, bowled by a finger-spinner?",
        options: ["Googly", "Off-break", "Leg-break", "Doosra"],
        correctIndex: 1,
      },
      {
        question: "Which continent is the Sahara Desert located on?",
        options: ["Asia", "Africa", "Australia", "South America"],
        correctIndex: 1,
      },
      {
        question: "Which country is home to the Great Barrier Reef?",
        options: ["India", "Brazil", "Australia", "Indonesia"],
        correctIndex: 2,
      },
      {
        question: "What is the longest river in the world?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        correctIndex: 1,
      },
      {
        question: "Which country is known as the 'Land of the Rising Sun'?",
        options: ["China", "Japan", "Thailand", "South Korea"],
        correctIndex: 1,
      },
      {
        question: "Which Indian state is known as the 'Land of Five Rivers'?",
        options: ["Haryana", "Punjab", "Rajasthan", "Gujarat"],
        correctIndex: 1,
      },
      {
        question: "What is the national sport of Japan?",
        options: ["Judo", "Karate", "Sumo wrestling", "Baseball"],
        correctIndex: 2,
      },
      {
        question: "How many players are there in a standard football (soccer) team on the field?",
        options: ["9", "10", "11", "12"],
        correctIndex: 2,
      },
      {
        question: "How many players are there on a basketball team on the court at one time?",
        options: ["4", "5", "6", "7"],
        correctIndex: 1,
      },
      {
        question: "What is the hardest natural substance known on Earth?",
        options: ["Gold", "Iron", "Diamond", "Granite"],
        correctIndex: 2,
      },
      {
        question: "Which gas makes up the majority of Earth's atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correctIndex: 1,
      },
      {
        question: "What is the study of stars and planets called?",
        options: ["Biology", "Geology", "Astronomy", "Meteorology"],
        correctIndex: 2,
      },
      {
        question: "Riddle: What has a heart that doesn't beat?",
        options: ["A robot", "An artichoke", "A statue", "A clock"],
        correctIndex: 1,
      },
      {
        question: "Riddle: The more of me there is, the less you see. What am I?",
        options: ["Smoke", "Darkness", "Fog", "Rain"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has an endless supply of letters but is never full?",
        options: ["A mailbox", "A post office", "A library", "A dictionary"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What kind of coat is always wet when you put it on?",
        options: ["A raincoat", "A coat of paint", "A fur coat", "A snow coat"],
        correctIndex: 1,
      },
      {
        question: "Riddle: You see me once in June, twice in November, but not at all in May. What am I?",
        options: ["The letter N", "The letter E", "The number 2", "A full moon"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has a golden head and a golden tail, but no golden body?",
        options: ["A trophy", "A coin", "A crown", "A ring"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What always runs but never gets anywhere?",
        options: ["A river", "A clock", "A treadmill", "An engine"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What question can you never honestly answer 'yes' to?",
        options: ["Are you lying?", "Are you asleep?", "Are you here?", "Are you silent?"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What can be cracked, made, told, and played?",
        options: ["A code", "A joke", "A story", "A game"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has four wheels and flies?",
        options: ["An airplane", "A garbage truck", "A bicycle", "A drone"],
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
      {
        question: "Which captain led Australia to back-to-back ODI Cricket World Cup titles in 2003 and 2007?",
        options: ["Ricky Ponting", "Steve Waugh", "Allan Border", "Michael Clarke"],
        correctIndex: 0,
      },
      {
        question: "Which fielding position sits very close to the batsman on the leg side, often used against spin?",
        options: ["Silly point", "Short leg", "Long on", "Deep square leg"],
        correctIndex: 1,
      },
      {
        question: "In cricket, what is the term for a bowler's delivery that doesn't bounce and reaches the batsman at waist height or above (full toss above the waist), considered unfair?",
        options: ["Yorker", "Beamer", "Bouncer", "Full toss"],
        correctIndex: 1,
      },
      {
        question: "Which award is given to the best player of a cricket match?",
        options: ["Golden Bat", "Man of the Match", "Best Player Trophy", "Star Performer"],
        correctIndex: 1,
      },
      {
        question: "What is the name of the shot where a batsman deliberately guides a fine, fast delivery over the slip fielders for four?",
        options: ["Upper cut", "Reverse sweep", "Ramp shot", "Switch hit"],
        correctIndex: 0,
      },
      {
        question: "Which Indian city hosts the Eden Gardens cricket stadium?",
        options: ["Mumbai", "Chennai", "Kolkata", "Delhi"],
        correctIndex: 2,
      },
      {
        question: "Who is credited with inventing the telephone?",
        options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"],
        correctIndex: 1,
      },
      {
        question: "Which Indian freedom fighter is known as the 'Father of the Nation'?",
        options: ["Jawaharlal Nehru", "Subhas Chandra Bose", "Mahatma Gandhi", "Sardar Patel"],
        correctIndex: 2,
      },
      {
        question: "Which planet is known for its prominent ring system visible from Earth?",
        options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
        correctIndex: 1,
      },
      {
        question: "What is the powerhouse of the cell called in biology?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Cytoplasm"],
        correctIndex: 2,
      },
      {
        question: "Which Indian city is known as the 'Silicon Valley of India'?",
        options: ["Hyderabad", "Pune", "Bengaluru", "Chennai"],
        correctIndex: 2,
      },
      {
        question: "What is the chemical symbol for sodium?",
        options: ["So", "Sd", "Na", "S"],
        correctIndex: 2,
      },
      {
        question: "Which Mughal emperor built the Taj Mahal?",
        options: ["Akbar", "Shah Jahan", "Jahangir", "Aurangzeb"],
        correctIndex: 1,
      },
      {
        question: "Which artist painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correctIndex: 2,
      },
      {
        question: "What is the main language spoken in Brazil?",
        options: ["Spanish", "Portuguese", "French", "Italian"],
        correctIndex: 1,
      },
      {
        question: "Which Indian festival is known as the 'Festival of Lights'?",
        options: ["Holi", "Diwali", "Navratri", "Raksha Bandhan"],
        correctIndex: 1,
      },
      {
        question: "What is the national currency of Japan called?",
        options: ["Won", "Yuan", "Yen", "Ringgit"],
        correctIndex: 2,
      },
      {
        question: "Riddle: What loses its head every morning and gets it back every night?",
        options: ["A pillow", "A pin", "A flower", "A shadow"],
        correctIndex: 1,
      },
      {
        question: "Riddle: The more you remove from me, the bigger I grow. What am I?",
        options: ["A pit", "A balloon", "A debt", "A shadow"],
        correctIndex: 0,
      },
      {
        question: "Riddle: I shave every day, but my beard stays the same. Who am I?",
        options: ["A monk", "A barber", "A clown", "A king"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What building has the most floors but no stairs or elevators?",
        options: ["A hospital", "A stock exchange", "A library", "A mall"],
        correctIndex: 1,
      },
      {
        question: "Riddle: Give me food, and I will live; give me water, and I will die. What am I?",
        options: ["A plant", "Fire", "A candle", "Ice"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has words, but never speaks?",
        options: ["A radio", "A book", "A phone", "A teacher"],
        correctIndex: 1,
      },
      {
        question: "Riddle: I am always in front of you but can't be seen. What am I?",
        options: ["The future", "The wind", "Time", "A shadow"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What kind of tree can you carry in your hand?",
        options: ["An oak tree", "A palm tree", "A pine tree", "A family tree"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What has to be in the right position to work, but if you flip it over, it still works the same?",
        options: ["A light switch", "A key", "A coin", "A battery"],
        correctIndex: 2,
      },
      {
        question: "Riddle: What five-letter word becomes shorter when you add two letters to it?",
        options: ["Short", "Small", "Brief", "Tiny"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What gets sharper the more you use it?",
        options: ["A pencil", "Your brain", "A knife", "A sword"],
        correctIndex: 1,
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
      {
        question: "Which Indian cricketer is known as the 'God of Cricket' and holds the record for most international runs?",
        options: ["Virender Sehwag", "Sachin Tendulkar", "Rahul Dravid", "Sourav Ganguly"],
        correctIndex: 1,
      },
      {
        question: "Who was the first bowler in cricket history to take 800 Test wickets?",
        options: ["Shane Warne", "James Anderson", "Muttiah Muralitharan", "Anil Kumble"],
        correctIndex: 2,
      },
      {
        question: "Which country hosted the first-ever Cricket World Cup in 1975?",
        options: ["Australia", "India", "England", "West Indies"],
        correctIndex: 2,
      },
      {
        question: "In Test cricket, what is it called when the team batting second is forced to bat again immediately after being dismissed for a much lower score?",
        options: ["Follow-on", "Second innings", "Replay", "Double bat"],
        correctIndex: 0,
      },
      {
        question: "Which Indian city hosts the Wankhede Stadium?",
        options: ["Pune", "Mumbai", "Nagpur", "Ahmedabad"],
        correctIndex: 1,
      },
      {
        question: "Who wrote the Indian national anthem 'Jana Gana Mana'?",
        options: ["Bankim Chandra Chattopadhyay", "Rabindranath Tagore", "Sarojini Naidu", "Subramania Bharati"],
        correctIndex: 1,
      },
      {
        question: "Which gas is most responsible for the greenhouse effect on Earth?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
        correctIndex: 2,
      },
      {
        question: "Which river is considered the longest in India?",
        options: ["Yamuna", "Godavari", "Ganga", "Brahmaputra"],
        correctIndex: 2,
      },
      {
        question: "Which scientist proposed the theory of relativity?",
        options: ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Galileo Galilei"],
        correctIndex: 1,
      },
      {
        question: "What is the deepest known point in the Earth's oceans called?",
        options: ["Puerto Rico Trench", "Mariana Trench", "Java Trench", "Tonga Trench"],
        correctIndex: 1,
      },
      {
        question: "Which Indian state has the longest coastline?",
        options: ["Tamil Nadu", "Andhra Pradesh", "Gujarat", "Maharashtra"],
        correctIndex: 2,
      },
      {
        question: "Which blood type is known as the 'universal donor'?",
        options: ["AB positive", "O negative", "A positive", "B negative"],
        correctIndex: 1,
      },
      {
        question: "Which ancient wonder of the world was located in Giza, Egypt?",
        options: ["Hanging Gardens", "Colossus of Rhodes", "Great Pyramid", "Lighthouse of Alexandria"],
        correctIndex: 2,
      },
      {
        question: "Who was the first Indian Prime Minister?",
        options: ["Lal Bahadur Shastri", "Jawaharlal Nehru", "Indira Gandhi", "Rajendra Prasad"],
        correctIndex: 1,
      },
      {
        question: "Which planet in our solar system is the hottest, despite not being closest to the Sun?",
        options: ["Mercury", "Venus", "Mars", "Jupiter"],
        correctIndex: 1,
      },
      {
        question: "Riddle: I have cities but no houses, forests but no trees, rivers but no water. What am I?",
        options: ["A globe", "A map", "A dream", "A storybook"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What can you hold in your right hand but never in your left hand?",
        options: ["A pen", "Your left hand", "A mirror", "A coin"],
        correctIndex: 1,
      },
      {
        question: "Riddle: A man describes his daughter: 'she has no brothers, but this boy's father is my father's son.' Who is the boy to the man?",
        options: ["His nephew", "His son", "His grandson", "His cousin"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What can run but never walks, has a bed but never sleeps, has a mouth but never talks?",
        options: ["A river", "A clock", "A car", "A shadow"],
        correctIndex: 0,
      },
      {
        question: "Riddle: Forward I am heavy, backward I am not. What am I?",
        options: ["Ton", "Stone", "Rock", "Brick"],
        correctIndex: 0,
      },
      {
        question: "Riddle: The more you have of it, the less you see. What is it?",
        options: ["Light", "Darkness", "Fog", "Dust"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What English word retains the same pronunciation, even after you take away four of its five letters?",
        options: ["Queue", "Eerie", "Alone", "Night"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has many keys, but opens no doors, and has space, but no room?",
        options: ["A map", "A piano", "A keyboard", "A safe"],
        correctIndex: 2,
      },
      {
        question: "Riddle: What is so fragile that saying its name breaks it?",
        options: ["Glass", "Silence", "Trust", "A promise"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What is always coming but never arrives?",
        options: ["The train", "Tomorrow", "The future", "The mail"],
        correctIndex: 1,
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
      {
        question: "Which Indian cricketer was the first to score a double century in an ODI innings?",
        options: ["Virat Kohli", "Rohit Sharma", "Sachin Tendulkar", "Virender Sehwag"],
        correctIndex: 2,
      },
      {
        question: "Who captained the West Indies during their back-to-back 1975 and 1979 World Cup wins?",
        options: ["Garfield Sobers", "Viv Richards", "Clive Lloyd", "Gordon Greenidge"],
        correctIndex: 2,
      },
      {
        question: "Which bowler became the first to take a hat-trick in Cricket World Cup history, in the 1987 edition?",
        options: ["Imran Khan", "Chetan Sharma", "Kapil Dev", "Richard Hadlee"],
        correctIndex: 1,
      },
      {
        question: "Which Indian captain lifted the 1983 Cricket World Cup, India's first, at Lord's?",
        options: ["Sunil Gavaskar", "Kapil Dev", "Mohinder Amarnath", "Ravi Shastri"],
        correctIndex: 1,
      },
      {
        question: "Who holds the record for the fastest century in ODI cricket history, off just 31 balls?",
        options: ["Chris Gayle", "AB de Villiers", "Shahid Afridi", "Corey Anderson"],
        correctIndex: 1,
      },
      {
        question: "Which freedom fighter founded the Indian National Army (Azad Hind Fauj)?",
        options: ["Bhagat Singh", "Subhas Chandra Bose", "Chandrashekhar Azad", "Lala Lajpat Rai"],
        correctIndex: 1,
      },
      {
        question: "What is the only mammal capable of true, sustained flight?",
        options: ["Flying squirrel", "Bat", "Flying fox", "Sugar glider"],
        correctIndex: 1,
      },
      {
        question: "Which Indian scientist is credited as the father of India's space programme?",
        options: ["Homi Bhabha", "Vikram Sarabhai", "APJ Abdul Kalam", "CV Raman"],
        correctIndex: 1,
      },
      {
        question: "What is the official name of the first artificial satellite launched into space in 1957?",
        options: ["Voyager 1", "Sputnik 1", "Explorer 1", "Apollo 1"],
        correctIndex: 1,
      },
      {
        question: "Which element has the chemical symbol 'Fe'?",
        options: ["Fluorine", "Francium", "Iron", "Fermium"],
        correctIndex: 2,
      },
      {
        question: "Riddle: A man walks into a room and sees a bed, a table, a mirror, and a window. What does he see first?",
        options: ["The bed", "The mirror", "His own reflection", "The window"],
        correctIndex: 2,
      },
      {
        question: "Riddle: You measure my life in hours, and I serve you by expiring. I'm quick when thin, slow when fat. The wind is my enemy. What am I?",
        options: ["A clock", "A candle", "An hourglass", "A matchstick"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What disappears as soon as you say its name?",
        options: ["Darkness", "Silence", "Time", "A secret"],
        correctIndex: 1,
      },
      {
        question: "Riddle: Two fathers and two sons go fishing together. They each catch exactly one fish, yet they bring home only three fish total. How?",
        options: ["One fish got away", "They are a grandfather, father, and son", "They shared one fish", "One lied about catching a fish"],
        correctIndex: 1,
      },
      {
        question: "Riddle: You can break me, but I'm not physical — I'm what someone makes when they say they'll do something for you. What am I?",
        options: ["A deal", "A promise", "A rule", "A plan"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What word in the English dictionary is always spelled wrong, no matter the dictionary?",
        options: ["Mistake", "Wrong", "Incorrectly", "Error"],
        correctIndex: 1,
      },
      {
        question: "Riddle: I am taken from a mine and shut in a wooden case, from which I am never released, and yet I am used by almost everyone. What am I?",
        options: ["Coal", "Pencil lead (graphite)", "Gold", "Iron ore"],
        correctIndex: 1,
      },
      {
        question: "Riddle: What starts with 'E', ends with 'E', and contains only one letter — yet it isn't the letter E?",
        options: ["Envelope", "Eye", "Edge", "Echo"],
        correctIndex: 0,
      },
      {
        question: "Riddle: What has roots that nobody sees, is taller than trees, up and up it goes, yet never grows?",
        options: ["A river", "A mountain", "The sky", "A cloud"],
        correctIndex: 1,
      },
      {
        question: "Riddle: A clerk in a butcher's shop is six feet tall and wears size 9 shoes. What does he weigh?",
        options: ["180 pounds", "200 pounds", "Meat", "He weighs himself daily"],
        correctIndex: 2,
      },
    ],
  },
];
