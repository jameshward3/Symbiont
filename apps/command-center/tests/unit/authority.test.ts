import assert from "node:assert/strict";
import test from "node:test";
import { mayPerform, validateCommand } from "../../lib/agents/contracts.ts";

test("AGT-002 cannot approve pricing", () => assert.deepEqual(mayPerform("AGT-002", "approve_price"), { allowed: false, requiresApproval: true, reason: "AGT-002 has L1 Draft and Recommend authority" }));
test("no agent sends client messages autonomously", () => assert.equal(mayPerform("AGT-001", "send_external_communication").allowed, false));
test("AGT-003 cannot approve changes, accept delivery risk, or write production records", () => {
  for (const action of ["approve_change_order", "accept_material_risk", "write_production_record"]) assert.deepEqual(mayPerform("AGT-003", action), { allowed: false, requiresApproval: true, reason: "AGT-003 has L1 Draft authority" });
});
test("AGT-005 cannot publish, delete, change access, or approve controlled content", () => {
  for (const action of ["approve_controlled_content", "publish_knowledge", "permanent_delete", "change_access", "external_disclosure", "change_retention_rule", "overwrite_issued_version", "expand_permissions"]) assert.deepEqual(mayPerform("AGT-005", action), { allowed: false, requiresApproval: true, reason: "AGT-005 has L2 authority for reversible internal knowledge actions only" });
});
test("API accepts only registered agent IDs", () => { assert.equal(validateCommand({ agentId: "AGT-002", command: "Draft a discovery brief" }).agentId, "AGT-002"); assert.equal(validateCommand({ agentId: "AGT-003", command: "Draft a recovery plan" }).agentId, "AGT-003"); assert.equal(validateCommand({ agentId: "AGT-005", command: "Index uploaded knowledge" }).agentId, "AGT-005"); assert.throws(() => validateCommand({ agentId: "AGT-999", command: "Do work" })); });
