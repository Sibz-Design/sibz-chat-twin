// Heuristic first line of defense against prompt-injection attempts. This is
// intentionally paired with structural defenses in the chat function itself
// (delimiting user content and instructing the model to never treat it as
// instructions) — pattern matching alone is never sufficient.

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all|any)?\s*(previous|prior|above|earlier)\s+instructions?/i,
  /disregard\s+(all|any)?\s*(previous|prior|above|earlier)\s*(instructions?|prompt)?/i,
  /forget\s+(everything|all)\s+(you\s+(were|have\s+been)\s+told|above)/i,
  /you\s+are\s+now\s+(in\s+)?(dan|jailbreak|developer\s+mode|unrestricted)/i,
  /reveal\s+(your|the)\s+(system\s+prompt|instructions|rules)/i,
  /print\s+(your|the)\s+(system\s+prompt|instructions|rules)/i,
  /what\s+(is|are)\s+your\s+(system\s+prompt|instructions|rules)/i,
  /act\s+as\s+(if\s+you|though\s+you)\s+(have\s+no|are\s+not)\s+(restrictions|rules|limits)/i,
  /new\s+instructions?\s*:/i,
  /<\|.*?\|>/,
];

export interface PromptGuardResult {
  flagged: boolean;
  reason?: string;
}

export function scanForPromptInjection(text: string): PromptGuardResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { flagged: true, reason: `Matched pattern: ${pattern}` };
    }
  }

  // deno-lint-ignore no-control-regex
  const controlCharCount = (text.match(/[\x00-\x08\x0E-\x1F]/g) || []).length;
  if (controlCharCount > 5) {
    return { flagged: true, reason: "Excessive control characters." };
  }

  return { flagged: false };
}
