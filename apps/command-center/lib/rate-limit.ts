const windows = new Map<string, { count: number; resetsAt: number }>();

export function allowRequest(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetsAt <= now) { windows.set(key, { count: 1, resetsAt: now + windowMs }); return true; }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
