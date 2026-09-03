// Shared CORS handling for all edge functions in this project.
// Configure allowed origins via the ALLOWED_ORIGINS env var (comma-separated).

// 8080 is Vite's configured port; 8099 is the port .claude/launch.json uses.
// Without both, local dev against the deployed function fails CORS preflight.
const DEFAULT_ORIGINS =
  "https://sibz-chat-twin.vercel.app,http://localhost:8080,http://localhost:8099";

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
