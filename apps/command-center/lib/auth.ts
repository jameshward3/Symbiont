import { timingSafeEqual } from "node:crypto";
import { auth } from "@/auth";

export function hasServerDataPlane() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function isAuthorized(request: Request) {
  const workspaceEmail = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const allowlist = process.env.SYMBIONT_ALLOWED_EMAILS?.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean) ?? [];
  if (workspaceEmail && (allowlist.length === 0 || allowlist.includes(workspaceEmail))) return true;
  const expected = process.env.SYMBIONT_ACCESS_KEY;
  const actual = request.headers.get("x-symbiont-access-key");
  if (expected && actual) {
    const left = Buffer.from(expected);
    const right = Buffer.from(actual);
    if (left.length === right.length && timingSafeEqual(left, right)) return true;
  }

  try {
    const session = await auth();
    return Boolean(session?.user?.entraObjectId && session.user.entraTenantId);
  } catch {
    return false;
  }
}
