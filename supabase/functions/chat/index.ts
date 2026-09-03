import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { buildRateLimitIdentifier } from "../_shared/identity.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";
import { validateChatRequest } from "../_shared/validation.ts";
import { scanForPromptInjection } from "../_shared/promptGuard.ts";
import { getCachedResponse, hashPrompt, setCachedResponse } from "../_shared/cache.ts";
import { classifyIntent } from "../_shared/intent.ts";
import { answerFromProfile, followUpsForCards, type ChatReply } from "../_shared/answers.ts";
import { buildSystemPrompt, extractCards } from "../_shared/prompt.ts";
import { identity, PROFILE_VERSION } from "../_shared/profile/index.ts";

// --- Configuration (all overridable via edge function secrets/env vars) ---
const MAX_MESSAGE_LENGTH = Number(Deno.env.get("MAX_MESSAGE_LENGTH") ?? 2000);
const MAX_HISTORY_ITEMS = Number(Deno.env.get("MAX_HISTORY_ITEMS") ?? 20);
const MAX_HISTORY_ITEM_LENGTH = Number(Deno.env.get("MAX_HISTORY_ITEM_LENGTH") ?? 4000);
const MAX_BODY_BYTES = Number(Deno.env.get("MAX_BODY_BYTES") ?? 32_000);
const RATE_LIMIT_PER_MINUTE = Number(Deno.env.get("RATE_LIMIT_PER_MINUTE") ?? 10);
const RATE_LIMIT_PER_HOUR = Number(Deno.env.get("RATE_LIMIT_PER_HOUR") ?? 50);
const RATE_LIMIT_PER_DAY = Number(Deno.env.get("RATE_LIMIT_PER_DAY") ?? 100);
const CACHE_TTL_SECONDS = Number(Deno.env.get("CACHE_TTL_SECONDS") ?? 3600);
// Falls back to a fixed default so local/dev environments still work; set a real
// secret in production so rate-limit identifiers can't be derived by outsiders.
const RATE_LIMIT_SALT = Deno.env.get("RATE_LIMIT_SALT") ?? "sibz-portfolio-default-salt";
// Fraction of requests that trigger an opportunistic DB cleanup, as a fallback
// for environments where the pg_cron schedule isn't enabled.
const CLEANUP_SAMPLE_RATE = Number(Deno.env.get("CLEANUP_SAMPLE_RATE") ?? 0.02);

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Built once per cold start from the shared profile data, so the knowledge base
// has exactly one source of truth.
const SYSTEM_PROMPT = buildSystemPrompt();

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

/**
 * Serialises a reply with the pre-envelope Cohere shape mirrored alongside it.
 *
 * The old frontend reads `message.content[0].text`; the new one reads `text`.
 * Emitting both means the function and the site can be deployed in either order
 * — and either one rolled back on its own — without a window where the deployed
 * pair disagree and chat breaks for visitors.
 *
 * Safe to delete once the site has been running the new frontend for a while.
 */
