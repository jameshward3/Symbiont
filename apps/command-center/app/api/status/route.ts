import { NextResponse } from "next/server";
import { hasServerDataPlane, isAuthorized } from "@/lib/auth";

export async function GET(request: Request) {
  return NextResponse.json({ dataPlane: hasServerDataPlane() ? (await isAuthorized(request) ? "connected" : "authorization_required") : "unavailable", model: process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL ? "configured" : "unavailable", source: hasServerDataPlane() ? "live" : "unavailable" });
}
