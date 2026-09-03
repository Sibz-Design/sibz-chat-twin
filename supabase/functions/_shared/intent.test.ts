// Intent classifier checks. Run with: npm run test:intent
//
// Worth extending whenever you add a rule to intent.ts — the scoring is
// weighted, so a new high-weight pattern can quietly outrank an existing one.
// (Bundled through esbuild rather than Deno so it runs with the toolchain the
// project already has installed.)

import { classifyIntent, type Intent } from "./intent.ts";
import { answerFromProfile, isCardType } from "./answers.ts";
import { buildSystemPrompt, extractCards } from "./prompt.ts";
import { hobbies, PROFILE_VERSION, profile } from "./profile/index.ts";

const CASES: Array<[string, Intent]> = [
  // Hobbies — the phrasings that used to be refused or hallucinated.
  ["What are Siba's hobbies?", "hobbies"],
  ["What does Siba do in his free time?", "hobbies"],
  ["What is Siba interested in?", "hobbies"],
  ["Does Siba like coding?", "hobbies"],
  ["What does Siba enjoy outside of work?", "hobbies"],
  ["what does he do for fun", "hobbies"],
  ["Is Siba into anime?", "hobbies"],
  ["Tell me about Siba's hobbies", "hobbies"],
  ["Which football team does Siba support?", "hobbies"],
  ["Is Siba a Man City fan?", "hobbies"],
  ["Does he support Kaizer Chiefs?", "hobbies"],
  ["Tell me about the short film he acted in", "hobbies"],
  ["Has Siba done any acting?", "hobbies"],
  ["Does Siba go to church?", "hobbies"],
  ["Does he like sightseeing?", "hobbies"],

  ["Who is Siba?", "who"],
  ["who is sibabalwe", "who"],
  ["Tell me about Siba", "who"],
  ["What does Siba do?", "who"],
  ["tell me about yourself", "who"],

  ["What projects has Siba worked on?", "projects"],
  ["Show me Siba's projects", "projects"],
  ["Tell me about Siba's projects", "projects"],

  ["What technologies does Siba use?", "skills"],
  ["What tech stack does Siba use?", "skills"],
  ["What are Siba's key skills?", "skills"],

  ["Tell me about Siba's experience", "experience"],
  ["Where does he work?", "experience"],
  ["Summarize your experience", "experience"],

  ["How can I contact Siba?", "contact"],
  ["what's his email", "contact"],
  ["Show me Siba's badges", "badges"],
  ["What certifications does he have?", "certificates"],
  ["Where did he study?", "education"],
  ["What is he working towards?", "goals"],
  ["hi", "greeting"],
  ["Good morning", "greeting"],

  // Must fall through to the model rather than being answered from a template.
  ["What is the capital of France?", "unknown"],
  ["Write me a poem about cats", "unknown"],
  ["How did he learn all this?", "unknown"],
];

let failures = 0;

function check(label: string, condition: boolean, detail = "") {
  if (!condition) {
    failures++;
    console.error(`FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

for (const [question, expected] of CASES) {
  const { intent } = classifyIntent(question);
  check(`"${question}"`, intent === expected, `expected ${expected}, got ${intent}`);
}

// Every intent that isn't `unknown` must produce a deterministic answer.
for (const [, expected] of CASES) {
  if (expected === "unknown") continue;
  check(`answerFromProfile(${expected})`, answerFromProfile(expected) !== null);
}
check("answerFromProfile(unknown) falls through", answerFromProfile("unknown") === null);

// Card directive parsing.
const parsed = extractCards("He likes anime.\n[[cards: hobbies, bogus, hobbies]]");
check("directive is stripped from text", !parsed.text.includes("[[cards"));
check("unknown card names are dropped", parsed.cards.length === 1 && parsed.cards[0].type === "hobbies");
check("no directive means no cards", extractCards("Plain answer.").cards.length === 0);
check("at most two cards", extractCards("x\n[[cards: profile, skills, projects]]").cards.length === 2);

// Profile integrity.
check("profile version is stable within a run", PROFILE_VERSION === PROFILE_VERSION);
check("system prompt includes every hobby", hobbies.every((h) => buildSystemPrompt().includes(h.label)));
check("system prompt includes every project", profile.projects.every((p) => buildSystemPrompt().includes(p.title)));
check("hobby ids are unique", new Set(hobbies.map((h) => h.id)).size === hobbies.length);

// Media integrity — a missing alt or a video without a poster degrades the card.
for (const hobby of hobbies) {
  for (const item of hobby.media) {
    check(`${hobby.id} media has alt text`, item.alt.trim().length > 0, item.src);
    check(
      `${hobby.id} media src is a path or URL`,
      item.src.startsWith("/") || item.src.startsWith("https://"),
      item.src,
    );
    if (item.kind === "video") {
      check(`${hobby.id} video has a poster`, !!item.poster, item.src);
    }
  }
}
check(
  "system prompt lists hobby media",
  buildSystemPrompt().includes("Photos/clips available"),
);
check("card types are recognised", isCardType("hobbies") && !isCardType("nonsense"));

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  // Non-zero exit so this is usable as a pre-commit or CI gate. Typed loosely
  // because the file runs under Node here but lives in a Deno directory.
  (globalThis as { process?: { exit(code: number): void } }).process?.exit(1);
} else {
  console.log(`All checks passed (${CASES.length} intent cases).`);
}
