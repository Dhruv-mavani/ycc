// UI-chrome translations for the KBC-style quiz games (Quiz Champion,
// Kaun Banega Lakhpati) — buttons, headings, lifeline names, dialogs.
// Deliberately NOT server-only: the client picks the active language and
// renders straight from this dictionary. The actual question/option text
// is translated separately (see quiz-translations/) and resolved
// server-side, since that content must never leave the server ahead of
// time (see quiz-session.ts's header comment).
//
// Scope: only the quiz game's own screens. The shared TeamPlayerGate
// code-entry widget (used by Mystery Box and Kismat Ke Khiladi too) stays
// English-only for now — translating it would mean threading a language
// prop through a component several other, non-translated games also use.

export type QuizLang = "en" | "hi" | "gu";

export const QUIZ_LANGUAGES: { code: QuizLang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" },
];

export interface QuizUiStrings {
  welcomeTo: string; // "Welcome to {title}" — title itself is not translated
  introQuestions: (totalLevels: number) => string;
  introTimer: (timerSeconds: number) => string;
  introLifelinesHeading: string;
  lifelineAudiencePollDesc: string;
  lifelineAskGeniusDesc: string;
  lifelineFiftyFiftyDesc: string;
  lifelineFlipDesc: string;
  introEnterCode: (title: string) => string;
  startNewGame: string;
  starting: string;
  questionOf: (current: number, total: number) => string;
  chanceOf: (attempt: number) => string;
  aiNotAllowed: string;
  answerHonestly: string;
  cheatWatermark: string;
  lifelineFiftyFifty: string;
  lifelineAudiencePoll: string;
  lifelineAskGenius: string;
  lifelineFlip: string;
  gameOver: string;
  wonHeading: (title: string) => string;
  wonMessage: (totalQuestions: number) => string;
  lostMessage: (questionsCorrect: number) => string;
  correctAnswerLabel: string;
  leaderboardTitle: (title: string) => string;
  leaderboardEmpty: string;
  leaderboardFooterLink: string;
  audiencePollResultsTitle: string;
  askGeniusTitle: string;
  geniusPhrases: string[]; // each with a literal "{answer}" placeholder
  languageLabel: string;
}

