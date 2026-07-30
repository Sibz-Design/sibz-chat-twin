// Builds a stable, privacy-preserving identifier used as the rate-limit key.
// Combines the frontend-generated client ID with the request's source IP so
// neither one alone can be rotated to dodge limits, then hashes the pair with
// a server-side salt so raw IPs are never persisted to the database.

const CLIENT_ID_PATTERN = /^[a-zA-Z0-9-_]{1,100}$/;

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildRateLimitIdentifier(
  req: Request,
  clientId: string | undefined,
  salt: string,
): Promise<string> {
  const ip = getClientIp(req);
  const safeClientId = clientId && CLIENT_ID_PATTERN.test(clientId) ? clientId : "anon";
  return await sha256Hex(`${salt}:${safeClientId}:${ip}`);
}
