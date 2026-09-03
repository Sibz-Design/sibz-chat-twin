// Transport layer for the chat edge function.
//
// Kept out of the React component so the page is only concerned with rendering.
// The server owns all knowledge and all card decisions; this module just moves
// the envelope across the wire and turns failures into typed results.

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
  data?: unknown;
}

/** The success envelope returned by supabase/functions/chat. */
export interface ChatReply {
  text: string;
  cards: ChatCard[];
  followUps: string[];
  source: "intent" | "model" | "cache";
}

export interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

// A single `kind` discriminant rather than a boolean `ok`: this project builds
// with strictNullChecks off, where narrowing on a boolean literal is unreliable.
export type ChatResult =
  | { kind: "ok"; reply: ChatReply }
  | { kind: "rate-limited"; retryAfter: number; message: string }
  | { kind: "config"; message: string }
  | { kind: "error"; message: string };

/** How many prior turns to send. Keeps requests small and within MAX_HISTORY_ITEMS. */
const MAX_HISTORY_TURNS = 8;

/** Cards carry no text, so only text turns are worth sending back as context. */
export function toHistory(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): HistoryItem[] {
  return messages
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content }));
}

export async function sendChatMessage(
  message: string,
  history: HistoryItem[],
  clientId: string,
  signal?: AbortSignal,
): Promise<ChatResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      kind: "config",
      message:
        "Configuration error: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env.local file.",
    };
  }

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ message, history, clientId }),
      signal,
    });
  } catch (err) {
    return {
      kind: "error",
      message: `I couldn't reach the chat service. ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (response.status === 429) {
    let retryAfter = 60;
    try {
      const info = await response.json();
      retryAfter = Number(info?.retryAfter ?? 60);
    } catch {
      // Malformed body — fall back to the default window.
    }
    return {
      kind: "rate-limited",
      retryAfter,
      message: `You're sending messages a little too fast. Please wait ${retryAfter}s before trying again.`,
    };
  }

  if (!response.ok) {
    let message = `The chat service responded with ${response.status}.`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // Not JSON — keep the status-based message.
    }
    return { kind: "error", message };
  }

  try {
    const body = await response.json();
    if (typeof body?.text !== "string") {
      return { kind: "error", message: "The chat service returned an unexpected response." };
    }
    return {
      kind: "ok",
      reply: {
        text: body.text,
        cards: Array.isArray(body.cards) ? body.cards : [],
        followUps: Array.isArray(body.followUps) ? body.followUps : [],
        source: body.source ?? "model",
      },
    };
  } catch {
    return { kind: "error", message: "The chat service returned a response I couldn't read." };
  }
}