export const QUIZ_UI_STRINGS: Record<QuizLang, QuizUiStrings> = {
  en: {
    welcomeTo: "Welcome to",
    introQuestions: (totalLevels) =>
      `${totalLevels} thrilling questions — cricket trivia, general knowledge, and riddles — each one a little tougher than the last.`,
    introTimer: (timerSeconds) => `${timerSeconds} seconds per question, four options (A, B, C, D) every time.`,
    introLifelinesHeading: "Four lifelines are here to help:",
    lifelineAudiencePollDesc: "taps into the wisdom of the crowd",
    lifelineAskGeniusDesc: "gives you an expert opinion",
    lifelineFiftyFiftyDesc: "removes two wrong options",
    lifelineFlipDesc: "trades the current question for a new one",
    introEnterCode: (title) =>
      `Enter your code below to confirm who's playing, then it's just you against the quiz. Ready to become ${title}?`,
    startNewGame: "Start New Game",
    starting: "Starting…",
    questionOf: (current, total) => `Question ${current} of ${total}`,
    chanceOf: (attempt) => ` · Chance ${attempt} of 2`,
    aiNotAllowed: "AI assistance is not allowed during this quiz — answer it yourself.",
    answerHonestly: "Answer honestly — no AI, no outside help.",
    cheatWatermark: "AI is not allowed here",
    lifelineFiftyFifty: "Fifty-Fifty",
    lifelineAudiencePoll: "Audience Poll",
    lifelineAskGenius: "Ask a Genius",
    lifelineFlip: "Flip Question",
    gameOver: "Game Over",
    wonHeading: (title) => `🎉 ${title}!`,
    wonMessage: (totalQuestions) => `You answered all ${totalQuestions} questions correctly!`,
    lostMessage: (questionsCorrect) =>
      `That one was wrong — got ${questionsCorrect} question${questionsCorrect === 1 ? "" : "s"} correct.`,
    correctAnswerLabel: "Correct answer:",
    leaderboardTitle: (title) => `${title} Leaderboard`,
    leaderboardEmpty: "No one's cracked the top of the leaderboard yet — be the first!",
    leaderboardFooterLink: "View full leaderboard (+ Mystery Box & Kismat Ke Khiladi winners) ↗",
    audiencePollResultsTitle: "Audience Poll Results",
    askGeniusTitle: "Ask a Genius",
    geniusPhrases: [
      "Haha, I don't know... but try option {answer}!",
      "I'm no expert, but my gut says option {answer}.",
      "Honestly? No clue. Going with option {answer} anyway.",
      "Genius mode activated. The answer is option {answer}, trust me.",
      "I skipped class that day, but I'm pretty sure it's option {answer}.",
      "Let me consult my crystal ball... it says option {answer}.",
      "Ask a genius, get a genius answer: option {answer}.",
      "I googled it in my head. Option {answer}, final answer.",
    ],
    languageLabel: "Language",
  },
  hi: {
    welcomeTo: "आपका स्वागत है",
    introQuestions: (totalLevels) =>
      `${totalLevels} रोमांचक सवाल — क्रिकेट ट्रिविया, सामान्य ज्ञान और पहेलियाँ — हर एक पिछले से थोड़ा मुश्किल।`,
    introTimer: (timerSeconds) => `हर सवाल के लिए ${timerSeconds} सेकंड, हर बार चार विकल्प (A, B, C, D)।`,
    introLifelinesHeading: "मदद के लिए चार लाइफलाइन मौजूद हैं:",
    lifelineAudiencePollDesc: "भीड़ की राय जानने का मौका",
    lifelineAskGeniusDesc: "एक विशेषज्ञ की राय दिलाता है",
    lifelineFiftyFiftyDesc: "दो गलत विकल्प हटाता है",
    lifelineFlipDesc: "मौजूदा सवाल को नए सवाल से बदल देता है",
    introEnterCode: (title) =>
      `खेलने वाले की पुष्टि के लिए नीचे अपना कोड डालें, फिर सिर्फ आप और यह क्विज़। तैयार हैं ${title} बनने के लिए?`,
    startNewGame: "नया गेम शुरू करें",
    starting: "शुरू हो रहा है…",
    questionOf: (current, total) => `सवाल ${current} / ${total}`,
    chanceOf: (attempt) => ` · मौका ${attempt} / 2`,
    aiNotAllowed: "इस क्विज़ के दौरान AI की मदद लेना मना है — खुद जवाब दें।",
    answerHonestly: "ईमानदारी से जवाब दें — न AI, न किसी और की मदद।",
    cheatWatermark: "यहाँ AI का इस्तेमाल मना है",
    lifelineFiftyFifty: "फिफ्टी-फिफ्टी",
    lifelineAudiencePoll: "ऑडियंस पोल",
    lifelineAskGenius: "जीनियस से पूछें",
    lifelineFlip: "सवाल बदलें",
    gameOver: "गेम ओवर",
    wonHeading: (title) => `🎉 ${title}!`,
    wonMessage: (totalQuestions) => `आपने सभी ${totalQuestions} सवालों के सही जवाब दिए!`,
    lostMessage: (questionsCorrect) => `यह जवाब गलत था — आपने ${questionsCorrect} सवाल सही किए।`,
    correctAnswerLabel: "सही जवाब:",
    leaderboardTitle: (title) => `${title} लीडरबोर्ड`,
    leaderboardEmpty: "अभी तक लीडरबोर्ड में कोई टॉप नहीं है — सबसे पहले आप बनें!",
    leaderboardFooterLink: "पूरा लीडरबोर्ड देखें (+ मिस्ट्री बॉक्स और किस्मत के खिलाड़ी के विजेता) ↗",
    audiencePollResultsTitle: "ऑडियंस पोल नतीजे",
    askGeniusTitle: "जीनियस से पूछें",
    geniusPhrases: [
      "हाहा, मुझे नहीं पता... पर विकल्प {answer} आज़माओ!",
      "मैं कोई एक्सपर्ट नहीं हूँ, पर मेरा मन कहता है विकल्प {answer}।",
      "सच कहूँ तो कोई आइडिया नहीं। फिर भी विकल्प {answer} चुनता हूँ।",
      "जीनियस मोड ऑन। जवाब है विकल्प {answer}, भरोसा करो।",
      "उस दिन क्लास मिस कर दी थी, पर लगता है यह विकल्प {answer} है।",
      "मेरी क्रिस्टल बॉल से पूछता हूँ... वो कहती है विकल्प {answer}।",
      "जीनियस से पूछा, जीनियस वाला जवाब मिला: विकल्प {answer}।",
      "दिमाग में ही गूगल कर लिया। विकल्प {answer}, फाइनल आंसर।",
    ],
    languageLabel: "भाषा",
  },
  gu: {
    welcomeTo: "સ્વાગત છે",
    introQuestions: (totalLevels) =>
      `${totalLevels} રોમાંચક સવાલો — ક્રિકેટ ટ્રિવિયા, સામાન્ય જ્ઞાન અને કોયડા — દરેક પાછલા કરતાં થોડો અઘરો.`,
    introTimer: (timerSeconds) => `દરેક સવાલ માટે ${timerSeconds} સેકન્ડ, દર વખતે ચાર વિકલ્પ (A, B, C, D).`,
    introLifelinesHeading: "મદદ માટે ચાર લાઇફલાઇન ઉપલબ્ધ છે:",
    lifelineAudiencePollDesc: "ભીડનો અભિપ્રાય જાણવાની તક",
    lifelineAskGeniusDesc: "એક નિષ્ણાતનો અભિપ્રાય આપે છે",
    lifelineFiftyFiftyDesc: "બે ખોટા વિકલ્પો હટાવે છે",
    lifelineFlipDesc: "હાલનો સવાલ નવા સવાલ સાથે બદલે છે",
    introEnterCode: (title) =>
      `કોણ રમી રહ્યું છે તેની પુષ્ટિ માટે નીચે તમારો કોડ દાખલ કરો, પછી ફક્ત તમે અને આ ક્વિઝ. ${title} બનવા તૈયાર છો?`,
    startNewGame: "નવી ગેમ શરૂ કરો",
    starting: "શરૂ થઈ રહ્યું છે…",
    questionOf: (current, total) => `સવાલ ${current} / ${total}`,
    chanceOf: (attempt) => ` · તક ${attempt} / 2`,
    aiNotAllowed: "આ ક્વિઝ દરમિયાન AI ની મદદ લેવી મનાઈ છે — જાતે જવાબ આપો.",
    answerHonestly: "પ્રામાણિકપણે જવાબ આપો — ન AI, ન કોઈ બહારની મદદ.",
    cheatWatermark: "અહીં AI વાપરવાની મનાઈ છે",
    lifelineFiftyFifty: "ફિફ્ટી-ફિફ્ટી",
    lifelineAudiencePoll: "ઓડિયન્સ પોલ",
    lifelineAskGenius: "જીનિયસને પૂછો",
    lifelineFlip: "સવાલ બદલો",
    gameOver: "ગેમ ઓવર",
    wonHeading: (title) => `🎉 ${title}!`,
    wonMessage: (totalQuestions) => `તમે બધા ${totalQuestions} સવાલોના સાચા જવાબ આપ્યા!`,
    lostMessage: (questionsCorrect) => `આ જવાબ ખોટો હતો — તમે ${questionsCorrect} સવાલ સાચા કર્યા.`,
    correctAnswerLabel: "સાચો જવાબ:",
    leaderboardTitle: (title) => `${title} લીડરબોર્ડ`,
    leaderboardEmpty: "હજુ સુધી કોઈ લીડરબોર્ડની ટોચ પર નથી — સૌથી પહેલા તમે બનો!",
    leaderboardFooterLink: "સંપૂર્ણ લીડરબોર્ડ જુઓ (+ મિસ્ટરી બોક્સ અને કિસ્મત કે ખિલાડી ના વિજેતાઓ) ↗",
    audiencePollResultsTitle: "ઓડિયન્સ પોલ પરિણામો",
    askGeniusTitle: "જીનિયસને પૂછો",
    geniusPhrases: [
      "હાહા, મને ખબર નથી... પણ વિકલ્પ {answer} અજમાવો!",
      "હું કોઈ નિષ્ણાત નથી, પણ મારું મન કહે છે વિકલ્પ {answer}.",
      "સાચું કહું તો કંઈ ખબર નથી. છતાં વિકલ્પ {answer} પસંદ કરું છું.",
      "જીનિયસ મોડ ચાલુ. જવાબ છે વિકલ્પ {answer}, વિશ્વાસ રાખો.",
      "તે દિવસે ક્લાસ ચૂકી ગયો હતો, પણ લાગે છે આ વિકલ્પ {answer} છે.",
      "મારા ક્રિસ્ટલ બોલને પૂછું છું... તે કહે છે વિકલ્પ {answer}.",
      "જીનિયસને પૂછ્યું, જીનિયસ જેવો જવાબ મળ્યો: વિકલ્પ {answer}.",
      "મગજમાં જ ગૂગલ કરી લીધું. વિકલ્પ {answer}, ફાઇનલ આન્સર.",
    ],
    languageLabel: "ભાષા",
  },
};
