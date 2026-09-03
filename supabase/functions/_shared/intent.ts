// Deterministic intent classifier.
//
// This replaces the regex chain that used to live in the React component. The
// high-confidence intents are answered directly from the profile data with no
// model call at all: instant, free, and never hallucinated. Anything that does
// not score above THRESHOLD falls through to Cohere.
//
// Scoring is deliberately weighted rather than first-match-wins, so that
// "What does Siba do in his free time?" resolves to `hobbies` even though it
// also contains the `who` phrase "what does siba do".

export type Intent =
  | "greeting"
  | "who"
  | "hobbies"
  | "projects"
  | "skills"
  | "experience"
  | "education"
  | "certificates"
  | "badges"
  | "contact"
  | "goals"
  | "unknown";

export interface IntentMatch {
  intent: Intent;
  score: number;
}

interface Rule {
  intent: Intent;
  weight: number;
  pattern: RegExp;
}

/** Minimum score required to answer without calling the model. */
const THRESHOLD = 4;

const RULES: Rule[] = [
  // --- greeting -----------------------------------------------------------
  { intent: "greeting", weight: 20, pattern: /^(hi|hello|hey|yo|sup|hiya|howdy|good\s(morning|afternoon|evening))[\s!.,?]*$/ },

  // --- hobbies / interests ------------------------------------------------
  // Weighted above `who` so "what does he do for fun" beats "what does he do".
  { intent: "hobbies", weight: 10, pattern: /\bhobb(y|ies)\b/ },
  { intent: "hobbies", weight: 10, pattern: /\bfree\s?time\b/ },
  { intent: "hobbies", weight: 10, pattern: /\bspare\s?time\b/ },
  { intent: "hobbies", weight: 10, pattern: /\bfor\s+fun\b/ },
  { intent: "hobbies", weight: 9, pattern: /\boutside\s+(of\s+)?(work|the\s+office|his\s+job)\b/ },
  { intent: "hobbies", weight: 8, pattern: /\binterest(s|ed)?\b/ },
  { intent: "hobbies", weight: 8, pattern: /\bpassion(s|ate)?\b/ },
  { intent: "hobbies", weight: 7, pattern: /\b(does|do)\s+(he|siba|sibz|sibabalwe)\s+(like|enjoy|love)\b/ },
  { intent: "hobbies", weight: 7, pattern: /\bwhat\s+does\s+(he|siba|sibz|sibabalwe)\s+(like|enjoy|love)\b/ },
  { intent: "hobbies", weight: 6, pattern: /\b(anime|manga)\b/ },
  { intent: "hobbies", weight: 5, pattern: /\b(sports?|psychology|human\s+behaviou?r)\b/ },
  // Topics that only exist in the hobbies section — safe to weight highly.
  { intent: "hobbies", weight: 8, pattern: /\b(football|soccer)\b/ },
  { intent: "hobbies", weight: 8, pattern: /\b(man\s?city|manchester\s+city|kaizer\s+chiefs|barcelona|barca)\b/ },
  { intent: "hobbies", weight: 8, pattern: /\b(acting|actor|short\s+film|movie|filming|on\s+set)\b/ },
  { intent: "hobbies", weight: 8, pattern: /\b(church|faith|praying|prays)\b/ },
  { intent: "hobbies", weight: 8, pattern: /\b(sightseeing|scenery|scenic|aesthetic\s+view)\b/ },
  { intent: "hobbies", weight: 6, pattern: /\b(supports?|supporter|fan)\s+(of\s+)?(a\s+)?(team|club)\b/ },
  { intent: "hobbies", weight: 5, pattern: /\bwhen\s+(he|siba)('s|\s+is)?\s+not\s+working\b/ },
  { intent: "hobbies", weight: 4, pattern: /\bpersonal\s+(life|interests?)\b/ },

  // --- who / about --------------------------------------------------------
  { intent: "who", weight: 10, pattern: /\bwho\s+(is|are)\s+(siba|sibz|sibabalwe|you)\b/ },
  { intent: "who", weight: 10, pattern: /\bwho['’]s\s+(siba|sibz|sibabalwe)\b/ },
  // The possessive lookahead keeps "tell me about Siba's experience" out of the
  // bio intent, so it can route to `experience` instead.
  { intent: "who", weight: 8, pattern: /\btell\s+me\s+about\s+(siba|sibz|sibabalwe|him|himself|yourself|his\s+background)\b(?!['’]s)/ },
  { intent: "who", weight: 7, pattern: /\bintroduce\s+(siba|him|yourself)\b/ },
  { intent: "who", weight: 6, pattern: /\b(his|siba['’]s)\s+(bio|background|profile|story)\b/ },
  { intent: "who", weight: 5, pattern: /\bwhat\s+does\s+(siba|sibz|sibabalwe|he)\s+do\b/ },
  { intent: "who", weight: 5, pattern: /\bwhat\s+is\s+(his|siba['’]s)\s+(role|job|title)\b/ },
  { intent: "who", weight: 5, pattern: /\babout\s+(siba|sibz|sibabalwe)\b(?!['’]s)/ },

  // --- projects -----------------------------------------------------------
  { intent: "projects", weight: 10, pattern: /\bprojects?\b/ },
  { intent: "projects", weight: 8, pattern: /\bportfolio\s+(work|pieces?)\b/ },
  { intent: "projects", weight: 7, pattern: /\bwhat\s+(has|have)\s+(he|siba)\s+built\b/ },
  { intent: "projects", weight: 6, pattern: /\b(github|repos?|repositor(y|ies))\b/ },

  // --- skills / tech ------------------------------------------------------
  { intent: "skills", weight: 10, pattern: /\bskills?\b/ },
  { intent: "skills", weight: 10, pattern: /\btech(nolog(y|ies))?\s+(stack|does|he\s+uses?)\b/ },
  { intent: "skills", weight: 9, pattern: /\btech\s?stack\b/ },
  { intent: "skills", weight: 8, pattern: /\btechnologies\b/ },
  { intent: "skills", weight: 7, pattern: /\b(what|which)\s+(tools|languages|frameworks)\b/ },
  { intent: "skills", weight: 6, pattern: /\bgood\s+at\b/ },
  { intent: "skills", weight: 6, pattern: /\bexpertise\b/ },

  // --- experience ---------------------------------------------------------
  { intent: "experience", weight: 10, pattern: /\bexperiences?\b/ },
  { intent: "experience", weight: 9, pattern: /\bwork\s+history\b/ },
  { intent: "experience", weight: 9, pattern: /\b(resume|cv)\b/ },
  { intent: "experience", weight: 8, pattern: /\bcareer\b/ },
  { intent: "experience", weight: 8, pattern: /\bwhere\s+does\s+(he|siba)\s+work\b/ },
  { intent: "experience", weight: 7, pattern: /\b(clickatell|capaciti)\b/ },
  { intent: "experience", weight: 6, pattern: /\bemploy(ed|ment|er)\b/ },

  // --- education ----------------------------------------------------------
  { intent: "education", weight: 10, pattern: /\beducation\b/ },
  { intent: "education", weight: 9, pattern: /\b(degree|diploma|qualification)\b/ },
  { intent: "education", weight: 8, pattern: /\b(study|studied|studies|university|college)\b/ },

  // --- certificates / badges ---------------------------------------------
  { intent: "certificates", weight: 10, pattern: /\bcertificat(e|es|ion|ions)\b/ },
  { intent: "certificates", weight: 7, pattern: /\bcourses?\b/ },
  { intent: "badges", weight: 12, pattern: /\bbadges?\b/ },

  // --- contact ------------------------------------------------------------
  { intent: "contact", weight: 10, pattern: /\bcontact\b/ },
  { intent: "contact", weight: 10, pattern: /\bget\s+in\s+touch\b/ },
  { intent: "contact", weight: 9, pattern: /\b(email|linkedin)\b/ },
  { intent: "contact", weight: 8, pattern: /\breach\s+(him|out|siba)\b/ },
  { intent: "contact", weight: 7, pattern: /\bhire\b/ },

  // --- goals --------------------------------------------------------------
  { intent: "goals", weight: 10, pattern: /\bgoals?\b/ },
  { intent: "goals", weight: 9, pattern: /\bworking\s+towards?\b/ },
  { intent: "goals", weight: 8, pattern: /\b(what|where)\s+.*\b(looking\s+for|aspir|ambition)/ },
  { intent: "goals", weight: 7, pattern: /\bnext\s+(step|move)\b/ },
  { intent: "goals", weight: 7, pattern: /\bfuture\s+plans?\b/ },
];

function normalize(message: string): string {
  return message.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Scores a message against every rule and returns the winning intent.
 * Returns `unknown` when nothing clears the confidence threshold, which is the
 * caller's signal to fall through to the model.
 */
export function classifyIntent(message: string): IntentMatch {
  const text = normalize(message);
  const scores = new Map<Intent, number>();

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      scores.set(rule.intent, (scores.get(rule.intent) ?? 0) + rule.weight);
    }
  }

  let best: Intent = "unknown";
  let bestScore = 0;
  for (const [intent, score] of scores) {
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }

  if (bestScore < THRESHOLD) return { intent: "unknown", score: bestScore };
  return { intent: best, score: bestScore };
}
