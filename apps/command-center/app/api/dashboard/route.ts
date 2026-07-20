import { NextResponse } from "next/server";
import { hasServerDataPlane, isAuthorized } from "@/lib/auth";
import { dbRequest } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!hasServerDataPlane()) return NextResponse.json({ error: "Shared data plane is not configured.", source: "unavailable" }, { status: 503 });
  if (!isAuthorized(request)) return NextResponse.json({ error: "Secure session required." }, { status: 401 });
  try {
    const agents = await dbRequest("agents", {}, { select: "stable_id,name,mission,authority_level,status,parent_agent_id,updated_at", order: "stable_id" });
    const goals = await dbRequest("goals", {}, { select: "stable_id,objective,status,priority,due_date,success_metrics,completion_evidence,updated_at", order: "updated_at.desc", limit: 25 });
    const opportunities = await dbRequest("opportunities", {}, { select: "stable_id,name,stage,qualification_score,recommendation,amount,currency,probability,expected_close,next_action,next_action_date,proposal_status,recurring_potential,required_approvals,updated_at", status: "eq.Open", order: "updated_at.desc", limit: 100 });
    const decisions = await dbRequest("decisions", {}, { select: "stable_id,statement,status,required_by,recommendation,created_at", order: "created_at.desc", limit: 25 });
    const runs = await dbRequest("agent_runs", {}, { select: "run_id,status,correlation_id,duration_ms,started_at,completed_at,agents(stable_id,name)", order: "started_at.desc", limit: 20 });
    const handoffs = await dbRequest("handoffs", {}, { select: "id,status,acceptance_criteria,created_at,from_agent_id,to_agent_id", order: "created_at.desc", limit: 20 });
    return NextResponse.json({ source: "live", asOf: new Date().toISOString(), agents, goals, opportunities, decisions, runs, handoffs });
  } catch { return NextResponse.json({ error: "The shared data plane could not be read safely." }, { status: 502 }); }
}
