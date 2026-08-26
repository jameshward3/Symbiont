import { auth } from "@/auth";
import { isMicrosoftEntraConfigured } from "@/lib/entra-config";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

function applySecurityHeaders(response: NextResponse, pathname: string) {
  response.headers.set(
    "Cache-Control",
    pathname.startsWith("/api/") ? "private, no-store" : "private, no-cache",
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://api.openai.com",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

const authenticatedProxy = auth((request) => {
  const pathname = request.nextUrl.pathname;

  if (!request.auth?.user?.entraObjectId || !request.auth.user.entraTenantId) {
    if (pathname.startsWith("/api/")) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: "Microsoft Entra session required." },
          { status: 401 },
        ),
        pathname,
      );
    }

    const signInUrl = new URL("/signin", request.nextUrl.origin);
    signInUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${request.nextUrl.search}`,
    );
    return applySecurityHeaders(NextResponse.redirect(signInUrl), pathname);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-symbiont-authenticated", "entra");
  requestHeaders.set("x-symbiont-actor-id", request.auth.user.entraObjectId);
  requestHeaders.set("x-symbiont-tenant-id", request.auth.user.entraTenantId);
  requestHeaders.set(
    "x-request-id",
    request.headers.get("x-request-id") || crypto.randomUUID(),
  );

  return applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    pathname,
  );
}) as unknown as (request: NextRequest, event: NextFetchEvent) => Promise<Response>;

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!isMicrosoftEntraConfigured()) {
    return applySecurityHeaders(
      new NextResponse("Microsoft Entra sign-in is not configured.", {
        status: 503,
      }),
      request.nextUrl.pathname,
    );
  }

  return authenticatedProxy(request, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|signin(?:/|$)|api/auth(?:/|$)|api/health/(?:live|ready)(?:/|$)).*)",
  ],
};