function replyResponse(reply: ChatReply, status: number, headers: Record<string, string>): Response {
  return json(
    { ...reply, message: { content: [{ type: "text", text: reply.text }] } },
    status,
    headers,
  );
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, corsHeaders);
  }

  // --- Request size limit (defense against oversized payload abuse) ---
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return json({ error: `Request body exceeds the maximum size of ${MAX_BODY_BYTES} bytes.` }, 413, corsHeaders);
  }

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400, corsHeaders);
  }

  // --- Input validation ---
  const validation = validateChatRequest(body, {
    maxMessageLength: MAX_MESSAGE_LENGTH,
    maxHistoryItems: MAX_HISTORY_ITEMS,
    maxHistoryItemLength: MAX_HISTORY_ITEM_LENGTH,
  });
  if (!validation.valid) {
    return json({ error: validation.error }, 400, corsHeaders);
  }

  const { message, history = [], clientId } = body as {
    message: string;
    history?: Array<{ role: string; content: string }>;
    clientId?: string;
  };

  // --- Prompt injection guard ---
  const guard = scanForPromptInjection(message);
  if (guard.flagged) {
    console.warn("Prompt injection attempt blocked:", guard.reason);
    return json(
      { error: `Your message could not be processed. Please rephrase your question about ${identity.name}.` },
      400,
      corsHeaders,
    );
  }

  // --- Sliding-window rate limiting (client ID + IP based) ---
  const identifier = await buildRateLimitIdentifier(req, clientId, RATE_LIMIT_SALT);

  let rateLimitResult;
  try {
    rateLimitResult = await checkRateLimit(supabaseAdmin, identifier, {
      minute: RATE_LIMIT_PER_MINUTE,
      hour: RATE_LIMIT_PER_HOUR,
      day: RATE_LIMIT_PER_DAY,
    });
  } catch (err) {
    // Fail open on infrastructure errors so a transient DB blip doesn't take
    // the whole chat feature down; the attempt is still logged for visibility.
    console.error("Rate limit check failed, failing open:", err);
    rateLimitResult = null;
  }

  if (rateLimitResult && !rateLimitResult.allowed) {
    const window = rateLimitResult.limitedWindow!;
    return json(
      {
        error: "Rate limit exceeded. Please slow down and try again shortly.",
        retryAfter: rateLimitResult.retryAfterSeconds,
        limitedWindow: window,
        limits: {
          minute: rateLimitResult.minute,
          hour: rateLimitResult.hour,
          day: rateLimitResult.day,
        },
      },
      429,
      {
        ...corsHeaders,
        "Retry-After": String(rateLimitResult.retryAfterSeconds),
        "X-RateLimit-Limit": String(rateLimitResult[window].limit),
        "X-RateLimit-Remaining": "0",
      },
    );
  }

  // Opportunistic fallback cleanup in case pg_cron isn't enabled on this project.
  if (Math.random() < CLEANUP_SAMPLE_RATE) {
    supabaseAdmin.rpc("cleanup_expired_records").then(
      () => {},
      (err: unknown) => console.error("Opportunistic cleanup failed:", err),
    );
  }

  // --- Deterministic intent fast path ---
  // High-confidence questions ("what are his hobbies", "show me his projects")
  // are answered straight from the profile data: no model call, no latency, and
  // no chance of a hallucinated detail. Only the ambiguous tail reaches Cohere.
  const { intent, score } = classifyIntent(message);
  const directAnswer = answerFromProfile(intent);
  if (directAnswer) {
    return replyResponse(directAnswer, 200, {
      ...corsHeaders,
      "X-Answer-Source": "intent",
      "X-Intent": `${intent}:${score}`,
    });
  }

  // --- Response caching (stateless, first-turn questions only) ---
  // The cache key mixes in the profile fingerprint, so editing any profile file
  // invalidates every cached answer instead of serving stale content until TTL.
  const canUseCache = history.length === 0;
  const promptHash = canUseCache ? await hashPrompt(`v${PROFILE_VERSION}:${message}`) : null;

  if (promptHash) {
    const cached = await getCachedResponse(supabaseAdmin, promptHash);
    if (cached) {
      return replyResponse({ ...cached, source: "cache" }, 200, { ...corsHeaders, "X-Cache": "HIT" });
    }
  }

  const cohereApiKey = Deno.env.get("COHERE_API_KEY");
  if (!cohereApiKey) {
    console.error("COHERE_API_KEY not found in environment variables");
    return json({ error: "Chat service is not configured." }, 500, corsHeaders);
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: `<user_message>\n${message}\n</user_message>` },
  ];

  // deno-lint-ignore no-explicit-any
  let cohereData: any;
  try {
    const cohereResponse = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cohereApiKey}`,
      },
      body: JSON.stringify({
        model: "command-r-08-2024",
        messages,
      }),
    });

    if (!cohereResponse.ok) {
      const errorBody = await cohereResponse.text();
      console.error("Cohere API error:", errorBody);
      return json({ error: "Failed to fetch response from Cohere." }, 502, corsHeaders);
    }

    cohereData = await cohereResponse.json();
  } catch (err) {
    console.error("Cohere request failed:", err);
    return json({ error: "Failed to reach the chat service." }, 502, corsHeaders);
  }

  // Cohere v2 returns content as an array of typed blocks; concatenate the text
  // ones rather than assuming content[0] exists and is a text block.
  const rawText: string = (cohereData?.message?.content ?? [])
    // deno-lint-ignore no-explicit-any
    .filter((block: any) => block?.type === "text" && typeof block.text === "string")
    // deno-lint-ignore no-explicit-any
    .map((block: any) => block.text)
    .join("")
    .trim();

  if (!rawText) {
    console.error("Cohere returned no text content:", JSON.stringify(cohereData));
    return json({ error: "The chat service returned an empty response." }, 502, corsHeaders);
  }

  const { text, cards } = extractCards(rawText);
  const reply: ChatReply = {
    text,
    cards,
    followUps: followUpsForCards(cards),
    source: "model",
  };

  if (promptHash) {
    setCachedResponse(supabaseAdmin, promptHash, reply, CACHE_TTL_SECONDS).catch((err) =>
      console.error("Cache write failed:", err)
    );
  }

  return replyResponse(reply, 200, { ...corsHeaders, "X-Cache": "MISS", "X-Answer-Source": "model" });
});
