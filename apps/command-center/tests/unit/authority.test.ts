import assert from "node:assert/strict";
import test from "node:test";
import { mayPerform, validateCommand } from "../../lib/agents/contracts.ts";

test("AGT-002 cannot approve pricing", () => assert.deepEqual(mayPerform("AGT-002", "approve_price"), { allowed: false, requiresApproval: true, reason: "AGT-002 has L1 Draft and Recommend authority" }));
test("no agent sends client messages autonomously", () => assert.equal(mayPerform("AGT-001", "send_external_communication").allowed, false));
test("AGT-003 cannot approve changes, accept delivery risk, or write production records", () => {
  for (const action of ["approve_change_order", "accept_material_risk", "write_production_record"]) assert.deepEqual(mayPerform("AGT-003", action), { allowed: false, requiresApproval: true, reason: "AGT-003 has L1 Draft authority" });
});
test("API accepts only registered agent IDs", () => { assert.equal(validateCommand({ agentId: "AGT-002", command: "Draft a discovery brief" }).agentId, "AGT-002"); assert.equal(validateCommand({ agentId: "AGT-003", command: "Draft a recovery plan" }).agentId, "AGT-003"); assert.throws(() => validateCommand({ agentId: "AGT-999", command: "Do work" })); });
