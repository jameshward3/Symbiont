const windows = new Map<string, { count: number; resetsAt: number }>();

export function allowRequest(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetsAt <= now) { windows.set(key, { count: 1, resetsAt: now + windowMs }); return true; }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

/**
 * Distributed limiter for production. It falls back to the local limiter only
 * when the data plane is unavailable, preserving fail-safe availability while
 * making normal limits consistent across serverless instances.
 */
export async function allowDistributedRequest(key: string, limit = 10, windowSeconds = 60) {
  try {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    const privacySafeKey = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const { rpc } = await import("@/lib/supabase/server");
    const result = await rpc<Array<{ allowed: boolean }>>("consume_api_rate_limit", {
      p_key: privacySafeKey,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    return result[0]?.allowed === true;
  } catch {
    return allowRequest(key, Math.max(1, Math.floor(limit / 2)), windowSeconds * 1000);
  }
}
