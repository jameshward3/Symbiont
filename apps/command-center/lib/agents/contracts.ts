export const AGENTS = {
  "AGT-001": { id: "AGT-001", name: "Symbiont COO", authority: "L2", parent: null },
  "AGT-002": { id: "AGT-002", name: "Sales Operations", authority: "L1", parent: "AGT-001" },
  "AGT-003": { id: "AGT-003", name: "Delivery Control", authority: "L1", parent: "AGT-001" },
} as const;

export type AgentId = keyof typeof AGENTS;

export function isAgentId(value: unknown): value is AgentId {
  return typeof value === "string" && value in AGENTS;
}

export function validateCommand(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("INVALID_INPUT");
  const candidate = value as Record<string, unknown>;
  if (!isAgentId(candidate.agentId)) throw new Error("INVALID_AGENT");
  if (typeof candidate.command !== "string" || candidate.command.trim().length < 3 || candidate.command.length > 4000) throw new Error("INVALID_COMMAND");
  return { agentId: candidate.agentId, command: candidate.command.trim(), goalId: typeof candidate.goalId === "string" ? candidate.goalId : undefined };
}

export function mayPerform(agentId: AgentId, action: string) {
  const deniedForAll = ["send_external_communication", "sign_contract", "move_money", "publish_external_claim", "delete_shared_record"];
  const gatedForSales = ["approve_price", "approve_proposal", "approve_material_decision", "commit_scope", "commit_schedule"];
  if (deniedForAll.includes(action)) return { allowed: false, requiresApproval: true, reason: "Prohibited autonomous action" };
  if (agentId === "AGT-002" && gatedForSales.includes(action)) return { allowed: false, requiresApproval: true, reason: "AGT-002 has L1 Draft and Recommend authority" };
  const gatedForDelivery = ["approve_change_order", "commit_scope", "commit_schedule", "accept_deliverable", "accept_material_risk", "approve_financial_forecast", "write_production_record"];
  if (agentId === "AGT-003" && gatedForDelivery.includes(action)) return { allowed: false, requiresApproval: true, reason: "AGT-003 has L1 Draft authority" };
  return { allowed: true, requiresApproval: false };
}
