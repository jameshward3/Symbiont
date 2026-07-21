import { NextResponse } from "next/server";
import { hasServerDataPlane, isAuthorized } from "@/lib/auth";
import { validateCommand } from "@/lib/agents/contracts";
import { runAgent } from "@/lib/agents/runtime";
import { allowDistributedRequest } from "@/lib/rate-limit";
import { logEvent, requestId } from "@/lib/observability";

export async function POST(request: Request) {
  if (!hasServerDataPlane()) return NextResponse.json({ error: "Shared data plane is unavailable; no agent run was simulated." }, { status: 503 });
  if (!isAuthorized(request)) return NextResponse.json({ error: "Secure session required." }, { status: 401 });
  const requestKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "authorized-session";
  const correlationId = requestId(request);
  if (!(await allowDistributedRequest(requestKey))) return NextResponse.json({ error: "Agent run rate limit reached. Try again shortly.", correlationId }, { status: 429, headers: { "Retry-After": "60", "X-Request-Id": correlationId } });
  try {
    const input = validateCommand(await request.json());
    const result = await runAgent(input.agentId, input.command, input.goalId);
    logEvent("info", "agent_run_complete", { correlationId, agentId: input.agentId });
    return NextResponse.json(result, { headers: { "X-Request-Id": correlationId } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "FAILED";
    logEvent("error", "agent_run_failed", { correlationId, code });
    return NextResponse.json({ error: code === "MODEL_UNAVAILABLE" ? "The model runtime is not configured; no response was simulated." : "Agent run failed safely.", correlationId }, { status: code.startsWith("INVALID") ? 400 : 502, headers: { "X-Request-Id": correlationId } });
  }
}
