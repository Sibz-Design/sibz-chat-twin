// Shared CORS handling for all edge functions in this project.
// Configure allowed origins via the ALLOWED_ORIGINS env var (comma-separated).

const DEFAULT_ORIGINS = "https://sibz-chat-twin.vercel.app,http://localhost:8080";

function allowedOrigins(): string[] {
  return (Deno.env.get("ALLOWED_ORIGINS") || DEFAULT_ORIGINS)
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

export function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = allowedOrigins();
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
