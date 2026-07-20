import { timingSafeEqual } from "node:crypto";

export function hasServerDataPlane() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isAuthorized(request: Request) {
  const expected = process.env.SYMBIONT_ACCESS_KEY;
  const actual = request.headers.get("x-symbiont-access-key");
  if (!expected || !actual) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}
