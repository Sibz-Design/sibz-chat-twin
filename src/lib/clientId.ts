const STORAGE_KEY = "sibzai_client_id";

// Persists a per-browser random ID so the backend can rate-limit per client in
// addition to per IP. Falls back to a session-only ID if localStorage is
// unavailable (e.g. private browsing with storage disabled).
export function getOrCreateClientId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
