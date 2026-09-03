// Deterministic answers composed straight from the profile data.
//
// Cards carry only a `type`. The frontend imports the same profile module, so
// there is no reason to ship the content twice over the wire — the server
// decides *what* to show, the client decides *how* to render it.

import { currentRole, followUps, identity, profile } from "./profile/index.ts";
import type { Intent } from "./intent.ts";

export type CardType =
  | "profile"
  | "hobbies"
  | "projects"
  | "skills"
  | "experience"
  | "certificates"
  | "badges"
  | "contact";

export interface ChatCard {
  type: CardType;
  // deno-lint-ignore no-explicit-any
  data?: any;
}

export interface ChatReply {
  text: string;
  cards: ChatCard[];
  followUps: string[];
  source: "intent" | "model" | "cache";
}

const ALL_CARD_TYPES: CardType[] = [
  "profile",
  "hobbies",
  "projects",
  "skills",
  "experience",
  "certificates",
  "badges",
  "contact",
];

export function isCardType(value: string): value is CardType {
  return (ALL_CARD_TYPES as string[]).includes(value);
}

function suggestionsFor(intent: Intent): string[] {
  return followUps[intent] ?? followUps.default;
}

/**
 * Returns a fully composed reply for intents we can answer without the model,
 * or null to signal that the caller should fall through to Cohere.
 */
export function answerFromProfile(intent: Intent): ChatReply | null {
  switch (intent) {
    case "greeting":
      return {
        text: `Hey there — I'm SibzAI, ${identity.shortName}'s digital twin. Ask me about his work, his projects, the tech he uses, or what he gets up to outside of work.`,
        cards: [],
        followUps: suggestionsFor("default"),
        source: "intent",
      };

    case "who":
      return {
        text: [
          `${identity.name} — ${identity.headline}`,
          "",
          identity.summary,
          "",
          identity.tagline,
        ].join("\n"),
        cards: [{ type: "profile" }],
        followUps: suggestionsFor("who"),
        source: "intent",
      };

    case "hobbies":
      return {
        text: [
          `Outside of work, ${identity.shortName}'s interests cluster around a few things:`,
          "",
          ...profile.hobbies.map((h) => `- ${h.label}: ${h.blurb}`),
          "",
          "Ask about any one of these and I can go deeper.",
        ].join("\n"),
        cards: [{ type: "hobbies" }],
        followUps: suggestionsFor("hobbies"),
        source: "intent",
      };

    case "projects":
      return {
        text: `Here are the projects ${identity.shortName} has built — mostly AI automation and data work, with the code and live demos linked on each card.`,
        cards: [{ type: "projects" }],
        followUps: suggestionsFor("projects"),
        source: "intent",
      };

    case "skills":
      return {
        text: `${identity.shortName} works across IT support, networking, and AI automation. Here's the breakdown:`,
        cards: [{ type: "skills" }],
        followUps: suggestionsFor("skills"),
        source: "intent",
      };

    case "experience":
      return {
        text: [
          `${identity.shortName} is currently a ${currentRole.title} at ${currentRole.org} (${currentRole.period}).`,
          currentRole.summary,
          "",
          "Here's the full work history:",
        ].join("\n"),
        cards: [{ type: "experience" }],
        followUps: suggestionsFor("experience"),
        source: "intent",
      };

    case "education": {
      const primary = profile.education[0];
      return {
        text: [
          `${identity.shortName} holds a ${primary.qualification} from ${primary.institution} (${primary.period}).`,
          "",
          "He's also worked through a long list of certifications across IT support, networking, cloud, AI, and machine learning.",
        ].join("\n"),
        cards: [{ type: "certificates" }],
        followUps: suggestionsFor("education"),
        source: "intent",
      };
    }

    case "certificates":
      return {
        text: `${identity.shortName} has completed certifications from Google, Cisco, IBM, Microsoft, AWS, Stanford, Duke, and Johns Hopkins, spanning IT support, networking, cloud, AI, and data science.`,
        cards: [{ type: "certificates" }],
        followUps: suggestionsFor("certificates"),
        source: "intent",
      };

    case "badges":
      return {
        text: `These are the badges ${identity.shortName} earned through the CAPACITI programme.`,
        cards: [{ type: "badges" }],
        followUps: suggestionsFor("badges"),
        source: "intent",
      };

    case "contact":
      return {
        text: `The best ways to reach ${identity.shortName}:`,
        cards: [{ type: "contact" }],
        followUps: suggestionsFor("contact"),
        source: "intent",
      };

    case "goals":
      return {
        text: [
          `What ${identity.shortName} is working towards:`,
          "",
          ...profile.goals.map((g) => `- ${g}`),
        ].join("\n"),
        cards: [],
        followUps: suggestionsFor("goals"),
        source: "intent",
      };

    default:
      return null;
  }
}

/** Follow-up chips for a model-generated answer, chosen from the cards it asked for. */
export function followUpsForCards(cards: ChatCard[]): string[] {
  const first = cards[0]?.type;
  if (!first) return followUps.default;
  const key = first === "profile" ? "who" : first;
  return followUps[key] ?? followUps.default;
}
