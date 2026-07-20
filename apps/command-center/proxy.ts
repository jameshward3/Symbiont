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

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
