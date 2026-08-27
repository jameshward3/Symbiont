import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", service: "symbiont-command-center", timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
