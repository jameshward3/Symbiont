import { dbRequest, rpc } from "@/lib/supabase/server";
import { mayPerform, type AgentId } from "./contracts";

export const tools = {
  read_shared_goals: (organizationId: string) => dbRequest("goals", {}, { select: "stable_id,objective,status,priority,due_date,success_metrics", organization_id: `eq.${organizationId}`, order: "updated_at.desc", limit: 25 }),
  read_goal_context: (goalId: string) => dbRequest("goals", {}, { select: "*,goal_members(role,agents(stable_id,name)),work_items(*)", stable_id: `eq.${goalId}`, limit: 1 }),
  claim_work_item: (workItemId: string, agentId: string, idempotencyKey: string) => rpc("claim_work_item", { p_work_item_id: workItemId, p_agent_id: agentId, p_idempotency_key: idempotencyKey, p_lease_seconds: 900 }),
  release_work_item: (workItemId: string, agentId: string, status: string, evidence?: unknown) => rpc("release_work_item", { p_work_item_id: workItemId, p_agent_id: agentId, p_status: status, p_evidence: evidence ?? null }),
  append_goal_event: (payload: unknown) => dbRequest("goal_events", { method: "POST", body: JSON.stringify(payload) }),
  send_agent_message: (payload: unknown) => dbRequest("agent_messages", { method: "POST", body: JSON.stringify(payload) }),
  create_decision_request: (agentId: AgentId, payload: unknown) => { mayPerform(agentId, "approve_material_decision"); return dbRequest("decisions", { method: "POST", body: JSON.stringify({ ...(payload as object), status: "Proposed", approval_timestamp: null, approver_user_id: null }) }); },
  create_artifact: (payload: unknown) => dbRequest("artifacts", { method: "POST", body: JSON.stringify(payload) }),
  read_sales_context: (organizationId: string) => Promise.all([
    dbRequest("accounts", {}, { select: "stable_id,name,status,account_type", organization_id: `eq.${organizationId}`, limit: 50 }),
    dbRequest("opportunities", {}, { select: "stable_id,name,stage,qualification_score,recommendation,amount,currency,probability,expected_close,next_action,next_action_date,proposal_status,recurring_potential,required_approvals", organization_id: `eq.${organizationId}`, status: "eq.Open", limit: 100 }),
  ]),
  create_opportunity: (payload: unknown) => dbRequest("opportunities", { method: "POST", body: JSON.stringify(payload) }),
  update_opportunity_draft: (id: string, version: number, payload: unknown) => dbRequest("opportunities", { method: "PATCH", body: JSON.stringify({ ...(payload as object), version: version + 1 }) }, { id: `eq.${id}`, version: `eq.${version}` }),
  create_proposal_draft: (payload: unknown) => dbRequest("proposal_drafts", { method: "POST", body: JSON.stringify({ ...(payload as object), status: "Draft", approved_at: null, approved_by_user_id: null }) }),
  create_handoff_draft: (payload: unknown) => dbRequest("handoffs", { method: "POST", body: JSON.stringify({ ...(payload as object), status: "Review" }) }),
};
