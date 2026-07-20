import { NextResponse } from "next/server";
import { hasServerDataPlane, isAuthorized } from "@/lib/auth";
import { validateCommand } from "@/lib/agents/contracts";
import { runAgent } from "@/lib/agents/runtime";
import { allowRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!hasServerDataPlane()) return NextResponse.json({ error: "Shared data plane is unavailable; no agent run was simulated." }, { status: 503 });
  if (!isAuthorized(request)) return NextResponse.json({ error: "Secure session required." }, { status: 401 });
  const requestKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "authorized-session";
  if (!allowRequest(requestKey)) return NextResponse.json({ error: "Agent run rate limit reached. Try again shortly." }, { status: 429 });
  try { const input = validateCommand(await request.json()); return NextResponse.json(await runAgent(input.agentId, input.command, input.goalId)); }
  catch (error) { const code = error instanceof Error ? error.message : "FAILED"; return NextResponse.json({ error: code === "MODEL_UNAVAILABLE" ? "The model runtime is not configured; no response was simulated." : "Agent run failed safely." }, { status: code.startsWith("INVALID") ? 400 : 502 }); }
}
