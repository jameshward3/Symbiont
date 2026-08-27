type Level = "info" | "warn" | "error";
type Fields = Record<string, string | number | boolean | null | undefined>;

export function requestId(request: Request) {
  return request.headers.get("x-request-id") || crypto.randomUUID();
}

export function logEvent(level: Level, event: string, fields: Fields = {}) {
  const record = JSON.stringify({ timestamp: new Date().toISOString(), level, event, service: "symbiont-command-center", ...fields });
  if (level === "error") console.error(record);
  else if (level === "warn") console.warn(record);
  else console.info(record);
}
