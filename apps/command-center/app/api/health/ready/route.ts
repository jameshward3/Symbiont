import { NextResponse } from "next/server";
import { hasServerDataPlane } from "@/lib/auth";
import { isMicrosoftEntraConfigured, microsoftEntraConfigurationStatus } from "@/lib/entra-config";

export const dynamic = "force-dynamic";

export function GET() {
  const checks = {
    microsoftEntra: isMicrosoftEntraConfigured(),
    microsoftEntraConfiguration: microsoftEntraConfigurationStatus(),
    dataPlane: hasServerDataPlane(),
    modelRuntime: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL),
  };
  const ready = checks.microsoftEntra && checks.dataPlane;
  return NextResponse.json({ status: ready ? "ready" : "degraded", checks, timestamp: new Date().toISOString() }, { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
