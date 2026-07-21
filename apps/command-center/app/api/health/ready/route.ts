import { NextResponse } from "next/server";
import { hasServerDataPlane } from "@/lib/auth";

export const dynamic = "force-dynamic";

export function GET() {
  const checks = {
    siteAccess: Boolean(process.env.SITE_PASSWORD),
    dataPlane: hasServerDataPlane(),
    modelRuntime: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL),
  };
  const ready = checks.siteAccess && checks.dataPlane;
  return NextResponse.json({ status: ready ? "ready" : "degraded", checks, timestamp: new Date().toISOString() }, { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
