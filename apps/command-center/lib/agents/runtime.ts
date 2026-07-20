import { randomUUID } from "node:crypto";
import { dbRequest } from "@/lib/supabase/server";
import { AGENTS, type AgentId } from "./contracts";
import { OpenAIResponsesProvider } from "./provider";

const evidenceContract = "Distinguish Verified facts, Inferences, Assumptions, Missing evidence, Recommendations, and Required approvals. Never claim an unavailable system is connected.";
const instructions: Record<AgentId, string> = {
  "AGT-001": `You are AGT-001, Symbiont COO. Coordinate company operations and governed agent work. ${evidenceContract}`,
  "AGT-002": `You are AGT-002, Symbiont Sales Operations, reporting to AGT-001. Authority is L1 Draft and Recommend. Never send external communications or commit pricing, scope, schedule, contracts, or material decisions. ${evidenceContract}`,
};

export async function runAgent(agentId: AgentId, input: string, goalId?: string) {
  const runId = `RUN-${randomUUID()}`;
  const correlationId = randomUUID();
  const started = Date.now();
  const provider = new OpenAIResponsesProvider();
  let agentUuid: string | undefined;
  try {
    const rows = await dbRequest<Array<{ id: string; organization_id: string }>>("agents", {}, { select: "id,organization_id", stable_id: `eq.${agentId}`, limit: 1 });
    agentUuid = rows[0]?.id;
    if (!agentUuid) throw new Error("AGENT_NOT_REGISTERED");
    await dbRequest("agent_runs", { method: "POST", body: JSON.stringify({ run_id: runId, organization_id: rows[0].organization_id, agent_id: agentUuid, correlation_id: correlationId, status: "In Progress", model_provider: provider.name, input_summary: { characters: input.length }, goal_id: goalId || null }) });
    const result = await provider.respond({ instructions: instructions[agentId], input });
    await dbRequest("agent_runs", { method: "PATCH", body: JSON.stringify({ status: "Complete", model: result.model, duration_ms: Date.now() - started, completed_at: new Date().toISOString(), output_summary: { characters: result.text.length } }) }, { run_id: `eq.${runId}` });
    return { runId, correlationId, agent: AGENTS[agentId], text: result.text, status: "Complete" };
  } catch (error) {
    if (agentUuid) await dbRequest("agent_runs", { method: "PATCH", body: JSON.stringify({ status: "Failed", duration_ms: Date.now() - started, completed_at: new Date().toISOString(), error_code: error instanceof Error ? error.message.slice(0, 80) : "UNKNOWN" }) }, { run_id: `eq.${runId}` }).catch(() => undefined);
    throw error;
  }
}
