import { NextRequest, NextResponse } from "next/server";

const DEFAULT_USERNAME = "symbiont";
const AUTH_REALM = "Symbiont Executive Command Center";

function unauthorized(message = "Authentication required.") {
  return new NextResponse(message, {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": `Basic realm="${AUTH_REALM}", charset="UTF-8"`,
    },
  });
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

async function secureEqual(actual: string, expected: string) {
  const [actualDigest, expectedDigest] = await Promise.all([
    digest(actual),
    digest(expected),
  ]);

  let difference = 0;
  for (let index = 0; index < actualDigest.length; index += 1) {
    difference |= actualDigest[index] ^ expectedDigest[index];
  }

  return difference === 0;
}

function parseBasicCredentials(header: string | null) {
  if (!header?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const expectedPassword = process.env.SITE_PASSWORD;
  const expectedUsername = process.env.SITE_USERNAME || DEFAULT_USERNAME;

  // Fail closed if the deployment secret was not configured.
  if (!expectedPassword) {
    return new NextResponse("Site access is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const credentials = parseBasicCredentials(
    request.headers.get("authorization"),
  );

  if (
    !credentials ||
    !(await secureEqual(credentials.username, expectedUsername)) ||
    !(await secureEqual(credentials.password, expectedPassword))
  ) {
    return unauthorized();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-symbiont-authenticated", "basic");
  requestHeaders.set("x-request-id", request.headers.get("x-request-id") || crypto.randomUUID());
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Cache-Control", request.nextUrl.pathname.startsWith("/api/") ? "private, no-store" : "private, no-cache");
  response.headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://api.openai.com");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health/live).*)"],
};
