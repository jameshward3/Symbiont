import { timingSafeEqual } from "node:crypto";

export function hasServerDataPlane() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isAuthorized(request: Request) {
  if (request.headers.get("x-symbiont-authenticated") === "basic") return true;
  const workspaceEmail = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const allowlist = process.env.SYMBIONT_ALLOWED_EMAILS?.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean) ?? [];
  if (workspaceEmail && (allowlist.length === 0 || allowlist.includes(workspaceEmail))) return true;
  const expected = process.env.SYMBIONT_ACCESS_KEY;
  const actual = request.headers.get("x-symbiont-access-key");
  if (!expected || !actual) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}
