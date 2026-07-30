import type { SupabaseClient } from "npm:@supabase/supabase-js@2.45.4";

export interface WindowStat {
  count: number;
  limit: number;
  remaining: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limitedWindow: "minute" | "hour" | "day" | null;
  retryAfterSeconds: number;
  minute: WindowStat;
  hour: WindowStat;
  day: WindowStat;
}

export interface RateLimitConfig {
  minute: number;
  hour: number;
  day: number;
}

// Delegates to the `check_and_record_rate_limit` Postgres function, which does
// the sliding-window count + insert atomically (per-identifier advisory lock)
// so concurrent requests can't race past the limit.
export async function checkRateLimit(
  admin: SupabaseClient,
  identifier: string,
  limits: RateLimitConfig,
): Promise<RateLimitResult> {
  const { data, error } = await admin.rpc("check_and_record_rate_limit", {
    p_identifier: identifier,
    p_minute_limit: limits.minute,
    p_hour_limit: limits.hour,
    p_day_limit: limits.day,
  });

  if (error) throw error;
  return data as RateLimitResult;
}
