import type { SupabaseClient } from "npm:@supabase/supabase-js@2.45.4";

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Cache key is the normalized message text only — callers should gate caching
// to stateless requests (empty history) so a cached answer can never leak
// context from a different conversation.
export async function hashPrompt(message: string): Promise<string> {
  return await sha256Hex(message.trim().toLowerCase());
}

// deno-lint-ignore no-explicit-any
export async function getCachedResponse(admin: SupabaseClient, promptHash: string): Promise<any | null> {
  const { data, error } = await admin
    .from("prompt_cache")
    .select("response, expires_at")
    .eq("prompt_hash", promptHash)
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  admin.rpc("increment_prompt_cache_hit", { p_hash: promptHash }).then(
    () => {},
    (err: unknown) => console.error("Cache hit-count update failed:", err),
  );

  return data.response;
}

export async function setCachedResponse(
  admin: SupabaseClient,
  promptHash: string,
  // deno-lint-ignore no-explicit-any
  response: any,
  ttlSeconds: number,
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const { error } = await admin
    .from("prompt_cache")
    .upsert({ prompt_hash: promptHash, response, expires_at: expiresAt }, { onConflict: "prompt_hash" });
  if (error) console.error("Cache write failed:", error);
}
